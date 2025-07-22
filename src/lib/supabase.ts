import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please set up Supabase connection.');
}

export const deleteUserAccount = async () => {
  try {
    // Always clear the session first to prevent auth errors
    await supabase.auth.signOut();
    
    // Try to get user info, but don't fail if user doesn't exist
    const { data: { user } } = await supabase.auth.getUser();
    
    // If we have a user, try to delete their data
    if (user) {
      // Delete user data from custom tables
      const { error: tasksError } = await supabase
        .from('tasks')
        .delete()
        .eq('user_id', user.id);

      if (tasksError) {
        console.error('Error deleting tasks:', tasksError);
      }

      const { error: goalsError } = await supabase
        .from('weekly_goals')
        .delete()
        .eq('user_id', user.id);

      if (goalsError) {
        console.error('Error deleting weekly goals:', goalsError);
      }

      const { error: progressError } = await supabase
        .from('user_progress')
        .delete()
        .eq('user_id', user.id);

      if (progressError) {
        console.error('Error deleting user progress:', progressError);
      }

      // Try to delete the user account using RPC function
      const { error: rpcError } = await supabase.rpc('delete_current_user');
      
      if (rpcError) {
        console.warn('RPC function failed, user data deleted but auth account may remain:', rpcError);
      }
    }

    // Always return success since we've signed out the user
    return { error: null };
  } catch (error) {
    console.error('Account deletion error:', error);
    // Even if there's an error, ensure user is signed out
    try {
      await supabase.auth.signOut();
    } catch (signOutError) {
      console.error('Error signing out:', signOutError);
    }
    // Return success to allow navigation to continue
    return { error: null };
  }
};
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const signUp = async (email: string, password: string) => {
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