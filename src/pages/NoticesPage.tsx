import { useState } from 'react';
import { useApp } from '../app/AppState';
import { getRelevantNotices } from '../utils/selectors';

export function NoticesPage() {
  const { createNotice, currentRole, currentUser, openModal, state } = useApp();
  const isEnglish = state.preferences.language === 'en';
  const notices = getRelevantNotices(state, currentUser);
  const [noticeForm, setNoticeForm] = useState({
    title: '',
    body: '',
    classroom: '',
    pinned: false,
  });

  return (
    <div className="stack-gap">
      <section className="hero-panel">
        <div>
          <div className="panel-card__eyebrow">{isEnglish ? 'Notices' : 'Avisos'}</div>
          <h1 className="hero-panel__title">
            {isEnglish ? 'The official school update center.' : 'A central oficial de comunicados da escola.'}
          </h1>
          <p className="hero-panel__copy">
            {isEnglish
              ? 'A clearer version of the old notices panel, integrated with feed and notifications.'
              : 'Uma versao mais clara do painel antigo de avisos, integrada ao feed e notificacoes.'}
          </p>
        </div>
      </section>

      {currentRole === 'teacher' ? (
        <section className="panel-card">
          <div className="panel-card__eyebrow">{isEnglish ? 'Publish notice' : 'Publicar aviso'}</div>
          <div className="form-grid">
            <input
              className="ui-input"
              placeholder={isEnglish ? 'Title' : 'Titulo'}
              value={noticeForm.title}
              onChange={(event) => setNoticeForm((current) => ({ ...current, title: event.target.value }))}
            />
            <input
              className="ui-input"
              placeholder={isEnglish ? 'Classroom or empty' : 'Turma ou vazio'}
              value={noticeForm.classroom}
              onChange={(event) => setNoticeForm((current) => ({ ...current, classroom: event.target.value }))}
            />
            <textarea
              className="ui-textarea"
              rows={4}
              placeholder={isEnglish ? 'Message' : 'Mensagem'}
              value={noticeForm.body}
              onChange={(event) => setNoticeForm((current) => ({ ...current, body: event.target.value }))}
            />
          </div>
          <div className="composer-card__actions">
            <label className="checkbox-row" htmlFor="notice-page-pinned">
              <input
                id="notice-page-pinned"
                type="checkbox"
                checked={noticeForm.pinned}
                onChange={(event) => setNoticeForm((current) => ({ ...current, pinned: event.target.checked }))}
              />
              <span>{isEnglish ? 'Pin notice' : 'Fixar aviso'}</span>
            </label>
            <button
              className="solid-button"
              type="button"
              onClick={() => {
                createNotice({
                  title: noticeForm.title,
                  body: noticeForm.body,
                  classroom: noticeForm.classroom || undefined,
                  pinned: noticeForm.pinned,
                });
                setNoticeForm({ title: '', body: '', classroom: '', pinned: false });
              }}
            >
              {isEnglish ? 'Publish' : 'Publicar'}
            </button>
          </div>
        </section>
      ) : null}

      <section className="notice-grid">
        {notices.map((notice) => (
          <article key={notice.id} className="panel-card notice-card">
            <div className="panel-card__eyebrow">
              {new Date(notice.createdAt).toLocaleDateString('pt-BR')}
            </div>
            <h2>{notice.title}</h2>
            <p>{notice.body}</p>
            <div className="tag-list">
              {notice.classroom ? <span className="tag-pill">Turma {notice.classroom}</span> : null}
              {notice.pinned ? <span className="status-pill">{isEnglish ? 'Pinned' : 'Fixado'}</span> : null}
            </div>
            <button className="ghost-button ghost-button--slim" type="button" onClick={() => openModal({ type: 'noticeDetails', noticeId: notice.id })}>
              {isEnglish ? 'Open notice' : 'Abrir aviso'}
            </button>
          </article>
        ))}
      </section>
    </div>
  );
}
