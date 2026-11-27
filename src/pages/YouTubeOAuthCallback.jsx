import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowLeft,
} from "lucide-react";

import { FaYoutube } from "react-icons/fa";

const API_URL = "http://localhost:5000";

function YouTubeOAuthCallback() {
  const navigate = useNavigate();

  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState(
    "Memverifikasi koneksi YouTube..."
  );

  useEffect(() => {
    let isMounted = true;

    async function verifyConnection() {
      try {
        const response = await fetch(
          `${API_URL}/api/oauth/status`,
          {
            credentials: "include",
          }
        );

        const result = await response.json();

        if (!isMounted) return;

        if (result.success && result.connected) {
          setStatus("success");
          setMessage(
            "Akun YouTube berhasil terhubung dengan MultiStream."
          );

          // Beri waktu agar pengguna melihat halaman sukses.
          setTimeout(() => {
            if (window.opener && !window.opener.closed) {
              window.opener.postMessage(
                {
                  type: "YOUTUBE_OAUTH_SUCCESS",
                },
                "http://localhost:5173"
              );
            }

            window.close();
          }, 2500);
        } else {
          setStatus("error");
          setMessage(
            "Koneksi YouTube belum berhasil. Silakan coba kembali."
          );
        }
      } catch (error) {
        console.error(
          "YouTube OAuth verification error:",
          error
        );

        if (!isMounted) return;

        setStatus("error");
        setMessage(
          "Terjadi kesalahan saat memverifikasi koneksi YouTube."
        );
      }
    }

    verifyConnection();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleReturn = () => {
    if (window.opener && !window.opener.closed) {
      window.close();
      return;
    }

    navigate("/dashboard");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#090B10] px-4 text-white">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#11141C] p-8 text-center shadow-2xl">
        {/* LOGO */}

        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10">
          <FaYoutube
            size={34}
            className="text-red-500"
            />
        </div>

        {/* LOADING */}

        {status === "loading" && (
          <>
            <Loader2
              size={36}
              className="mx-auto mb-4 animate-spin text-violet-500"
            />

            <h1 className="text-xl font-semibold">
              Connecting YouTube
            </h1>

            <p className="mt-3 text-sm text-gray-400">
              {message}
            </p>
          </>
        )}

        {/* SUCCESS */}

        {status === "success" && (
          <>
            <CheckCircle2
              size={42}
              className="mx-auto mb-4 text-green-500"
            />

            <h1 className="text-xl font-semibold">
              YouTube Connected Successfully
            </h1>

            <p className="mt-3 text-sm leading-6 text-gray-400">
              {message}
            </p>

            <div className="mt-6 rounded-xl border border-green-500/20 bg-green-500/5 p-4">
              <p className="text-sm text-green-400">
                Authentication completed successfully.
              </p>

              <p className="mt-1 text-xs text-gray-500">
                This tab will close automatically.
              </p>
            </div>
          </>
        )}

        {/* ERROR */}

        {status === "error" && (
          <>
            <XCircle
              size={42}
              className="mx-auto mb-4 text-red-500"
            />

            <h1 className="text-xl font-semibold">
              Connection Failed
            </h1>

            <p className="mt-3 text-sm leading-6 text-gray-400">
              {message}
            </p>

            <button
              onClick={handleReturn}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-medium transition hover:bg-violet-700"
            >
              <ArrowLeft size={16} />
              Return to MultiStream
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default YouTubeOAuthCallback;