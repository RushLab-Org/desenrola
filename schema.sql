-- ═══════════════════════════════════════════════════════════════════
-- Schema do Supabase — Sacada IA
-- Versão: 1.0 — maio/2026
-- 
-- COMO USAR:
--   1. Crie projeto Supabase em região São Paulo
--   2. SQL Editor → cole este arquivo inteiro → Run
--   3. Verifique que tabelas, triggers, RLS policies foram criadas
--   4. Faça teste manual de isolamento (criar 2 usuários, tentar acessar dados um do outro)
--
-- IMPORTANTE:
--   - Schema versionado neste arquivo. NUNCA edite via UI da Supabase.
--   - Mudanças futuras vão como migrations numeradas (002_xxx.sql, 003_xxx.sql)
--   - RLS está ATIVO em todas as tabelas com dados de usuário
--   - Mídia (prints, áudios) NÃO é armazenada — processada em memória e descartada
-- ═══════════════════════════════════════════════════════════════════


-- ═══════════════════════════════════════════════════════════════════
-- EXTENSÕES
-- ═══════════════════════════════════════════════════════════════════

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ═══════════════════════════════════════════════════════════════════
-- TABELA: profiles
-- 
-- Perfil do usuário pagante. Criado automaticamente quando webhook da
-- Perfect Pay confirma pagamento. Contém:
--   - Dados de assinatura (status, tipo, transaction)
--   - Perfil pessoal pra calibração da IA (idade, estado civil, etc)
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  
  -- Dados de assinatura
  subscription_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (subscription_status IN ('pending', 'active', 'refunded', 'cancelled')),
  subscription_type TEXT NOT NULL DEFAULT 'lifetime'
    CHECK (subscription_type IN ('lifetime')),
  purchased_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ,
  transaction_id TEXT,
  payment_method TEXT
    CHECK (payment_method IN ('pix', 'credit_card', NULL)),
  
  -- Perfil pessoal pra calibração da IA
  -- (preenchido no onboarding, editável depois)
  age_range TEXT
    CHECK (age_range IN ('18-24', '25-30', '31-38', '39-45', '46-55', '55+', NULL)),
  marital_status TEXT
    CHECK (marital_status IN ('single_long_term', 'recently_single', 'divorced', 'widowed', NULL)),
  time_single TEXT
    CHECK (time_single IN ('less_3_months', '3_to_12_months', 'more_1_year', NULL)),
  returning_to_market BOOLEAN,
  has_children BOOLEAN,
  improvement_areas TEXT[],  -- multi-select: ex: ['flirt_again', 'avoid_cringe', 'be_more_confident']
  primary_goal TEXT
    CHECK (primary_goal IN ('reconquer_specific', 'date_around', 'serious_relationship', 'avoid_mistakes', 'learn_flirting', NULL)),
  
  onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_profiles_subscription_status ON public.profiles(subscription_status);
CREATE INDEX idx_profiles_email ON public.profiles(email);


-- ═══════════════════════════════════════════════════════════════════
-- TABELA: crushes
-- 
-- Mulheres que o usuário tá conversando. Perfil contínuo com contexto
-- livre que a IA usa pra calibrar respostas.
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE public.crushes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  relationship_type TEXT NOT NULL
    CHECK (relationship_type IN ('namorada', 'ficante', 'conversante', 'ex', 'outras')),
  context TEXT,  -- texto livre, ~até 5000 chars: signo, gostos, fase do rolo, piadas internas, red flags, etc
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_crushes_user_id ON public.crushes(user_id);
CREATE INDEX idx_crushes_user_updated ON public.crushes(user_id, updated_at DESC);


