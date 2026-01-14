'use client';

import React from 'react';
import { SystemMessage } from './SystemMessage';
import { useSystemMessage } from '@/hooks/useSystemMessage';

/**
 * Global System Message Display
 * 
 * Place this component once in your layout to enable System messages
 * throughout the entire application.
 * 
 * Usage:
 * 1. Wrap your app with <SystemMessageProvider>
 * 2. Add <SystemMessageDisplay /> anywhere inside the provider
 * 3. Use useSystemMessage() hook to trigger messages
 */
export const SystemMessageDisplay: React.FC = () => {
  const { messageState, hideMessage, isVisible } = useSystemMessage();

  return (
    <SystemMessage
      type={messageState.type}
      title={messageState.title}
      message={messageState.message}
      urgent={messageState.urgent}
      visible={isVisible}
      onClose={hideMessage}
      autoCloseDelay={messageState.autoCloseDelay}
    />
  );
};

export default SystemMessageDisplay;
