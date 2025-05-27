/*
  # Add RLS policies for polls table

  1. Security
    - Enable RLS on polls table if not already enabled
    - Add policies for CRUD operations with proper checks
    - Ensure policies don't conflict with existing ones

  2. Policies
    - Read: Anyone can read polls
    - Create: Only authenticated users can create polls (must set themselves as creator)
    - Update: Only creator can update their polls
    - Delete: Only creator can delete their polls
*/

DO $$ BEGIN
  -- Enable RLS if not already enabled
  IF NOT EXISTS (
    SELECT 1
    FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename = 'polls'
      AND rowsecurity = true
  ) THEN
    ALTER TABLE polls ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Drop existing policies if they exist
DO $$ BEGIN
  DROP POLICY IF EXISTS "Anyone can read polls" ON polls;
  DROP POLICY IF EXISTS "Only creator can delete" ON polls;
  DROP POLICY IF EXISTS "Logged in users can create polls" ON polls;
  DROP POLICY IF EXISTS "Creator can update polls" ON polls;
END $$;

-- Recreate all policies
CREATE POLICY "Anyone can read polls"
ON polls FOR SELECT
USING (true);

CREATE POLICY "Only creator can delete"
ON polls FOR DELETE
USING (auth.uid() = created_by);

CREATE POLICY "Logged in users can create polls"
ON polls FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Creator can update polls"
ON polls FOR UPDATE
USING (auth.uid() = created_by)
WITH CHECK (auth.uid() = created_by);