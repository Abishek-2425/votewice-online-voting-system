/*
  # Add delete policies for poll cleanup

  1. Changes
    - Add DELETE policies for polls, options, and votes tables
    - Ensure users can only delete their own polls and related data

  2. Security
    - Maintain RLS enforcement
    - Only poll creators can delete their polls
    - Cascading delete policies for related data
*/

-- Add DELETE policy for polls
CREATE POLICY "Users can delete own polls"
ON polls
FOR DELETE
TO authenticated
USING (auth.uid() = created_by);

-- Add DELETE policy for options
CREATE POLICY "Users can delete options for their polls"
ON options
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM polls
    WHERE polls.id = options.poll_id
    AND polls.created_by = auth.uid()
  )
);

-- Add DELETE policy for votes
CREATE POLICY "Users can delete votes for their polls"
ON votes
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM polls
    WHERE polls.id = votes.poll_id
    AND polls.created_by = auth.uid()
  )
);