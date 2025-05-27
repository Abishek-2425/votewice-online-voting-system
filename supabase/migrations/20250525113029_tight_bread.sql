/*
  # Add poll expiration feature

  1. Changes
    - Add expiration_date column to polls table
    - Add is_expired function to check poll status
    - Update RLS policies to prevent voting on expired polls

  2. Security
    - Maintain existing RLS policies
    - Add check for expiration in voting policy
*/

-- Add expiration_date column
ALTER TABLE polls
ADD COLUMN IF NOT EXISTS expiration_date timestamptz;

-- Create function to check if poll is expired
CREATE OR REPLACE FUNCTION is_poll_expired(poll_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM polls
    WHERE id = poll_id
      AND expiration_date IS NOT NULL
      AND expiration_date < now()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update votes policy to prevent voting on expired polls
DROP POLICY IF EXISTS "Users can vote once per poll" ON votes;

CREATE POLICY "Users can vote once per poll"
ON votes FOR INSERT
WITH CHECK (
  (user_id = auth.uid()) AND
  (NOT is_poll_expired(poll_id)) AND
  (NOT EXISTS (
    SELECT 1
    FROM votes v
    WHERE v.poll_id = votes.poll_id
      AND v.user_id = auth.uid()
  )) AND
  (NOT EXISTS (
    SELECT 1
    FROM polls p
    WHERE p.id = votes.poll_id
      AND p.created_by = auth.uid()
  ))
);