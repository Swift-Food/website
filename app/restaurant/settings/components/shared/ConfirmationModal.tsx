"use client";

import { AlertCircle, Save, Loader } from "lucide-react";

interface ConfirmationModalProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  saving: boolean;
}

export const ConfirmationModal = ({
  title,
  message,
  onConfirm,
  onCancel,
  saving,
}: ConfirmationModalProps) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl">
        <div className="flex items-center gap-4 mb-6">
          <div className="bg-purple-100 rounded-full p-4">
            <AlertCircle className="text-purple-600" size={28} />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">
            {title}
          </h3>
        </div>

        <p className="text-gray-600 mb-8 text-lg">
          {message}
        </p>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-4 px-6 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={saving}
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-6 rounded-xl transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader size={20} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={20} />
                Save
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