-- ═══════════════════════════════════════════════════════════════════
-- TABELA: generations
-- 
-- Histórico de gerações. Salva input + output como JSON estruturado.
-- NÃO armazena mídia (prints/áudios) — processados em memória.
-- 
-- Trigger automático mantém apenas as últimas 50 gerações por crush
-- pra não inflar storage (decisão técnica do ADR-004).
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE public.generations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  crush_id UUID NOT NULL REFERENCES public.crushes(id) ON DELETE CASCADE,
  
  -- Input
  input_mode TEXT NOT NULL
    CHECK (input_mode IN ('text', 'print', 'audio')),
  her_message TEXT,  -- texto colado OU transcrição extraída de print/áudio
  intensity SMALLINT NOT NULL
    CHECK (intensity BETWEEN 1 AND 5),  -- ADR-020: ampliado de 1-4 pra 1-5
  intent TEXT NOT NULL
    CHECK (intent IN ('responder_normal', 'esquentar', 'sair_de_dr', 'pedir_pra_sair', 'reconquistar', 'desconversar', 'outros')),
  extra_context TEXT,
  
  -- Output (JSON estruturado da resposta da IA)
  ai_reading TEXT,                  -- campo "leitura" do JSON
  ai_options JSONB,                 -- array de 3 opções {estrategia, resposta}
  skills_applied TEXT[],            -- array de skills usadas
  info_detected TEXT,               -- info nova detectada (se houve)
  
  -- Metadata
  marked_as_win BOOLEAN NOT NULL DEFAULT FALSE,  -- usuário marca que essa resposta funcionou
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_generations_user_id ON public.generations(user_id);
CREATE INDEX idx_generations_crush_id ON public.generations(crush_id);
CREATE INDEX idx_generations_user_created ON public.generations(user_id, created_at DESC);
CREATE INDEX idx_generations_crush_created ON public.generations(crush_id, created_at DESC);


-- ═══════════════════════════════════════════════════════════════════
-- TABELA: usage_tracking
-- 
-- Rastreia uso diário por usuário pra limite anti-abuso de 200/dia
-- (ADR-011). Reset à meia-noite timezone America/Sao_Paulo.
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE public.usage_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  usage_date DATE NOT NULL,  -- data no timezone America/Sao_Paulo
  generation_count INTEGER NOT NULL DEFAULT 0,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(user_id, usage_date)
);

CREATE INDEX idx_usage_tracking_user_date ON public.usage_tracking(user_id, usage_date);


-- ═══════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS)
-- 
-- Cada usuário só vê seus próprios dados.
-- service_role bypassa RLS (usado pelo webhook da Perfect Pay).
-- ═══════════════════════════════════════════════════════════════════

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crushes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;

-- profiles: usuário vê e edita só o próprio
CREATE POLICY "users_can_view_own_profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "users_can_update_own_profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- crushes: usuário vê/cria/edita/deleta só as próprias
CREATE POLICY "users_can_view_own_crushes"
  ON public.crushes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "users_can_insert_own_crushes"
  ON public.crushes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_can_update_own_crushes"
  ON public.crushes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "users_can_delete_own_crushes"
  ON public.crushes FOR DELETE
  USING (auth.uid() = user_id);

-- generations: usuário vê/cria só as próprias
CREATE POLICY "users_can_view_own_generations"
  ON public.generations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "users_can_insert_own_generations"
  ON public.generations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_can_update_own_generations"
  ON public.generations FOR UPDATE
  USING (auth.uid() = user_id);

-- usage_tracking: usuário vê só os próprios contadores
-- (insert/update feito por service role no backend)
CREATE POLICY "users_can_view_own_usage"
  ON public.usage_tracking FOR SELECT
  USING (auth.uid() = user_id);


-- ═══════════════════════════════════════════════════════════════════
-- TRIGGERS
-- ═══════════════════════════════════════════════════════════════════

-- Trigger 1: Atualizar updated_at automaticamente em UPDATE
-- ═══════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER crushes_updated_at
  BEFORE UPDATE ON public.crushes
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER usage_tracking_updated_at
  BEFORE UPDATE ON public.usage_tracking
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


-- Trigger 2: Manter apenas 50 gerações mais recentes por crush
-- Após INSERT de nova geração, deleta as mais antigas se passar de 50.
-- Decisão técnica do ADR-004 pra controle de storage.
-- ═══════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.trim_generations_per_crush()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM public.generations
  WHERE crush_id = NEW.crush_id
    AND id NOT IN (
      SELECT id FROM public.generations
      WHERE crush_id = NEW.crush_id
      ORDER BY created_at DESC
      LIMIT 50
    );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generations_trim_after_insert
  AFTER INSERT ON public.generations
  FOR EACH ROW EXECUTE FUNCTION public.trim_generations_per_crush();


