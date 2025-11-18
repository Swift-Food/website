interface TermsCheckboxProps {
  termsAccepted: boolean;
  onToggle: (accepted: boolean) => void;
  id?: string;
}

export function TermsCheckbox({ termsAccepted, onToggle, id = 'terms' }: TermsCheckboxProps) {
  return (
    <div className="flex items-start gap-3 mb-4">
      <input
        type="checkbox"
        id={id}
        checked={termsAccepted}
        onChange={(e) => onToggle(e.target.checked)}
        className="w-5 h-5 mt-0.5 rounded border-base-300 text-dark-pink focus:ring-2 focus:ring-dark-pink cursor-pointer"
      />
      <label htmlFor={id} className="text-sm text-base-content/80 cursor-pointer">
        I accept the{' '}
        <a
          href="/terms"
          target="_blank"
          rel="noopener noreferrer"
          className="text-dark-pink hover:underline font-medium"
          onClick={(e) => e.stopPropagation()}
        >
          Terms and Conditions
        </a>
        *
      </label>
    </div>
  );
}
