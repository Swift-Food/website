import { useState } from 'react';

export function ImportantNotes() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mb-4">
      <button
        type="button"
        className="w-full bg-warning/10 border border-warning/30 rounded-xl p-4 flex items-center justify-between focus:outline-none group"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-controls="important-notes-content"
      >
        <span className="text-xs font-semibold text-warning">Important Notes</span>
        <span className="ml-2 text-warning group-hover:underline flex items-center">
          <svg
            className={`transition-transform duration-200 w-4 h-4 ${
              isOpen ? 'rotate-180' : 'rotate-0'
            }`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>
      {isOpen && (
        <div
          id="important-notes-content"
          className="mt-2 text-xs text-base-content/80 leading-relaxed"
        >
          <p>
            For accurate allergen information, please contact stalls or restaurants directly.
          </p>
          <p>
            For any last-minute changes, please contact us at least two days before your
            event.
          </p>
        </div>
      )}
    </div>
  );
}
