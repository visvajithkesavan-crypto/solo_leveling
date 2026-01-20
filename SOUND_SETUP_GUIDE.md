# 🔊 SYSTEM MESSAGE FRAMEWORK - SOUND SETUP GUIDE

**Last Updated:** January 16, 2026  
**Purpose:** Complete guide to adding audio files for System messages

---

## 🎵 OVERVIEW

The System Message Framework supports 5 sound types. Currently, the app **works without sounds** but adding them enhances the experience significantly.

**Sound files are optional** - messages will display correctly even if sounds are missing.

---

## 📁 REQUIRED SOUND FILES

### File Specifications

| File Name | Purpose | Duration | Volume | Format |
|-----------|---------|----------|--------|--------|
| `command.mp3` | Commands, objectives, quests | 0.5-1.5s | Medium | MP3, OGG, or WAV |
| `warning.mp3` | Warnings, deadlines, alerts | 0.5-1.5s | Medium-High | MP3, OGG, or WAV |
| `praise.mp3` | Achievements, completions, rewards | 1-2s | Medium | MP3, OGG, or WAV |
| `judgment.mp3` | Failures, penalties, harsh feedback | 0.5-1.5s | High | MP3, OGG, or WAV |
| `notification.mp3` | Info, neutral updates | 0.3-0.8s | Low-Medium | MP3, OGG, or WAV |

### Sound Characteristics

#### 1. **command.mp3** (Cyan messages)
**Used for:**
- Quest created
- Daily quest available
- Hidden quest unlocked
- New objectives
- System commands

**Desired qualities:**
- Sharp, digital, technological
- Brief "beep" or "ping"
- Attention-grabbing but not jarring
- Futuristic/sci-fi vibe
- Similar to: Interface confirm sound, HUD activation

**Search keywords:**
- "UI notification beep"
- "interface confirm"
- "digital ping"
- "HUD activation"
- "system notification"
- "computer beep short"

#### 2. **warning.mp3** (Orange messages)
**Used for:**
- Deadline approaching
- Inactivity warning
- Urgent notifications
- Time-sensitive alerts

**Desired qualities:**
- Urgent but not alarming
- Alert-style sound
- Higher pitch or repetitive element
- Clearly different from command
- Creates sense of time pressure

**Search keywords:**
- "alert notification"
- "urgent beep"
- "warning tone"
- "attention sound"
- "deadline alert"
- "timer warning"

#### 3. **praise.mp3** (Green messages)
**Used for:**
- Quest completed
- Achievement unlocked
- Streak milestones
- Level up (can use same or special variant)
- Successes

**Desired qualities:**
- Rewarding, positive
- Triumphant but brief
- "Success" feeling
- Uplifting tone
- Musical element acceptable

**Search keywords:**
- "achievement unlock"
- "success chime"
- "quest complete"
- "reward sound"
- "level up"
- "victory short"
- "accomplishment"

#### 4. **judgment.mp3** (Red messages)
**Used for:**
- Quest failed
- Streak broken
- Penalties
- Harsh system feedback
- Punishments

**Desired qualities:**
- Heavy, serious, ominous
- Lower pitch
- Slightly uncomfortable
- Creates negative reinforcement
- NOT scary, just serious

**Search keywords:**
- "failure sound"
- "error heavy"
- "penalty tone"
- "negative feedback"
- "game over short"
- "warning buzz"
- "disapproval sound"

#### 5. **notification.mp3** (Blue messages)
**Used for:**
- Stat increased/decreased
- Steps logged
- Weekly review
- General info
- System errors (minor)

**Desired qualities:**
- Soft, subtle
- Shortest of all sounds
- Acknowledgment without drama
- Background-friendly
- Neutral tone

**Search keywords:**
- "notification soft"
- "gentle ping"
- "subtle beep"
- "info tone"
- "minimal notification"
- "interface click"

---

## 🌐 WHERE TO FIND FREE SOUNDS

### Option 1: Pixabay (Recommended - Easiest)

**Website:** https://pixabay.com/sound-effects/

**Why Pixabay:**
- ✅ Free for commercial use
- ✅ No attribution required
- ✅ High quality
- ✅ No login needed for download
- ✅ Large selection

**How to use:**

1. **Visit:** https://pixabay.com/sound-effects/
2. **Search** using keywords from table above (e.g., "UI notification beep")
3. **Filter:**
   - Sort by: "Popular" or "Latest"
   - Duration: "Short" (0-2 minutes filter)
4. **Preview** sounds by clicking play button
5. **Download:**
   - Click green "Free Download" button
   - No account required
   - Choose MP3 format

**Recommended searches:**

