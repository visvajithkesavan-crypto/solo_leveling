# 🔧 SYSTEM MESSAGE FRAMEWORK - TROUBLESHOOTING GUIDE

**Last Updated:** January 16, 2026  
**Purpose:** Diagnose and fix common issues with System Message integration

---

## 🎯 QUICK DIAGNOSTIC FLOWCHART

```
Issue Detected
    ↓
Messages don't appear? → See ISSUE #1
    ↓
Messages appear but no sound? → See ISSUE #2
    ↓
Styling looks wrong? → See ISSUE #3
    ↓
TypeScript errors? → See ISSUE #4
    ↓
Messages overlap/don't queue? → See ISSUE #5
    ↓
Messages don't auto-close? → See ISSUE #6
    ↓
Mobile issues? → See ISSUE #7
```

---

## 🐛 ISSUE #1: Messages Don't Appear

### Symptoms
- Clicking buttons does nothing
- No modal appears on screen
- `showMessage()` seems to do nothing
- Console shows hook-related errors

### Diagnostic Steps

#### Step 1: Check Browser Console
**Open DevTools (F12) → Console tab**

Look for these errors:

```javascript
❌ Error: Cannot read property 'showMessage' of undefined
❌ Error: useSystemMessage must be used within SystemMessageProvider
❌ TypeError: showMessage is not a function
```

**If you see these errors → Provider is missing or incorrectly set up**

#### Step 2: Verify Provider in Layout
**File:** [apps/web/src/app/layout.tsx](apps/web/src/app/layout.tsx)

Check that your layout looks like this:

```tsx
import { SystemMessageProvider } from '@/hooks/useSystemMessage';
import SystemMessageDisplay from '@/components/SystemMessageDisplay';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <SystemMessageProvider>  {/* ← MUST BE HERE */}
            {children}
            <SystemMessageDisplay />  {/* ← MUST BE HERE */}
          </SystemMessageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
```

**Common Mistakes:**
- ❌ Provider not imported
- ❌ Provider not wrapping `{children}`
- ❌ `<SystemMessageDisplay />` missing
- ❌ Provider inside a Client Component boundary

#### Step 3: Check Component Imports
**In the file where messages don't work:**

```tsx
// ✅ CORRECT
'use client';  // ← Must have this at top of file
import { useSystemMessage } from '@/hooks/useSystemMessage';

export default function MyComponent() {
  const { showMessage } = useSystemMessage();
  // ...
}
```

```tsx
// ❌ WRONG - Missing 'use client'
import { useSystemMessage } from '@/hooks/useSystemMessage';
// This will fail in server components
```

#### Step 4: Verify Hook Usage
```tsx
// ✅ CORRECT
const { showMessage, showCustomMessage } = useSystemMessage();

// Click handler
const handleClick = () => {
  showMessage('questCreated');
};

// ❌ WRONG - Calling hook conditionally
if (condition) {
  const { showMessage } = useSystemMessage(); // NEVER DO THIS
}

// ❌ WRONG - Wrong scenario key
showMessage('questCreateddddd'); // Typo
```

### Fixes

#### Fix 1: Add Provider to Layout
```bash
# Edit layout.tsx
code apps/web/src/app/layout.tsx
```

Add the imports and wrap your app:
```tsx
import { SystemMessageProvider } from '@/hooks/useSystemMessage';
import SystemMessageDisplay from '@/components/SystemMessageDisplay';

// ... in JSX:
<SystemMessageProvider>
  {children}
  <SystemMessageDisplay />
</SystemMessageProvider>
```

#### Fix 2: Add 'use client' Directive
At the **very top** of any component using the hook:
```tsx
'use client';  // ← Line 1 of the file

import { useSystemMessage } from '@/hooks/useSystemMessage';
// ... rest of imports
```

#### Fix 3: Check Scenario Keys
Valid keys are defined in `systemMessages.ts`:

```typescript
// ✅ Valid keys:
'welcomeNewUser'
'dailyQuestAvailable'
'questCompleted'
'questFailed'
'questCreated'
'questDeleted'
'levelUp'
'statIncreased'
'stepsLogged'
'systemError'
// ... and more
```

Use autocomplete in VS Code to see all available keys.

