'use client';

import { useState } from 'react';
import { apiClient } from '@/lib/api-client';

interface ManualStepsFormProps {
  onSubmit: () => void;
}

export function ManualStepsForm({ onSubmit }: ManualStepsFormProps) {
  const [steps, setSteps] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const stepsValue = parseInt(steps);
      if (isNaN(stepsValue) || stepsValue < 0) {
        throw new Error('Invalid steps value');
      }

      // Use API client to log steps through backend
      const result = await apiClient.logManualSteps(stepsValue);
      
      setSuccess(`✓ ${result.message}`);
      setSteps('');
      
      // Notify parent to refresh
      setTimeout(() => {
        onSubmit();
        setSuccess('');
      }, 1500);

    } catch (err: any) {
      setError(err.message || 'Failed to submit steps');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="system-window p-4">
      <h3 className="text-lg font-bold text-system-gold mb-4">📊 Log Today's Steps</h3>
      
      {error && (
        <div className="bg-red-900/50 border border-red-500 text-red-200 px-3 py-2 rounded mb-3 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-900/50 border border-green-500 text-green-200 px-3 py-2 rounded mb-3 text-sm">
          {success}
        </div>
      )}

      <div className="flex gap-2">
        <input
          type="number"
          value={steps}
          onChange={(e) => setSteps(e.target.value)}
          placeholder="Enter steps..."
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
          {loading ? 'Logging...' : '📝 Log Steps'}
        </button>
      </div>

      <p className="text-xs opacity-75 mt-2">
        Default target: 6,000 steps • Unverified attempts earn 40% XP
      </p>
    </form>
  );
}
