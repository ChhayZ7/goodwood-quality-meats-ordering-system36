"use client"; // This tells Next.js this page runs on the client side, because we are using hooks like useState and useEffect.

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";

export default function ProfilePage() {

  const router = useRouter(); // Allows us to navigate/redirect users programmatically.
  const [user, setUser] = useState(null);   // Stores the logged-in user data returned from the API.

  // Stores editable personal details in the form.
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    phone: "",
  });

 
  const [loading, setLoading] = useState(true);  // Loading state is true while profile data is being fetched.
  const [saving, setSaving] = useState(false);  // Saving state is true when the user clicks "Update Details".
  const [error, setError] = useState(null);   // Stores profile update or loading error messages.
  const [success, setSuccess] = useState(false);  // Shows success message after details update successfully.
  const [showPasswordForm, setShowPasswordForm] = useState(false); // Controls whether the password change form is visible or hidden.

  // Stores password form values.
  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  const [passwordError, setPasswordError] = useState(null);  // Stores password change error message.
  const [passwordSuccess, setPasswordSuccess] = useState(false);  // Shows password success message after password is updated.
  const [changingPassword, setChangingPassword] = useState(false);  // True while password update request is being processed.
  const [emailUnsubscribed, setEmailUnsubscribed] = useState(false); // Stores whether the user has unsubscribed from marketing emails.

  // Runs once when the page loads to fetch the current user's profile.
  useEffect(() => {
    async function load() {
      
      const res = await fetch("/api/users/me"); // Calls backend API to get logged-in user's profile.

      // If API says user is not logged in, redirect to login page.
      if (res.status === 401) {
        router.replace("/login");
        return;
      }

      const json = await res.json(); // Convert API response into JSON.

      // If user data is missing, show an error and stop loading.
      if (!json.user) {
        setError(json.error ?? "Failed to load profile");
        setLoading(false);
        return;
      }

      setUser(json.user);  // Store full user data.

      // Fill the personal details form with existing user information.
      setForm({
        first_name: json.user.first_name ?? "",
        last_name: json.user.last_name ?? "",
        phone: json.user.phone ?? "",
      });

      setEmailUnsubscribed(json.user.email_unsubscribed ?? false); // Set email preference from user profile.
      setLoading(false); // Loading is complete.
    }

    load();
  }, [router]);

  // Handles saving updated personal details.
  const handleSave = async (e) => {
    e.preventDefault(); // Stops the form from refreshing the page.

    setSaving(true); // Shows saving state on button.
    setError(null); // Clears old error messages.
    setSuccess(false); // Hides old success message.

    // Sends updated form data to backend API.
    const res = await fetch("/api/users/me", {
      method: "PATCH", // PATCH means update existing data.
      headers: { "Content-Type": "application/json" }, // Tells API we are sending JSON.
      body: JSON.stringify(form), // Converts form object into JSON string.
    });

    const json = await res.json();

    // If update failed, show error and stop saving.
    if (!res.ok) {
      setError(json.error ?? "Failed to save.");
      setSaving(false);
      return;
    }

    setUser(json.user); // Update user state with new user data from API.
    setSuccess(true); // Show success message.
    setSaving(false); // Stop saving state.
  };

  // Handles marketing email subscription toggle.
  const handleEmailPreference = async (unsubscribed) => {
    
    setEmailUnsubscribed(unsubscribed); // Immediately update UI so toggle feels responsive.

    // Save new email preference to backend.
    const res = await fetch("/api/users/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email_unsubscribed: unsubscribed }),
    });

    const json = await res.json();

    // If update fails, reverse the toggle and show error.
    if (!res.ok) {
      // Revert toggle on failure
      setEmailUnsubscribed(!unsubscribed);
      setError(json.error ?? "Failed to update email preference.");
    }
  };

  // Handles changing password.
  const handlePasswordChange = async (e) => {
    e.preventDefault(); // Stops page refresh.

    setPasswordError(null); // Clear old password errors.
    setPasswordSuccess(false); // Hide old password success message.

    // Check if new password and confirm password match.
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setPasswordError("New passwords do not match");
      return;
    }

    // Check password length.
    if (passwordForm.new_password.length < 8) {
      setPasswordError("New password must be at least 8 characters");
      return;
    }

    setChangingPassword(true);  // Start password changing state.

    // Send password update request to backend API.
    const res = await fetch("/api/users/me/password", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
      }),
    });

    const json = await res.json();  // Convert response into JSON.

    // If password update failed, show error message.
    if (!res.ok) {
      setPasswordError(
        json.details
          ? Object.values(json.details).join(", ")
          : (json.error ?? "Failed to update password"),
      );
      setChangingPassword(false);
      return;
    }

    setPasswordSuccess(true); // Show password success message.

    // Clear password form fields.
    setPasswordForm({
      current_password: "",
      new_password: "",
      confirm_password: "",
    });

    setChangingPassword(false); // Stop loading state.
    setShowPasswordForm(false); // Hide password form after successful update.
  };

  // If page is still loading, show skeleton loading UI.
  if (loading)
    return (
      <div className="max-w-4xl mx-auto">
        {/* Header skeleton while loading */}
        <div style={{ marginBottom: "32px" }}>
          <div
            style={{
              height: "40px",
              width: "240px",
              background: "#F0E8D0",
              borderRadius: "6px",
              marginBottom: "32px",
            }}
          />
          <div
            style={{
              height: "2px",
              background: "linear-gradient(90deg, #C9A84C, transparent)",
              borderRadius: "1px",
            }}
          />
        </div>

        {/* Skeleton placeholders for profile cards */}
        <div className="animate-pulse">
          <div className="bg-white rounded-xl border border-gray-200 p-8 mb-6">
            <div className="h-6 w-36 bg-gray-200 rounded mb-6" />
            <div className="flex gap-4 mb-5">
              <div className="flex-1 h-12 bg-gray-200 rounded-lg" />
              <div className="flex-1 h-12 bg-gray-200 rounded-lg" />
            </div>
            <div className="h-12 bg-gray-200 rounded-lg mb-5" />
            <div className="h-12 bg-gray-200 rounded-lg mb-5" />
            <div className="h-10 w-32 bg-gray-200 rounded-lg" />
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-8">
            <div className="h-6 w-24 bg-gray-200 rounded mb-4" />
            <div className="h-4 w-20 bg-gray-200 rounded mb-2" />
            <div className="h-4 w-52 bg-gray-200 rounded mb-4" />
            <div className="h-10 w-36 bg-gray-200 rounded-lg" />
          </div>
        </div>
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto">
      {/* Page header */}
      <div style={{ marginBottom: "32px" }}>
        <h1
          style={{
            fontFamily: '"Lato",serif',
            fontSize: "36px",
            fontWeight: 700,
            color: "#7B1A1A",
            margin: "0 0 32px 0",
          }}
        >
          My Account
        </h1>

        {/* Gold divider*/}
        <div
          style={{
            height: "2px",
            background: "linear-gradient(90deg, #C9A84C, transparent)",
            borderRadius: "1px",
          }}
        />
      </div>

      {/* Personal Details Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-8 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">
          Personal Details
        </h2>

        {/* Show error message if something goes wrong */}
        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

        {/* Show success message after profile update */}
        {success && (
          <p className="text-green-600 text-sm mb-4">
            Details updated successfully.
          </p>
        )}

        {/* Form for updating profile details */}
        <form onSubmit={handleSave} className="space-y-5">
          {/* First name and last name fields side by side */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <input
                type="text"
                value={form.first_name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, first_name: e.target.value }))
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1A1A]"
              />
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <input
                type="text"
                value={form.last_name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, last_name: e.target.value }))
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1A1A]"
              />
            </div>
          </div>

          {/* Email address field is disabled because user should not edit it here */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={user.email}
              disabled
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
            />
          </div>

          {/* Phone number field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) =>
                setForm((p) => ({ ...p, phone: e.target.value }))
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1A1A]"
            />
          </div>

          {/* Submit button for profile update */}
          <button
            type="submit"
            disabled={saving}
            className="bg-[#8B1A1A] text-white px-6 py-3 rounded-lg text-sm font-semibold hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Update Details"}
          </button>
        </form>
      </div>

      {/* Password Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-8 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Password</h2>

        {/* Hidden password visual dots */}
        <p className="text-gray-400 text-2xl tracking-widest mb-1">••••••••</p>

        <p className="text-sm text-gray-500 mb-4">
          You can update your password at any time
        </p>

        {/* If password form is hidden, show Change Password button */}
        {!showPasswordForm ? (
          <button
            onClick={() => setShowPasswordForm(true)}
            className="border border-[#8B1A1A] text-[#8B1A1A] px-6 py-3 rounded-lg text-sm font-semibold hover:bg-[#8B1A1A] hover:text-white transition-colors"
          >
            Change Password
          </button>
        ) : (
          // If password form is visible, show password update form
          <form onSubmit={handlePasswordChange} className="space-y-4 mt-4">
            {/* Password error message */}
            {passwordError && (
              <p className="text-red-600 text-sm">{passwordError}</p>
            )}

            {/* Password success message */}
            {passwordSuccess && (
              <p className="text-green-600 text-sm">
                Password updated successfully.
              </p>
            )}

            {/* Current password input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Password
              </label>
              <input
                type="password"
                value={passwordForm.current_password}
                onChange={(e) =>
                  setPasswordForm((p) => ({
                    ...p,
                    current_password: e.target.value,
                  }))
                }
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1A1A]"
              />
            </div>

            {/* New password input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <input
                type="password"
                value={passwordForm.new_password}
                onChange={(e) =>
                  setPasswordForm((p) => ({
                    ...p,
                    new_password: e.target.value,
                  }))
                }
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1A1A]"
              />
            </div>

            {/* Confirm new password input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                value={passwordForm.confirm_password}
                onChange={(e) =>
                  setPasswordForm((p) => ({
                    ...p,
                    confirm_password: e.target.value,
                  }))
                }
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1A1A]"
              />
            </div>

            {/* Password form buttons */}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={changingPassword}
                className="bg-[#8B1A1A] text-white px-6 py-3 rounded-lg text-sm font-semibold hover:opacity-90 disabled:opacity-50"
              >
                {changingPassword ? "Updating..." : "Update Password"}
              </button>

              {/* Cancel button hides the password form */}
              <button
                type="button"
                onClick={() => {
                  setShowPasswordForm(false);
                  setPasswordError(null);
                }}
                className="border border-gray-300 text-gray-600 px-6 py-3 rounded-lg text-sm font-semibold hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Email Preferences Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-8 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Email Preferences
        </h2>

        {/* Explains what the email preference controls */}
        <p className="text-sm text-gray-500 mb-6">
          Control which emails you receive from us. You will always receive
          transactional emails about your orders regardless of this setting.
        </p>

        {/* Marketing emails preference row */}
        <div
          className="flex items-center justify-between p-4 rounded-lg"
          style={{ background: "#FAF3E0", border: "1px solid #E8D48A" }}
        >
          <div>
            <p className="text-sm font-semibold text-gray-800">
              Marketing emails
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Christmas order reminders and promotions from Goodwood Quality
              Meats
            </p>
          </div>

          {/* Toggle switch for marketing emails */}
          <button
            type="button"
            role="switch"
            aria-checked={!emailUnsubscribed}
            onClick={() => handleEmailPreference(!emailUnsubscribed)}
            className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer
                rounded-full border-2 border-transparent transition-colors duration-200
                focus:outline-none focus:ring-2 focus:ring-[#8B1A1A] focus:ring-offset-2"
            style={{
              backgroundColor: emailUnsubscribed ? "#D1D5DB" : "#8B1A1A",
            }}
          >
            {/* Small white circle inside the toggle */}
            <span
              className="pointer-events-none inline-block h-5 w-5 transform rounded-full
                  bg-white shadow ring-0 transition duration-200 ease-in-out"
              style={{
                transform: emailUnsubscribed
                  ? "translateX(0)"
                  : "translateX(20px)",
              }}
            />
          </button>
        </div>

        {/* Text showing current email subscription status */}
        <p className="text-xs text-gray-400 mt-3">
          {emailUnsubscribed
            ? "You are currently unsubscribed from marketing emails."
            : "You are currently subscribed to marketing emails."}
        </p>
      </div>
    </div>
  );
}