---

## 🔇 ISSUE #2: Sounds Don't Play

### Symptoms
- Messages appear correctly
- But no audio plays
- Console shows 404 errors: `GET /sounds/command.mp3 404`
- Or audio plays but very quiet/loud

### Diagnostic Steps

#### Step 1: Check if Sound Files Exist
```bash
# List sound directory
ls apps/web/public/sounds/
```

**Expected files:**
- `command.mp3`
- `warning.mp3`
- `praise.mp3`
- `judgment.mp3`
- `notification.mp3`

**If files are missing:** This is OK for now! The app should work without sounds.

#### Step 2: Check Console Errors
```javascript
// Expected (if files missing):
⚠️ GET http://localhost:3000/sounds/command.mp3 404 (Not Found)

// This is NOT a breaking error
// Messages should still display
```

#### Step 3: Verify Sound System Code
**File:** [apps/web/src/lib/sounds.ts](apps/web/src/lib/sounds.ts)

Should have graceful error handling:
```typescript
export function playSound(type: SoundType) {
  try {
    const audio = new Audio(`/sounds/${type}.mp3`);
    audio.volume = 0.5;
    audio.play().catch((err) => {
      console.warn('[Sound] Playback failed:', err);
      // Fails silently - doesn't break app
    });
  } catch (error) {
    console.warn('[Sound] Error:', error);
  }
}
```

### Fixes

#### Fix 1: Add Sound Files
**See [SOUND_SETUP_GUIDE.md](./SOUND_SETUP_GUIDE.md) for detailed instructions.**

Quick version:
1. Download free sound effects from Pixabay/Freesound
2. Rename them to match required names
3. Place in `apps/web/public/sounds/`
4. Restart dev server

#### Fix 2: Disable Sounds Temporarily
If sounds are causing issues, you can disable them:

```typescript
// apps/web/src/lib/sounds.ts

export function playSound(type: SoundType) {
  return; // ← Add this line to disable all sounds
  
  // ... rest of code
}
```

#### Fix 3: Adjust Volume
If sounds are too loud/quiet:

```typescript
// apps/web/src/lib/sounds.ts

export function playSound(type: SoundType, volume: number = 0.5) {
  const audio = new Audio(`/sounds/${type}.mp3`);
  audio.volume = volume; // 0.0 to 1.0
  
  // Or set different volumes per type:
  const volumes: Record<SoundType, number> = {
    command: 0.6,
    warning: 0.7,
    praise: 0.5,
    judgment: 0.8,
    notification: 0.3,
  };
  
  audio.volume = volumes[type];
  audio.play().catch(console.warn);
}
```

#### Fix 4: Add Mute Toggle
If you want users to control sound:

```typescript
// apps/web/src/lib/sounds.ts

let isMuted = false;

export function toggleMute() {
  isMuted = !isMuted;
  localStorage.setItem('soundMuted', String(isMuted));
  return isMuted;
}

export function playSound(type: SoundType) {
  if (isMuted) return; // ← Check mute state
  
  // ... rest of code
}

// Initialize from localStorage
if (typeof window !== 'undefined') {
  isMuted = localStorage.getItem('soundMuted') === 'true';
}
```

Then add a button in your UI:
```tsx
const [muted, setMuted] = useState(false);

<button onClick={() => setMuted(toggleMute())}>
  {muted ? '🔇' : '🔊'} Sound
</button>
```

---

## 🎨 ISSUE #3: Styling Issues

### Symptoms
- Messages don't have blue glow
- Colors are wrong (not cyan/green/orange/red)
- Text not readable
- Animations don't work
- Layout broken

### Diagnostic Steps

#### Step 1: Verify CSS Import
**File:** [apps/web/src/app/layout.tsx](apps/web/src/app/layout.tsx)

Must have this import:
```tsx
import '@/styles/system.css';  // ← MUST BE PRESENT
```

#### Step 2: Check if system.css Exists
```bash
# Verify file exists
ls apps/web/src/styles/system.css
```

If missing, create it (see Fix 1 below).

#### Step 3: Inspect Element in DevTools
1. Right-click on the message modal
2. Select "Inspect"
3. Check **Computed** tab
4. Look for these properties:
   - `box-shadow` (should have blue glow)
   - `border-color` (should match message type)
   - `animation` (should have fade-in)

