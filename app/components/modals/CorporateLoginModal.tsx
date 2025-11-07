import { CorporateUser } from "@/types/catering.types";
import React, { useState } from "react";
import { jwtDecode } from "jwt-decode";
import { restaurantApi } from "@/app/api/restaurantApi";

interface CorporateLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessfulLogin: (corporateAccount: CorporateUser) => void;
}

interface JwtPayload {
  corporateUserId: string;
  [key: string]: any;
}

const CorporateLoginModal: React.FC<CorporateLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccessfulLogin,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      // Step 1: Login and get TokenPair
      const tokenPair = await restaurantApi.loginCorporate({ email, password });

      // Step 2: Decode the access token to get corporateUserId
      const decodedToken = jwtDecode<JwtPayload>(tokenPair.access_token);
      const corporateUserId = decodedToken.corporateUserId;

      if (!corporateUserId) {
        throw new Error("Corporate user ID not found in token");
      }

      // Step 3: Fetch the corporate user details
      const corporateUser = await restaurantApi.getCorporateUser(
        corporateUserId
      );

      // Step 4: Call the success callback with corporate user data
      onSuccessfulLogin(corporateUser);

      // Reset form
      setEmail("");
      setPassword("");
    } catch (err) {
      console.error("Corporate login error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Login failed. Please check your credentials."
      );
    } finally {
      setIsLoading(false);
    }
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
            className="w-full bg-primary text-white py-2 px-6 rounded-xl font-bold text-base transition-colors hover:bg-hot-pink cursor-pointer mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CorporateLoginModal;