```
Command: "interface beep" → Sort by Popular
Warning: "alert notification" → Sort by Popular  
Praise: "success" → Sort by Popular
Judgment: "error" OR "wrong" → Sort by Popular
Notification: "soft notification" → Sort by Popular
```

### Option 2: Freesound.org (Most Selection)

**Website:** https://freesound.org/

**Why Freesound:**
- ✅ Huge library (600,000+ sounds)
- ✅ Most are Creative Commons
- ✅ High quality
- ⚠️ Requires free account
- ⚠️ Check license per file (most are CC0 or CC-BY)

**How to use:**

1. **Create account:** https://freesound.org/home/register/
   - Free, only need email
2. **Search** with keywords (e.g., "UI beep notification")
3. **Filter:**
   - License: "Creative Commons 0" (no attribution needed)
   - Duration: Max 2 seconds
   - File type: mp3, ogg, or wav
4. **Preview** with play button
5. **Download:**
   - Click "Download" button
   - May need to verify you're human (captcha)

**Pro tip:** Add "UI" to searches for interface-appropriate sounds
```
"UI notification" - better than just "notification"
"UI beep" - better than just "beep"
```

### Option 3: Mixkit (Curated Collection)

**Website:** https://mixkit.co/free-sound-effects/

**Why Mixkit:**
- ✅ Free license
- ✅ High quality, curated
- ✅ No attribution required
- ⚠️ Smaller selection

**How to use:**
1. Visit site
2. Browse categories: "User Interface" and "Alerts"
3. Preview sounds
4. Download directly (MP3)

### Option 4: Zapsplat (Registration Required)

**Website:** https://www.zapsplat.com/

**Why Zapsplat:**
- ✅ Large collection
- ✅ High quality
- ⚠️ Requires free registration
- ⚠️ Attribution appreciated (not required)

---

## 💾 DOWNLOADING & PREPARING FILES

### Step 1: Create Sounds Directory

**Terminal command (Windows PowerShell):**
```powershell
# Navigate to web app
cd apps/web

# Create sounds directory
mkdir public/sounds -Force

# Verify creation
ls public/sounds
```

**Expected output:**
```
Directory: C:\Users\visva\Documents\solo_leveling\apps\web\public\sounds

Mode                 LastWriteTime         Length Name
----                 -------------         ------ ----
-a---           1/16/2026  10:30 AM           1234 README.md
```

### Step 2: Download Sounds

1. **Find 5 sounds** using one of the sources above
2. **Download** each one
3. **Note the filenames** (will rename in next step)

**Recommended approach:** Download all to your Downloads folder first, then move/rename.

### Step 3: Rename Files

**Windows File Explorer:**
1. Navigate to your Downloads folder
2. Right-click each sound file
3. Select "Rename"
4. Name exactly as required:
   - `command.mp3`
   - `warning.mp3`
   - `praise.mp3`
   - `judgment.mp3`
   - `notification.mp3`

**OR use PowerShell:**
```powershell
# Navigate to Downloads
cd ~/Downloads

# Rename files (adjust source names as needed)
Rename-Item "interface-beep-123.mp3" -NewName "command.mp3"
Rename-Item "alert-sound-456.mp3" -NewName "warning.mp3"
Rename-Item "success-chime-789.mp3" -NewName "praise.mp3"
Rename-Item "error-heavy-101.mp3" -NewName "judgment.mp3"
Rename-Item "soft-ping-202.mp3" -NewName "notification.mp3"
```

### Step 4: Move Files to Project

**Using File Explorer:**
1. Select all 5 renamed MP3 files in Downloads
2. Copy (Ctrl+C)
3. Navigate to: `C:\Users\visva\Documents\solo_leveling\apps\web\public\sounds\`
4. Paste (Ctrl+V)

**OR use PowerShell:**
```powershell
# Move files (from Downloads to project)
Move-Item ~/Downloads/command.mp3 C:\Users\visva\Documents\solo_leveling\apps\web\public\sounds\
Move-Item ~/Downloads/warning.mp3 C:\Users\visva\Documents\solo_leveling\apps\web\public\sounds\
Move-Item ~/Downloads/praise.mp3 C:\Users\visva\Documents\solo_leveling\apps\web\public\sounds\
Move-Item ~/Downloads/judgment.mp3 C:\Users\visva\Documents\solo_leveling\apps\web\public\sounds\
Move-Item ~/Downloads/notification.mp3 C:\Users\visva\Documents\solo_leveling\apps\web\public\sounds\
```

### Step 5: Verify Placement

**PowerShell:**
```powershell
cd C:\Users\visva\Documents\solo_leveling\apps\web\public\sounds
ls
```

**Expected output:**
```
Mode                 LastWriteTime         Length Name
----                 -------------         ------ ----
-a---           1/16/2026  10:30 AM          15234 command.mp3
-a---           1/16/2026  10:30 AM          18456 judgment.mp3
-a---           1/16/2026  10:30 AM          12345 notification.mp3
-a---           1/16/2026  10:30 AM          20123 praise.mp3
-a---           1/16/2026  10:30 AM           1234 README.md
-a---           1/16/2026  10:30 AM          16789 warning.mp3
```

**All 5 MP3 files present? ✅ You're done!**

---

## 🎧 TESTING SOUNDS

### Test in Browser

**No restart needed!** Next.js serves public files immediately.

1. **Open browser:** `http://localhost:3000/test-system`
2. **Click any button** (e.g., "Quest Created")
3. **Listen** for sound

