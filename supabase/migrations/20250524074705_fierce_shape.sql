/*
  # Fix votes table RLS policy

  1. Changes
    - Drop existing INSERT policy for votes table
    - Create new INSERT policy with correct conditions:
      - User can only vote as themselves (user_id = auth.uid())
      - User can only vote once per poll
      - Fixed the poll_id comparison in the EXISTS check

  2. Security
    - Maintains RLS enforcement
    - Ensures users can only vote once per poll
    - Prevents users from voting as other users
*/

-- Drop the existing policy
DROP POLICY IF EXISTS "Users can vote once per poll" ON votes;

-- Create new policy with correct conditions
CREATE POLICY "Users can vote once per poll"
ON votes
FOR INSERT
TO authenticated
WITH CHECK (
  -- User can only vote as themselves
  user_id = auth.uid() 
  AND
  -- User can only vote once per poll
  NOT EXISTS (
    SELECT 1 FROM votes v
    WHERE v.poll_id = votes.poll_id 
    AND v.user_id = auth.uid()
  )
);