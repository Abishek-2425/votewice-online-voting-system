/*
  # Add RLS policies for users table

  1. Security Changes
    - Add policy to allow authenticated users to insert their own records
    - Add policy to allow authenticated users to update their own records

  Note: The existing policy "Users can read own data" remains unchanged
*/

-- Policy to allow users to insert their own records
CREATE POLICY "Users can insert own record"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Policy to allow users to update their own records
CREATE POLICY "Users can update own record"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);