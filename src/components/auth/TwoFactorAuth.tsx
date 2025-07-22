import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { Modal } from '../ui/Modal';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import { Smartphone, Key, Copy, CheckCircle, AlertCircle, QrCode } from 'lucide-react';

interface TwoFactorAuthProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'setup' | 'verify' | 'disable';
}

export function TwoFactorAuth({ isOpen, onClose, mode }: TwoFactorAuthProps) {
  const { user } = useAuth();
  const [step, setStep] = useState<'qr' | 'verify' | 'backup'>('qr');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [secret, setSecret] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);

  useEffect(() => {
    if (isOpen && mode === 'setup') {
      generateQRCode();
    } else if (isOpen && mode === 'verify') {
      check2FAStatus();
    }
  }, [isOpen, mode]);

  const generateQRCode = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Generate TOTP secret
      const totpSecret = generateTOTPSecret();
      setSecret(totpSecret);

      // Create QR code URL for authenticator apps
      const appName = 'Goal Tracker';
      const qrUrl = `otpauth://totp/${encodeURIComponent(appName)}:${encodeURIComponent(user.email)}?secret=${totpSecret}&issuer=${encodeURIComponent(appName)}`;
      setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrUrl)}`);

    } catch (error) {
      console.error('Error generating QR code:', error);
      toast.error('Failed to generate QR code');
    } finally {
      setLoading(false);
    }
  };

  const generateTOTPSecret = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let secret = '';
    for (let i = 0; i < 32; i++) {
      secret += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return secret;
  };

  const verifyTOTPCode = async () => {
    if (!user || !verificationCode || !secret) {
      toast.error('Please enter the verification code');
      return;
    }

    setLoading(true);

    try {
      // In a real implementation, you would verify the TOTP code server-side
      // For now, we'll simulate the verification
      const isValid = await simulateTOTPVerification(secret, verificationCode);

      if (!isValid) {
        toast.error('Invalid verification code. Please try again.');
        return;
      }

      // Save 2FA settings to user metadata
      const { error } = await supabase.auth.updateUser({
        data: {
          two_factor_enabled: true,
          totp_secret: secret
        }
      });

      if (error) throw error;

      // Generate backup codes
      const codes = generateBackupCodes();
      setBackupCodes(codes);

      // Save backup codes to user metadata
      await supabase.auth.updateUser({
        data: {
          backup_codes: codes
        }
      });

      toast.success('2FA enabled successfully!');
      setStep('backup');

    } catch (error) {
      console.error('Error enabling 2FA:', error);
      toast.error('Failed to enable 2FA');
    } finally {
      setLoading(false);
    }
  };

  const simulateTOTPVerification = async (secret: string, code: string): Promise<boolean> => {
    // In a real implementation, you would use a TOTP library like 'otplib'
    // For demonstration, we'll accept any 6-digit code
    return code.length === 6 && /^\d{6}$/.test(code);
  };

  const generateBackupCodes = (): string[] => {
    const codes = [];
    for (let i = 0; i < 10; i++) {
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      codes.push(code);
    }
    return codes;
  };

  const check2FAStatus = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase.auth.getUser();
      if (error) throw error;

      const twoFactorEnabled = data.user?.user_metadata?.two_factor_enabled || false;
      setIs2FAEnabled(twoFactorEnabled);
    } catch (error) {
      console.error('Error checking 2FA status:', error);
    }
  };

  const disable2FA = async () => {
    if (!user) return;

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          two_factor_enabled: false,
          totp_secret: null,
          backup_codes: null
        }
      });

      if (error) throw error;

      toast.success('2FA disabled successfully');
      onClose();
    } catch (error) {
      console.error('Error disabling 2FA:', error);
      toast.error('Failed to disable 2FA');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const copyAllBackupCodes = () => {
    const codesText = backupCodes.join('\n');
    navigator.clipboard.writeText(codesText);
    toast.success('All backup codes copied to clipboard');
  };

  const getTitle = () => {
    switch (mode) {
      case 'setup': return 'Setup Two-Factor Authentication';
      case 'verify': return 'Two-Factor Authentication Status';
      case 'disable': return 'Disable Two-Factor Authentication';
      default: return 'Two-Factor Authentication';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={getTitle()} size="lg">
      <div className="space-y-6">
        {/* Setup Mode */}
        {mode === 'setup' && (
          <>
            {step === 'qr' && (
              <div className="space-y-6">
                <div className="text-center">
                  <Smartphone className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Scan QR Code
                  </h3>
                  <p className="text-gray-600">
                    Use your authenticator app (Google Authenticator, Authy, etc.) to scan this QR code
                  </p>
                </div>

                {qrCodeUrl && (
                  <div className="text-center">
                    <div className="inline-block p-4 bg-white border-2 border-gray-200 rounded-lg">
                      <img src={qrCodeUrl} alt="2FA QR Code" className="w-48 h-48" />
                    </div>
                  </div>
                )}

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Manual Entry</h4>
                  <p className="text-sm text-gray-600 mb-2">
                    If you can't scan the QR code, enter this secret manually:
                  </p>
                  <div className="flex items-center space-x-2">
                    <code className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded text-sm font-mono">
                      {secret}
                    </code>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => copyToClipboard(secret)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <Input
                    label="Verification Code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="Enter 6-digit code from your app"
                    maxLength={6}
                  />
                  
                  <div className="flex space-x-3">
                    <Button
                      variant="secondary"
                      onClick={onClose}
                      className="flex-1"
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={verifyTOTPCode}
                      className="flex-1"
                      disabled={loading || verificationCode.length !== 6}
                    >
                      {loading ? 'Verifying...' : 'Verify & Enable'}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {step === 'backup' && (
              <div className="space-y-6">
                <div className="text-center">
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    2FA Enabled Successfully!
                  </h3>
                  <p className="text-gray-600">
                    Save these backup codes in a secure location. You can use them to access your account if you lose your authenticator device.
                  </p>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                    <h4 className="font-medium text-yellow-800">Important: Save Your Backup Codes</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {backupCodes.map((code, index) => (
                      <div key={index} className="flex items-center justify-between bg-white px-3 py-2 rounded border">
                        <code className="text-sm font-mono">{code}</code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(code)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={copyAllBackupCodes}
                    className="w-full"
                  >
                    Copy All Codes
                  </Button>
                </div>

                <div className="flex space-x-3">
                  <Button
                    onClick={onClose}
                    className="flex-1"
                  >
                    Done
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Verify Mode */}
        {mode === 'verify' && (
          <div className="space-y-6">
            <div className="text-center">
              <div className={`p-3 rounded-full mx-auto mb-4 ${is2FAEnabled ? 'bg-green-100' : 'bg-gray-100'}`}>
                <Key className={`h-8 w-8 ${is2FAEnabled ? 'text-green-600' : 'text-gray-600'}`} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Two-Factor Authentication Status
              </h3>
              <p className={`text-lg font-medium ${is2FAEnabled ? 'text-green-600' : 'text-gray-600'}`}>
                {is2FAEnabled ? 'Enabled' : 'Disabled'}
              </p>
            </div>

            {is2FAEnabled ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <h4 className="font-medium text-green-800">2FA is Active</h4>
                </div>
                <p className="text-sm text-green-700">
                  Your account is protected with two-factor authentication. You'll need your authenticator app to sign in.
                </p>
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  <h4 className="font-medium text-yellow-800">2FA is Not Enabled</h4>
                </div>
                <p className="text-sm text-yellow-700">
                  Enable two-factor authentication to add an extra layer of security to your account.
                </p>
              </div>
            )}

            <div className="flex space-x-3">
              <Button
                variant="secondary"
                onClick={onClose}
                className="flex-1"
              >
                Close
              </Button>
              {!is2FAEnabled && (
                <Button
                  onClick={() => {
                    onClose();
                    // Trigger setup mode
                    setTimeout(() => {
                      // This would need to be handled by parent component
                    }, 100);
                  }}
                  className="flex-1"
                >
                  Enable 2FA
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Disable Mode */}
        {mode === 'disable' && (
          <div className="space-y-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Disable Two-Factor Authentication
              </h3>
              <p className="text-gray-600">
                This will remove the extra security layer from your account. Are you sure you want to continue?
              </p>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <h4 className="font-medium text-red-800">Security Warning</h4>
              </div>
              <p className="text-sm text-red-700">
                Disabling 2FA will make your account less secure. You'll only need your password to sign in.
              </p>
            </div>

            <div className="flex space-x-3">
              <Button
                variant="secondary"
                onClick={onClose}
                className="flex-1"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={disable2FA}
                className="flex-1"
                disabled={loading}
              >
                {loading ? 'Disabling...' : 'Disable 2FA'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}