import { useState } from 'react';
import { isValidEmail } from '@/lib/utils';

export function useCcEmails() {
  const [ccEmails, setCcEmails] = useState<string[]>([]);
  const [ccEmailInput, setCcEmailInput] = useState('');

  const handleAddCcEmail = () => {
    const trimmedEmail = ccEmailInput.trim();

    if (!trimmedEmail) {
      return;
    }

    if (!isValidEmail(trimmedEmail)) {
      alert('Please enter a valid email address');
      return;
    }

    if (ccEmails.includes(trimmedEmail)) {
      alert('This email is already added');
      return;
    }

    setCcEmails([...ccEmails, trimmedEmail]);
    setCcEmailInput('');
  };

  const handleRemoveCcEmail = (emailToRemove: string) => {
    setCcEmails(ccEmails.filter((email) => email !== emailToRemove));
  };

  return {
    ccEmails,
    ccEmailInput,
    setCcEmailInput,
    handleAddCcEmail,
    handleRemoveCcEmail,
  };
}
