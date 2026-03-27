import { memo, useRef } from 'react';
import ChatImage from './ChatImage';
import { formatTime } from '../utils/formatters';

const TickIcon = ({ status }) => {
  if (status === 'read') return <span style={{ color: '#53bdeb' }}>✓✓</span>;
  if (status === 'delivered') return <span style={{ color: '#8696a0' }}>✓✓</span>;
  return <span style={{ color: '#8696a0' }}>✓</span>;
};

const MessageBubble = memo(
  ({
    message,
    isMine,
    isEditing,
    editValue,
    onEditChange,
    onEditCancel,
    onEditSave,
    onOpenActions,
    onOpenImageViewer
  }) => {
    const longPressTimerRef = useRef(null);

    const openActions = () => onOpenActions(message);
    const clearLongPress = () => {
      if (longPressTimerRef.current) {
        window.clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }
    };

    return (
      <article
        className={`message-bubble ${isMine ? 'mine' : ''} ${message.isDeleted ? 'deleted' : ''}`}
        onContextMenu={(event) => {
          if (isEditing) return;
          event.preventDefault();
          openActions();
        }}
        onTouchStart={() => {
          if (isEditing) return;
          clearLongPress();
          longPressTimerRef.current = window.setTimeout(() => {
            openActions();
            clearLongPress();
          }, 420);
        }}
        onTouchEnd={clearLongPress}
        onTouchCancel={clearLongPress}
        onTouchMove={clearLongPress}
      >
        <button type="button" className="message-menu-button" aria-label="Message actions" onClick={openActions}>
          ⋮
        </button>
        {message.image && <ChatImage src={message.image} alt="attachment" onOpenViewer={onOpenImageViewer} />}
        {isEditing ? (
          <div className="message-edit-box">
            <input value={editValue} onChange={(event) => onEditChange(event.target.value)} maxLength={5000} autoFocus />
            <div className="message-edit-actions">
              <button type="button" className="ghost" onClick={onEditCancel}>Cancel</button>
              <button type="button" onClick={onEditSave}>Save</button>
            </div>
          </div>
        ) : (
          message.message && <p className={message.isDeleted ? 'message-deleted-copy' : ''}>{message.message}</p>
        )}
        <span className="message-meta-line">
          {message.isEdited && !message.isDeleted && <em>(edited)</em>}
          {formatTime(message.timestamp)}
          {isMine && <TickIcon status={message.status} />}
        </span>
      </article>
    );
  }
);

export default MessageBubble;