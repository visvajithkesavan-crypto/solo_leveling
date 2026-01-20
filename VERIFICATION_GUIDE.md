# 🎯 SYSTEM MESSAGE FRAMEWORK - VERIFICATION GUIDE

**Status:** Integration Complete ✅  
**Last Updated:** January 16, 2026  
**Purpose:** Step-by-step testing of all System Message integration points

---

## 🚀 QUICK START

1. **Start the dev server:** `cd apps/web && pnpm dev`
2. **Open browser:** `http://localhost:3000`
3. **Login/signup** to access dashboard
4. **Navigate to test page:** `http://localhost:3000/test-system`

---

## 📋 PART 1: TEST PAGE VERIFICATION

### Location
`http://localhost:3000/test-system`

### What You Should See

```
◈ SYSTEM MESSAGE TEST INTERFACE ◈

Select a scenario to trigger a System message. Each click shows a random variation.

[Grid of colored buttons organized by message type]

◇ CUSTOM MESSAGE TEST ◇
[5 buttons: Command, Warning, Praise, Judgment, Notification]
```

### Visual Layout
- **Dark background** (gray-900)
- **Title** in cyan-400 with tracking
- **Button grid** (2-4 columns depending on screen size)
- **Each button** shows:
  - Scenario name (e.g., "Welcome New User")
  - Message type and variation count (e.g., "COMMAND • 5 var")

### Button Color Coding

| Type | Border Color | Hover Effect | Examples |
|------|-------------|--------------|----------|
| **COMMAND** | Cyan (border-cyan-500) | Blue-cyan glow | Daily Quest Available, Quest Created |
| **WARNING** | Orange (border-orange-500) | Orange glow | Deadline Approaching, Inactivity Warning |
| **PRAISE** | Green (border-green-500) | Green glow | Quest Completed, Level Up, Achievement |
| **JUDGMENT** | Red (border-red-500) | Red glow | Quest Failed, Streak Broken, Penalty |
| **NOTIFICATION** | Blue (border-blue-500) | Blue glow | Stat Increased, Steps Logged |

### Testing Each Message Type

#### ✅ COMMAND Messages (Cyan)
**Test Buttons:**
- "Welcome New User"
- "Daily Quest Available"  
- "Quest Created"
- "Hidden Quest Unlocked"
- "Penalty Quest Issued"

**What to expect when clicked:**
1. Modal appears with **cyan border glow**
2. **Title** appears in cyan-400 text
3. **Message** appears in white/gray text
4. **Sound** plays (command.mp3) - if file exists
5. Modal should **auto-close after 5 seconds** (for most)
6. OR requires **manual close** (click backdrop or X)

**Variation Test:**
- Click same button **3-5 times**
- Each click should show **different text** (random from pool)
- Example for "Quest Created":
  - Variation 1: "NEW QUEST ESTABLISHED"
  - Variation 2: "QUEST INITIALIZED"
  - Variation 3: "OBJECTIVE CREATED"

#### ⚠️ WARNING Messages (Orange)
**Test Buttons:**
- "Deadline Approaching"
- "Inactivity Warning"

**What to expect:**
1. Modal appears with **orange border glow**
2. Title in **orange-400**
3. Sound plays (warning.mp3)
4. **URGENT** flag - may have different animation
5. Auto-close after 5 seconds

**Check:** Orange glow should pulse if urgent=true

#### 🎉 PRAISE Messages (Green)
**Test Buttons:**
- "Quest Completed"
- "Level Up" ⚡ (CINEMATIC)
- "7-Day Streak"
- "30-Day Streak"
- "Achievement Unlocked"

**What to expect:**
1. Modal appears with **green border glow**
2. Title in **green-400**
3. Sound plays (praise.mp3)
4. Positive, encouraging message tone
5. Auto-close after 5 seconds

**Special Case - Level Up:**
- This should feel **MORE CINEMATIC**
- Potentially longer display time
- Stronger visual effect
- Check if it mentions "All base stats increased"

#### ⚔️ JUDGMENT Messages (Red)
**Test Buttons:**
- "Quest Failed"
- "Streak Broken"

**What to expect:**
1. Modal appears with **red border glow**
2. Title in **red-400**
3. Sound plays (judgment.mp3) - heavy, serious tone
4. Harsh, critical message tone
5. Auto-close after 5 seconds

**Message tone check:** Should feel punitive, not encouraging

#### 📢 NOTIFICATION Messages (Blue)
**Test Buttons:**
- "Stat Increased"
- "Stat Decreased"
- "Weekly Review"
- "Steps Logged"
- "System Error"

