/*
  # Fix votes table RLS policy

  1. Changes
    - Fix the INSERT policy for votes table to:
      - Correctly check for existing votes using the correct poll_id reference
      - Ensure users can only vote as themselves
      - Prevent duplicate votes per poll

  2. Security
    - Maintains RLS enforcement
    - Ensures users can only vote once per poll
    - Prevents voting as other users
*/

-- Drop the existing policy
DROP POLICY IF EXISTS "Users can vote once per poll" ON votes;

-- Create the corrected policy
CREATE POLICY "Users can vote once per poll"
ON votes
FOR INSERT
TO authenticated
WITH CHECK (
  -- Ensure user can only vote as themselves
  auth.uid() = user_id 
  AND
  -- Prevent duplicate votes for the same poll
  NOT EXISTS (
    SELECT 1 FROM votes v
    WHERE v.poll_id = poll_id 
    AND v.user_id = auth.uid()
  )
);