import { CorporateUser } from "@/types/catering.types";
import React, { useState } from "react";

interface CorporateLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessfulLogin: (corporateAccount: CorporateUser) => void;
}

const CorporateLoginModal: React.FC<CorporateLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccessfulLogin,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleLogin = () => {
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }
    setError(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md relative">
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold mb-6 text-center">Corporate Login</h2>
        <div className="flex flex-col gap-4">
          <label className="block text-sm font-semibold mb-1 text-base-content">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full px-4 py-3 bg-base-200/50 border rounded-xl focus:ring-2 focus:ring-dark-pink focus:border-transparent transition-all border-base-300"
            required
          />
          <label className="block text-sm font-semibold mb-1 text-base-content">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="w-full px-4 py-3 bg-base-200/50 border rounded-xl focus:ring-2 focus:ring-dark-pink focus:border-transparent transition-all border-base-300"
            required
          />
          {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
          <button
            type="button"
            className="w-full bg-primary text-white py-2 px-6 rounded-xl font-bold text-base transition-colors hover:bg-hot-pink cursor-pointer mt-2"
            onClick={handleLogin}
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default CorporateLoginModal;
