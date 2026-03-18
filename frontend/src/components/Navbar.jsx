import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import useDebounce from '../hooks/useDebounce';
import RequestDropdown from './RequestDropdown';

const Navbar = ({ requests, onRespond, onSearchPick }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [showRequests, setShowRequests] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const debouncedQuery = useDebounce(query);
  const { user, logout, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated || !debouncedQuery.trim()) {
      setResults([]);
      return undefined;
    }

    let active = true;
    api.get(`/users/search?q=${encodeURIComponent(debouncedQuery)}`).then(({ data }) => {
      if (active) setResults(data);
    });

    return () => {
      active = false;
    };
  }, [debouncedQuery, isAuthenticated]);

  const badgeCount = requests.length;
  const initials = useMemo(() => user?.fullName?.split(' ').map((part) => part[0]).join('').slice(0, 2) || 'Z', [user]);

  return (
    <header className="topbar whatsapp-bar">
      <div className="brand-wrap">
        <Link to={isAuthenticated ? '/dashboard' : '/login'} className="brand-link">Zappy</Link>
        {isAuthenticated && (
          <div className="navbar-search">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by username"
              aria-label="Search users"
            />
            {results.length > 0 && (
              <div className="dropdown-card search-dropdown">
                {results.map((result) => (
                  <button
                    key={result._id}
                    type="button"
                    className="search-result"
                    onClick={() => {
                      onSearchPick?.(result);
                      setQuery('');
                      setResults([]);
                      navigate('/dashboard');
                    }}
                  >
                    <img src={result.profilePic || 'https://placehold.co/40x40'} alt={result.username} />
                    <div>
                      <strong>{result.fullName}</strong>
                      <p>@{result.username}</p>
                    </div>
                    <span className={`presence-pill ${result.isOnline ? 'online' : ''}`}>
                      {result.isOnline ? 'Online' : 'Offline'}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {isAuthenticated && (
        <div className="nav-actions">
          <button type="button" className="icon-button" onClick={() => setShowRequests((open) => !open)}>
            Requests
            {badgeCount > 0 && <span className="badge-dot">{badgeCount}</span>}
          </button>
          <button type="button" className="icon-button" onClick={toggleTheme}>
            {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
          </button>
          <button type="button" className="profile-pill" onClick={() => setMenuOpen((open) => !open)}>
            {user?.profilePic ? <img src={user.profilePic} alt={user.username} /> : <span>{initials}</span>}
          </button>
          {menuOpen && (
            <div className="dropdown-card profile-dropdown">
              <strong>{user?.fullName}</strong>
              <p>@{user?.username}</p>
              <button type="button" className="ghost" onClick={logout}>Logout</button>
            </div>
          )}
          <RequestDropdown open={showRequests} requests={requests} onRespond={onRespond} />
        </div>
      )}
    </header>
  );
};

export default Navbar;
