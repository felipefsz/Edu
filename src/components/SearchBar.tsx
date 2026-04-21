import { Search, UserRound, Users, MessageSquareText, FileText, BellRing, NotebookTabs, HelpCircle } from 'lucide-react';
import { useDeferredValue, useEffect, useRef } from 'react';
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
  const inputRef = useRef<HTMLInputElement | null>(null);
  const deferredQuery = useDeferredValue(state.ui.searchQuery);
  const results = buildSearchResults(state, deferredQuery);
  const shouldShowDropdown = state.ui.searchOpen && state.ui.searchQuery.trim().length > 1;

  useEffect(() => {
    if (state.ui.searchOpen) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [state.ui.searchOpen]);

  const closeSearch = () => {
    setSearchQuery('');
    setSearchOpen(false);
  };

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

    closeSearch();
  };

  return (
    <div
      className="search-slot"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setSearchOpen(false);
        }
      }}
    >
      <div className={state.ui.searchOpen ? 'search-inline search-inline--open' : 'search-inline'}>
        <button
          type="button"
          className="search-icon-button"
          onClick={() => {
            if (state.ui.searchOpen) {
              closeSearch();
              return;
            }
            setSearchOpen(true);
          }}
          aria-expanded={state.ui.searchOpen}
          aria-label={t('search')}
        >
          <Search size={16} />
        </button>
        <input
          ref={inputRef}
          className="search-input"
          value={state.ui.searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          onFocus={() => setSearchOpen(true)}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              event.preventDefault();
              closeSearch();
            }
          }}
          placeholder={`${t('search')}...`}
          aria-label={t('search')}
          tabIndex={state.ui.searchOpen ? 0 : -1}
        />
        {state.ui.searchOpen && state.ui.searchQuery ? (
          <button className="search-clear-button" type="button" onClick={closeSearch}>
            ×
          </button>
        ) : null}
      </div>

      {shouldShowDropdown ? (
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
          ) : (
            <div className="search-empty">{t('noResults')}</div>
          )}
        </div>
      ) : null}
    </div>
  );
}