-- Trigger 3: Criar profile automaticamente quando user é criado em auth.users
-- O webhook da Perfect Pay vai criar user via admin API; este trigger
-- garante que sempre tem profile correspondente.
-- ═══════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, subscription_status)
  VALUES (
    NEW.id,
    NEW.email,
    'pending'  -- vai virar 'active' quando webhook confirmar pagamento
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ═══════════════════════════════════════════════════════════════════
-- FUNÇÃO: increment_usage
-- 
-- Chamada pelo backend antes de gerar resposta.
-- Retorna TRUE se usuário pode gerar (não atingiu 200/dia).
-- Retorna FALSE se atingiu limite.
-- 
-- Uso (em Server Action):
--   const { data } = await supabase.rpc('increment_usage', { p_user_id: userId })
--   if (!data) throw new Error('limite diário atingido')
-- ═══════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.increment_usage(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_today DATE;
  v_count INTEGER;
  v_limit INTEGER := 200;
BEGIN
  -- Data atual no timezone America/Sao_Paulo
  v_today := (NOW() AT TIME ZONE 'America/Sao_Paulo')::DATE;
  
  -- Pega contador atual ou cria registro
  INSERT INTO public.usage_tracking (user_id, usage_date, generation_count)
  VALUES (p_user_id, v_today, 0)
  ON CONFLICT (user_id, usage_date) DO NOTHING;
  
  -- Lê contador atual
  SELECT generation_count INTO v_count
  FROM public.usage_tracking
  WHERE user_id = p_user_id AND usage_date = v_today;
  
  -- Checa limite
  IF v_count >= v_limit THEN
    RETURN FALSE;
  END IF;
  
  -- Incrementa
  UPDATE public.usage_tracking
  SET generation_count = generation_count + 1
  WHERE user_id = p_user_id AND usage_date = v_today;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ═══════════════════════════════════════════════════════════════════
-- FUNÇÃO: has_active_subscription
-- 
-- Helper pra middleware checar se usuário tem acesso.
-- Retorna TRUE se subscription_status = 'active' (não refundado, não cancelado).
-- ═══════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.has_active_subscription(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_status TEXT;
BEGIN
  SELECT subscription_status INTO v_status
  FROM public.profiles
  WHERE id = p_user_id;
  
  RETURN v_status = 'active';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ═══════════════════════════════════════════════════════════════════
-- COMENTÁRIOS NAS TABELAS (documentação dentro do banco)
-- ═══════════════════════════════════════════════════════════════════

COMMENT ON TABLE public.profiles IS 'Perfil do usuário pagante. Criado via webhook da Perfect Pay. Inclui dados de assinatura E perfil pessoal pra calibração da IA.';

COMMENT ON TABLE public.crushes IS 'Mulheres que o usuário tá conversando. Cada uma tem contexto livre que a IA usa pra calibrar respostas.';

COMMENT ON TABLE public.generations IS 'Histórico de gerações. NUNCA armazena mídia (prints/áudios são processados em memória). Trimmed automaticamente pra 50 mais recentes por crush.';

COMMENT ON TABLE public.usage_tracking IS 'Contador diário de gerações por usuário. Limite anti-abuso de 200/dia. Reset à meia-noite America/Sao_Paulo.';


-- ═══════════════════════════════════════════════════════════════════
-- FIM DO SCHEMA
-- 
-- PRÓXIMOS PASSOS APÓS RODAR ESTE SCRIPT:
--   1. Verificar que tabelas foram criadas: Table Editor no Supabase
--   2. Verificar que RLS está ativo (ícone de cadeado nas tabelas)
--   3. Teste manual de isolamento (criar 2 usuários test, verificar bloqueio)
--   4. Implementar webhook Perfect Pay que usa admin API pra criar user:
--      supabase.auth.admin.createUser({ email, email_confirm: true })
--   5. Após criar user, atualizar profile:
--      UPDATE profiles SET subscription_status='active', purchased_at=NOW(),
--        transaction_id=xxx, payment_method=xxx WHERE id=user_id
--   6. Enviar magic link: supabase.auth.signInWithOtp({ email })
-- ═══════════════════════════════════════════════════════════════════
