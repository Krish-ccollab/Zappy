import { memo, useRef } from 'react';
import ChatImage from './ChatImage';
import { formatTime } from '../utils/formatters';

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
        className={`message-bubble ${isMine ? 'mine' : ''} ${message.isDeleted ? 'deleted' : ''} ${isEditing ? 'editing' : ''}`}
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
            <span className="message-edit-label">Editing message…</span>
            <input
              className="message-edit-input"
              value={editValue}
              onChange={(event) => onEditChange(event.target.value)}
              maxLength={5000}
              autoFocus
            />
            <div className="message-edit-actions">
              <button type="button" className="ghost edit-cancel-button" onClick={onEditCancel}>Cancel</button>
              <button type="button" className="edit-save-button" onClick={onEditSave}>Save</button>
            </div>
          </div>
        ) : (
          message.message && <p className={message.isDeleted ? 'message-deleted-copy' : ''}>{message.message}</p>
        )}
        <span className="message-meta-line">
          {message.isEdited && !message.isDeleted && <em>(edited)</em>}
          <span>{formatTime(message.timestamp)} {isMine ? '✓✓' : ''}</span>
        </span>
      </article>
    );
  }
);

export default MessageBubble;
