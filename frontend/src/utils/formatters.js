export const formatTime = (value) => {
  if (!value) return '';
  return new Intl.DateTimeFormat([], {
    hour: 'numeric',
    minute: '2-digit'
  }).format(new Date(value));
};

export const formatLastSeen = (value, isOnline) => {
  if (isOnline) return 'online';
  if (!value) return 'offline';
  return `last seen ${new Intl.DateTimeFormat([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(value))}`;
};
