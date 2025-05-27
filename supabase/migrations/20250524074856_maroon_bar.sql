/*
  # Prevent poll creators from voting on their own polls

  1. Security Changes
    - Update votes policy to check if user is not the poll creator
    - Maintain existing checks for duplicate votes and user authentication
*/

-- Drop the existing policy
DROP POLICY IF EXISTS "Users can vote once per poll" ON votes;

-- Create new policy with additional creator check
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
  AND
  -- User cannot vote on their own polls
  NOT EXISTS (
    SELECT 1 FROM polls p
    WHERE p.id = votes.poll_id
    AND p.created_by = auth.uid()
  )
);