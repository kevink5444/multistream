
import { useState } from "react";
import { forgotPassword } from "../services/authService";

export default function ForgotPassword({
  onNavigateLogin,
}) {
  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /* =========================================================
     HANDLE SUBMIT
     ========================================================= */

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const normalizedEmail = email.trim();

    if (!normalizedEmail) {
      setError("Email is required.");
      return;
    }

    setLoading(true);

    try {
      const result = await forgotPassword
        (email.trim());
      

      setSuccess(result.message);

    } catch (error) {
      setError(error.message);

    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     RENDER
     ========================================================= */

  return (
    <div className="min-h-screen bg-[#09090f] flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#11111b] p-8">

        {/* HEADER */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white">
            MultiStream
          </h1>

          <p className="mt-2 text-gray-400">
            Forgot your password?
          </p>
        </div>

        {/* DESCRIPTION */}
        <p className="mb-6 text-sm leading-6 text-gray-400">
          Enter your email address and we'll send
          you a link to reset your password.
        </p>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          {/* EMAIL */}
          <div>
            <label
              htmlFor="forgot-password-email"
              className="mb-2 block text-sm text-gray-300"
            >
              Email
            </label>

            <input
              id="forgot-password-email"
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);

                setError("");
                setSuccess("");
              }}
              required
              autoComplete="email"
              placeholder="you@example.com"
              disabled={loading}
              className="w-full rounded-lg border border-white/10 bg-[#09090f] px-4 py-3 text-white outline-none transition focus:border-indigo-500 disabled:opacity-60"
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
            <div className="rounded-lg border border-green-500/20 bg-green-500/10 p-3 text-sm leading-6 text-green-400">
              {success}
            </div>
          )}

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={loading || !email.trim()}
            className="w-full rounded-lg bg-indigo-600 py-3 font-medium text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Sending..."
              : "Send Reset Link"}
          </button>
        </form>

        {/* BACK TO LOGIN */}
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={onNavigateLogin}
            disabled={loading}
            className="text-sm text-indigo-400 transition hover:text-indigo-300 disabled:opacity-50"
          >
            ← Back to Login
          </button>
        </div>

      </div>
    </div>
  );
}
