import { useState } from "react";
import { login } from "../services/authService";

export default function Login({
  onLoginSuccess,
  onNavigateRegister,
  onNavigateForgotPassword,
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const result = await login({
        email,
        password,
      });

      onLoginSuccess(result.data.user);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
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
            Sign in to your account
          </p>
        </div>

        {/* LOGIN FORM */}
        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          {/* EMAIL */}
          <div>
            <label className="mb-2 block text-sm text-gray-300">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              required
              autoComplete="email"
              placeholder="you@example.com"
              className="w-full rounded-lg border border-white/10 bg-[#09090f] px-4 py-3 text-white outline-none focus:border-indigo-500"
            />
          </div>

          {/* PASSWORD */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="block text-sm text-gray-300">
                Password
              </label>

              <button
                type="button"
                onClick={onNavigateForgotPassword}
                className="text-sm text-indigo-400 transition hover:text-indigo-300"
              >
                Forgot password?
              </button>
            </div>

            <input
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              required
              autoComplete="current-password"
              placeholder="Enter your password"
              className="w-full rounded-lg border border-white/10 bg-[#09090f] px-4 py-3 text-white outline-none focus:border-indigo-500"
            />
          </div>

          {/* ERROR */}
          {error && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* LOGIN BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-indigo-600 py-3 font-medium text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Signing in..."
              : "Sign In"}
          </button>
        </form>

        {/* REGISTER */}
        <div className="mt-6 text-center text-sm text-gray-400">
          Don't have an account?

          <button
            type="button"
            onClick={onNavigateRegister}
            className="ml-2 text-indigo-400 transition hover:text-indigo-300"
          >
            Register
          </button>
        </div>
      </div>
    </div>
  );
}