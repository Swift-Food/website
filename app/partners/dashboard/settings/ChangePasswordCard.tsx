"use client";

import { useState } from "react";
import { Loader, AlertCircle, CheckCircle, Lock } from "lucide-react";
import { coworkingApi } from "@/services/api/coworking.api";

export const ChangePasswordCard = () => {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  const passwordShort = next.length > 0 && next.length < 6;
  const passwordMismatch = confirm.length > 0 && next !== confirm;
  const canSubmit = current.length > 0 && next.length >= 6 && next === confirm;

  const handleSave = async () => {
    setSaving(true);
    setSaveError("");
    setSaveSuccess(false);
    try {
      await coworkingApi.changePassword(current, next);
      setSaveSuccess(true);
      setCurrent("");
      setNext("");
      setConfirm("");
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      setSaveError(err.message || "Failed to change password.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-start gap-3 border-b border-gray-100 p-5 sm:p-6">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Lock size={18} />
        </span>
        <div>
          <h2 className="font-semibold tracking-tight text-gray-900">Change password</h2>
          <p className="mt-0.5 text-sm text-gray-500">
            Update the password you use to sign in to the partner dashboard.
          </p>
        </div>
      </div>

      <div className="space-y-4 p-5 sm:p-6">
        {saveError && (
          <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <AlertCircle size={14} className="flex-shrink-0" />
            {saveError}
          </div>
        )}
        {saveSuccess && (
          <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
            <CheckCircle size={14} className="flex-shrink-0" />
            Password changed.
          </div>
        )}

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Current password</label>
          <input
            type="password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-indigo-500"
            placeholder="••••••••"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">New password</label>
          <input
            type="password"
            value={next}
            onChange={(e) => setNext(e.target.value)}
            className={`w-full rounded-lg border px-4 py-2.5 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-indigo-500 ${
              passwordShort ? "border-red-400 bg-red-50" : "border-gray-300"
            }`}
            placeholder="••••••••"
          />
          {passwordShort && <p className="mt-1 text-xs text-red-600">Minimum 6 characters.</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Confirm new password</label>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className={`w-full rounded-lg border px-4 py-2.5 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-indigo-500 ${
              passwordMismatch ? "border-red-400 bg-red-50" : "border-gray-300"
            }`}
            placeholder="••••••••"
          />
          {passwordMismatch && <p className="mt-1 text-xs text-red-600">Passwords do not match.</p>}
        </div>
      </div>

      <div className="flex justify-end border-t border-gray-100 bg-gray-50/60 px-5 py-4 sm:px-6">
        <button
          onClick={handleSave}
          disabled={saving || !canSubmit}
          className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-primary/40"
        >
          {saving ? (
            <>
              <Loader size={14} className="animate-spin" />
              Saving…
            </>
          ) : (
            <>
              <Lock size={14} />
              Change password
            </>
          )}
        </button>
      </div>
    </div>
  );
};
