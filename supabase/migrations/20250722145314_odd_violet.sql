/*
  # Create delete_current_user RPC function

  1. New Functions
    - `delete_current_user()` - RPC function to delete the current authenticated user
      - Deletes user data from all custom tables (tasks, weekly_goals, user_progress)
      - Deletes the user from auth.users table
      - Uses SECURITY DEFINER to allow deletion from auth schema
      - Only accessible to authenticated users

  2. Security
    - Function uses SECURITY DEFINER to access auth.users table
    - Grants EXECUTE permission to authenticated role only
    - Uses auth.uid() to ensure users can only delete their own account

  3. Data Cleanup
    - Removes all user data from custom tables before deleting auth user
    - Ensures referential integrity is maintained
    - Cascading deletes handled by foreign key constraints
*/

CREATE OR REPLACE FUNCTION public.delete_current_user()
RETURNS void AS $$
DECLARE
  current_user_id uuid;
BEGIN
  -- Get the current authenticated user's ID
  current_user_id := auth.uid();
  
  -- Ensure we have a valid user ID
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'No authenticated user found';
  END IF;

  -- Delete user's data from custom tables
  -- The foreign key constraints will handle cascading deletes
  DELETE FROM public.tasks WHERE user_id = current_user_id;
  DELETE FROM public.weekly_goals WHERE user_id = current_user_id;
  DELETE FROM public.user_progress WHERE user_id = current_user_id;

  -- Delete the user from auth.users table
  -- This requires the function to be SECURITY DEFINER
  DELETE FROM auth.users WHERE id = current_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execution privileges to authenticated users only
GRANT EXECUTE ON FUNCTION public.delete_current_user() TO authenticated;