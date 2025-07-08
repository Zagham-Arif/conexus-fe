import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useEntry } from '../contexts/EntryContext';
import { Toaster as ToastComponent } from './ui/toast';

const Toaster: React.FC = () => {
  const { message: authMessage, messageType: authMessageType, clearMessage: clearAuthMessage } = useAuth();
  const { message: entryMessage, messageType: entryMessageType, clearMessage: clearEntryMessage } = useEntry();

  // Display auth messages first, then entry messages
  const message = authMessage || entryMessage;
  const messageType = authMessage ? authMessageType : entryMessageType;
  const clearMessage = authMessage ? clearAuthMessage : clearEntryMessage;

  if (!message || !messageType) {
    return null;
  }

  return (
    <ToastComponent
      message={message}
      type={messageType}
      onClose={clearMessage}
    />
  );
};

export default Toaster;