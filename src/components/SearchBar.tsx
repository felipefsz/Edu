import { Search, UserRound, Users, MessageSquareText, FileText, BellRing } from 'lucide-react';
import { useDeferredValue } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../app/AppState';
import { buildSearchResults } from '../utils/selectors';

const iconMap = {
  user: UserRound,
  chat: Users,
  post: MessageSquareText,
  task: FileText,
  notice: BellRing,
};

export function SearchBar() {
  const { setSearchOpen, setSearchQuery, state, selectThread, t } = useApp();
  const navigate = useNavigate();
  const deferredQuery = useDeferredValue(state.ui.searchQuery);
  const results = buildSearchResults(state, deferredQuery);

  const handleResult = (targetPage: string, targetId?: string) => {
    if (targetPage === 'profile' && targetId) {
      navigate(`/profile/${targetId}`);
    } else if (targetPage === 'messages') {
      if (targetId) selectThread(targetId);
      navigate('/messages');
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
                  onClick={() => handleResult(result.targetPage, result.targetId)}
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
