'use client';

import React from 'react';
import { useSystemMessage } from '@/hooks/useSystemMessage';
import { SYSTEM_MESSAGES, SystemMessageScenarioKey } from '@/lib/systemMessages';

/**
 * System Message Test Page
 * 
 * Use this page to test all System message types and scenarios.
 * Access at: /test-system
 */
export default function TestSystemPage() {
  const { showMessage, showCustomMessage } = useSystemMessage();

  const scenarios: { key: SystemMessageScenarioKey; label: string }[] = [
    { key: 'welcomeNewUser', label: 'Welcome New User' },
    { key: 'dailyQuestAvailable', label: 'Daily Quest Available' },
    { key: 'dailyQuestDeadlineApproaching', label: 'Deadline Approaching' },
    { key: 'questCompleted', label: 'Quest Completed' },
    { key: 'questFailed', label: 'Quest Failed' },
    { key: 'questCreated', label: 'Quest Created' },
    { key: 'questDeleted', label: 'Quest Deleted' },
    { key: 'levelUp', label: 'Level Up' },
    { key: 'statIncreased', label: 'Stat Increased' },
    { key: 'statDecreased', label: 'Stat Decreased' },
    { key: 'streakMilestone7', label: '7-Day Streak' },
    { key: 'streakMilestone30', label: '30-Day Streak' },
    { key: 'streakBroken', label: 'Streak Broken' },
    { key: 'inactivityWarning', label: 'Inactivity Warning' },
    { key: 'hiddenQuestUnlocked', label: 'Hidden Quest' },
    { key: 'weeklyReview', label: 'Weekly Review' },
    { key: 'penaltyQuestIssued', label: 'Penalty Quest' },
    { key: 'achievementUnlocked', label: 'Achievement Unlocked' },
    { key: 'stepsLogged', label: 'Steps Logged' },
    { key: 'systemError', label: 'System Error' },
  ];

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-cyan-400 mb-2 tracking-wider">
          ◈ SYSTEM MESSAGE TEST INTERFACE ◈
        </h1>
        <p className="text-gray-400 mb-8">
          Select a scenario to trigger a System message. Each click shows a random variation.
        </p>

        {/* Scenario Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-12">
          {scenarios.map(({ key, label }) => {
            const scenario = SYSTEM_MESSAGES[key];
            if (!scenario) return null;
            
            const typeColors: Record<string, string> = {
              command: 'border-cyan-500 hover:bg-cyan-900/30 text-cyan-400',
              warning: 'border-orange-500 hover:bg-orange-900/30 text-orange-400',
              praise: 'border-green-500 hover:bg-green-900/30 text-green-400',
              judgment: 'border-red-500 hover:bg-red-900/30 text-red-400',
              notification: 'border-blue-500 hover:bg-blue-900/30 text-blue-400',
            };

            return (
              <button
                key={key}
                onClick={() => showMessage(key)}
                className={`
                  p-4 border-2 rounded-lg transition-all
                  text-left bg-gray-800/50
                  ${typeColors[scenario.type] || 'border-gray-600 text-gray-400'}
                `}
              >
                <div className="text-sm font-semibold mb-1">{label}</div>
                <div className="text-xs text-gray-500 uppercase">
                  {scenario.type} • {scenario.variations.length} var
                </div>
              </button>
            );
          })}
        </div>

        {/* Custom Message Test */}
        <div className="border border-gray-700 rounded-lg p-6 mb-8">
          <h2 className="text-xl text-cyan-400 mb-4">◇ CUSTOM MESSAGE TEST ◇</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <button
              onClick={() => showCustomMessage('command', 'CUSTOM COMMAND', 'This is a custom command message from the System. Execute immediately.')}
              className="p-3 bg-cyan-900/30 border border-cyan-500 rounded text-cyan-400 text-sm hover:bg-cyan-800/40 transition-colors"
            >
              Command
            </button>
            <button
              onClick={() => showCustomMessage('warning', 'CUSTOM WARNING', 'This is a custom warning message. The System requires your attention.', { urgent: true })}
              className="p-3 bg-orange-900/30 border border-orange-500 rounded text-orange-400 text-sm hover:bg-orange-800/40 transition-colors"
            >
              Warning
            </button>
            <button
              onClick={() => showCustomMessage('praise', 'CUSTOM PRAISE', 'The System acknowledges your exceptional performance. Continue.')}
              className="p-3 bg-green-900/30 border border-green-500 rounded text-green-400 text-sm hover:bg-green-800/40 transition-colors"
            >
              Praise
            </button>
            <button
              onClick={() => showCustomMessage('judgment', 'CUSTOM JUDGMENT', 'Your performance has been evaluated. Inadequate effort detected.', { urgent: true })}
              className="p-3 bg-red-900/30 border border-red-500 rounded text-red-400 text-sm hover:bg-red-800/40 transition-colors"
            >
              Judgment
            </button>
            <button
              onClick={() => showCustomMessage('notification', 'CUSTOM NOTIFICATION', 'The System has recorded this event. No action required.')}
              className="p-3 bg-blue-900/30 border border-blue-500 rounded text-blue-400 text-sm hover:bg-blue-800/40 transition-colors"
            >
              Notification
            </button>
          </div>
        </div>

        {/* Code Examples */}
        <div className="border border-gray-700 rounded-lg p-6">
          <h2 className="text-xl text-cyan-400 mb-4">◇ INTEGRATION EXAMPLES ◇</h2>
          <pre className="bg-gray-800 p-4 rounded text-sm text-gray-300 overflow-x-auto">
{`// Import the hook
import { useSystemMessage } from '@/hooks/useSystemMessage';

// In your component
const { showMessage, showCustomMessage } = useSystemMessage();

// Show a predefined message (picks random variation)
showMessage('questCompleted');

// Show with custom options
showMessage('levelUp', {
  autoCloseDelay: 10000, // 10 seconds
});

// Show fully custom message
showCustomMessage(
  'praise',           // type
  'CUSTOM TITLE',     // title
  'Custom message',   // message
  { urgent: true }    // options
);`}
          </pre>
        </div>

        {/* Back to Dashboard */}
        <div className="mt-8 text-center">
          <a 
            href="/dashboard" 
            className="text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            ← Return to Hunter Command Center
          </a>
        </div>
      </div>
    </div>
  );
}
