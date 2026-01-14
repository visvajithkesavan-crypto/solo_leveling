'use client';

import { useState, useCallback, createContext, useContext, ReactNode } from 'react';
import { SYSTEM_MESSAGES, getRandomMessage, SystemMessageScenarioKey } from '@/lib/systemMessages';
import { MessageType } from '@/components/SystemMessage';

interface SystemMessageState {
  visible: boolean;
  type: MessageType;
  title: string;
  message: string;
  urgent: boolean;
  autoCloseDelay: number | null;
}

interface SystemMessageContextValue {
  messageState: SystemMessageState;
  showMessage: (
    scenario: SystemMessageScenarioKey,
    options?: {
      customTitle?: string;
      customMessage?: string;
      autoCloseDelay?: number | null;
      interpolations?: Record<string, string | number>;
    }
  ) => void;
  showCustomMessage: (
    type: MessageType,
    title: string,
    message: string,
    options?: {
      urgent?: boolean;
      autoCloseDelay?: number | null;
    }
  ) => void;
  hideMessage: () => void;
  isVisible: boolean;
}

const defaultState: SystemMessageState = {
  visible: false,
  type: 'notification',
  title: '',
  message: '',
  urgent: false,
  autoCloseDelay: 5000,
};

const SystemMessageContext = createContext<SystemMessageContextValue | null>(null);

/**
 * Provider component for System Messages
 * Wrap your app with this to enable useSystemMessage hook
 */
export function SystemMessageProvider({ children }: { children: ReactNode }) {
  const [messageState, setMessageState] = useState<SystemMessageState>(defaultState);

  const showMessage = useCallback((
    scenario: SystemMessageScenarioKey,
    options?: {
      customTitle?: string;
      customMessage?: string;
      autoCloseDelay?: number | null;
      interpolations?: Record<string, string | number>;
    }
  ) => {
    const randomMessage = getRandomMessage(scenario);
    
    let title = options?.customTitle ?? randomMessage.title;
    let message = options?.customMessage ?? randomMessage.message;
    
    if (options?.interpolations) {
      Object.entries(options.interpolations).forEach(([key, value]) => {
        title = title.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value));
        message = message.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value));
      });
    }

    setMessageState({
      visible: true,
      type: randomMessage.type,
      title,
      message,
      urgent: randomMessage.urgent ?? false,
      autoCloseDelay: options?.autoCloseDelay !== undefined 
        ? options.autoCloseDelay 
        : (randomMessage.urgent ? 8000 : 5000),
    });
  }, []);

  const showCustomMessage = useCallback((
    type: MessageType,
    title: string,
    message: string,
    options?: {
      urgent?: boolean;
      autoCloseDelay?: number | null;
    }
  ) => {
    setMessageState({
      visible: true,
      type,
      title,
      message,
      urgent: options?.urgent ?? false,
      autoCloseDelay: options?.autoCloseDelay !== undefined 
        ? options.autoCloseDelay 
        : 5000,
    });
  }, []);

  const hideMessage = useCallback(() => {
    setMessageState(prev => ({ ...prev, visible: false }));
  }, []);

  const value: SystemMessageContextValue = {
    messageState,
    showMessage,
    showCustomMessage,
    hideMessage,
    isVisible: messageState.visible,
  };

  return (
    <SystemMessageContext.Provider value={value}>
      {children}
    </SystemMessageContext.Provider>
  );
}

/**
 * Hook to access System Message functionality
 */
export function useSystemMessage(): SystemMessageContextValue {
  const context = useContext(SystemMessageContext);
  
  if (!context) {
    throw new Error(
      'useSystemMessage must be used within a SystemMessageProvider. ' +
      'Wrap your app with <SystemMessageProvider>.'
    );
  }
  
  return context;
}

export default useSystemMessage;
