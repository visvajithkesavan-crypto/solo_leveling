# AI Coach System - Complete Implementation Guide

## Overview

The AI Coach system transforms Solo Leveling into a comprehensive life improvement platform with GPT-4 powered goal analysis, personalized quest generation, weekly performance reviews, and milestone tracking.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (Next.js)                       │
├─────────────────────────────────────────────────────────────────┤
│  GoalSettingModal │ AIQuestBoard │ WeeklyReview │ MasterPlan    │
│                     useAICoach Hook                              │
│                     api-ai-coach.ts Client                       │
├─────────────────────────────────────────────────────────────────┤
│                         Backend (NestJS)                         │
├─────────────────────────────────────────────────────────────────┤
│                      AICoachController                           │
├──────────────┬──────────────┬─────────────┬────────────────────┤
│ GoalAnalyzer │ QuestGen     │ Performance │ MilestoneTracker   │
│ Service      │ Service      │ Analyzer    │ Service            │
├──────────────┴──────────────┴─────────────┴────────────────────┤
│                        OpenAI Service                            │
│            (Rate Limiting, Retries, JSON Parsing)               │
├─────────────────────────────────────────────────────────────────┤
│                     Supabase (PostgreSQL)                        │
│  user_master_goals │ master_plans │ ai_daily_quests │ etc.      │
└─────────────────────────────────────────────────────────────────┘
```

## Database Schema

### Tables Created

1. **user_master_goals** - Stores user's primary life goals
2. **master_plans** - AI-generated comprehensive plans
3. **ai_daily_quests** - Daily personalized quests
4. **weekly_reviews** - Weekly performance analysis
5. **milestone_records** - Milestone completion tracking
6. **quest_regeneration_log** - Tracks quest regeneration limits

### Key Functions

- `get_active_master_goal(user_id)` - Get user's current active goal
- `get_weekly_quest_stats(user_id, week_start, week_end)` - Quest statistics
- `check_regeneration_limit(user_id, date)` - Check regeneration count
- `increment_regeneration_count(user_id, date)` - Increment counter

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/ai-coach/set-goal` | Set a new master goal |
| GET | `/ai-coach/master-plan` | Get current master plan |
| GET | `/ai-coach/daily-quests` | Get today's AI quests |
| POST | `/ai-coach/regenerate-quests` | Regenerate today's quests |
| POST | `/ai-coach/complete-quest/:id` | Complete an AI quest |
| GET | `/ai-coach/weekly-review` | Get latest weekly review |
| GET | `/ai-coach/milestones` | Get milestone records |
| GET | `/ai-coach/status` | Get AI coach status |
| POST | `/ai-coach/admin/trigger-quests` | Admin: Generate quests |
| POST | `/ai-coach/admin/trigger-reviews` | Admin: Generate reviews |

## Frontend Components

### GoalSettingModal
3-step goal setting flow with AI-powered master plan generation.

### MasterPlanViewer
Tabbed interface showing phases, daily habits, metrics, and milestones.

### AIQuestBoard
Displays AI-generated daily quests with completion and regeneration.

### WeeklyReviewModal
Shows weekly performance analysis with insights and recommendations.

### ProgressTowardGoalWidget
Compact widget showing goal progress and current phase.

## Environment Variables

### Required for Backend

```env
# OpenAI Configuration
OPENAI_API_KEY=sk-your-api-key-here
OPENAI_MODEL=gpt-4o              # or gpt-4, gpt-3.5-turbo
OPENAI_MAX_TOKENS=2000

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key

# Optional: Quest Generation Schedule
AI_QUEST_CRON=0 6 * * *          # 6 AM daily
AI_REVIEW_CRON=0 20 * 0          # 8 PM every Sunday
```

## Setup Instructions

### 1. Apply Database Migrations

```bash
# Using Supabase CLI
supabase db push

# Or manually run the SQL file
# infra/supabase/migrations/20260122000001_create_ai_coach_tables.sql
```

### 2. Configure Environment

Add the required environment variables to your `.env` file.

### 3. Install Dependencies

```bash
# Install OpenAI SDK
cd apps/api
pnpm add openai

# Install @nestjs/schedule for cron jobs
pnpm add @nestjs/schedule
```

### 4. Start the Services

```bash
# Start API
cd apps/api
pnpm dev

# Start Web
cd apps/web
pnpm dev
```

