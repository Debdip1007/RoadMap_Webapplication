import { createClient } from '@supabase/supabase-js';

// Email cooldown check function
export const checkEmailCooldown = async (email: string): Promise<boolean> => {
  const { data, error } = await supabase.rpc('is_email_in_cooldown', { check_email: email });
  return !error && data === true;
};

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please set up Supabase connection.');
}

export const deleteUserAccount = async () => {
  try {
    // Verify user is authenticated
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return {
        error: new Error('No authenticated user found'),
        success: false
      };
    }

    // Call the database function to handle complete account deletion
    const { data: deletionResult, error: rpcError } = await supabase
      .rpc('delete_user_account');

    if (rpcError) {
      console.error('RPC deletion error:', rpcError);
      return {
        error: new Error(`Account deletion failed: ${rpcError.message}`),
        success: false
      };
    }

    // Check if the database function reported success
    if (!deletionResult?.success) {
      console.error('Database deletion failed:', deletionResult);
      return {
        error: new Error(deletionResult?.error || 'Account deletion failed'),
        success: false
      };
    }

    // Force sign out from all sessions immediately
    await supabase.auth.signOut({ scope: 'global' });

    // Clear local storage and session storage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('supabase.auth.token');
      localStorage.clear();
      sessionStorage.clear();
      
      // Clear any cached data
      if ('caches' in window) {
        caches.keys().then(names => {
          names.forEach(name => {
            caches.delete(name);
          });
        });
      }
    }

    console.log('Account deletion successful:', deletionResult);

    return { 
      error: null, 
      success: true,
      message: deletionResult.message,
      deletedUserId: deletionResult.user_id
    };

  } catch (error) {
    console.error('Account deletion error:', error);
    
    // Always sign out user even if deletion fails
    await supabase.auth.signOut({ scope: 'global' }).catch(console.error);
    
    return { 
      error: error instanceof Error ? error : new Error('Unknown error during account deletion'),
      success: false
    };
  }
};
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const signUp = async (email: string, password: string) => {
  // Check if email is in cooldown period
  const inCooldown = await checkEmailCooldown(email);
  if (inCooldown) {
    return {
      data: null,
      error: new Error('This email address cannot be used for registration at this time. Please try again later or contact support.')
    };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: window.location.origin + '/auth/callback'
    }
  });
  return { data, error };
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
}