#### Step 4: Check for Tailwind Conflicts
If using Tailwind classes, they might override system.css.

**Solution:** Use `!important` or increase CSS specificity.

### Fixes

#### Fix 1: Create/Restore system.css
```bash
# Create the file
code apps/web/src/styles/system.css
```

Add this content:
```css
/* Solo Leveling System - Core UI Styles */

:root {
  --system-cyan: #22d3ee;
  --system-orange: #fb923c;
  --system-green: #4ade80;
  --system-red: #f87171;
  --system-blue: #60a5fa;
  --system-bg: #0a0e27;
  --system-text: #e2e8f0;
}

.system-message-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(4px);
  z-index: 9998;
  animation: fadeIn 0.2s ease-out;
}

.system-message-modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  max-width: 90%;
  width: 500px;
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  border: 2px solid var(--system-blue);
  border-radius: 8px;
  padding: 24px;
  z-index: 9999;
  box-shadow: 
    0 0 30px rgba(96, 165, 250, 0.4),
    0 0 60px rgba(96, 165, 250, 0.2),
    0 20px 40px rgba(0, 0, 0, 0.5);
  animation: slideIn 0.3s ease-out;
}

/* Type-specific borders */
.system-message-modal[data-type="command"] {
  border-color: var(--system-cyan);
  box-shadow: 
    0 0 30px rgba(34, 211, 238, 0.4),
    0 0 60px rgba(34, 211, 238, 0.2);
}

.system-message-modal[data-type="warning"] {
  border-color: var(--system-orange);
  box-shadow: 
    0 0 30px rgba(251, 146, 60, 0.4),
    0 0 60px rgba(251, 146, 60, 0.2);
}

.system-message-modal[data-type="praise"] {
  border-color: var(--system-green);
  box-shadow: 
    0 0 30px rgba(74, 222, 128, 0.4),
    0 0 60px rgba(74, 222, 128, 0.2);
}

.system-message-modal[data-type="judgment"] {
  border-color: var(--system-red);
  box-shadow: 
    0 0 30px rgba(248, 113, 113, 0.4),
    0 0 60px rgba(248, 113, 113, 0.2);
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translate(-50%, -55%);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%);
  }
}

/* Urgent pulse animation */
.system-message-urgent {
  animation: slideIn 0.3s ease-out, pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.9; }
}
```

#### Fix 2: Force CSS Reload
```bash
# Stop dev server (Ctrl+C)
# Clear Next.js cache
rm -rf apps/web/.next

# Restart
cd apps/web && pnpm dev
```

#### Fix 3: Fix Tailwind Conflicts
If Tailwind is overriding styles:

```tsx
// In your component
<div className="system-message-modal !border-cyan-500">
  {/* ! prefix forces Tailwind to use !important */}
</div>
```

Or increase CSS specificity:
```css
/* In system.css */
.system-message-modal.system-message-modal {
  /* Double class = higher specificity */
  border: 2px solid var(--system-blue);
}
```

---

## 🔴 ISSUE #4: TypeScript Errors

### Symptoms
- Red squiggles in VS Code
- Build fails with type errors
- `pnpm build` fails

### Common Errors & Fixes

#### Error 1: Cannot find module '@/hooks/useSystemMessage'
```typescript
❌ Cannot find module '@/hooks/useSystemMessage' or its corresponding type declarations
```

**Cause:** Path alias not configured in tsconfig.json

**Fix:**
```json
// apps/web/tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]  // ← Ensure this exists
    }
  }
}
```

Then restart TypeScript server:
- VS Code: Ctrl+Shift+P → "TypeScript: Restart TS Server"

#### Error 2: Property 'showMessage' does not exist
```typescript
❌ Property 'showMessage' does not exist on type 'SystemMessageContextValue | null'
```

**Cause:** Hook used outside provider, returning null

**Fix:**
```tsx
// Add null check
const context = useSystemMessage();
if (!context) {
  throw new Error('useSystemMessage must be used within SystemMessageProvider');
}
const { showMessage } = context;
```

