import { useEffect, useMemo, useState } from 'react';

const getBlurPreviewUrl = (url) => {
  if (!url.includes('/upload/')) {
    return url;
  }

  return url.replace('/upload/', '/upload/e_blur:1200,q_1,w_48/');
};

const ChatImage = ({ src, alt = 'attachment', metaInfo = '', onOpenViewer }) => {
  const [fullImageUrl, setFullImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const previewUrl = useMemo(() => getBlurPreviewUrl(src), [src]);

  useEffect(() => () => {
    if (fullImageUrl) {
      URL.revokeObjectURL(fullImageUrl);
    }
  }, [fullImageUrl]);

  const fetchImage = async ({ openViewer = false } = {}) => {
    if (fullImageUrl) {
      if (openViewer) {
        onOpenViewer({ src: fullImageUrl, originalSrc: src });
      }
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      const response = await fetch(src);
      if (!response.ok) {
        throw new Error('Image download failed.');
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      setFullImageUrl((current) => {
        if (current) {
          URL.revokeObjectURL(current);
        }
        return objectUrl;
      });

      if (openViewer) {
        onOpenViewer({ src: objectUrl, originalSrc: src });
      }
    } catch (requestError) {
      setError(requestError.message || 'Unable to load image.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-image-shell">
      <button
        type="button"
        className={`chat-image-button ${fullImageUrl ? 'loaded' : ''} ${isLoading ? 'loading' : ''}`}
        onClick={() => (fullImageUrl ? onOpenViewer({ src: fullImageUrl, originalSrc: src }) : fetchImage({ openViewer: true }))}
      >
        <span className="chat-image-frame">
          <img
            className={`message-image ${fullImageUrl ? 'ready' : 'message-image--blurred'}`}
            src={fullImageUrl || previewUrl}
            alt={alt}
          />
        </span>
        {!fullImageUrl && (
          <span className="chat-image-overlay">
            {isLoading ? 'Loading image...' : 'Download image'}
          </span>
        )}
        {metaInfo && <span className="chat-image-meta">{metaInfo}</span>}
      </button>
      {!fullImageUrl && !isLoading && (
        <button type="button" className="chat-image-download" onClick={() => fetchImage()}>
          ⬇ Download
        </button>
      )}
      {error && <small className="error-text">{error}</small>}
    </div>
  );
};

export default ChatImage;
