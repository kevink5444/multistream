
import { useEffect, useState } from "react";

import {
  User,
  Mail,
  Shield,
  CircleCheck,
  Pencil,
  Save,
  X,
  Check,
  LockKeyhole,
  LoaderCircle,
} from "lucide-react";

import { api } from "../services/api";

// =====================================
// PROFILE PAGE
// =====================================

function Profile({ user, onProfileUpdated }) {
  // =====================================
  // USER INFORMATION
  // =====================================

  const initialName = user?.name || "User";
  const userEmail = user?.email || "-";
  const userRole = user?.role || "User";

  const [profileName, setProfileName] = useState(initialName);
  const [editName, setEditName] = useState(initialName);

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // =====================================
  // SYNC USER DATA
  // =====================================

  useEffect(() => {
    const name = user?.name || "User";

    setProfileName(name);
    setEditName(name);
  }, [user]);

  // =====================================
  // USER INITIALS
  // =====================================

  const getInitials = (name) => {
    return name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const initials = getInitials(profileName);

  // =====================================
  // ROLE LABEL
  // =====================================

  const roleLabel =
    userRole.toLowerCase() === "admin"
      ? "Administrator"
      : userRole;

  // =====================================
  // START EDITING
  // =====================================

  const handleEditProfile = () => {
    setEditName(profileName);
    setErrorMessage("");
    setSuccessMessage("");
    setIsEditing(true);
  };

  // =====================================
  // CANCEL EDITING
  // =====================================

  const handleCancelEdit = () => {
    if (isSaving) return;

    setEditName(profileName);
    setErrorMessage("");
    setSuccessMessage("");
    setIsEditing(false);
  };

  // =====================================
  // SAVE PROFILE
  // =====================================

  const handleSaveProfile = async () => {
    const trimmedName = editName.trim();

    // VALIDATION

    if (!trimmedName) {
      setErrorMessage("Name cannot be empty.");
      return;
    }

    if (trimmedName.length < 2) {
      setErrorMessage(
        "Name must contain at least 2 characters."
      );
      return;
    }

    if (trimmedName.length > 50) {
      setErrorMessage(
        "Name cannot exceed 50 characters."
      );
      return;
    }

    // NO CHANGE

    if (trimmedName === profileName) {
      setIsEditing(false);
      setErrorMessage("");
      return;
    }

    // START REQUEST

    setIsSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      // UPDATE PROFILE THROUGH BACKEND API

      const response = await api.updateProfile({
        name: trimmedName,
      });

      // CHECK RESPONSE

      if (!response?.success || !response?.data?.user) {
        throw new Error(
          response?.message || "Failed to update profile."
        );
      }

      const updatedUser = response.data.user;

      // UPDATE LOCAL PROFILE

      setProfileName(updatedUser.name);
      setEditName(updatedUser.name);

      // UPDATE GLOBAL USER STATE

      if (typeof onProfileUpdated === "function") {
        onProfileUpdated(updatedUser);
      }

      // SUCCESS

      setSuccessMessage(
        response.message || "Profile updated successfully."
      );

      setIsEditing(false);
      setErrorMessage("");

    } catch (error) {
      console.error("Update Profile Error:", error);

      setErrorMessage(
        error.message || "Failed to update profile."
      );
    } finally {
      setIsSaving(false);
    }
  };

  // =====================================
  // ACCOUNT INFORMATION
  // =====================================

  const accountInformation = [
    {
      label: "Full Name",
      value: profileName,
      icon: User,
    },
    {
      label: "Email Address",
      value: userEmail,
      icon: Mail,
    },
    {
      label: "Account Role",
      value: roleLabel,
      icon: Shield,
    },
  ];

  // =====================================
  // RENDER
  // =====================================

  return (
    <div className="space-y-6">

      {/* =====================================
          PROFILE HEADER
      ===================================== */}

      <section className="rounded-2xl border border-white/[0.06] bg-[#11141B] p-5 sm:p-8">

        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">

          {/* AVATAR */}

          <div className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-blue-500 text-3xl font-bold text-white shadow-lg shadow-violet-500/10">
            {initials || "U"}
          </div>

          {/* PROFILE INFORMATION */}

          <div className="min-w-0 flex-1">

            <h2 className="break-words text-2xl font-semibold tracking-tight text-white">
              {profileName}
            </h2>

            <p className="mt-2 break-all text-sm text-gray-400">
              {userEmail}
            </p>

            {/* BADGES */}

            <div className="mt-4 flex flex-wrap items-center gap-2">

              {/* ROLE */}

              <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-400">
                <Shield className="h-3.5 w-3.5" />
                {roleLabel}
              </span>

              {/* ACCOUNT STATUS */}

              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
                <CircleCheck className="h-3.5 w-3.5" />
                Active Account
              </span>

            </div>
          </div>

          {/* EDIT BUTTON */}

          {!isEditing && (
            <button
              onClick={handleEditProfile}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-gray-300 transition hover:border-violet-500/30 hover:bg-violet-500/[0.08] hover:text-white"
            >
              <Pencil className="h-4 w-4" />
              Edit Profile
            </button>
          )}

        </div>
      </section>

      {/* =====================================
          SUCCESS MESSAGE
      ===================================== */}

      {successMessage && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] px-4 py-3">

          <Check className="h-4 w-4 shrink-0 text-emerald-400" />

          <p className="text-sm text-emerald-400">
            {successMessage}
          </p>

        </div>
      )}

      {/* =====================================
          EDIT PROFILE FORM
      ===================================== */}

      {isEditing && (
        <section className="rounded-2xl border border-violet-500/20 bg-[#11141B]">

          {/* FORM HEADER */}

          <div className="border-b border-white/[0.06] p-5 sm:p-6">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10">
                <Pencil className="h-5 w-5 text-violet-400" />
              </div>

              <div>
                <h3 className="text-base font-semibold text-white">
                  Edit Profile
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Update your personal account information.
                </p>
              </div>

            </div>
          </div>

          {/* FORM CONTENT */}

          <div className="space-y-5 p-5 sm:p-6">

            {/* NAME FIELD */}

            <div>

              <label
                htmlFor="profile-name"
                className="mb-2 block text-sm font-medium text-gray-300"
              >
                Full Name
              </label>

              <div className="relative">

                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />

                <input
                  id="profile-name"
                  type="text"
                  value={editName}
                  onChange={(event) => {
                    setEditName(event.target.value);
                    setErrorMessage("");
                    setSuccessMessage("");
                  }}
                  disabled={isSaving}
                  maxLength={50}
                  placeholder="Enter your full name"
                  className={`h-11 w-full rounded-xl border bg-white/[0.02] pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-gray-600 focus:bg-white/[0.04] disabled:cursor-not-allowed disabled:opacity-60 ${
                    errorMessage
                      ? "border-red-500/40 focus:border-red-500/60"
                      : "border-white/[0.08] focus:border-violet-500/40"
                  }`}
                />

              </div>

              <div className="mt-2 flex items-center justify-between">

                <p className="text-xs text-gray-500">
                  Your name will be displayed across MultiStream.
                </p>

                <p className="text-xs text-gray-600">
                  {editName.length}/50
                </p>

              </div>

              {/* VALIDATION ERROR */}

              {errorMessage && (
                <p className="mt-2 text-xs text-red-400">
                  {errorMessage}
                </p>
              )}

            </div>

            {/* EMAIL FIELD */}

            <div>

              <label className="mb-2 block text-sm font-medium text-gray-300">
                Email Address
              </label>

              <div className="relative">

                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />

                <input
                  type="email"
                  value={userEmail}
                  disabled
                  className="h-11 w-full cursor-not-allowed rounded-xl border border-white/[0.06] bg-white/[0.02] pl-10 pr-4 text-sm text-gray-500 outline-none"
                />

              </div>

              <p className="mt-2 text-xs text-gray-600">
                Email address cannot be changed here.
              </p>

            </div>

            {/* FORM ACTIONS */}

            <div className="flex flex-col-reverse gap-3 border-t border-white/[0.06] pt-5 sm:flex-row sm:justify-end">

              {/* CANCEL */}

              <button
                onClick={handleCancelEdit}
                disabled={isSaving}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/[0.08] px-4 py-2.5 text-sm font-medium text-gray-400 transition hover:bg-white/[0.04] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X className="h-4 w-4" />
                Cancel
              </button>

              {/* SAVE */}

              <button
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSaving ? (
                  <>
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </button>

            </div>

          </div>
        </section>
      )}

      {/* =====================================
          ACCOUNT INFORMATION
      ===================================== */}

      <section className="overflow-hidden rounded-2xl border border-white/[0.06] bg-[#11141B]">

        {/* SECTION HEADER */}

        <div className="border-b border-white/[0.06] p-5 sm:p-6">

          <h3 className="text-base font-semibold text-white">
            Account Information
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            Your personal account information.
          </p>

        </div>

        {/* INFORMATION LIST */}

        <div className="divide-y divide-white/[0.05]">

          {accountInformation.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.label}
                className="flex items-center gap-4 p-5 transition hover:bg-white/[0.015] sm:p-6"
              >

                {/* ICON */}

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.04]">
                  <Icon className="h-5 w-5 text-gray-400" />
                </div>

                {/* INFORMATION */}

                <div className="min-w-0 flex-1">

                  <p className="text-xs text-gray-500">
                    {item.label}
                  </p>

                  <p className="mt-1 break-words text-sm font-medium text-white">
                    {item.value}
                  </p>

                </div>

              </div>
            );
          })}

        </div>
      </section>

      {/* =====================================
          ACCOUNT STATUS
      ===================================== */}

      <section className="rounded-2xl border border-white/[0.06] bg-[#11141B] p-5 sm:p-6">

        <div className="flex items-start gap-4">

          {/* ICON */}

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10">
            <CircleCheck className="h-5 w-5 text-emerald-400" />
          </div>

          {/* INFORMATION */}

          <div className="min-w-0 flex-1">

            <h3 className="text-sm font-semibold text-white">
              Account Status
            </h3>

            <p className="mt-1 text-sm leading-relaxed text-gray-500">
              Your account is active and currently signed in to MultiStream.
            </p>

          </div>

        </div>
      </section>

      {/* =====================================
          SECURITY INFORMATION
      ===================================== */}

      <section className="rounded-2xl border border-white/[0.06] bg-[#11141B] p-5 sm:p-6">

        <div className="flex items-start gap-4">

          {/* ICON */}

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10">
            <LockKeyhole className="h-5 w-5 text-blue-400" />
          </div>

          {/* INFORMATION */}

          <div className="min-w-0 flex-1">

            <h3 className="text-sm font-semibold text-white">
              Account Security
            </h3>

            <p className="mt-1 text-sm leading-relaxed text-gray-500">
              Your account is protected by MultiStream authentication.
              Password management is handled separately from your profile.
            </p>

          </div>

        </div>
      </section>

    </div>
  );
}

export default Profile;
