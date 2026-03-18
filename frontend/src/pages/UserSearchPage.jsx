import { useEffect, useState } from 'react';
import api from '../api/client';
import useDebounce from '../hooks/useDebounce';

const UserSearchPage = () => {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [feedback, setFeedback] = useState('Type a username to discover people.');
  const debouncedQuery = useDebounce(query);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setUsers([]);
      setFeedback('Type a username to discover people.');
      return;
    }

    api.get(`/users/search?q=${encodeURIComponent(debouncedQuery)}`).then(({ data }) => {
      setUsers(data);
      setFeedback(data.length ? '' : 'No users found.');
    });
  }, [debouncedQuery]);

  const sendRequest = async (receiverId) => {
    await api.post('/chats/requests', { receiverId });
    setFeedback('Chat request sent successfully.');
  };

  return (
    <section className="page-shell search-page">
      <div className="panel-card">
        <h2>Search users</h2>
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by username" />
        <div className="search-results-grid">
          {users.map((user) => (
            <article key={user._id} className="search-user-card">
              <img src={user.profilePic || 'https://placehold.co/72x72'} alt={user.username} />
              <strong>{user.fullName}</strong>
              <p>@{user.username}</p>
              <button type="button" onClick={() => sendRequest(user._id)}>Send chat request</button>
            </article>
          ))}
        </div>
        {feedback && <p className="muted-copy">{feedback}</p>}
      </div>
    </section>
  );
};

export default UserSearchPage;
