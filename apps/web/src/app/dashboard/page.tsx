'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { apiClient } from '@/lib/api-client';
import { SystemWindow, QuestCard, StatusBar } from '@/components/SystemUI';
import { PopupQueue } from '@/components/PopupSystem';
import { ManualStepsForm } from '@/components/ManualStepsForm';
import { useSystemMessage } from '@/hooks/useSystemMessage';
import UI_TEXT from '@/lib/uiText';
import { 
  Goal, 
  CreateGoalDto, 
  StatusWindow as StatusWindowData,
  PopupEvent,
} from '@solo-leveling/shared';

export default function Dashboard() {
  const { session, signOut, loading: authLoading } = useAuth();
  const router = useRouter();
  const { showMessage, showCustomMessage } = useSystemMessage();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [statusWindow, setStatusWindow] = useState<StatusWindowData | null>(null);
  const [popupEvents, setPopupEvents] = useState<PopupEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newGoal, setNewGoal] = useState<CreateGoalDto>({ title: '' });
  const [error, setError] = useState('');
  const [previousLevel, setPreviousLevel] = useState<number | null>(null);

  useEffect(() => {
    if (!authLoading && !session) {
      router.push('/auth/signin');
    }
  }, [session, authLoading, router]);

  useEffect(() => {
    if (session) {
      loadGoals();
      loadStatusWindow();
    }
  }, [session]);

  const loadGoals = async () => {
    try {
      setError('');
      const data = await apiClient.getGoals();
      setGoals(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load goals');
    } finally {
      setLoading(false);
    }
  };

  const loadStatusWindow = async () => {
    try {
      const data = await apiClient.getStatusWindow();
      
      // Check for level up
      if (previousLevel !== null && data.level > previousLevel) {
        showMessage('levelUp');
      }
      setPreviousLevel(data.level);
      
      setStatusWindow(data);
    } catch (err: any) {
      // If no level state exists yet, use defaults
      setStatusWindow({
        level: 1,
        xp: 0,
        xpToNext: 1000,
        streak: 0,
        bestStreak: 0,
      });
    }
  };

  const handleEvaluateDay = async () => {
    setEvaluating(true);
    setError('');

    try {
      const today = new Date().toISOString().split('T')[0];
      const result = await apiClient.evaluateDay(today);
      
      // Check for level up before updating status
      if (statusWindow && result.statusWindow.level > statusWindow.level) {
        showMessage('levelUp');
      }
      
      // Update status window
      setStatusWindow(result.statusWindow);
      
      // Show popup events
      if (result.popupEvents.length > 0) {
        setPopupEvents(result.popupEvents);
      }
      
      // Show weekly review message
      showMessage('weeklyReview');
    } catch (err: any) {
      setError(err.message || 'Failed to evaluate day');
      showMessage('systemError');
    } finally {
      setEvaluating(false);
    }
  };

  const handleStepsSubmitted = () => {
    // Refresh status window after steps are logged
    loadStatusWindow();
  };

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoal.title.trim()) return;

    setCreating(true);
    setError('');

    try {
      const created = await apiClient.createGoal(newGoal);
      setGoals([created, ...goals]);
      setNewGoal({ title: '' });
      setShowCreateForm(false);
      
      // Show System message for quest creation
      showMessage('questCreated');
    } catch (err: any) {
      setError(err.message || 'Failed to create goal');
      showMessage('systemError');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteGoal = async (id: string) => {
    // Show System-style confirmation
    showCustomMessage(
      'warning',
      UI_TEXT.confirmations.deleteQuest.title,
      UI_TEXT.confirmations.deleteQuest.message,
      { urgent: true, autoCloseDelay: null }
    );
    
    if (!confirm('Confirm termination of this quest?')) return;

    try {
      await apiClient.deleteGoal(id);
      setGoals(goals.filter((g) => g.id !== id));
      showMessage('questDeleted');
    } catch (err: any) {
      setError(err.message || 'Failed to delete goal');
      showMessage('systemError');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-system-gold text-2xl animate-pulse">Initializing System...</div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <>
      {/* Popup Queue */}
      {popupEvents.length > 0 && (
        <PopupQueue 
          events={popupEvents} 
          onComplete={() => setPopupEvents([])} 
        />
      )}

      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <h1 className="system-title text-3xl">◈ HUNTER COMMAND CENTER ◈</h1>
            <button
              onClick={() => signOut()}
              className="btn-system bg-red-600 hover:bg-red-700 text-sm px-4 py-2"
            >
              {UI_TEXT.buttons.signOut}
            </button>
          </div>

          {/* Status Window */}
          <SystemWindow title="◇ STATUS WINDOW ◇" className="max-w-md">
            <div className="space-y-4">
              <div className="text-center pb-4 border-b border-system-border">
                <p className="text-sm opacity-75">HUNTER DESIGNATION</p>
                <p className="text-xl font-bold text-system-gold">{session.user.email}</p>
              </div>
              
              {statusWindow && (
                <>
                  <StatusBar 
                    label={UI_TEXT.stats.level}
                    value={statusWindow.level} 
                    color="gold" 
                  />
                  <StatusBar 
                    label={UI_TEXT.stats.experience}
                    value={statusWindow.xp} 
                    maxValue={statusWindow.xpToNext}
                    color="mana" 
                  />
                  <StatusBar 
                    label="ACTIVE OBJECTIVES" 
                    value={goals.length} 
                    color="border" 
                  />
                  <div className="flex justify-between text-sm pt-2 border-t border-system-border">
                    <span>{UI_TEXT.stats.currentStreak}</span>
                    <span className="text-system-gold font-bold">
                      {statusWindow.streak} 🔥 (Best: {statusWindow.bestStreak})
                    </span>
                  </div>
                </>
              )}
            </div>
          </SystemWindow>

          {/* Manual Steps Entry */}
          <ManualStepsForm onSubmit={handleStepsSubmitted} />

          {/* Dev Tools */}
          <div className="system-window p-4 bg-yellow-900/20">
            <p className="text-xs text-yellow-400 mb-2">⚠️ DEV ONLY - Quest Evaluation</p>
            <button
              onClick={handleEvaluateDay}
              disabled={evaluating}
              className="btn-system bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 text-sm"
            >
              {evaluating ? 'Evaluating...' : '🔄 Run Daily Evaluation'}
            </button>
            <p className="text-xs mt-2 opacity-75">
              This evaluates all quests for today. In production, this runs automatically.
            </p>
          </div>

          {/* Quest Board */}
          <SystemWindow title="◇ QUEST LOG ◇">
          {error && (
            <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {/* Create Quest Button */}
          {!showCreateForm && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="btn-system mb-6 w-full md:w-auto"
            >
              ◆ {UI_TEXT.buttons.newQuest}
            </button>
          )}

          {/* Create Quest Form */}
          {showCreateForm && (
            <form onSubmit={handleCreateGoal} className="mb-6 space-y-4 p-4 bg-system-bg border border-system-border rounded">
              <div>
                <label htmlFor="title" className="block text-sm font-medium mb-2">
                  {UI_TEXT.forms.questTitle.label} *
                </label>
                <input
                  id="title"
                  type="text"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  placeholder={UI_TEXT.forms.questTitle.placeholder}
                  required
                  className="w-full px-4 py-2 bg-system-panel border border-system-border rounded focus:outline-none focus:border-system-gold"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium mb-2">
                  {UI_TEXT.forms.questDescription.label}
                </label>
                <textarea
                  id="description"
                  value={newGoal.description || ''}
                  onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                  placeholder={UI_TEXT.forms.questDescription.placeholder}
                  rows={3}
                  className="w-full px-4 py-2 bg-system-panel border border-system-border rounded focus:outline-none focus:border-system-gold"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={creating || !newGoal.title.trim()}
                  className="btn-system disabled:opacity-50"
                >
                  {creating ? 'PROCESSING...' : UI_TEXT.buttons.createQuest}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setNewGoal({ title: '' });
                  }}
                  className="btn-system bg-gray-600 hover:bg-gray-700"
                >
                  {UI_TEXT.buttons.cancel}
                </button>
              </div>
            </form>
          )}

          {/* Goals List */}
          {goals.length === 0 ? (
            <div className="text-center py-12 opacity-50">
              <p className="text-lg">{UI_TEXT.emptyStates.noQuests.title}</p>
              <p className="text-sm mt-2">{UI_TEXT.emptyStates.noQuests.message}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {goals.map((goal) => (
                <QuestCard
                  key={goal.id}
                  title={goal.title}
                  description={goal.description}
                  difficulty={goal.difficulty}
                  createdAt={goal.created_at}
                  onDelete={() => handleDeleteGoal(goal.id)}
                />
              ))}
            </div>
          )}
        </SystemWindow>
      </div>
    </div>
    </>
  );
}
