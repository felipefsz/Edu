import { Search, UserRound, Users, MessageSquareText, FileText, BellRing, NotebookTabs, HelpCircle } from 'lucide-react';
import { useDeferredValue } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../app/AppState';
import type { SearchResult } from '../app/types';
import { buildSearchResults } from '../utils/selectors';

const iconMap = {
  user: UserRound,
  chat: Users,
  post: MessageSquareText,
  task: FileText,
  notice: BellRing,
  forum: NotebookTabs,
  quiz: HelpCircle,
};

export function SearchBar() {
  const { openModal, setSearchOpen, setSearchQuery, state, selectThread, t } = useApp();
  const navigate = useNavigate();
  const deferredQuery = useDeferredValue(state.ui.searchQuery);
  const results = buildSearchResults(state, deferredQuery);

  const handleResult = (result: SearchResult) => {
    const { targetPage, targetId } = result;

    if (targetPage === 'profile' && targetId) {
      navigate(`/profile/${targetId}`);
    } else if (targetPage === 'messages') {
      if (targetId) selectThread(targetId);
      navigate('/messages');
    } else if (result.type === 'post' && targetId) {
      navigate('/feed');
      openModal({ type: 'postDetails', postId: targetId });
    } else if (result.type === 'task' && targetId) {
      navigate('/tasks');
      openModal({ type: 'taskDetails', taskId: targetId });
    } else if (result.type === 'notice' && targetId) {
      navigate('/notices');
      openModal({ type: 'noticeDetails', noticeId: targetId });
    } else if (result.type === 'forum' && targetId) {
      navigate('/forum');
      openModal({ type: 'forumTopic', topicId: targetId });
    } else {
      navigate(`/${targetPage}`);
    }

    setSearchQuery('');
    setSearchOpen(false);
  };

  return (
    <div className="search-slot">
      <div className={state.ui.searchOpen ? 'search-inline search-inline--open' : 'search-inline'}>
        <button type="button" className="search-icon-button" onClick={() => setSearchOpen(!state.ui.searchOpen)}>
          <Search size={16} />
        </button>
        <input
          className="search-input"
          value={state.ui.searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          onFocus={() => setSearchOpen(true)}
          placeholder={`${t('search')}...`}
          aria-label={t('search')}
        />
        {state.ui.searchOpen && state.ui.searchQuery ? (
          <button className="search-clear-button" type="button" onClick={() => setSearchQuery('')}>
            ×
          </button>
        ) : null}
      </div>

      {state.ui.searchOpen ? (
        <div className="search-dropdown">
          {results.length ? (
            results.map((result) => {
              const Icon = iconMap[result.type];
              return (
                <button
                  key={result.id}
                  type="button"
                  className="search-result"
                  onClick={() => handleResult(result)}
                >
                  <span className="search-result__icon">
                    <Icon size={16} />
                  </span>
                  <span className="search-result__content">
                    <strong>{result.title}</strong>
                    <small>{result.subtitle}</small>
                  </span>
                  <span className="search-result__type">{result.type}</span>
                </button>
              );
            })
          ) : state.ui.searchQuery.length > 1 ? (
            <div className="search-empty">{t('noResults')}</div>
          ) : (
            <div className="search-empty">{t('typeToSearch')}</div>
          )}
        </div>
      ) : null}
    </div>
  );
}
