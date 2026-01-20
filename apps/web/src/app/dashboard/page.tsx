'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { apiClient } from '@/lib/api-client';
import { SystemWindow } from '@/components/SystemUI';
import { QuestCard } from '@/components/QuestCard';
import { StatusWindowCard } from '@/components/StatusWindowCard';
import { LevelUpCinematic } from '@/components/LevelUpCinematic';
import { useFloatingXP } from '@/components/FloatingXP';
import { PopupQueue } from '@/components/PopupSystem';
import { ManualStepsForm } from '@/components/ManualStepsForm';
import { JobClassSelection } from '@/components/JobClassSelection';
import { AchievementsPanel } from '@/components/AchievementsPanel';
import { ShadowArmyPanel } from '@/components/ShadowArmyPanel';
import { useSystemMessage } from '@/hooks/useSystemMessage';
import UI_TEXT from '@/lib/uiText';
import { 
  Goal, 
  CreateGoalDto, 
  StatusWindow as StatusWindowData,
  PopupEvent,
  JobClass,
  JOB_CLASSES,
  UserShadow,
} from '@solo-leveling/shared';

// Dashboard tab type
type DashboardTab = 'quests' | 'achievements' | 'shadows';

export default function Dashboard() {
  const { session, signOut, loading: authLoading } = useAuth();
  const router = useRouter();
  const { showMessage, showCustomMessage } = useSystemMessage();
  const { showFloatingXP } = useFloatingXP();
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
  
  // Level Up Cinematic State
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [levelUpData, setLevelUpData] = useState<{ level: number; stats: Record<string, number> }>({ 
    level: 1, 
    stats: {} 
  });
  
  // Dashboard Tab State
  const [activeTab, setActiveTab] = useState<DashboardTab>('quests');
  
  // Job Class State
  const [showJobSelection, setShowJobSelection] = useState(false);
  const [userJobClass, setUserJobClass] = useState<JobClass>(JobClass.NONE);
  
  // Achievements State (simulated for now - would come from API)
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([
    'first_quest',
  ]);
  
  // Shadow Army State (simulated for now - would come from API)
  const [userShadows, setUserShadows] = useState<UserShadow[]>([]);

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
      
      // Check for level up - trigger cinematic instead of just message
      if (previousLevel !== null && data.level > previousLevel) {
        // Trigger level up cinematic
        setLevelUpData({
          level: data.level,
          stats: {
            STR: Math.floor(Math.random() * 3) + 2,
            AGI: Math.floor(Math.random() * 3) + 2,
            INT: Math.floor(Math.random() * 3) + 2,
            VIT: Math.floor(Math.random() * 3) + 2,
          },
        });
        setShowLevelUp(true);
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
      
      // Check for level up before updating status - trigger cinematic
      if (statusWindow && result.statusWindow.level > statusWindow.level) {
        setLevelUpData({
          level: result.statusWindow.level,
          stats: {
            STR: Math.floor(Math.random() * 3) + 2,
            AGI: Math.floor(Math.random() * 3) + 2,
            INT: Math.floor(Math.random() * 3) + 2,
            VIT: Math.floor(Math.random() * 3) + 2,
          },
        });
        setShowLevelUp(true);
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

  // Handle quest completion
  const handleCompleteGoal = async (id: string) => {
    try {
      // Find the quest element for floating XP
      const questElement = document.getElementById(`quest-${id}`);
      const goal = goals.find(g => g.id === id);
      const xpReward = goal?.xp_reward || 50;
      
      // Show floating XP
      showFloatingXP(xpReward, questElement);
      
      // TODO: Call API to complete the goal
      // await apiClient.completeGoal(id);
      
      // For now, remove from list and show message
      setGoals(goals.filter(g => g.id !== id));
      showMessage('questCompleted');
      
      // Refresh status to check for level up
      loadStatusWindow();
    } catch (err: any) {
      setError(err.message || 'Failed to complete goal');
      showMessage('systemError');
    }
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
    // Confirm before deleting
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

  // Handle Job Class Selection
  const handleSelectJobClass = (selectedClass: JobClass) => {
    setUserJobClass(selectedClass);
    setShowJobSelection(false);
    // TODO: Save to API
    showCustomMessage({
      title: 'CLASS AWAKENED',
      message: `You have awakened as a ${JOB_CLASSES[selectedClass].name}. Your path is set.`,
      type: 'success',
    });
  };

  // Handle Shadow Activation
  const handleActivateShadow = (shadowId: string) => {
    setUserShadows(prev => prev.map(s => ({
      ...s,
      isActive: s.shadowId === shadowId ? !s.isActive : s.isActive,
    })));
  };

  // Calculate user stats for achievements/shadows
  const userStats = {
    questCount: goals.filter(g => g.status === 'completed').length || 0,
    currentStreak: statusWindow?.streak || 0,
    level: statusWindow?.level || 1,
    dailyXp: 0,
  };

  const shadowStats = {
    questStreak: statusWindow?.streak || 0,
    level: statusWindow?.level || 1,
    achievements: unlockedAchievements,
  };

  const currentClassInfo = JOB_CLASSES[userJobClass];

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
      {/* Level Up Cinematic */}
      {showLevelUp && (
        <LevelUpCinematic
          level={levelUpData.level}
          statIncreases={levelUpData.stats}
          onClose={() => setShowLevelUp(false)}
          autoCloseDelay={5000}
        />
      )}

      {/* Job Class Selection Modal */}
      {showJobSelection && (
        <JobClassSelection
          currentLevel={statusWindow?.level || 1}
          currentClass={userJobClass}
          onSelectClass={handleSelectJobClass}
          onClose={() => setShowJobSelection(false)}
        />
      )}

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
            <h1 className="text-2xl md:text-3xl font-rajdhani font-bold text-cyan-400 tracking-wider">
              ◈ HUNTER COMMAND CENTER ◈
            </h1>
            <button
              onClick={() => signOut()}
              className="px-4 py-2 bg-red-900/50 border border-red-500/50 text-red-400 font-rajdhani font-semibold text-sm rounded tracking-wider hover:bg-red-800/60 hover:border-red-400 transition-all"
            >
              {UI_TEXT.buttons.signOut}
            </button>
          </div>

          {/* Main Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Status Window & Job Class */}
            <div className="lg:col-span-1 space-y-6">
              {/* Status Window Card */}
              {statusWindow && (
                <StatusWindowCard 
                  data={statusWindow} 
                  userName={session?.user?.email?.split('@')[0] || 'HUNTER'} 
                />
              )}

              {/* Job Class Card */}
              <div 
                className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-2 rounded-xl p-4 cursor-pointer hover:border-opacity-100 transition-all"
                style={{ borderColor: currentClassInfo.color + '60' }}
                onClick={() => setShowJobSelection(true)}
              >
                <div className="flex items-center gap-4">
                  <div 
                    className="w-14 h-14 flex items-center justify-center text-3xl rounded-lg"
                    style={{ 
                      backgroundColor: currentClassInfo.color + '20',
                      boxShadow: userJobClass !== JobClass.NONE ? `0 0 20px ${currentClassInfo.color}40` : 'none',
                    }}
                  >
                    {currentClassInfo.icon}
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-slate-500 tracking-wider">JOB CLASS</div>
                    <div 
                      className="text-lg font-rajdhani font-bold"
                      style={{ color: currentClassInfo.color }}
                    >
                      {currentClassInfo.name}
                    </div>
                    <div className="text-xs text-slate-400">{currentClassInfo.title}</div>
                  </div>
                  {userJobClass !== JobClass.NONE && (
                    <div className="text-right">
                      <div className="text-xs text-green-400">
                        +{Math.round((currentClassInfo.bonusMultiplier - 1) * 100)}% XP
                      </div>
                    </div>
                  )}
                </div>
                {userJobClass === JobClass.NONE && (
                  <div className="mt-3 text-center text-xs text-cyan-400/70 animate-pulse">
                    Click to begin Job Change Quest
                  </div>
                )}
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setActiveTab('achievements')}
                  className={`p-3 rounded-lg border transition-all text-left
                    ${activeTab === 'achievements' 
                      ? 'bg-yellow-900/30 border-yellow-500/50' 
                      : 'bg-slate-800/50 border-slate-600/30 hover:border-yellow-500/30'
                    }
                  `}
                >
                  <div className="text-xl mb-1">🏆</div>
                  <div className="text-xs text-slate-400">Achievements</div>
                  <div className="text-lg font-bold text-yellow-400">{unlockedAchievements.length}</div>
                </button>
                <button
                  onClick={() => setActiveTab('shadows')}
                  className={`p-3 rounded-lg border transition-all text-left
                    ${activeTab === 'shadows' 
                      ? 'bg-purple-900/30 border-purple-500/50' 
                      : 'bg-slate-800/50 border-slate-600/30 hover:border-purple-500/30'
                    }
                  `}
                >
                  <div className="text-xl mb-1">👥</div>
                  <div className="text-xs text-slate-400">Shadows</div>
                  <div className="text-lg font-bold text-purple-400">{userShadows.length}</div>
                </button>
              </div>

              {/* Manual Steps Entry */}
              <ManualStepsForm onSubmit={handleStepsSubmitted} />

              {/* Dev Tools */}
              <div className="bg-gradient-to-br from-yellow-900/30 to-orange-900/30 border border-yellow-500/40 rounded-lg p-4">
                <p className="text-xs text-yellow-400 font-mono mb-3 tracking-wider">⚠️ DEV TOOLS</p>
                <button
                  onClick={handleEvaluateDay}
                  disabled={evaluating}
                  className="w-full py-2.5 px-4 bg-yellow-900/50 border border-yellow-500/50 text-yellow-400 font-rajdhani font-semibold text-sm rounded tracking-wider hover:bg-yellow-800/60 hover:border-yellow-400 transition-all disabled:opacity-50"
                >
                  {evaluating ? '◇ EVALUATING...' : '◇ RUN DAILY EVALUATION'}
                </button>
                <p className="text-[10px] text-yellow-400/60 mt-2 font-mono">
                  Evaluates all quests for today. Auto-runs in production.
                </p>
              </div>
            </div>

            {/* Right Column: Main Content Area */}
            <div className="lg:col-span-2">
              {/* Tab Navigation */}
              <div className="flex gap-2 mb-4 border-b border-slate-700 pb-3">
                <button
                  onClick={() => setActiveTab('quests')}
                  className={`px-4 py-2 font-rajdhani font-bold rounded-t-lg transition-all
                    ${activeTab === 'quests' 
                      ? 'bg-cyan-900/50 border-b-2 border-cyan-400 text-cyan-400' 
                      : 'text-slate-500 hover:text-white'
                    }
                  `}
                >
                  ◇ QUEST LOG
                </button>
                <button
                  onClick={() => setActiveTab('achievements')}
                  className={`px-4 py-2 font-rajdhani font-bold rounded-t-lg transition-all
                    ${activeTab === 'achievements' 
                      ? 'bg-yellow-900/50 border-b-2 border-yellow-400 text-yellow-400' 
                      : 'text-slate-500 hover:text-white'
                    }
                  `}
                >
                  🏆 ACHIEVEMENTS
                </button>
                <button
                  onClick={() => setActiveTab('shadows')}
                  className={`px-4 py-2 font-rajdhani font-bold rounded-t-lg transition-all
                    ${activeTab === 'shadows' 
                      ? 'bg-purple-900/50 border-b-2 border-purple-400 text-purple-400' 
                      : 'text-slate-500 hover:text-white'
                    }
                  `}
                >
                  👥 SHADOW ARMY
                </button>
              </div>

              {/* Quest Tab Content */}
              {activeTab === 'quests' && (
                <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-2 border-cyan-500/40 rounded-xl p-6 shadow-quest">
                  {/* Quest Board Header */}
                  <div className="flex justify-between items-center border-b border-cyan-500/30 pb-4 mb-6">
                    <h2 className="text-xl font-rajdhani font-bold text-cyan-400 tracking-widest">
                      ◇ ACTIVE QUESTS ◇
                    </h2>
                    <span className="text-sm font-mono text-slate-500">
                      {goals.length} ACTIVE
                    </span>
                  </div>

                  {error && (
                    <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-4 font-mono text-sm">
                      {error}
                    </div>
                  )}

                  {/* Create Quest Button */}
                  {!showCreateForm && (
                    <button
                      onClick={() => setShowCreateForm(true)}
                      className="mb-6 w-full py-3 bg-gradient-to-r from-cyan-900/50 to-blue-900/50 border-2 border-dashed border-cyan-500/50 text-cyan-400 font-rajdhani font-bold text-lg rounded-lg tracking-widest hover:border-cyan-400 hover:from-cyan-800/50 hover:to-blue-800/50 transition-all"
                    >
                      ◆ {UI_TEXT.buttons.newQuest}
                    </button>
                  )}

                  {/* Create Quest Form */}
                  {showCreateForm && (
                    <form onSubmit={handleCreateGoal} className="mb-6 space-y-4 p-5 bg-slate-900/80 border border-cyan-500/30 rounded-lg">
                      <div>
                        <label htmlFor="title" className="block text-xs font-mono text-cyan-400/80 mb-2 tracking-wider">
                          {UI_TEXT.forms.questTitle.label} *
                        </label>
                        <input
                          id="title"
                          type="text"
                          value={newGoal.title}
                          onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                          placeholder={UI_TEXT.forms.questTitle.placeholder}
                          required
                          className="w-full px-4 py-3 bg-slate-800 border border-cyan-500/40 rounded-lg text-slate-200 font-rajdhani focus:outline-none focus:border-cyan-400 focus:shadow-button-cyan transition-all"
                        />
                      </div>

                      <div>
                        <label htmlFor="description" className="block text-xs font-mono text-cyan-400/80 mb-2 tracking-wider">
                          {UI_TEXT.forms.questDescription.label}
                        </label>
                        <textarea
                          id="description"
                          value={newGoal.description || ''}
                          onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                          placeholder={UI_TEXT.forms.questDescription.placeholder}
                          rows={3}
                          className="w-full px-4 py-3 bg-slate-800 border border-cyan-500/40 rounded-lg text-slate-200 font-rajdhani focus:outline-none focus:border-cyan-400 focus:shadow-button-cyan transition-all resize-none"
                        />
                      </div>

                      <div className="flex gap-3">
                        <button
                          type="submit"
                          disabled={creating || !newGoal.title.trim()}
                          className="flex-1 py-2.5 px-4 bg-gradient-to-r from-cyan-900/50 to-blue-900/50 border border-cyan-500 text-cyan-300 font-rajdhani font-semibold rounded tracking-widest hover:from-cyan-800/60 hover:to-blue-800/60 transition-all disabled:opacity-50"
                        >
                          {creating ? '◇ PROCESSING...' : UI_TEXT.buttons.createQuest}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowCreateForm(false);
                            setNewGoal({ title: '' });
                          }}
                          className="py-2.5 px-4 bg-slate-800 border border-slate-600 text-slate-400 font-rajdhani font-semibold rounded tracking-widest hover:border-slate-500 transition-all"
                        >
                          {UI_TEXT.buttons.cancel}
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Goals List */}
                  {goals.length === 0 ? (
                    <div className="text-center py-16 opacity-60">
                      <div className="text-4xl mb-4">📜</div>
                      <p className="text-lg font-rajdhani text-cyan-400">{UI_TEXT.emptyStates.noQuests.title}</p>
                      <p className="text-sm text-slate-500 mt-2">{UI_TEXT.emptyStates.noQuests.message}</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                      {goals.map((goal) => (
                        <QuestCard
                          key={goal.id}
                          goal={goal}
                          onComplete={handleCompleteGoal}
                          onDelete={handleDeleteGoal}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Achievements Tab Content */}
              {activeTab === 'achievements' && (
                <AchievementsPanel
                  userAchievements={unlockedAchievements}
                  stats={userStats}
                />
              )}

              {/* Shadow Army Tab Content */}
              {activeTab === 'shadows' && (
                <ShadowArmyPanel
                  userShadows={userShadows}
                  stats={shadowStats}
                  onActivateShadow={handleActivateShadow}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
