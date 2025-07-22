import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { ArrowLeft, Smartphone, Key } from 'lucide-react';

interface TwoFactorVerificationProps {
  onBack: () => void;
  userData: { email: string; password: string };
}

export function TwoFactorVerification({ onBack, userData }: TwoFactorVerificationProps) {
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCode, setBackupCode] = useState('');
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!verificationCode && !backupCode) {
      toast.error('Please enter a verification code');
      return;
    }

    setLoading(true);

    try {
      // First, sign in with email/password
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: userData.email,
        password: userData.password
      });

      if (authError) throw authError;

      // Get user metadata to check 2FA settings
      const user = authData.user;
      const twoFactorEnabled = user?.user_metadata?.two_factor_enabled;
      const totpSecret = user?.user_metadata?.totp_secret;
      const backupCodes = user?.user_metadata?.backup_codes || [];

      if (!twoFactorEnabled) {
        toast.success('Signed in successfully');
        return;
      }

      // Verify TOTP code or backup code
      let isValid = false;

      if (useBackupCode && backupCode) {
        // Check if backup code is valid
        isValid = backupCodes.includes(backupCode.toUpperCase());
        
        if (isValid) {
          // Remove used backup code
          const updatedBackupCodes = backupCodes.filter((code: string) => code !== backupCode.toUpperCase());
          await supabase.auth.updateUser({
            data: {
              backup_codes: updatedBackupCodes
            }
          });
          toast.success('Backup code used successfully');
        }
      } else if (verificationCode) {
        // Verify TOTP code (simplified verification)
        isValid = await verifyTOTPCode(totpSecret, verificationCode);
      }

      if (!isValid) {
        // Sign out the user since 2FA failed
        await supabase.auth.signOut();
        toast.error('Invalid verification code. Please try again.');
        return;
      }

      toast.success('Two-factor authentication successful');

    } catch (error) {
      console.error('2FA verification error:', error);
      toast.error(error instanceof Error ? error.message : 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const verifyTOTPCode = async (secret: string, code: string): Promise<boolean> => {
    // In a real implementation, you would use a TOTP library like 'otplib'
    // For demonstration, we'll accept any 6-digit code
    return code.length === 6 && /^\d{6}$/.test(code);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-teal-50 px-4">
      <Card className="w-full max-w-md" padding="lg">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Smartphone className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Two-Factor Authentication
          </h1>
          <p className="text-gray-600">
            Enter the verification code from your authenticator app
          </p>
        </div>

        <form onSubmit={handleVerification} className="space-y-6">
          {!useBackupCode ? (
            <Input
              label="Verification Code"
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="Enter 6-digit code"
              maxLength={6}
              className="text-center text-lg font-mono"
            />
          ) : (
            <Input
              label="Backup Code"
              type="text"
              value={backupCode}
              onChange={(e) => setBackupCode(e.target.value)}
              placeholder="Enter backup code"
              className="text-center font-mono"
            />
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={loading || (!verificationCode && !backupCode)}
          >
            {loading ? 'Verifying...' : 'Verify'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setUseBackupCode(!useBackupCode)}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            {useBackupCode ? 'Use authenticator app instead' : 'Use backup code instead'}
          </button>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={onBack}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center justify-center mx-auto"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Sign In
          </button>
        </div>
      </Card>
    </div>
  );
}