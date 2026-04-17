import { ArrowRight, Sparkles, Layers3, Gauge } from 'lucide-react';
import { useApp } from '../app/AppState';

const quickAccounts = [
  { id: 'teacher', label: 'Professor', detail: 'Painel completo de gestao escolar' },
  { id: 'ana', label: 'Ana Lima', detail: 'Fluxo social e academico do aluno' },
  { id: 'diego', label: 'Diego Melo', detail: 'Aluno com alto desempenho e rotina forte' },
];

export function LandingPage() {
  const { loginAs, state } = useApp();

  return (
    <div className="landing-page">
      <section className="landing-hero">
        <div className="landing-copy">
          <span className="hero-badge">
            <Sparkles size={15} />
            Refat 4 em React
          </span>
          <h1>Uma camada social escolar mais viva, organizada e pronta para evoluir.</h1>
          <p>
            Esta versao preserva a atmosfera do HTML original, mas agora em uma arquitetura React
            real, com estado centralizado, componentes reutilizaveis, pesquisa, feed, mensagens,
            tarefas, analytics e configuracoes em crescimento constante.
          </p>
          <div className="landing-actions">
            {quickAccounts.map((account) => (
              <button key={account.id} className="solid-button" type="button" onClick={() => loginAs(account.id)}>
                <span>{account.label}</span>
                <ArrowRight size={16} />
              </button>
            ))}
          </div>
          <div className="landing-account-hints">
            {quickAccounts.map((account) => (
              <div key={account.id} className="list-card">
                <strong>{account.label}</strong>
                <small>{account.detail}</small>
              </div>
            ))}
          </div>
        </div>

        <div className="landing-grid">
          <article className="feature-card">
            <Layers3 size={18} />
            <strong>Estrutura por camadas</strong>
            <p>Estado em TypeScript, paginas modulares e espaco pronto para crescer sem voltar ao monolito.</p>
          </article>
          <article className="feature-card">
            <Gauge size={18} />
            <strong>Leve, mas completo</strong>
            <p>Feed, mensagens, tarefas, busca expansivel, notificacoes, tema, idioma e analytics no mesmo fluxo.</p>
          </article>
          <article className="feature-card">
            <Sparkles size={18} />
            <strong>Pronto para backend real</strong>
            <p>Os mocks ficam isolados para depois trocar por Supabase ou outra camada sem desmontar a UX.</p>
          </article>
        </div>
      </section>

      <section className="landing-preview">
        <div className="landing-preview__label">Estado inicial da demo</div>
        <div className="landing-preview__stats">
          <div>
            <strong>{state.users.length}</strong>
            <span>usuarios</span>
          </div>
          <div>
            <strong>{state.posts.length}</strong>
            <span>publicacoes</span>
          </div>
          <div>
            <strong>{state.tasks.length}</strong>
            <span>tarefas</span>
          </div>
          <div>
            <strong>{state.chatGroups.length + state.directThreads.length}</strong>
            <span>conversas</span>
          </div>
        </div>
      </section>
    </div>
  );
}