## Testing Guide

### 1. Test Goal Setting

1. Navigate to Dashboard → AI Coach tab
2. Click "SET YOUR GOAL"
3. Enter a goal like "Get fit and lose 20 pounds"
4. Select 3 month timeline
5. Verify master plan is generated

### 2. Test Quest Generation

1. After setting a goal, daily quests should appear
2. Complete a quest by clicking "COMPLETE"
3. Verify XP is awarded and floating animation shows

### 3. Test Quest Regeneration

1. Click "REGENERATE QUESTS"
2. Verify new quests appear (max 3 per day)
3. Check counter decreases

### 4. Test Weekly Review

Admin trigger:
```bash
curl -X POST http://localhost:3001/ai-coach/admin/trigger-reviews \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 5. Test Milestones

1. Complete quests toward milestones
2. Verify milestone completion triggers celebration
3. Check bonus XP is awarded

## Troubleshooting

### OpenAI Errors

**Rate Limit Exceeded**
- The service has built-in rate limiting (50 req/min)
- Increase wait time between retries if needed

**Invalid API Key**
- Verify OPENAI_API_KEY is set correctly
- Check key hasn't expired

### Database Errors

**RLS Policy Violation**
- Ensure user is authenticated
- Check service role key for admin operations

**Missing Tables**
- Run migrations: `supabase db push`

### Frontend Issues

**Components Not Loading**
- Check API connection in browser dev tools
- Verify NEXT_PUBLIC_API_URL is set

**Auth Errors**
- Ensure Supabase session is valid
- Check token expiration

## Production Deployment Checklist

- [ ] Set all environment variables in production
- [ ] Apply database migrations
- [ ] Configure OpenAI API key with billing
- [ ] Set up cron job scheduling (Railway/Vercel)
- [ ] Enable RLS policies on all tables
- [ ] Configure CORS for production domain
- [ ] Set up error monitoring (Sentry)
- [ ] Configure rate limiting for API endpoints
- [ ] Test full flow end-to-end
- [ ] Monitor OpenAI usage and costs

## Cost Considerations

### OpenAI API Costs (GPT-4o)

| Operation | Est. Tokens | Cost (approx) |
|-----------|-------------|---------------|
| Goal Analysis | 1500-2000 | $0.03-0.04 |
| Quest Generation | 800-1200 | $0.02-0.03 |
| Weekly Review | 1000-1500 | $0.02-0.03 |
| Milestone Check | 200-400 | $0.004-0.008 |

**Monthly estimate per active user:** $1-3

### Cost Optimization Tips

1. Use GPT-4o-mini for simpler operations
2. Cache master plans (don't regenerate unnecessarily)
3. Batch quest generation for multiple users
4. Set reasonable regeneration limits (3/day)

## Future Enhancements

- [ ] Voice input for goal setting
- [ ] Push notifications for quest reminders
- [ ] Social sharing of achievements
- [ ] Team/guild goals
- [ ] Integration with fitness trackers
- [ ] Custom AI personality options
- [ ] Multi-language support

## Files Reference

### Backend
- `apps/api/src/ai-coach/ai-coach.module.ts`
- `apps/api/src/ai-coach/ai-coach.controller.ts`
- `apps/api/src/ai-coach/openai.service.ts`
- `apps/api/src/ai-coach/goal-analyzer.service.ts`
- `apps/api/src/ai-coach/quest-generator.service.ts`
- `apps/api/src/ai-coach/performance-analyzer.service.ts`
- `apps/api/src/ai-coach/milestone-tracker.service.ts`
- `apps/api/src/ai-coach/quest-scheduler.service.ts`
- `apps/api/src/ai-coach/interfaces/ai-coach.interfaces.ts`

### Frontend
- `apps/web/src/lib/api-ai-coach.ts`
- `apps/web/src/hooks/useAICoach.ts`
- `apps/web/src/components/GoalSettingModal.tsx`
- `apps/web/src/components/MasterPlanViewer.tsx`
- `apps/web/src/components/AIQuestBoard.tsx`
- `apps/web/src/components/WeeklyReviewModal.tsx`
- `apps/web/src/components/ProgressTowardGoalWidget.tsx`

### Database
- `infra/supabase/migrations/20260122000001_create_ai_coach_tables.sql`
