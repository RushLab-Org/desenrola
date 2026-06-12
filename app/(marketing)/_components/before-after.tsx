export function BeforeAfterSection() {
  return (
    <section data-animate>
      <div className="wrap">
        <div className="pain-cards">
          <div className="pain-card">
            <span className="pain-card__icon">😶</span>
            <div>
              <strong>Trava encarando a tela</strong>
              <p>Não sabe o que mandar e fica em branco</p>
            </div>
          </div>
          <div className="pain-card">
            <span className="pain-card__icon">📵</span>
            <div>
              <strong>Manda algo e ela some</strong>
              <p>&quot;✓✓ Visualizado&quot; — sem resposta</p>
            </div>
          </div>
          <div className="pain-card">
            <span className="pain-card__icon">📅</span>
            <div>
              <strong>Ficou anos fora do jogo</strong>
              <p>As regras mudaram. O manual não.</p>
            </div>
          </div>
        </div>

        <p className="before-after-label">A Sacada resolve isso</p>

        <div className="before-after-grid">
          <div className="before-after-col before-after-col--bad">
            <p className="before-after-col__title">Sem a Sacada</p>
            <div className="ba-convo">
              <div className="chat-bubble chat-bubble--her">oi, sumiu né 😏</div>
              <div className="chat-bubble chat-bubble--me-bad">é, tava ocupado kkkk</div>
              <p className="read-status read-status--bad">✓✓ Visualizado</p>
            </div>
            <div className="ba-convo">
              <div className="chat-bubble chat-bubble--her">o que você fez no fds?</div>
              <div className="chat-bubble chat-bubble--me-bad">nada especial, fiquei em casa</div>
              <p className="read-status read-status--bad">✓✓ Visualizado</p>
            </div>
          </div>

          <div className="before-after-col before-after-col--good">
            <p className="before-after-col__title">Com a Sacada</p>
            <div className="ba-convo">
              <div className="chat-bubble chat-bubble--her">oi, sumiu né 😏</div>
              <div className="chat-bubble chat-bubble--me-good">sumiço intencional. queria ver quanto tempo até você notar</div>
              <p className="read-status read-status--good">❤️ Ela respondeu</p>
            </div>
            <div className="ba-convo">
              <div className="chat-bubble chat-bubble--her">o que você fez no fds?</div>
              <div className="chat-bubble chat-bubble--me-good">tive uma ideia pra você. mas só conto pessoalmente</div>
              <p className="read-status read-status--good">🔥 Marcou encontro</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