**Expected behavior:**
- ✅ Sound plays when message appears
- ✅ Volume is reasonable (not too loud/quiet)
- ✅ Sound matches message type (cyber beep for command, etc.)

**Check browser console (F12):**
```javascript
[Sound] Playing: /sounds/command.mp3
```

**If you see:**
```javascript
❌ GET http://localhost:3000/sounds/command.mp3 404 (Not Found)
```

**Troubleshooting:**
1. Verify file name is **exactly** `command.mp3` (check spelling, extension)
2. Verify file is in `apps/web/public/sounds/` (not `apps/web/sounds/`)
3. Clear browser cache (Ctrl+F5)
4. If still 404, restart dev server

### Manual Sound Test

**Direct URL test:**
1. Open browser
2. Navigate to: `http://localhost:3000/sounds/command.mp3`
3. Should play the sound file directly

If this works but sounds don't play in app, check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) Issue #2.

---

## 🎛️ ADJUSTING VOLUME

### If Sounds Are Too Loud/Quiet

**Edit:** [apps/web/src/lib/sounds.ts](apps/web/src/lib/sounds.ts)

```typescript
export type SoundType = 'command' | 'warning' | 'praise' | 'judgment' | 'notification';

// Define custom volumes per sound type
const SOUND_VOLUMES: Record<SoundType, number> = {
  command: 0.6,      // 60% volume
  warning: 0.7,      // 70% volume
  praise: 0.5,       // 50% volume
  judgment: 0.8,     // 80% volume
  notification: 0.3, // 30% volume (quietest)
};

export function playSound(type: SoundType) {
  try {
    const audio = new Audio(`/sounds/${type}.mp3`);
    audio.volume = SOUND_VOLUMES[type]; // Apply custom volume
    audio.play().catch((err) => {
      console.warn('[Sound] Playback failed:', err);
    });
  } catch (error) {
    console.warn('[Sound] Error:', error);
  }
}
```

**Volume values:**
- `0.0` = Silent
- `0.5` = 50% volume
- `1.0` = 100% volume (max)

**Recommended starting values:**
- Command: 0.5-0.7 (medium)
- Warning: 0.6-0.8 (louder to grab attention)
- Praise: 0.4-0.6 (pleasant, not jarring)
- Judgment: 0.7-0.9 (impactful)
- Notification: 0.2-0.4 (subtle background)

### Global Volume Control

If ALL sounds are too loud:

```typescript
const MASTER_VOLUME = 0.5; // 50% of all volumes

export function playSound(type: SoundType) {
  const audio = new Audio(`/sounds/${type}.mp3`);
  audio.volume = SOUND_VOLUMES[type] * MASTER_VOLUME;
  audio.play().catch(console.warn);
}
```

---

## 🔇 ADDING MUTE TOGGLE

### User-Controlled Sound Muting

**Update:** [apps/web/src/lib/sounds.ts](apps/web/src/lib/sounds.ts)

```typescript
// Add mute state
let isMuted = false;

// Check localStorage on load
if (typeof window !== 'undefined') {
  const savedMute = localStorage.getItem('systemSoundMuted');
  isMuted = savedMute === 'true';
}

export function toggleMute(): boolean {
  isMuted = !isMuted;
  if (typeof window !== 'undefined') {
    localStorage.setItem('systemSoundMuted', String(isMuted));
  }
  return isMuted;
}

export function isSoundMuted(): boolean {
  return isMuted;
}

export function playSound(type: SoundType) {
  if (isMuted) return; // Don't play if muted
  
  // ... rest of code
}
```

### Add Mute Button to UI

**Example - Add to dashboard:**

```tsx
// apps/web/src/app/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { toggleMute, isSoundMuted } from '@/lib/sounds';

export default function Dashboard() {
  const [muted, setMuted] = useState(false);

  // Load mute state on mount
  useEffect(() => {
    setMuted(isSoundMuted());
  }, []);

  const handleToggleMute = () => {
    const newMutedState = toggleMute();
    setMuted(newMutedState);
  };

  return (
    <div>
      {/* Mute button in corner */}
      <button
        onClick={handleToggleMute}
        className="fixed bottom-4 right-4 p-3 bg-gray-800 border border-cyan-500 rounded-lg hover:bg-gray-700 transition-colors"
        title={muted ? 'Unmute sounds' : 'Mute sounds'}
      >
        <span className="text-2xl">
          {muted ? '🔇' : '🔊'}
        </span>
      </button>

      {/* Rest of dashboard */}
    </div>
  );
}
```

