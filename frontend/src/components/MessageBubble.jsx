import { memo, useRef } from 'react';
import ChatImage from './ChatImage';
import { formatTime } from '../utils/formatters';

const MessageBubble = memo(
  ({
    message,
    isMine,
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

    const metaInfo = `${formatTime(message.timestamp)}${isMine ? ' ✓✓' : ''}`;
    const shouldShowMetaLine = !message.image || Boolean(message.message);

    return (
      <article
        className={`message-bubble ${isMine ? 'mine' : ''} ${message.isDeleted ? 'deleted' : ''}`}
        onContextMenu={(event) => {
          event.preventDefault();
          openActions();
        }}
        onTouchStart={() => {
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
        {message.image && <ChatImage src={message.image} alt="attachment" metaInfo={metaInfo} onOpenViewer={onOpenImageViewer} />}
        {message.message && <p className={message.isDeleted ? 'message-deleted-copy' : ''}>{message.message}</p>}
        {shouldShowMetaLine && (
          <span className="message-meta-line">
            {message.isEdited && !message.isDeleted && <em>(edited)</em>}
            <span>{metaInfo}</span>
          </span>
        )}
      </article>
    );
  }
);

export default MessageBubble;
