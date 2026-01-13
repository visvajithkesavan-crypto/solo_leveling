-- Migration: Add missing columns to goals table

-- Add description column
ALTER TABLE public.goals 
ADD COLUMN IF NOT EXISTS description TEXT;

-- Add difficulty column  
ALTER TABLE public.goals 
ADD COLUMN IF NOT EXISTS difficulty TEXT DEFAULT 'E' CHECK (difficulty IN ('E', 'D', 'C', 'B', 'A', 'S'));
