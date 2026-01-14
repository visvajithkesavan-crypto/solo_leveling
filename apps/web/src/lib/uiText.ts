/**
 * Solo Leveling System - UI Text Constants
 * 
 * All user-facing text written in the System's voice.
 * Formal, commanding, authoritative - never casual.
 */

export const UI_TEXT = {
  // ═══════════════════════════════════════════════════════════════
  // BUTTONS
  // ═══════════════════════════════════════════════════════════════
  
  buttons: {
    // Quest Management
    newQuest: 'INITIATE QUEST',
    createQuest: 'REGISTER OBJECTIVE',
    deleteQuest: 'TERMINATE',
    editQuest: 'MODIFY',
    completeQuest: 'MARK COMPLETE',
    abandonQuest: 'FORFEIT',
    
    // Navigation
    signOut: 'DISCONNECT',
    signIn: 'AUTHENTICATE',
    signUp: 'REGISTER HUNTER',
    
    // Steps/Activity
    logSteps: 'LOG ACTIVITY',
    submitSteps: 'RECORD DATA',
    syncHealth: 'SYNC METRICS',
    
    // General Actions
    confirm: 'CONFIRM',
    cancel: 'ABORT',
    continue: 'PROCEED',
    retry: 'RETRY',
    acknowledge: 'ACKNOWLEDGED',
    dismiss: 'DISMISS',
    viewDetails: 'EXAMINE',
    close: 'CLOSE',
    save: 'SAVE',
    update: 'UPDATE',
    refresh: 'RECALIBRATE',
  },

  // ═══════════════════════════════════════════════════════════════
  // FORM LABELS & PLACEHOLDERS
  // ═══════════════════════════════════════════════════════════════
  
  forms: {
    // Quest Creation
    questTitle: {
      label: 'OBJECTIVE DESIGNATION',
      placeholder: 'Enter objective name...',
    },
    questDescription: {
      label: 'MISSION PARAMETERS',
      placeholder: 'Additional details (optional)...',
    },
    questDeadline: {
      label: 'TIME LIMIT',
      placeholder: 'Select deadline...',
    },
    questDifficulty: {
      label: 'DIFFICULTY RATING',
    },
    questXP: {
      label: 'EXPERIENCE VALUE',
    },
    
    // Steps Input
    stepsInput: {
      label: 'STEP COUNT',
      placeholder: 'Enter step count...',
    },
    stepsGoal: {
      label: 'TARGET OBJECTIVE',
      placeholder: 'Enter daily target...',
    },
    
    // Authentication
    email: {
      label: 'HUNTER ID (EMAIL)',
      placeholder: 'Enter identification...',
    },
    password: {
      label: 'ACCESS CODE',
      placeholder: 'Enter access code...',
    },
    confirmPassword: {
      label: 'CONFIRM ACCESS CODE',
      placeholder: 'Re-enter access code...',
    },
    hunterName: {
      label: 'HUNTER DESIGNATION',
      placeholder: 'Enter your name...',
    },
  },

  // ═══════════════════════════════════════════════════════════════
  // SUCCESS MESSAGES
  // ═══════════════════════════════════════════════════════════════
  
  success: {
    questCreated: 'Quest registered. The System awaits your completion.',
    questCompleted: 'Objective cleared. Experience points awarded.',
    questDeleted: 'Quest terminated. Record expunged.',
    questUpdated: 'Parameters modified. Changes recorded.',
    stepsLogged: 'Activity data recorded. Progress updated.',
    signedIn: 'Authentication successful. Welcome, Hunter.',
    signedUp: 'Hunter registration complete. Your journey begins.',
    signedOut: 'Session terminated. Connection severed.',
    settingsSaved: 'Configuration saved. System updated.',
    profileUpdated: 'Hunter profile modified.',
    syncComplete: 'Data synchronization complete.',
  },

  // ═══════════════════════════════════════════════════════════════
  // ERROR MESSAGES
  // ═══════════════════════════════════════════════════════════════
  
  errors: {
    questCreationFailed: 'Quest registration failed. System error detected.',
    questCompletionFailed: 'Unable to verify completion. Retry.',
    questDeletionFailed: 'Termination failed. Quest remains active.',
    stepsLoggingFailed: 'Activity recording failed. Data not saved.',
    authenticationFailed: 'Authentication denied. Verify credentials.',
    registrationFailed: 'Hunter registration failed. Try again.',
    networkError: 'Connection to System servers lost. Reconnecting...',
    unknownError: 'Anomaly detected. The System is recalibrating.',
    sessionExpired: 'Session expired. Re-authenticate.',
    invalidInput: 'Invalid input detected. Correct and resubmit.',
    permissionDenied: 'Access denied. Insufficient clearance.',
    notFound: 'Target not found. Verify your request.',
    serverError: 'System malfunction detected. Contact support.',
  },

  // ═══════════════════════════════════════════════════════════════
  // EMPTY STATES
  // ═══════════════════════════════════════════════════════════════
  
  emptyStates: {
    noQuests: {
      title: 'NO ACTIVE OBJECTIVES',
      message: 'Your quest log is empty. Initiate a quest to begin your ascent.',
    },
    noCompletedQuests: {
      title: 'NO COMPLETED OBJECTIVES',
      message: 'You have not yet proven yourself. Complete quests to build your record.',
    },
    noAchievements: {
      title: 'NO ACHIEVEMENTS RECORDED',
      message: 'Achievements are earned through exceptional performance. Continue training.',
    },
    noActivity: {
      title: 'NO ACTIVITY DATA',
      message: 'The System has no records for this period. Log your activities.',
    },
    noNotifications: {
      title: 'NO PENDING ALERTS',
      message: 'All messages have been acknowledged. Standby for further instructions.',
    },
  },

  // ═══════════════════════════════════════════════════════════════
  // LOADING STATES
  // ═══════════════════════════════════════════════════════════════
  
  loading: {
    default: 'SYSTEM PROCESSING...',
    quests: 'LOADING QUEST DATA...',
    profile: 'RETRIEVING HUNTER PROFILE...',
    stats: 'CALCULATING STATISTICS...',
    syncing: 'SYNCHRONIZING WITH SERVERS...',
    authenticating: 'VERIFYING CREDENTIALS...',
  },

  // ═══════════════════════════════════════════════════════════════
  // CONFIRMATION DIALOGS
  // ═══════════════════════════════════════════════════════════════
  
  confirmations: {
    deleteQuest: {
      title: 'CONFIRM TERMINATION',
      message: 'This quest will be permanently removed. This action cannot be undone.',
      confirm: 'TERMINATE',
      cancel: 'ABORT',
    },
    abandonQuest: {
      title: 'CONFIRM FORFEIT',
      message: 'Abandoning this quest will result in failure. Proceed?',
      confirm: 'FORFEIT',
      cancel: 'CONTINUE QUEST',
    },
    signOut: {
      title: 'CONFIRM DISCONNECT',
      message: 'Your session will be terminated. Unsaved progress may be lost.',
      confirm: 'DISCONNECT',
      cancel: 'STAY CONNECTED',
    },
    resetProgress: {
      title: 'CONFIRM RESET',
      message: 'WARNING: All progress will be erased. This action is irreversible.',
      confirm: 'RESET ALL',
      cancel: 'PRESERVE DATA',
    },
  },

  // ═══════════════════════════════════════════════════════════════
  // PAGE TITLES
  // ═══════════════════════════════════════════════════════════════
  
  pages: {
    dashboard: 'HUNTER STATUS',
    quests: 'QUEST LOG',
    profile: 'HUNTER PROFILE',
    settings: 'SYSTEM CONFIGURATION',
    achievements: 'ACHIEVEMENT REGISTRY',
    statistics: 'PERFORMANCE METRICS',
    signin: 'HUNTER AUTHENTICATION',
    signup: 'HUNTER REGISTRATION',
  },

  // ═══════════════════════════════════════════════════════════════
  // SECTION HEADERS
  // ═══════════════════════════════════════════════════════════════
  
  sections: {
    activeQuests: 'ACTIVE OBJECTIVES',
    completedQuests: 'COMPLETED OBJECTIVES',
    dailyProgress: 'DAILY PROGRESS',
    weeklyReport: 'WEEKLY ANALYSIS',
    statusWindow: 'STATUS WINDOW',
    recentActivity: 'ACTIVITY LOG',
    upcomingDeadlines: 'IMPENDING DEADLINES',
  },

  // ═══════════════════════════════════════════════════════════════
  // STATS & METRICS
  // ═══════════════════════════════════════════════════════════════
  
  stats: {
    level: 'LEVEL',
    experience: 'EXP',
    strength: 'STRENGTH',
    agility: 'AGILITY',
    vitality: 'VITALITY',
    intelligence: 'INTELLIGENCE',
    perception: 'PERCEPTION',
    currentStreak: 'CURRENT STREAK',
    longestStreak: 'LONGEST STREAK',
    questsCompleted: 'QUESTS CLEARED',
    totalXP: 'TOTAL EXPERIENCE',
    rank: 'HUNTER RANK',
  },

  // ═══════════════════════════════════════════════════════════════
  // TOOLTIPS
  // ═══════════════════════════════════════════════════════════════
  
  tooltips: {
    streak: 'Consecutive days of completed objectives.',
    xp: 'Experience points earned from quest completion.',
    level: 'Your current hunter level. Level up to increase base stats.',
    difficulty: 'Higher difficulty quests yield greater rewards.',
    deadline: 'Failure to complete by deadline results in quest failure.',
  },
};

/**
 * Helper function to get nested text values
 */
export function getText(path: string): string {
  const keys = path.split('.');
  let value: any = UI_TEXT;
  
  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key];
    } else {
      return path; // Return path if not found
    }
  }
  
  return typeof value === 'string' ? value : path;
}

export default UI_TEXT;
