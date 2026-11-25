import { useState } from "react";
import { resetPassword } from "../services/authService";

export default function ResetPassword({
  token,
  onNavigateLogin,
}) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!token) {
      setError("Invalid password reset link.");
      return;
    }

    if (password.length < 8) {
      setError(
        "Password must be at least 8 characters."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const result = await resetPassword({
        token,
        password,
        confirmPassword,
      });

      setSuccess(result.message);

      setPassword("");
      setConfirmPassword("");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = (value) => {
    setPassword(value);
    setError("");
    setSuccess("");
  };

  const handleConfirmPasswordChange = (value) => {
    setConfirmPassword(value);
    setError("");
    setSuccess("");
  };

  return (
    <div className="min-h-screen bg-[#09090f] flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#11111b] p-8">

        {/* HEADER */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white">
            MultiStream
          </h1>

          <p className="mt-2 text-gray-400">
            Reset your password
          </p>
        </div>

        {/* INVALID TOKEN */}
        {!token ? (
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
            Invalid password reset link.
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            {/* NEW PASSWORD */}
            <div>
              <label
                htmlFor="new-password"
                className="mb-2 block text-sm text-gray-300"
              >
                New Password
              </label>

              <input
                id="new-password"
                type="password"
                value={password}
                onChange={(event) =>
                  handlePasswordChange(
                    event.target.value
                  )
                }
                required
                minLength={8}
                autoComplete="new-password"
                disabled={loading}
                placeholder="Enter new password"
                className="w-full rounded-lg border border-white/10 bg-[#09090f] px-4 py-3 text-white outline-none transition focus:border-indigo-500 disabled:opacity-50"
              />
            </div>

            {/* CONFIRM PASSWORD */}
            <div>
              <label
                htmlFor="confirm-password"
                className="mb-2 block text-sm text-gray-300"
              >
                Confirm Password
              </label>

              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(event) =>
                  handleConfirmPasswordChange(
                    event.target.value
                  )
                }
                required
                minLength={8}
                autoComplete="new-password"
                disabled={loading}
                placeholder="Confirm new password"
                className="w-full rounded-lg border border-white/10 bg-[#09090f] px-4 py-3 text-white outline-none transition focus:border-indigo-500 disabled:opacity-50"
              />
            </div>

            {/* ERROR */}
            {error && (
              <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
                {error}
              </div>
            )}

            {/* SUCCESS */}
            {success && (
              <div className="rounded-lg border border-green-500/20 bg-green-500/10 p-3 text-sm text-green-400">
                {success}
              </div>
            )}

            {/* SUBMIT */}
            {!success && (
              <button
                type="submit"
                disabled={
                  loading ||
                  !password ||
                  !confirmPassword
                }
                className="w-full rounded-lg bg-indigo-600 py-3 font-medium text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading
                  ? "Resetting..."
                  : "Reset Password"}
              </button>
            )}
          </form>
        )}

        {/* LOGIN */}
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={onNavigateLogin}
            className="text-sm text-indigo-400 transition hover:text-indigo-300"
          >
            ← Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}