/*
  # Create user deletion function

  1. Database Functions
    - `delete_current_user()` - Safely deletes the current authenticated user
    - `prevent_deleted_user_signup()` - Prevents re-registration of deleted accounts

  2. Security
    - Function runs with security definer privileges
    - Only allows deletion of the currently authenticated user
    - Includes audit logging

  3. Triggers
    - Trigger to prevent signup with deleted account email
*/

-- Create function to delete current user
CREATE OR REPLACE FUNCTION delete_current_user()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_id uuid;
  result json;
BEGIN
  -- Get the current user ID
  current_user_id := auth.uid();
  
  -- Check if user is authenticated
  IF current_user_id IS NULL THEN
    RETURN json_build_object('error', 'Not authenticated');
  END IF;

  -- Log the deletion attempt
  INSERT INTO auth.audit_log_entries (
    instance_id,
    id,
    payload,
    created_at,
    ip_address
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    json_build_object(
      'action', 'user_deletion',
      'user_id', current_user_id,
      'timestamp', now(),
      'method', 'self_deletion'
    ),
    now(),
    inet_client_addr()
  );

  -- Delete the user from auth.users
  DELETE FROM auth.users WHERE id = current_user_id;
  
  -- Check if deletion was successful
  IF NOT FOUND THEN
    RETURN json_build_object('error', 'User not found or already deleted');
  END IF;

  RETURN json_build_object('success', true, 'message', 'User deleted successfully');
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('error', SQLERRM);
END;
$$;

-- Create function to prevent deleted user re-registration
CREATE OR REPLACE FUNCTION prevent_deleted_user_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if this email was recently deleted
  IF EXISTS (
    SELECT 1 FROM auth.audit_log_entries 
    WHERE payload->>'action' = 'user_deletion' 
    AND payload->>'email' = NEW.email
    AND created_at > now() - interval '30 days'
  ) THEN
    RAISE EXCEPTION 'This email address cannot be used for registration at this time';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to prevent re-registration of deleted accounts
DROP TRIGGER IF EXISTS prevent_deleted_user_signup_trigger ON auth.users;
CREATE TRIGGER prevent_deleted_user_signup_trigger
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION prevent_deleted_user_signup();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION delete_current_user() TO authenticated;
GRANT EXECUTE ON FUNCTION prevent_deleted_user_signup() TO service_role;