Or update the hook to never return null:
```tsx
// In useSystemMessage.tsx
export function useSystemMessage() {
  const context = useContext(SystemMessageContext);
  if (!context) {
    throw new Error('useSystemMessage must be used within SystemMessageProvider');
  }
  return context; // Now TypeScript knows it's never null
}
```

#### Error 3: Type 'string' is not assignable to type 'SystemMessageScenarioKey'
```typescript
❌ Argument of type 'string' is not assignable to parameter of type 'SystemMessageScenarioKey'
```

**Cause:** Passing dynamic string instead of typed key

**Fix:**
```tsx
// ❌ WRONG
const scenario = 'questCreated'; // Type: string
showMessage(scenario); // Error!

// ✅ CORRECT
const scenario = 'questCreated' as const; // Type: literal
showMessage(scenario); // Works!

// ✅ OR use direct literal
showMessage('questCreated'); // Works!
```

#### Error 4: 'MessageType' is not exported
```typescript
❌ Module '"@/components/SystemMessage"' has no exported member 'MessageType'
```

**Cause:** Import/export mismatch

**Fix:**
Check [apps/web/src/components/SystemMessage.tsx](apps/web/src/components/SystemMessage.tsx) exports:
```tsx
// Must have this export
export type MessageType = 'command' | 'warning' | 'praise' | 'judgment' | 'notification';
```

---

## 📚 ISSUE #5: Messages Overlap / Don't Queue

### Symptoms
- Multiple messages appear on top of each other
- Screen filled with overlapping modals
- Messages don't wait for previous to close

### Diagnostic Steps

#### Check if Multiple Providers Exist
Search your codebase:
```bash
# Should only appear ONCE in layout.tsx
grep -r "SystemMessageProvider" apps/web/src/
```

If it appears in multiple places, you have duplicate providers.

### Fix: Implement Message Queue

Update [apps/web/src/hooks/useSystemMessage.tsx](apps/web/src/hooks/useSystemMessage.tsx):

```tsx
'use client';

import { useState, useCallback, createContext, useContext, ReactNode, useEffect } from 'react';

interface QueuedMessage {
  id: string;
  type: MessageType;
  title: string;
  message: string;
  urgent: boolean;
  autoCloseDelay: number | null;
}

export function SystemMessageProvider({ children }: { children: ReactNode }) {
  const [messageState, setMessageState] = useState<SystemMessageState>(defaultState);
  const [messageQueue, setMessageQueue] = useState<QueuedMessage[]>([]);
  
  // Process queue when message closes
  useEffect(() => {
    if (!messageState.visible && messageQueue.length > 0) {
      // Show next message in queue
      const nextMessage = messageQueue[0];
      setMessageQueue(prev => prev.slice(1));
      
      setMessageState({
        visible: true,
        type: nextMessage.type,
        title: nextMessage.title,
        message: nextMessage.message,
        urgent: nextMessage.urgent,
        autoCloseDelay: nextMessage.autoCloseDelay,
      });
    }
  }, [messageState.visible, messageQueue]);

  const showMessage = useCallback((/* ... params ... */) => {
    const messageData = {
      id: Date.now().toString(),
      type: randomMessage.type,
      title,
      message,
      urgent: randomMessage.urgent ?? false,
      autoCloseDelay: options?.autoCloseDelay ?? (randomMessage.urgent ? null : 5000),
    };

    if (messageState.visible) {
      // Queue the message
      setMessageQueue(prev => [...prev, messageData]);
    } else {
      // Show immediately
      setMessageState({
        visible: true,
        ...messageData,
      });
    }
  }, [messageState.visible]);

  // ... rest of code
}
```

---

## ⏱️ ISSUE #6: Messages Don't Auto-Close

### Symptoms
- Messages stay on screen forever
- User must manually close every message
- Even though `autoCloseDelay` is set

### Fix

Update [apps/web/src/components/SystemMessageDisplay.tsx](apps/web/src/components/SystemMessageDisplay.tsx):

