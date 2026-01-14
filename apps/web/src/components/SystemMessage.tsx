'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { playSound } from '@/lib/sounds';

export type MessageType = 'command' | 'warning' | 'praise' | 'judgment' | 'notification';

export interface SystemMessageProps {
  type: MessageType;
  title: string;
  message: string;
  urgent?: boolean;
  onClose?: () => void;
  autoCloseDelay?: number | null; // milliseconds, null = manual close only
  visible?: boolean;
}

const TYPE_CONFIG: Record<MessageType, { sound: 'notification' | 'complete' | 'levelup' | 'warning' | 'failure'; iconClass: string }> = {
  command: { sound: 'notification', iconClass: 'system-icon-command' },
  warning: { sound: 'warning', iconClass: 'system-icon-warning' },
  praise: { sound: 'complete', iconClass: 'system-icon-praise' },
  judgment: { sound: 'failure', iconClass: 'system-icon-judgment' },
  notification: { sound: 'notification', iconClass: 'system-icon-notification' },
};

export const SystemMessage: React.FC<SystemMessageProps> = ({
  type,
  title,
  message,
  urgent = false,
  onClose,
  autoCloseDelay = 5000,
  visible = true,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  const handleClose = useCallback(() => {
    setIsLeaving(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, 300);
  }, [onClose]);

  useEffect(() => {
    if (visible) {
      setIsVisible(true);
      setIsLeaving(false);
      
      // Play sound on appearance
      const config = TYPE_CONFIG[type];
      playSound(config.sound);

      // Auto-close if specified
      if (autoCloseDelay !== null && autoCloseDelay > 0) {
        const timer = setTimeout(handleClose, autoCloseDelay);
        return () => clearTimeout(timer);
      }
    }
  }, [visible, type, autoCloseDelay, handleClose]);

  if (!isVisible) return null;

  return (
    <div className="system-message-overlay">
      <div
        className={`
          system-message-container
          ${urgent ? 'system-message-urgent' : ''}
          ${isLeaving ? 'system-message-leaving' : 'system-message-entering'}
          system-message-${type}
        `}
        role="alert"
        aria-live={urgent ? 'assertive' : 'polite'}
      >
        {/* Decorative corner brackets */}
        <div className="system-corner system-corner-tl" />
        <div className="system-corner system-corner-tr" />
        <div className="system-corner system-corner-bl" />
        <div className="system-corner system-corner-br" />

        {/* Header bar */}
        <div className="system-header">
          <div className={`system-icon ${TYPE_CONFIG[type].iconClass}`}>
            <SystemIcon type={type} />
          </div>
          <span className="system-header-line" />
          <span className="system-status">
            {urgent ? '◈ PRIORITY ◈' : '◇ SYSTEM ◇'}
          </span>
          <span className="system-header-line" />
        </div>

        {/* Title */}
        <h2 className="system-title">{title}</h2>

        {/* Divider */}
        <div className="system-divider">
          <span className="system-divider-diamond">◆</span>
        </div>

        {/* Message body */}
        <p className="system-body">{message}</p>

        {/* Close button */}
        <button
          onClick={handleClose}
          className="system-close-btn"
          aria-label="Acknowledge"
        >
          <span className="system-close-text">[ ACKNOWLEDGE ]</span>
        </button>

        {/* Bottom decoration */}
        <div className="system-footer">
          <span className="system-footer-line" />
          <span className="system-footer-diamond">◇</span>
          <span className="system-footer-line" />
        </div>
      </div>
    </div>
  );
};

// Icon component for different message types
const SystemIcon: React.FC<{ type: MessageType }> = ({ type }) => {
  switch (type) {
    case 'command':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" fill="none"/>
        </svg>
      );
    case 'warning':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
          <path d="M12 2L1 21h22L12 2zm0 6v6m0 4v.01" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
        </svg>
      );
    case 'praise':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" strokeWidth="2" fill="none"/>
        </svg>
      );
    case 'judgment':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
          <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" stroke="currentColor" strokeWidth="2" fill="none"/>
          <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
        </svg>
      );
    case 'notification':
    default:
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="2" fill="none"/>
        </svg>
      );
  }
};

export default SystemMessage;
