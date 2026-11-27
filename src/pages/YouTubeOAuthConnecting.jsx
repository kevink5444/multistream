import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { FaYoutube } from "react-icons/fa";

function YouTubeOAuthConnecting() {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.replace(
        "http://localhost:5000/api/oauth/youtube"
      );
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#090B10] text-white">
      <div className="w-full max-w-md px-6 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10">
          <FaYoutube
            size={34}
            className="text-red-500"
          />
        </div>

        <h1 className="text-xl font-semibold">
          Connecting to YouTube
        </h1>

        <p className="mt-3 text-sm text-gray-400">
          MultiStream is preparing your YouTube
          authentication.
        </p>

        <div className="mt-8 flex items-center justify-center gap-3 text-sm text-gray-400">
          <Loader2
            size={18}
            className="animate-spin text-violet-500"
          />

          Redirecting to Google...
        </div>

        <div className="mt-8 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
          <p className="text-xs text-gray-500">
            MultiStream OAuth Authentication
          </p>

          <p className="mt-1 text-sm text-gray-300">
            localhost:5173/oauth/youtube/connecting
          </p>
        </div>
      </div>
    </div>
  );
}

export default YouTubeOAuthConnecting;