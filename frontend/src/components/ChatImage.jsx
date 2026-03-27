import { useMemo, useState } from 'react';

const getBlurPreviewUrl = (url) => {
  if (!url.includes('/upload/')) {
    return url;
  }

  return url.replace('/upload/', '/upload/e_blur:1200,q_1,w_48/');
};

const ChatImage = ({ src, alt = 'attachment', metaInfo = '', onOpenViewer }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState('');
  const previewUrl = useMemo(() => getBlurPreviewUrl(src), [src]);

  return (
    <div className="chat-image-shell">
      <button
        type="button"
        className={`chat-image-button ${isLoaded ? 'loaded' : ''}`}
        onClick={() => onOpenViewer({ src, originalSrc: src })}
      >
        <span className="chat-image-frame">
          <img className="message-image message-image-preview" src={previewUrl} alt="" aria-hidden="true" />
          <img
            className={`message-image message-image-main ${isLoaded ? 'ready' : ''}`}
            src={src}
            alt={alt}
            loading="lazy"
            decoding="async"
            onLoad={() => {
              setIsLoaded(true);
              setError('');
            }}
            onError={() => {
              setError('Unable to load image.');
              setIsLoaded(true);
            }}
          />
        </span>
        {!isLoaded && <span className="chat-image-overlay">Loading image…</span>}
        {metaInfo && <span className="chat-image-meta">{metaInfo}</span>}
      </button>
      <a className="chat-image-download" href={src} download target="_blank" rel="noreferrer">⬇ Download</a>
      {error && <small className="error-text">{error}</small>}
    </div>
  );
};

export default ChatImage;
