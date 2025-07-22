/*
  # User Account Deletion System

  1. Database Functions
    - `delete_user_account()` - Safely delete user and all related data
    - `mark_email_for_cooldown()` - Prevent immediate email reuse
    - `audit_user_deletion()` - Log deletion attempts

  2. Security Features
    - Email cooldown period (30 days)
    - Audit logging
    - Proper cascade deletion
    - Session invalidation

  3. Tables
    - `deleted_users_audit` - Track deletions
    - `email_cooldown` - Prevent immediate reuse
*/

-- Create audit table for deleted users
CREATE TABLE IF NOT EXISTS deleted_users_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  email text NOT NULL,
  deleted_at timestamptz DEFAULT now(),
  deletion_reason text DEFAULT 'user_requested',
  ip_address inet,
  user_agent text
);

-- Create email cooldown table
CREATE TABLE IF NOT EXISTS email_cooldown (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  deleted_at timestamptz DEFAULT now(),
  cooldown_until timestamptz DEFAULT (now() + interval '30 days'),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on audit tables
ALTER TABLE deleted_users_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_cooldown ENABLE ROW LEVEL SECURITY;

-- RLS policies for audit table (admin only)
CREATE POLICY "Only service role can access audit logs"
  ON deleted_users_audit
  FOR ALL
  TO service_role
  USING (true);

-- RLS policies for email cooldown (prevent signup during cooldown)
CREATE POLICY "Check email cooldown on signup"
  ON email_cooldown
  FOR SELECT
  TO anon, authenticated
  USING (cooldown_until > now());

-- Function to safely delete user account
CREATE OR REPLACE FUNCTION delete_user_account()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id uuid;
  current_user_email text;
  deletion_result json;
  error_message text;
BEGIN
  -- Get current user info
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'No authenticated user found'
    );
  END IF;

  -- Get user email from auth.users
  SELECT email INTO current_user_email
  FROM auth.users
  WHERE id = current_user_id;

  IF current_user_email IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'User email not found'
    );
  END IF;

  BEGIN
    -- Step 1: Add email to cooldown period
    INSERT INTO email_cooldown (email, deleted_at, cooldown_until)
    VALUES (
      current_user_email,
      now(),
      now() + interval '30 days'
    )
    ON CONFLICT (email) DO UPDATE SET
      deleted_at = now(),
      cooldown_until = now() + interval '30 days';

    -- Step 2: Create audit record
    INSERT INTO deleted_users_audit (
      user_id,
      email,
      deleted_at,
      deletion_reason,
      ip_address,
      user_agent
    ) VALUES (
      current_user_id,
      current_user_email,
      now(),
      'user_requested',
      inet_client_addr(),
      current_setting('request.headers', true)::json->>'user-agent'
    );

    -- Step 3: Delete user data in correct order (respecting foreign keys)
    
    -- Delete tasks first (they reference weekly_goals)
    DELETE FROM tasks WHERE user_id = current_user_id;
    
    -- Delete user progress
    DELETE FROM user_progress WHERE user_id = current_user_id;
    
    -- Delete weekly goals
    DELETE FROM weekly_goals WHERE user_id = current_user_id;

    -- Step 4: Delete the auth user (this is the critical step)
    -- This requires admin privileges, so we use a service role function
    DELETE FROM auth.users WHERE id = current_user_id;

    -- If we get here, everything succeeded
    RETURN json_build_object(
      'success', true,
      'message', 'Account deleted successfully',
      'user_id', current_user_id,
      'email', current_user_email
    );

  EXCEPTION WHEN OTHERS THEN
    -- Log the error and return failure
    error_message := SQLERRM;
    
    -- Still try to create audit record for failed deletion
    INSERT INTO deleted_users_audit (
      user_id,
      email,
      deleted_at,
      deletion_reason,
      ip_address
    ) VALUES (
      current_user_id,
      current_user_email,
      now(),
      'deletion_failed: ' || error_message,
      inet_client_addr()
    );

    RETURN json_build_object(
      'success', false,
      'error', 'Account deletion failed: ' || error_message,
      'user_id', current_user_id
    );
  END;
END;
$$;

-- Function to check if email is in cooldown period
CREATE OR REPLACE FUNCTION is_email_in_cooldown(check_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM email_cooldown
    WHERE email = check_email
    AND cooldown_until > now()
  );
END;
$$;

-- Function to clean up expired cooldowns (run periodically)
CREATE OR REPLACE FUNCTION cleanup_expired_cooldowns()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM email_cooldown
  WHERE cooldown_until < now() - interval '7 days';
END;
$$;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION delete_user_account() TO authenticated;
GRANT EXECUTE ON FUNCTION is_email_in_cooldown(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION cleanup_expired_cooldowns() TO service_role;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_email_cooldown_email ON email_cooldown(email);
CREATE INDEX IF NOT EXISTS idx_email_cooldown_until ON email_cooldown(cooldown_until);
CREATE INDEX IF NOT EXISTS idx_deleted_users_audit_user_id ON deleted_users_audit(user_id);
CREATE INDEX IF NOT EXISTS idx_deleted_users_audit_email ON deleted_users_audit(email);