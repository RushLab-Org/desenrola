const rows = [
  { label: 'Não parece IA',          sacada: '✓', coach: '—',         chatgpt: '✗',          amigo: '—'     },
  { label: 'Funciona na hora certa',  sacada: '✓', coach: '✗',         chatgpt: '✓',          amigo: '✗'     },
  { label: 'Paga uma única vez',      sacada: '✓', coach: '✗',         chatgpt: '✗',          amigo: '✓'     },
  { label: 'Calibrado pro seu perfil',sacada: '✓', coach: '✓',         chatgpt: '✗',          amigo: '✗'     },
  { label: 'Disponível às 23h',       sacada: '✓', coach: '✗',         chatgpt: '✓',          amigo: '✗'     },
  { label: 'Custo',                   sacada: 'R$47', coach: 'R$2.000+', chatgpt: 'R$100+/mês', amigo: 'Grátis'},
] as const;

function cellClass(val: string): string {
  if (val === '✓') return 'comp-table__yes';
  if (val === '✗') return 'comp-table__no';
  return '';
}

export function ComparisonTable() {
  return (
    <section data-animate>
      <div className="wrap">
        <p className="kicker">Por que a Sacada?</p>
        <h2 className="h-sec">Comparado com as outras opções que você já considerou:</h2>
        <div className="comp-table-wrap">
          <table className="comp-table">
            <thead>
              <tr>
                <th></th>
                <th className="comp-table__highlight">Sacada IA</th>
                <th>Coach</th>
                <th>ChatGPT</th>
                <th>Pedir pro amigo</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.label}>
                  <td className="comp-table__label">{row.label}</td>
                  <td className={`comp-table__highlight ${cellClass(row.sacada)}`}>{row.sacada}</td>
                  <td className={cellClass(row.coach)}>{row.coach}</td>
                  <td className={cellClass(row.chatgpt)}>{row.chatgpt}</td>
                  <td className={cellClass(row.amigo)}>{row.amigo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