**What to expect:**
1. Modal appears with **blue border glow**
2. Title in **blue-400**
3. Sound plays (notification.mp3)
4. Neutral information tone
5. Auto-close after 5 seconds

### Custom Message Tests

**Location:** Bottom section of test page

**5 Buttons to test:**
1. **Command** - Should show "CUSTOM COMMAND" with cyan styling
2. **Warning** - Should show "CUSTOM WARNING" with orange styling + urgent flag
3. **Praise** - Should show "CUSTOM PRAISE" with green styling
4. **Judgment** - Should show "CUSTOM JUDGMENT" with red styling
5. **Notification** - Should show "CUSTOM NOTIFICATION" with blue styling

**Purpose:** Verifies custom message API works for dynamic content

---

## 📋 PART 2: DASHBOARD INTEGRATION VERIFICATION

### Location
`http://localhost:3000/dashboard`

### A. Quest Creation Test

**Steps:**
1. Navigate to dashboard
2. Click **"◇ ESTABLISH NEW OBJECTIVE ◇"** button (or similar System voice text)
3. Enter quest title: "Complete 100 pushups"
4. Click **"SUBMIT QUEST"** (or similar)

**Expected Result:**
- ✅ Quest appears in quest list
- ✅ System message modal appears:
  - **Type:** COMMAND (cyan)
  - **Title:** "NEW QUEST ESTABLISHED" (or variation)
  - **Message:** Something like "Objective registered. The System awaits your performance."
- ✅ Message auto-closes after 5 seconds

**Console Check:**
```javascript
// Open browser console (F12)
// Should see:
[SystemMessage] Showing message: questCreated
[Sound] Playing: command.mp3 (or error if file missing)
```

### B. Quest Completion Test

**Note:** This requires quest completion logic to be fully implemented in dashboard

**Steps:**
1. Find a quest in your list
2. Click **"COMPLETE"** or **"MARK DONE"** button (if available)
3. OR manually mark as complete via API

**Expected Result:**
- ✅ Quest marked as complete
- ✅ System message appears:
  - **Type:** PRAISE (green)
  - **Title:** "QUEST COMPLETE" (or variation)
  - **Message:** "Objective cleared. Experience points awarded."
- ✅ XP bar increases
- ✅ Check if level up triggered (if close to next level)

**If Level Up Occurs:**
- ✅ Second message appears:
  - **Type:** PRAISE (green)
  - **Title:** "LEVEL UP"
  - **Message:** "You have ascended to a new level. All base stats increased."
- ✅ Status window updates with new level
- ✅ XP resets for next level

### C. Quest Deletion Test

**Steps:**
1. Find a quest in your list
2. Click **"DELETE"** or **"❌"** button
3. Confirm deletion if prompted

**Expected Result:**
- ✅ Quest removed from list
- ✅ System message appears:
  - **Type:** NOTIFICATION (blue)
  - **Title:** "QUEST DELETED" (or variation)
  - **Message:** "Objective removed from your registry."

### D. Daily Quest Evaluation Test

**Steps:**
1. On dashboard, click **"EVALUATE DAY"** button (if available)
2. OR wait for automatic daily evaluation trigger

**Expected Result:**
- ✅ System processes your daily completion
- ✅ Multiple messages may appear:
  - Quest completed messages
  - Stat changes
  - Level up (if applicable)
  - Streak milestone (if 7/30 days)
- ✅ Status window updates

---

## 📋 PART 3: STEPS LOGGING VERIFICATION

### Location
Dashboard → Manual Steps Form (likely in sidebar or separate section)

### Successful Step Log Test

**Steps:**
1. Find the **"Log Steps"** form
2. Enter a number: `5000`
3. Click **"SUBMIT"** or **"LOG STEPS"**

**Expected Result:**
- ✅ Steps recorded in backend
- ✅ System message appears:
  - **Type:** NOTIFICATION (blue)
  - **Title:** "STEPS LOGGED"
  - **Message:** "Physical activity recorded: 5000 steps."
- ✅ May trigger XP gain (check if implemented)

**Console Check:**
```javascript
// Should see API call
POST /api/ingest/steps
Body: { steps: 5000, date: "2026-01-16" }
```

### Error Handling Test

**Steps:**
1. Enter invalid input: `-100` or `abc`
2. Click submit

**Expected Result:**
- ✅ Either frontend validation prevents submission
- ✅ OR System error message appears:
  - **Type:** NOTIFICATION (blue) or JUDGMENT (red)
  - **Title:** "SYSTEM ERROR"
  - **Message:** "Invalid input detected. Correct your data and retry."