```tsx
'use client';

import { useEffect } from 'react';
import { useSystemMessage } from '@/hooks/useSystemMessage';
import SystemMessage from './SystemMessage';

export default function SystemMessageDisplay() {
  const { messageState, hideMessage } = useSystemMessage();

  // Auto-close timer
  useEffect(() => {
    if (messageState.visible && messageState.autoCloseDelay !== null) {
      const timer = setTimeout(() => {
        hideMessage();
      }, messageState.autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [messageState.visible, messageState.autoCloseDelay, hideMessage]);

  if (!messageState.visible) return null;

  return (
    <SystemMessage
      type={messageState.type}
      title={messageState.title}
      message={messageState.message}
      urgent={messageState.urgent}
      onClose={hideMessage}
    />
  );
}
```

---

## 📱 ISSUE #7: Mobile Display Issues

### Symptoms
- Modal too wide on mobile
- Text too small to read
- Buttons not touch-friendly
- Animation janky

### Fixes

#### Fix 1: Responsive Modal Width
```css
/* apps/web/src/styles/system.css */

.system-message-modal {
  max-width: 90%;
  width: 500px;
  
  @media (max-width: 640px) {
    max-width: 95%;
    padding: 16px;
  }
}
```

#### Fix 2: Readable Text on Mobile
```css
.system-message-title {
  font-size: 1.5rem;
  
  @media (max-width: 640px) {
    font-size: 1.25rem;
  }
}

.system-message-body {
  font-size: 1rem;
  line-height: 1.6;
  
  @media (max-width: 640px) {
    font-size: 0.95rem;
  }
}
```

#### Fix 3: Touch-Friendly Close
```css
/* Make backdrop easier to tap */
.system-message-backdrop {
  /* Already full screen - good for touch */
}

/* Add visible close button on mobile */
.system-message-close-btn {
  display: none;
  
  @media (max-width: 640px) {
    display: block;
    position: absolute;
    top: 8px;
    right: 8px;
    width: 32px;
    height: 32px;
    /* Style as X button */
  }
}
```

---

## 🔍 DEBUGGING CHECKLIST

When stuck, go through this checklist:

```
[ ] 1. Check browser console for errors
[ ] 2. Verify provider is in layout.tsx
[ ] 3. Verify 'use client' directive in component
[ ] 4. Verify imports are correct
[ ] 5. Verify system.css is imported in layout
[ ] 6. Clear browser cache (Ctrl+F5)
[ ] 7. Clear Next.js cache (rm -rf .next)
[ ] 8. Restart dev server
[ ] 9. Restart VS Code
[ ] 10. Check TypeScript errors (Ctrl+Shift+M)
```

---

## 🆘 STILL STUCK?

### Step 1: Verify Core Files Exist
```bash
# Run this in terminal
ls apps/web/src/hooks/useSystemMessage.tsx
ls apps/web/src/components/SystemMessage.tsx
ls apps/web/src/components/SystemMessageDisplay.tsx
ls apps/web/src/lib/systemMessages.ts
ls apps/web/src/styles/system.css
```

All should exist. If any are missing, that's your problem.

### Step 2: Check Integration in Layout
```bash
# Verify provider is set up
cat apps/web/src/app/layout.tsx | grep "SystemMessageProvider"
```

Should see 2 lines: import and JSX usage.

### Step 3: Test in Isolation
Create a minimal test:

```tsx
// apps/web/src/app/test-minimal/page.tsx
'use client';

import { useSystemMessage } from '@/hooks/useSystemMessage';

export default function MinimalTest() {
  const { showMessage } = useSystemMessage();
  
  return (
    <button onClick={() => showMessage('questCreated')}>
      Click Me
    </button>
  );
}
```

Navigate to `/test-minimal`. If this works, problem is in your other code. If this doesn't work, problem is in core setup.

---

## 📞 NEXT STEPS

- **If test page works:** Your core setup is fine. Problem is in specific integration points.
- **If nothing works:** Recheck provider setup in layout.tsx
- **If sounds don't work:** See [SOUND_SETUP_GUIDE.md](./SOUND_SETUP_GUIDE.md)
- **If styling is wrong:** Verify system.css import and content
- **If TypeScript errors:** Check paths in tsconfig.json

---

**Most Common Fix:** Just restart everything
```bash
# Stop dev server (Ctrl+C)
cd apps/web
rm -rf .next
pnpm dev
# Hard refresh browser (Ctrl+F5)
```

This solves 70% of issues.
