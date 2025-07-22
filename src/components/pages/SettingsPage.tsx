import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { AccountDeletion } from '../auth/AccountDeletion';
import { TwoFactorAuth } from '../auth/TwoFactorAuth';
import { 
  User, 
  Shield, 
  Key, 
  Trash2, 
  Mail,
  Smartphone,
  AlertTriangle,
  CheckCircle,
  Settings as SettingsIcon
} from 'lucide-react';
import toast from 'react-hot-toast';

export function SettingsPage() {
  const { user } = useAuth();
  const [showAccountDeletion, setShowAccountDeletion] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [twoFAMode, setTwoFAMode] = useState<'setup' | 'verify' | 'disable'>('setup');
  const [loading, setLoading] = useState(false);

  const handlePasswordReset = async () => {
    if (!user?.email) {
      toast.error('No email address found');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      });

      if (error) throw error;

      toast.success('Password reset email sent! Check your inbox.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  const handle2FASetup = () => {
    setTwoFAMode('setup');
    setShow2FAModal(true);
  };

  const handle2FAStatus = () => {
    setTwoFAMode('verify');
    setShow2FAModal(true);
  };

  const handle2FADisable = () => {
    setTwoFAMode('disable');
    setShow2FAModal(true);
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="p-3 bg-blue-100 rounded-full">
            <SettingsIcon className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Account Settings</h1>
        <p className="text-gray-600">Manage your account preferences and security settings</p>
      </div>

      {/* Account Information */}
      <Card>
        <div className="flex items-center space-x-3 mb-6">
          <User className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">Account Information</h2>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold text-lg">
                  {user?.email?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-900">{user?.email}</p>
                <p className="text-sm text-gray-500">Primary email address</p>
              </div>
            </div>
            <div className="flex items-center text-green-600">
              <CheckCircle className="h-5 w-5 mr-1" />
              <span className="text-sm font-medium">Verified</span>
            </div>
          </div>

          <div className="text-sm text-gray-600">
            <p><strong>Account created:</strong> {new Date(user?.created_at || '').toLocaleDateString()}</p>
            <p><strong>Last sign in:</strong> {new Date(user?.last_sign_in_at || '').toLocaleDateString()}</p>
          </div>
        </div>
      </Card>

      {/* Security Settings */}
      <Card>
        <div className="flex items-center space-x-3 mb-6">
          <Shield className="h-6 w-6 text-green-600" />
          <h2 className="text-xl font-semibold text-gray-900">Security Settings</h2>
        </div>

        <div className="space-y-6">
          {/* Password Reset */}
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <Key className="h-5 w-5 text-gray-600" />
              <div>
                <h3 className="font-medium text-gray-900">Password Reset</h3>
                <p className="text-sm text-gray-600">Send password reset email to {user?.email}</p>
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={handlePasswordReset}
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send Reset Email'}
            </Button>
          </div>

          {/* Two-Factor Authentication */}
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <Smartphone className="h-5 w-5 text-gray-600" />
              <div>
                <h3 className="font-medium text-gray-900">Two-Factor Authentication</h3>
                <p className="text-sm text-gray-600">Secure your account with authenticator app</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={handle2FAStatus}
              >
                Check Status
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handle2FASetup}
              >
                Setup 2FA
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <div className="flex items-center space-x-3 mb-6">
          <AlertTriangle className="h-6 w-6 text-red-600" />
          <h2 className="text-xl font-semibold text-red-900">Danger Zone</h2>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Trash2 className="h-5 w-5 text-red-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-medium text-red-900 mb-1">Delete Account</h3>
              <p className="text-sm text-red-700 mb-4">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
              <Button
                variant="danger"
                size="sm"
                onClick={() => setShowAccountDeletion(true)}
              >
                Delete Account
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Two-Factor Authentication Modal */}
      <TwoFactorAuth
        isOpen={show2FAModal}
        onClose={() => setShow2FAModal(false)}
        mode={twoFAMode}
      />

      {/* Account Deletion Modal */}
      <AccountDeletion
        isOpen={showAccountDeletion}
        onClose={() => setShowAccountDeletion(false)}
        userEmail={user?.email || ''}
      />
    </div>
  );
}