---

## 🎨 SOUND FORMAT CONVERSION

### If You Downloaded WAV or OGG

Most browsers support MP3 best. Convert if needed:

**Online converter (easiest):**
1. Visit: https://online-audio-converter.com/
2. Upload your sound file
3. Select "MP3" format
4. Click "Convert"
5. Download

**OR use FFmpeg (if installed):**
```bash
# Convert WAV to MP3
ffmpeg -i command.wav -codec:a libmp3lame -qscale:a 2 command.mp3

# Convert OGG to MP3
ffmpeg -i command.ogg -codec:a libmp3lame -qscale:a 2 command.mp3
```

---

## 🎼 CREATING CUSTOM SOUNDS

### If You Want Unique Sounds

**Option 1: AI Sound Generation**
- **ElevenLabs Sound Effects:** https://elevenlabs.io/sound-effects
- Describe the sound you want, AI generates it
- Example: "Sharp digital beep for UI notification"

**Option 2: Audacity (Free Audio Editor)**
1. Download: https://www.audacityteam.org/
2. Generate → Tone → Sine wave (for beeps)
3. Adjust frequency, duration
4. Export as MP3

**Option 3: Hire on Fiverr**
- Search "UI sound effects"
- $5-20 for custom pack
- Specify Solo Leveling / cyber aesthetic

---

## ✅ SOUND SETUP CHECKLIST

Before moving to Day 2, verify:

- [ ] All 5 MP3 files in `apps/web/public/sounds/`
- [ ] Files named **exactly**: command.mp3, warning.mp3, praise.mp3, judgment.mp3, notification.mp3
- [ ] Test page plays sounds when buttons clicked
- [ ] Volume is comfortable (not too loud/quiet)
- [ ] Each sound matches its message type feeling
- [ ] Browser console shows no 404 errors
- [ ] Direct URL test works: `http://localhost:3000/sounds/command.mp3`

---

## 🎵 RECOMMENDED SOUND PACKS

If you want a pre-made matching set:

**Search on Pixabay:**
- "UI sound pack" → Download entire pack by one creator (consistent style)
- "interface sounds" → Look for packs with 5+ sounds

**Search on Freesound:**
- "notification pack" → Filter by license: CC0
- Often includes command, error, success variants

**Look for keywords in descriptions:**
- "Sci-fi UI"
- "Futuristic interface"
- "Game UI sounds"
- "HUD sounds"
- "System notifications"

---

## 🔧 TROUBLESHOOTING

### Sounds don't play at all
→ See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) Issue #2

### Sounds play but are delayed
→ Preload sounds on page load (add later if needed)

### Sounds cut off early
→ Ensure file isn't too short, or add slight padding

### Browser blocks autoplay
→ Sounds triggered by user actions (clicks) are always allowed

---

## 📊 SOUND QUALITY TIPS

**Ideal specifications:**
- **Format:** MP3 (most compatible)
- **Sample rate:** 44.1 kHz or 48 kHz
- **Bit rate:** 128-192 kbps (good quality, small size)
- **File size:** Under 50 KB each (keeps site fast)

**Avoid:**
- ❌ Very low quality (< 64 kbps) - sounds tinny
- ❌ Very high quality (> 320 kbps) - unnecessarily large
- ❌ Long sounds (> 3 seconds) - annoying for users
- ❌ Sounds with background music - should be clean effects

---

## 🎯 NEXT STEPS

**Once sounds are working:**
1. ✅ Mark this guide complete
2. → Move to [DAY2_VISUAL_BLUEPRINT.md](./DAY2_VISUAL_BLUEPRINT.md)
3. → Begin visual transformation

**Sounds are optional** - You can proceed to Day 2 even if sounds aren't ready. They can be added anytime without code changes.

---

## 📝 SOUND ATTRIBUTION (If Required)

If you downloaded sounds requiring attribution:

Create: `apps/web/public/sounds/ATTRIBUTION.txt`

```
Sound Effects Attribution:

command.mp3 - "UI Beep" by [Author Name]
Source: [URL]
License: [CC-BY 4.0 / CC0 / etc.]

warning.mp3 - "Alert Sound" by [Author Name]
Source: [URL]
License: [License Type]

[Continue for all 5 sounds if needed]
```

Most sounds from Pixabay/Mixkit don't require attribution, but document anyway for future reference.