---

## 📋 PART 4: AUTHENTICATION FLOW VERIFICATION

### A. Signup Flow

**Steps:**
1. Navigate to `http://localhost:3000/auth/signup`
2. Fill in:
   - Email: `test@example.com`
   - Password: `TestPass123!`
3. Click **"CREATE ACCOUNT"** (or System voice equivalent)

**Expected Result:**
- ✅ Account created successfully
- ✅ Redirected to dashboard
- ✅ **Welcome message appears:**
  - **Type:** COMMAND (cyan)
  - **Title:** "WELCOME, HUNTER" (or variation)
  - **Message:** "You have been selected by the System. Your journey begins now."
- ✅ Message appears **AFTER** dashboard loads

**Timing Check:**
- Message should appear **1-2 seconds after redirect**
- NOT immediately on page load
- Should feel like System is "scanning" you first

### B. Signin Flow

**Steps:**
1. Navigate to `http://localhost:3000/auth/signin`
2. Check page text

**Expected Result:**
- ✅ Page uses **System voice** in UI elements
- ✅ Button says: **"◇ AUTHENTICATE ◇"** (not "Login")
- ✅ Heading says: **"SYSTEM ACCESS"** (not "Sign In")

**After Signin:**
- No special message (welcome is only for signup)
- Just redirects to dashboard

---

## 📋 PART 5: UI TEXT VERIFICATION CHECKLIST

This table lists ALL UI elements that should use System voice:

| Location | Element | Expected System Text | How to Verify |
|----------|---------|---------------------|---------------|
| **Dashboard** | New Quest Button | "◇ ESTABLISH NEW OBJECTIVE ◇" | Check button text |
| **Dashboard** | Quest Board Title | "◈ ACTIVE OBJECTIVES ◈" | Check heading |
| **Dashboard** | Evaluate Day Button | "◇ SUBMIT FOR EVALUATION ◇" | Check button text |
| **Dashboard** | Status Window Title | "◈ HUNTER STATUS ◈" | Check panel heading |
| **Dashboard** | Empty Quest Message | "No active quests detected. Initiate new objectives." | Check when no quests |
| **Quest Form** | Submit Button | "◇ REGISTER QUEST ◇" | Check form button |
| **Quest Form** | Cancel Button | "◇ ABORT ◇" | Check form button |
| **Quest Card** | Complete Button | "◇ COMPLETE ◇" | Check quest action |
| **Quest Card** | Delete Button | "◇ REMOVE ◇" | Check quest action |
| **Steps Form** | Submit Button | "◇ LOG ACTIVITY ◇" | Check form button |
| **Steps Form** | Label | "Physical Training Data" | Check input label |
| **Signup Page** | Heading | "◈ SYSTEM REGISTRATION ◈" | Check page title |
| **Signup Page** | Submit Button | "◇ BEGIN INTEGRATION ◇" | Check button |
| **Signin Page** | Heading | "◈ SYSTEM ACCESS ◈" | Check page title |
| **Signin Page** | Submit Button | "◇ AUTHENTICATE ◇" | Check button |

### How to Verify Each
1. Navigate to the page/section
2. Visually inspect the text
3. ✅ Check if it matches expected text
4. ❌ If generic (e.g., "Create Quest"), needs update

---

## 📋 PART 6: BROWSER CONSOLE CHECKS

Open browser DevTools (F12) → Console tab

### What You SHOULD See

**On page load:**
```
[SystemMessage] Provider initialized
[Sound] Audio system ready
```

**When message triggered:**
```
[SystemMessage] Showing message: questCreated
[SystemMessage] Playing sound: command
[Sound] Playing: /sounds/command.mp3
```

**On message close:**
```
[SystemMessage] Message closed
```

### What You SHOULD NOT See

**❌ Errors:**
```
ERROR: Cannot read property 'showMessage' of undefined
// This means provider not wrapping component
```

```
404 (Not Found) /sounds/command.mp3
// This is OK if you haven't added sounds yet
// But should not crash the app
```

```
TypeError: SYSTEM_MESSAGES[scenario] is undefined
// This means invalid scenario key used
```

---

## 📋 PART 7: VISUAL QUALITY CHECKS

### Message Modal Appearance

**Expected Visual:**
```
┌────────────────────────────────────────┐
│ ◈ QUEST COMPLETE ◈                    │ ← Cyan/Green/Orange/Red text
│                                        │
│ Objective cleared. Your effort has    │ ← Gray/white text
│ been acknowledged by the System.      │
│ Experience points awarded.            │
│                                        │
│                     [Close: ESC]      │ ← Small gray hint
└────────────────────────────────────────┘
     ↑                              ↑
  Blue glow                    Blue glow
```

