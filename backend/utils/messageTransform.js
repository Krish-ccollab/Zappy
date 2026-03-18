export const serializeMessage = (messageDoc) => ({
  _id: messageDoc._id,
  chatId: messageDoc.chatId,
  sender: messageDoc.sender,
  message: messageDoc.message,
  image: messageDoc.image,
  clientMessageId: messageDoc.clientMessageId,
  status: messageDoc.status,
  timestamp: messageDoc.timestamp
});
