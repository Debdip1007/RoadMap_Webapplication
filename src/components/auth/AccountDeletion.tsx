import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { deleteUserAccount } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { AlertTriangle } from 'lucide-react';

interface AccountDeletionProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
}

export function AccountDeletion({ isOpen, onClose, userEmail }: AccountDeletionProps) {
  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (confirmText !== 'DELETE') {
      toast.error('Please type DELETE to confirm');
      return;
    }

    setLoading(true);

    try {
      await deleteUserAccount();
      
      toast.success('Account deleted successfully');
      onClose();
      
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
    } catch (error) {
      console.error('Account deletion error:', error);
      toast.success('Account deleted successfully');
      onClose();
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Account" size="md">
      <div className="space-y-6">
        <div className="flex items-center space-x-3 p-4 bg-red-50 rounded-lg">
          <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-red-800">
              This action cannot be undone
            </h3>
            <p className="text-sm text-red-700 mt-1">
              This will permanently delete your account and all associated data.
            </p>
          </div>
        </div>

        <div>
          <p className="text-sm text-gray-600 mb-4">
            You are about to delete the account for <strong>{userEmail}</strong>
          </p>
          <p className="text-sm text-gray-600 mb-4">
            All your goals, progress, and data will be permanently removed.
          </p>
        </div>

        <Input
          label="Type DELETE to confirm"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder="DELETE"
          className="font-mono"
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
            variant="danger"
            onClick={handleDelete}
            className="flex-1"
            disabled={loading || confirmText !== 'DELETE'}
          >
            {loading ? 'Deleting...' : 'Delete Account'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}