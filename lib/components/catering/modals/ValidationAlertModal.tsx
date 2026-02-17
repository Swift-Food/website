"use client";

interface ValidationAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message?: string;
  errors?: string[];
}

export default function ValidationAlertModal({
  isOpen,
  onClose,
  title,
  message,
  errors,
}: ValidationAlertModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[110] p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
        </div>

        {message && <p className="text-gray-600 mb-4 text-sm">{message}</p>}

        {errors && errors.length > 0 && (
          <ul className="mb-6 space-y-2">
            {errors.map((error, index) => (
              <li
                key={index}
                className="flex items-start gap-2 text-sm text-gray-600"
              >
                <span className="text-primary mt-0.5">•</span>
                <span>{error}</span>
              </li>
            ))}
          </ul>
        )}

        <button
          onClick={onClose}
          className="w-full px-4 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors font-medium text-sm"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