**Checklist:**
- ✅ **Border glow** - Blue/cyan glow around edges (box-shadow)
- ✅ **Color coding** - Title matches message type
- ✅ **Backdrop** - Dark semi-transparent overlay
- ✅ **Centered** - Modal centered on screen
- ✅ **Readable** - Text not too small/large
- ✅ **Animation** - Smooth fade-in (not jarring)
- ✅ **Responsive** - Works on mobile/tablet

### Animation Checks

**Fade In:**
- Should take ~300ms
- Smooth opacity transition
- Modal scales slightly (0.95 → 1.0)

**Fade Out:**
- When auto-closing or clicking backdrop
- Smooth reverse animation
- Modal fades and scales down

**Urgent Messages:**
- Orange warning messages may pulse
- Red judgment messages may shake slightly
- Check for `animate-pulse` class

### Font Check

**Expected Font:**
- Titles: **Rajdhani** (700 weight)
- Body: **Inter** (400 weight)

**How to verify:**
1. Inspect element in DevTools
2. Check computed font-family
3. Should see: `font-family: Rajdhani, sans-serif`

---

## 📋 PART 8: MESSAGE QUEUE TEST

### Purpose
Verify multiple messages don't overlap

**Test Steps:**
1. Go to test page
2. Rapidly click **5 different buttons** (within 2 seconds)
3. Observe behavior

**Expected Result:**
- ✅ Messages appear **one at a time**
- ✅ Each message waits for previous to close
- ✅ Queue processes in order
- ✅ No visual overlap or layering issues

**If messages overlap:** Queue system needs debugging

---

## 📋 PART 9: MOBILE RESPONSIVENESS TEST

### Test on Mobile Screen

**Chrome DevTools:**
1. Press F12
2. Click device toggle (Ctrl+Shift+M)
3. Select iPhone 12 Pro or similar

**Expected Behavior:**
- ✅ Modal **scales to fit screen**
- ✅ Text remains **readable**
- ✅ Padding prevents **edge cutoff**
- ✅ Touch interactions work
- ✅ Backdrop dismiss works

**Common Issues:**
- Modal too wide (should have max-width)
- Text too small
- Buttons not touch-friendly

---

## 🎯 SUCCESS CRITERIA SUMMARY

Mark ✅ when verified:

- [ ] Test page loads without errors
- [ ] All 20 scenario buttons work
- [ ] Each message type has correct color
- [ ] Messages auto-close after 5 seconds
- [ ] Variations cycle when clicking same button
- [ ] Quest creation triggers message
- [ ] Quest completion triggers message (if implemented)
- [ ] Quest deletion triggers message
- [ ] Level up detection works
- [ ] Steps logging triggers message
- [ ] Signup welcome message appears
- [ ] UI text uses System voice (all locations)
- [ ] No console errors (except 404 for sounds - OK for now)
- [ ] Messages queue properly (no overlap)
- [ ] Mobile responsive
- [ ] Animations smooth
- [ ] Backdrop dismiss works
- [ ] ESC key closes message

---

## 🐛 IF SOMETHING DOESN'T WORK

**Don't panic!** Check the [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) guide.

Common first steps:
1. **Clear browser cache** (Ctrl+F5)
2. **Restart dev server** (Ctrl+C, then `pnpm dev`)
3. **Check console** for specific errors
4. **Verify provider** wraps app in layout.tsx
5. **Check imports** in files using `useSystemMessage`

---

## 📊 VERIFICATION COMPLETION REPORT

After testing, fill this out:

**Date Tested:** ___________  
**Browser:** ___________  
**Issues Found:** ___________  

| Test Section | Status | Notes |
|--------------|--------|-------|
| Test Page | ☐ Pass / ☐ Fail | |
| Dashboard Integration | ☐ Pass / ☐ Fail | |
| Steps Logging | ☐ Pass / ☐ Fail | |
| Authentication | ☐ Pass / ☐ Fail | |
| UI Text | ☐ Pass / ☐ Fail | |
| Visual Quality | ☐ Pass / ☐ Fail | |
| Mobile | ☐ Pass / ☐ Fail | |

---

**Next Steps After Verification:**
1. If all passes → Proceed to [SOUND_SETUP_GUIDE.md](./SOUND_SETUP_GUIDE.md)
2. If issues found → Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
3. After sounds added → Move to [DAY2_VISUAL_BLUEPRINT.md](./DAY2_VISUAL_BLUEPRINT.md)
