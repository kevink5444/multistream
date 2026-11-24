import React from "react";

export default function YouTubeLiveCreating() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#09090f] text-white">
      <div className="text-center p-8">

        {/* Spinner */}
        <div className="w-12 h-12 border-4 border-[#292936] border-t-indigo-500 rounded-full animate-spin mx-auto mb-6" />

        {/* Title */}
        <h2 className="text-2xl font-semibold mb-3">
          Creating YouTube Live
        </h2>

        {/* Description */}
        <p className="text-sm text-gray-400">
          Please wait while your Live Control Room is being prepared.
        </p>

      </div>
    </div>
  );
}