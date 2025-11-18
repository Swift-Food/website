interface CcEmailInputProps {
  ccEmails: string[];
  ccEmailInput: string;
  setCcEmailInput: (value: string) => void;
  onAddEmail: () => void;
  onRemoveEmail: (email: string) => void;
}

export function CcEmailInput({
  ccEmails,
  ccEmailInput,
  setCcEmailInput,
  onAddEmail,
  onRemoveEmail,
}: CcEmailInputProps) {
  return (
    <div>
      <label className="block text-sm font-semibold mb-2 text-base-content">
        CC Additional Emails (Optional)
      </label>
      <p className="text-xs text-base-content/60 mb-3">
        Add additional email addresses to receive order updates
      </p>

      <div className="flex gap-2 mb-3">
        <input
          type="email"
          value={ccEmailInput}
          onChange={(e) => setCcEmailInput(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              onAddEmail();
            }
          }}
          placeholder="additional@email.com"
          className="flex-1 px-4 py-2 bg-base-200/50 border border-base-300 rounded-lg focus:ring-2 focus:ring-dark-pink focus:border-transparent text-sm"
        />
        <button
          type="button"
          onClick={onAddEmail}
          className="px-4 py-2 bg-dark-pink text-white rounded-lg font-medium hover:opacity-90 transition-all text-sm"
        >
          Add
        </button>
      </div>

      {ccEmails.length > 0 && (
        <div className="space-y-2">
          {ccEmails.map((email, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-base-100 p-2 rounded-lg border border-base-300"
            >
              <span className="text-sm text-base-content">{email}</span>
              <button
                type="button"
                onClick={() => onRemoveEmail(email)}
                className="text-error hover:opacity-80 text-xs font-medium"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
