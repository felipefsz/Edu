import { ArrowRight, Sparkles, Layers3, Gauge } from 'lucide-react';
import { useApp } from '../app/AppState';

const quickAccounts = [
  { id: 'teacher', label: 'Professor', detail: 'Teacher command center' },
  { id: 'ana', label: 'Ana Lima', detail: 'Student social dashboard' },
  { id: 'diego', label: 'Diego Melo', detail: 'High-performance student flow' },
];

export function LandingPage() {
  const { loginAs, state } = useApp();

  return (
    <div className="landing-page">
      <section className="landing-hero">
        <div className="landing-copy">
          <span className="hero-badge">
            <Sparkles size={15} />
            React migration step 2
          </span>
          <h1>EduSocial is now moving into a real React architecture.</h1>
          <p>
            The legacy HTML remains as reference, but this new app already splits data, state,
            modals, search, feed, messaging, tasks, analytics, and settings into a structure
            that can grow like a production product.
          </p>
          <div className="landing-actions">
            {quickAccounts.map((account) => (
              <button key={account.id} className="solid-button" type="button" onClick={() => loginAs(account.id)}>
                <span>{account.label}</span>
                <ArrowRight size={16} />
              </button>
            ))}
          </div>
        </div>

        <div className="landing-grid">
          <article className="feature-card">
            <Layers3 size={18} />
            <strong>Feature-first structure</strong>
            <p>State in TypeScript, reusable components, and pages separated from the old monolith.</p>
          </article>
          <article className="feature-card">
            <Gauge size={18} />
            <strong>Light but complete</strong>
            <p>React, Router, local persistence, theme, language, search, notifications, and analytics.</p>
          </article>
          <article className="feature-card">
            <Sparkles size={18} />
            <strong>Ready for backend swap</strong>
            <p>Mock data is isolated, so Supabase, Firebase, or a custom API can replace it cleanly.</p>
          </article>
        </div>
      </section>

      <section className="landing-preview">
        <div className="landing-preview__label">Seed status</div>
        <div className="landing-preview__stats">
          <div>
            <strong>{state.users.length}</strong>
            <span>users</span>
          </div>
          <div>
            <strong>{state.posts.length}</strong>
            <span>posts</span>
          </div>
          <div>
            <strong>{state.tasks.length}</strong>
            <span>tasks</span>
          </div>
          <div>
            <strong>{state.chatGroups.length + state.directThreads.length}</strong>
            <span>threads</span>
          </div>
        </div>
      </section>
    </div>
  );
}
