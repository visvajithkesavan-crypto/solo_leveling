'use client';

import { PopupEvent, PopupEventType } from '@solo-leveling/shared';

interface PopupProps {
  event: PopupEvent;
  onClose: () => void;
}

/**
 * System Popup - Shows quest results, level ups, etc.
 */
export function SystemPopup({ event, onClose }: PopupProps) {
  const getPopupStyle = () => {
    switch (event.type) {
      case PopupEventType.LEVEL_UP:
        return 'border-system-gold bg-gradient-to-b from-system-gold/20 to-system-panel';
      case PopupEventType.QUEST_COMPLETED:
        return 'border-green-500 bg-gradient-to-b from-green-500/20 to-system-panel';
      case PopupEventType.QUEST_FAILED:
        return 'border-red-500 bg-gradient-to-b from-red-500/20 to-system-panel';
      default:
        return 'border-system-border bg-system-panel';
    }
  };

  const getIcon = () => {
    switch (event.type) {
      case PopupEventType.LEVEL_UP:
        return '⚡';
      case PopupEventType.QUEST_COMPLETED:
        return '✓';
      case PopupEventType.QUEST_FAILED:
        return '✗';
      default:
        return '📢';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div className={`border-2 rounded-lg p-6 max-w-md w-full ${getPopupStyle()} animate-pulse`}>
        <div className="text-center space-y-4">
          <div className="text-6xl">{getIcon()}</div>
          <h2 className="text-2xl font-bold text-system-gold">{event.title}</h2>
          <p className="text-lg text-system-text">{event.message}</p>
          
          {event.data && event.type === PopupEventType.LEVEL_UP && (
            <div className="text-sm opacity-75">
              <p>New Level: {event.data.newLevel}</p>
            </div>
          )}

          <button
            onClick={onClose}
            className="btn-system mt-4"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}

interface PopupQueueProps {
  events: PopupEvent[];
  onComplete: () => void;
}

/**
 * Popup Queue - Shows popups one at a time
 */
export function PopupQueue({ events, onComplete }: PopupQueueProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0);

  const handleNext = () => {
    if (currentIndex < events.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onComplete();
    }
  };

  if (events.length === 0 || currentIndex >= events.length) {
    return null;
  }

  return <SystemPopup event={events[currentIndex]} onClose={handleNext} />;
}

import React from 'react';
