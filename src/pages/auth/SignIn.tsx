import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { AuthService } from "../../services/AuthService";
import type { SignInCredentials } from "../../services/AuthService";
import mindmintLogo from "../../assets/mindmint.png";
import arrowLeft from "../../assets/arrow-left.svg";

const ACCENT_COLOR = "#033330";
const ACCENT_LIGHT = "#0d4d4a";

export default function SignIn() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remindLater, setRemindLater] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const signInMutation = useMutation({
    mutationFn: (credentials: SignInCredentials) =>
      AuthService.signIn(credentials),
    onSuccess: (data) => {
      if (data.success) {
        setValidationError(null);
        navigate("/", { replace: true });
      } else {
        setValidationError(data.error ?? "Sign-in failed.");
      }
    },
    onError: () => {
      setValidationError("Something went wrong. Please try again.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setValidationError("Please enter your email address.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setValidationError("Please enter a valid email address.");
      return;
    }
    if (!password) {
      setValidationError("Please enter your password.");
      return;
    }

    signInMutation.mutate({ email: trimmedEmail, password });
  };

  const isLoading = signInMutation.isPending;
  const errorMessage = validationError ?? signInMutation.data?.error ?? null;

  return (
    <div
      className="min-h-screen bg-black flex flex-col"
      style={{ fontFamily: "Prompt, sans-serif" }}
    >
      {/* Header */}
      <header className="flex justify-between items-center px-6 py-5 md:px-10">
        <Link to="/" className="shrink-0">
          <img
            src={mindmintLogo}
            alt="Mindmint"
            className="h-10 w-auto object-contain"
          />
        </Link>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[#757575] cursor-pointer transition-colors"
        >
          <img src={arrowLeft} alt="" className="w-5 h-5" />
          <span className="uppercase text-sm font-medium">Back</span>
        </button>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-12">
        <div className="w-full max-w-md">
          <h1
            className="text-center text-2xl font-medium mb-8"
            style={{ color: ACCENT_LIGHT }}
          >
            Sign in
          </h1>

          {/* Email / Password form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="email"
              placeholder="your address@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              className="w-full px-4 py-3 rounded-xl border-2 bg-transparent! outline-none transition-colors placeholder:text-white/50 disabled:opacity-60"
              style={{ borderColor: "#353536", color: "#CFFDED" }}
              autoComplete="email"
            />
            <input
              type="password"
              placeholder="your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              className="w-full px-4 py-3 rounded-xl border-2 bg-transparent! outline-none transition-colors placeholder:text-white/50 disabled:opacity-60"
              style={{ borderColor: "#353536", color: "#CFFDED" }}
              autoComplete="current-password"
            />

            {/* Remind me later */}
            <label className="flex items-center gap-2 cursor-pointer w-fit" style={{ color: "#D1D1D1" }}>
              <input
                type="checkbox"
                checked={remindLater}
                onChange={(e) => setRemindLater(e.target.checked)}
                disabled={isLoading}
                className="w-4 h-4 rounded border-2 bg-transparent"
                style={{ borderColor: "#0A746D", accentColor: ACCENT_COLOR }}
              />
              <span className="text-sm">Remind me later</span>
            </label>

            {errorMessage && (
              <div
                className="px-4 py-3 rounded-xl text-sm"
                style={{
                  backgroundColor: "rgba(220, 38, 38, 0.15)",
                  color: "#fca5a5",
                  border: "1px solid rgba(220, 38, 38, 0.4)",
                }}
              >
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 rounded-xl font-normal text-white text-[20px] tracking-wide transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ backgroundColor: ACCENT_COLOR }}
            >
              {isLoading ? "Signing in…" : "Continue"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
