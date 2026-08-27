"use client";

import { useState } from "react";
import { AuthAlert } from "./AuthAlert";
import { AuthField } from "./AuthField";
import { AuthSubmitButton } from "./AuthSubmitButton";
import { customerAuthApi } from "@/services/api/customer-auth.api";

export const ChangePasswordCard = () => {
  const [open, setOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const tooShort = newPassword.length > 0 && newPassword.length < 6;
  const mismatch = confirmPassword.length > 0 && newPassword !== confirmPassword;
  const canSubmit =
    !!currentPassword && newPassword.length >= 6 && newPassword === confirmPassword;

  const reset = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setError("");
    setDone(false);
    setSubmitting(true);
    try {
      await customerAuthApi.changePassword(currentPassword, newPassword);
      reset();
      setDone(true);
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not change your password.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white border border-gray-100 rounded-[32px] p-8 shadow-[0_24px_60px_rgba(0,0,0,0.03)]">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h2 className="text-xs font-black uppercase tracking-widest text-black mb-2">
            Password
          </h2>
          <p className="text-sm text-gray-400 font-light leading-relaxed">
            Change the password you use to sign in.
          </p>
        </div>
        <button
          onClick={() => {
            setOpen((wasOpen) => !wasOpen);
            setError("");
            setDone(false);
          }}
          className="shrink-0 font-mono text-[10px] font-bold tracking-[0.12em] uppercase border-b border-primary text-primary pb-0.5 hover:text-black hover:border-black transition-colors"
        >
          {open ? "Cancel" : "Change"}
        </button>
      </div>

      {done && (
        <div className="mt-6">
          <AuthAlert tone="success" message="Your password has been updated." />
        </div>
      )}

      {open && (
        <form onSubmit={handleSubmit} className="mt-8 space-y-8">
          {error && <AuthAlert tone="error" message={error} />}

          <AuthField
            label="Current Password"
            type="password"
            autoComplete="current-password"
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="••••••••"
          />

          <AuthField
            label="New Password"
            type="password"
            autoComplete="new-password"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="••••••••"
            error={tooShort ? "Minimum 6 characters." : undefined}
          />

          <AuthField
            label="Confirm New Password"
            type="password"
            autoComplete="new-password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            error={mismatch ? "Passwords do not match." : undefined}
          />

          <AuthSubmitButton
            label="Update Password"
            pendingLabel="Updating…"
            pending={submitting}
            disabled={!canSubmit}
          />
        </form>
      )}
    </div>
  );
};
