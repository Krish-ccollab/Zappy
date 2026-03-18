import { memo } from 'react';
import { formatTime } from '../utils/formatters';

const ChatListItem = memo(({ chat, active, onSelect }) => (
  <button className={`chat-list-item ${active ? 'active' : ''}`} onClick={() => onSelect(chat)} type="button">
    <div className="avatar-wrap">
      <img src={chat.peer?.profilePic || 'https://placehold.co/56x56'} alt={chat.peer?.username || 'User'} />
      <span className={`presence-dot ${chat.peer?.isOnline ? 'online' : ''}`} />
    </div>
    <div className="chat-list-copy">
      <div className="chat-list-row">
        <strong>{chat.peer?.fullName || chat.peer?.username}</strong>
        <span>{formatTime(chat.lastMessageAt)}</span>
      </div>
      <div className="chat-list-row muted">
        <span>@{chat.peer?.username}</span>
        <span className="message-preview">{chat.lastMessage || 'Start chatting'}</span>
      </div>
    </div>
  </button>
));

export default ChatListItem;
