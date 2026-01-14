/**
 * Solo Leveling System - Message Library
 * 
 * The System speaks with authority. The System does not ask.
 * The System commands, judges, and acknowledges.
 */

import { MessageType } from '@/components/SystemMessage';

export interface SystemMessageVariation {
  title: string;
  message: string;
  urgent?: boolean;
}

export interface SystemMessageScenario {
  type: MessageType;
  variations: SystemMessageVariation[];
}

export const SYSTEM_MESSAGES: Record<string, SystemMessageScenario> = {
  // ═══════════════════════════════════════════════════════════════
  // DAILY QUEST NOTIFICATIONS
  // ═══════════════════════════════════════════════════════════════
  
  dailyQuestAvailable: {
    type: 'command',
    variations: [
      {
        title: 'DAILY QUEST ISSUED',
        message: 'Hunter, your training regimen for today has been prepared. Complete all objectives within 24 hours. Failure is not an option.',
        urgent: true,
      },
      {
        title: 'DAILY OBJECTIVES AVAILABLE',
        message: 'Your tasks have been assigned. The System awaits your performance. Commence immediately.',
        urgent: true,
      },
      {
        title: 'NEW QUEST DETECTED',
        message: 'A new day. A new trial. Your daily quest objectives are now active. Prove your worth.',
        urgent: true,
      },
      {
        title: 'DAILY QUEST INITIALIZED',
        message: 'The path to strength lies before you. Today\'s objectives have been set. Begin your ascent.',
        urgent: true,
      },
      {
        title: 'ATTENTION: QUEST AVAILABLE',
        message: 'Hunter, the System has prepared your trials. Review your objectives and execute without hesitation.',
        urgent: true,
      },
    ],
  },

  dailyQuestDeadlineApproaching: {
    type: 'warning',
    variations: [
      {
        title: 'TIME LIMIT WARNING',
        message: 'Remaining time: 3 hours. Incomplete objectives detected. The System does not tolerate failure.',
        urgent: true,
      },
      {
        title: 'DEADLINE IMMINENT',
        message: 'Critical alert. Quest expiration in 3 hours. Accelerate your efforts or accept the consequences.',
        urgent: true,
      },
      {
        title: 'WARNING: TIME CRITICAL',
        message: 'The clock runs against you. 3 hours remain. Complete your objectives or face penalty.',
        urgent: true,
      },
      {
        title: 'QUEST TIMER CRITICAL',
        message: 'Your daily quest approaches expiration. 3 hours remain. The System advises immediate action.',
        urgent: true,
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // QUEST COMPLETION / FAILURE
  // ═══════════════════════════════════════════════════════════════

  questCompleted: {
    type: 'praise',
    variations: [
      {
        title: 'QUEST COMPLETE',
        message: 'Objective cleared. Your effort has been acknowledged by the System. Experience points awarded.',
        urgent: false,
      },
      {
        title: 'OBJECTIVE ACHIEVED',
        message: 'The task is done. The System records your progress. Continue on this path, Hunter.',
        urgent: false,
      },
      {
        title: 'MISSION ACCOMPLISHED',
        message: 'Quest parameters satisfied. Your dedication does not go unnoticed. Rewards distributed.',
        urgent: false,
      },
      {
        title: 'TASK COMPLETED',
        message: 'Acknowledged. You have fulfilled the requirements. The System has updated your status.',
        urgent: false,
      },
      {
        title: 'SUCCESS REGISTERED',
        message: 'The System confirms completion. Your progress has been recorded. Prepare for the next trial.',
        urgent: false,
      },
    ],
  },

  questFailed: {
    type: 'judgment',
    variations: [
      {
        title: 'QUEST FAILED',
        message: 'Inadequate performance detected. You have failed to meet the required standards. Penalty will be imposed.',
        urgent: true,
      },
      {
        title: 'OBJECTIVE NOT MET',
        message: 'Failure. The System expected more from you, Hunter. Reflect on your weakness.',
        urgent: true,
      },
      {
        title: 'MISSION FAILURE',
        message: 'The task remains incomplete. Your performance was insufficient. The System is disappointed.',
        urgent: true,
      },
      {
        title: 'FAILURE RECORDED',
        message: 'You have fallen short. The weak are culled. Rise and prove you are not among them.',
        urgent: true,
      },
      {
        title: 'QUEST TERMINATED',
        message: 'Time expired. Objectives incomplete. This failure has been logged. Improve or perish.',
        urgent: true,
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // LEVEL / STAT CHANGES
  // ═══════════════════════════════════════════════════════════════

  levelUp: {
    type: 'praise',
    variations: [
      {
        title: 'LEVEL UP',
        message: 'Your accumulated efforts have been recognized. You have ascended to a new level. All base stats increased.',
        urgent: false,
      },
      {
        title: 'LEVEL INCREASED',
        message: 'The System acknowledges your growth. New level achieved. Your potential expands.',
        urgent: false,
      },
      {
        title: 'ADVANCEMENT ACHIEVED',
        message: 'You have broken through your limits. Level increased. The path ahead grows clearer.',
        urgent: false,
      },
      {
        title: 'EVOLUTION DETECTED',
        message: 'Hunter, your persistent training has triggered advancement. New level unlocked.',
        urgent: false,
      },
    ],
  },

  statIncreased: {
    type: 'notification',
    variations: [
      {
        title: 'STAT INCREASE',
        message: 'Your training has yielded results. Stat points have been allocated. View your status window.',
        urgent: false,
      },
      {
        title: 'GROWTH RECORDED',
        message: 'The System has detected improvement. Your stats have been updated accordingly.',
        urgent: false,
      },
      {
        title: 'ATTRIBUTE ENHANCED',
        message: 'Progress acknowledged. Stat values adjusted. Continue your ascent.',
        urgent: false,
      },
    ],
  },

  statDecreased: {
    type: 'judgment',
    variations: [
      {
        title: 'STAT PENALTY APPLIED',
        message: 'Your negligence has consequences. Stats have been reduced. The System does not forgive stagnation.',
        urgent: true,
      },
      {
        title: 'ATTRIBUTE DEGRADATION',
        message: 'Warning: Inactivity detected. Your abilities have atrophied. Stats decreased.',
        urgent: true,
      },
      {
        title: 'PENALTY IMPOSED',
        message: 'Failure to maintain progress results in decay. Stat points deducted. Recover what you have lost.',
        urgent: true,
      },
      {
        title: 'DEGRADATION RECORDED',
        message: 'The weak grow weaker. Your stats have diminished. Only consistent effort prevents decline.',
        urgent: true,
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // STREAKS
  // ═══════════════════════════════════════════════════════════════

  streakMilestone7: {
    type: 'praise',
    variations: [
      {
        title: '7-DAY STREAK ACHIEVED',
        message: 'One week of consistent performance. The System acknowledges your discipline. Bonus rewards granted.',
        urgent: false,
      },
      {
        title: 'WEEKLY MILESTONE',
        message: 'Seven consecutive days of completion. Your dedication is noted. Continue this trajectory.',
        urgent: false,
      },
      {
        title: 'STREAK: 7 DAYS',
        message: 'A week of unbroken progress. The foundation of strength is consistency. Bonus XP awarded.',
        urgent: false,
      },
    ],
  },

  streakMilestone30: {
    type: 'praise',
    variations: [
      {
        title: '30-DAY STREAK ACHIEVED',
        message: 'One month of unwavering commitment. You have proven your resolve. The System grants special recognition.',
        urgent: false,
      },
      {
        title: 'MONTHLY MILESTONE',
        message: 'Thirty days. Zero failures. This level of dedication places you among the elite. Significant bonus awarded.',
        urgent: false,
      },
      {
        title: 'LEGENDARY STREAK',
        message: 'A month of perfection. The System rarely witnesses such consistency. Your title has been upgraded.',
        urgent: false,
      },
    ],
  },

  streakMilestone100: {
    type: 'praise',
    variations: [
      {
        title: '100-DAY STREAK',
        message: 'One hundred days of excellence. You have transcended ordinary limits. The System bestows legendary status.',
        urgent: false,
      },
      {
        title: 'CENTENNIAL ACHIEVEMENT',
        message: 'Triple digits. Unbroken dedication. You are no longer among the weak. Special privileges unlocked.',
        urgent: false,
      },
    ],
  },

  streakBroken: {
    type: 'judgment',
    variations: [
      {
        title: 'STREAK TERMINATED',
        message: 'Your streak has been broken. Days of progress—erased. Begin again from zero.',
        urgent: true,
      },
      {
        title: 'CHAIN BROKEN',
        message: 'Consistency lost. Your streak has ended. The System records this failure.',
        urgent: true,
      },
      {
        title: 'STREAK RESET',
        message: 'One missed day. All progress nullified. Rebuild your discipline or remain weak.',
        urgent: true,
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // INACTIVITY WARNINGS
  // ═══════════════════════════════════════════════════════════════

  inactivityWarning: {
    type: 'warning',
    variations: [
      {
        title: 'INACTIVITY DETECTED',
        message: 'Hunter, you have been absent for 2 days. The System requires your engagement. Return immediately.',
        urgent: true,
      },
      {
        title: 'WARNING: ABSENCE NOTED',
        message: 'Two days without activity. Your stats are at risk of degradation. Resume training.',
        urgent: true,
      },
      {
        title: 'HUNTER STATUS: DORMANT',
        message: 'Extended inactivity detected. Continued absence will result in penalties. The System awaits your return.',
        urgent: true,
      },
      {
        title: 'ALERT: STAGNATION',
        message: 'You have not engaged with the System for 48 hours. Are you surrendering? Prove otherwise.',
        urgent: true,
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // HIDDEN QUESTS / SPECIAL EVENTS
  // ═══════════════════════════════════════════════════════════════

  hiddenQuestUnlocked: {
    type: 'notification',
    variations: [
      {
        title: 'HIDDEN QUEST DISCOVERED',
        message: 'Your actions have revealed a secret objective. A hidden quest has been added to your log.',
        urgent: false,
      },
      {
        title: 'SECRET QUEST UNLOCKED',
        message: 'The System has detected exceptional behavior. A special mission is now available.',
        urgent: false,
      },
      {
        title: 'BONUS QUEST REVEALED',
        message: 'Hidden parameters satisfied. A concealed quest has been activated. Accept the challenge.',
        urgent: false,
      },
    ],
  },

  weeklyReview: {
    type: 'judgment',
    variations: [
      {
        title: 'WEEKLY PERFORMANCE REVIEW',
        message: 'The System has analyzed your weekly data. Review your performance metrics in the Status Window.',
        urgent: false,
      },
      {
        title: 'WEEKLY ASSESSMENT COMPLETE',
        message: 'Seven days evaluated. Your strengths and weaknesses have been identified. Consult your report.',
        urgent: false,
      },
      {
        title: 'PERFORMANCE ANALYSIS READY',
        message: 'Your weekly progress has been calculated. The System provides feedback. Access your summary.',
        urgent: false,
      },
    ],
  },

  penaltyQuestIssued: {
    type: 'warning',
    variations: [
      {
        title: 'PENALTY QUEST ISSUED',
        message: 'Your failures have accumulated. A penalty quest has been assigned. Complete it or face further consequences.',
        urgent: true,
      },
      {
        title: 'MANDATORY REDEMPTION QUEST',
        message: 'The System demands atonement. A penalty quest is now active. Failure is not permitted.',
        urgent: true,
      },
      {
        title: 'CONSEQUENCE QUEST ACTIVATED',
        message: 'Your recent performance requires correction. Complete this penalty quest to restore standing.',
        urgent: true,
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // ACHIEVEMENTS
  // ═══════════════════════════════════════════════════════════════

  achievementUnlocked: {
    type: 'praise',
    variations: [
      {
        title: 'ACHIEVEMENT UNLOCKED',
        message: 'Special conditions fulfilled. A new achievement has been recorded in your hunter profile.',
        urgent: false,
      },
      {
        title: 'TITLE EARNED',
        message: 'The System has recognized your accomplishment. Achievement unlocked. View your new title.',
        urgent: false,
      },
      {
        title: 'MILESTONE ACHIEVED',
        message: 'Your efforts have been immortalized. A new achievement adorns your record.',
        urgent: false,
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // FIRST-TIME USER / ONBOARDING
  // ═══════════════════════════════════════════════════════════════

  welcomeNewUser: {
    type: 'command',
    variations: [
      {
        title: 'SYSTEM INITIALIZED',
        message: 'Hunter registration complete. You have been selected as a Player. Your journey to strength begins now.',
        urgent: true,
      },
      {
        title: 'AWAKENING DETECTED',
        message: 'A new Hunter has emerged. The System will guide your evolution. Prepare for your first quest.',
        urgent: true,
      },
      {
        title: 'PLAYER STATUS: ACTIVE',
        message: 'Welcome, Hunter. You have entered the System. Your current level: 1. Only the strong survive.',
        urgent: true,
      },
      {
        title: 'CONNECTION ESTABLISHED',
        message: 'The System has acknowledged your existence. From this moment, you are bound to the path of growth.',
        urgent: true,
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // MANUAL STEP LOGGING
  // ═══════════════════════════════════════════════════════════════

  stepsLogged: {
    type: 'notification',
    variations: [
      {
        title: 'STEPS RECORDED',
        message: 'Your physical activity has been logged. The System tracks all movement. Continue.',
        urgent: false,
      },
      {
        title: 'ACTIVITY LOGGED',
        message: 'Step count updated. Your effort contributes to your overall progress.',
        urgent: false,
      },
      {
        title: 'DATA RECORDED',
        message: 'Movement data accepted. The System has updated your daily metrics.',
        urgent: false,
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // ERROR / SYSTEM STATES
  // ═══════════════════════════════════════════════════════════════

  systemError: {
    type: 'warning',
    variations: [
      {
        title: 'SYSTEM ERROR',
        message: 'An unexpected error has occurred. The System is recalibrating. Retry your action.',
        urgent: true,
      },
      {
        title: 'PROCESSING FAILURE',
        message: 'Request could not be completed. System interference detected. Attempt again.',
        urgent: true,
      },
      {
        title: 'ANOMALY DETECTED',
        message: 'The System has encountered an irregularity. Your request was not processed.',
        urgent: true,
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // QUEST CREATION
  // ═══════════════════════════════════════════════════════════════

  questCreated: {
    type: 'notification',
    variations: [
      {
        title: 'QUEST REGISTERED',
        message: 'New objective has been added to your quest log. The System awaits your completion.',
        urgent: false,
      },
      {
        title: 'OBJECTIVE LOGGED',
        message: 'Your quest has been created. Parameters set. Begin when ready.',
        urgent: false,
      },
      {
        title: 'MISSION ACCEPTED',
        message: 'Quest successfully registered. Your path has been updated. Execute with precision.',
        urgent: false,
      },
    ],
  },

  questDeleted: {
    type: 'notification',
    variations: [
      {
        title: 'QUEST REMOVED',
        message: 'The objective has been deleted from your log. Choose your quests wisely.',
        urgent: false,
      },
      {
        title: 'OBJECTIVE TERMINATED',
        message: 'Quest removed. The System notes your decision. Proceed with remaining objectives.',
        urgent: false,
      },
    ],
  },
};

/**
 * Get a random message variation for a given scenario
 */
export function getRandomMessage(scenario: keyof typeof SYSTEM_MESSAGES): SystemMessageVariation & { type: MessageType } {
  const scenarioData = SYSTEM_MESSAGES[scenario];
  if (!scenarioData) {
    throw new Error(`Unknown scenario: ${scenario}`);
  }
  
  const randomIndex = Math.floor(Math.random() * scenarioData.variations.length);
  const variation = scenarioData.variations[randomIndex];
  
  return {
    ...variation,
    type: scenarioData.type,
  };
}

/**
 * Get all variations for a scenario (for testing/preview)
 */
export function getAllVariations(scenario: keyof typeof SYSTEM_MESSAGES): SystemMessageScenario {
  return SYSTEM_MESSAGES[scenario];
}

export type SystemMessageScenarioKey = keyof typeof SYSTEM_MESSAGES;
