import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { GoogleAuth } from './GoogleAuth';
import { PasswordReset } from './PasswordReset';
import { TwoFactorVerification } from './TwoFactorVerification';
import { signIn, signUp } from '../../lib/supabase';
import { checkEmailCooldown } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface AuthFormProps {
  mode: 'signin' | 'signup';
  onToggleMode: () => void;
}

export function AuthForm({ mode, onToggleMode }: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [show2FAVerification, setShow2FAVerification] = useState(false);
  const [tempUserData, setTempUserData] = useState<any>(null);

  if (showPasswordReset) {
    return <PasswordReset onBack={() => setShowPasswordReset(false)} />;
  }

  if (show2FAVerification) {
    return <TwoFactorVerification onBack={() => setShow2FAVerification(false)} userData={tempUserData} />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === 'signup' && password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    // Check email cooldown for signup
    if (mode === 'signup') {
      try {
        const inCooldown = await checkEmailCooldown(email);
        if (inCooldown) {
          toast.error('This email address is temporarily unavailable for registration. Please try again later or contact support.');
          return;
        }
      } catch (error) {
        console.error('Error checking email cooldown:', error);
        // Continue with signup if cooldown check fails
      }
    }
    
    setLoading(true);

    try {
      if (mode === 'signup') {
        const { error } = await signUp(email, password);
        if (error) throw error;
        toast.success('Please check your email to confirm your account.');
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          // Check if 2FA is required
          if (error.message.includes('2FA') || error.message.includes('two-factor')) {
            setTempUserData({ email, password });
            setShow2FAVerification(true);
            return;
          }
          throw error;
        }
        
        // Check if user has 2FA enabled
        // This would be handled by checking user metadata
        // For now, we'll proceed with normal login
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-teal-50 px-4">
      <Card className="w-full max-w-md" padding="lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Study Goal Tracker
          </h1>
          <p className="text-gray-600">
            {mode === 'signin' ? 'Welcome back!' : 'Create your account'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Enter your email"
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Enter your password"
            helperText={mode === 'signup' ? 'Minimum 6 characters' : undefined}
          />

          {mode === 'signup' && (
            <Input
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Confirm your password"
            />
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Please wait...' : (mode === 'signin' ? 'Sign In' : 'Sign Up')}
          </Button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>
          <div className="mt-6">
            <GoogleAuth mode={mode} />
          </div>
        </div>

        <div className="mt-6 text-center">
          {mode === 'signin' && (
            <button
              onClick={() => setShowPasswordReset(true)}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium block mb-4"
            >
              Forgot your password?
            </button>
          )}
          <button
            onClick={onToggleMode}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            {mode === 'signin' 
              ? "Don't have an account? Sign up" 
              : 'Already have an account? Sign in'
            }
          </button>
        </div>
      </Card>
    </div>
  );
}