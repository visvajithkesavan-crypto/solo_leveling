'use client';

import { useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { useSystemMessage } from '@/hooks/useSystemMessage';
import UI_TEXT from '@/lib/uiText';

interface ManualStepsFormProps {
  onSubmit: () => void;
}

export function ManualStepsForm({ onSubmit }: ManualStepsFormProps) {
  const [steps, setSteps] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { showMessage, showCustomMessage } = useSystemMessage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const stepsValue = parseInt(steps);
      if (isNaN(stepsValue) || stepsValue < 0) {
        throw new Error('Invalid steps value');
      }

      // Use API client to log steps through backend
      const result = await apiClient.logManualSteps(stepsValue);
      
      // Show System message based on performance
      if (stepsValue >= 6000) {
        // Met the target
        showCustomMessage(
          'praise',
          'TARGET ACHIEVED',
          `${stepsValue.toLocaleString()} steps recorded. Daily objective complete. The System acknowledges your effort.`,
        );
      } else {
        // Partial completion
        showMessage('stepsLogged');
      }
      
      setSteps('');
      
      // Notify parent to refresh
      setTimeout(() => {
        onSubmit();
      }, 500);

    } catch (err: any) {
      setError(err.message || 'Failed to submit steps');
      showMessage('systemError');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="system-window p-4">
      <h3 className="text-lg font-bold text-system-gold mb-4">◇ {UI_TEXT.buttons.logSteps} ◇</h3>
      
      {error && (
        <div className="bg-red-900/50 border border-red-500 text-red-200 px-3 py-2 rounded mb-3 text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-2">
        <input
          type="number"
          value={steps}
          onChange={(e) => setSteps(e.target.value)}
          placeholder={UI_TEXT.forms.stepsInput.placeholder}
          min="0"
          required
          disabled={loading}
          className="flex-1 px-4 py-2 bg-system-panel border border-system-border rounded focus:outline-none focus:border-system-gold disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={loading || !steps}
          className="btn-system disabled:opacity-50 whitespace-nowrap"
        >
          {loading ? 'RECORDING...' : `◆ ${UI_TEXT.buttons.submitSteps}`}
        </button>
      </div>

      <p className="text-xs opacity-75 mt-2">
        Target objective: 6,000 steps • Unverified data yields 40% XP
      </p>
    </form>
  );
}
