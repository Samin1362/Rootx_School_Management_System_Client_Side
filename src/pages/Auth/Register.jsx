import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import axios from "axios";
import useAuth from "../../hooks/useAuth";
import { API_BASE_URL } from "../../config/api";
import Logo from "../../components/Logo";
import {
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaUser,
  FaUserPlus,
  FaCheckCircle,
  FaSignInAlt,
  FaSchool,
  FaGraduationCap,
  FaUsers,
  FaChartLine,
} from "react-icons/fa";

const Register = () => {
  const { registerUser, updateUserProfile } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation("auth");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError(t("passwordMismatch") || "Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError(t("passwordMinLength") || "Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      // Create Firebase user
      const result = await registerUser(email, password);

      // Update Firebase profile
      await updateUserProfile({ displayName: name });

      // Register in MongoDB
      try {
        await axios.post(`${API_BASE_URL}/users/register`, {
          name,
          email,
          firebaseUid: result.user.uid,
          photoURL: result.user.photoURL || "",
        });
      } catch (apiError) {
        console.error("API registration error:", apiError);
        // Continue even if MongoDB registration fails
      }

      navigate("/waiting-for-organization");
    } catch (err) {
      console.error("Registration error:", err);
      const code = err.code;

      switch (code) {
        case "auth/email-already-in-use":
          setError("This email is already registered. Please login instead.");
          break;
        case "auth/weak-password":
          setError("Password should be at least 6 characters long.");
          break;
        case "auth/invalid-email":
          setError("Invalid email address. Please check and try again.");
          break;
        case "auth/operation-not-allowed":
          setError("Email/password sign up is not enabled. Please contact support.");
          break;
        case "auth/network-request-failed":
          setError("Network error. Please check your internet connection and try again.");
          break;
        default:
          setError(err.message || "Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Benefits for left panel
  const benefits = [
    {
      icon: FaUsers,
      title: "Join Your School",
      desc: "Connect with your school's management system",
    },
    {
      icon: FaGraduationCap,
      title: "Track Progress",
      desc: "Monitor your academic journey in real-time",
    },
    {
      icon: FaChartLine,
      title: "Stay Updated",
      desc: "Get instant notifications about important events",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-100 via-secondary/5 to-base-100 flex items-center justify-center p-4 overflow-hidden relative">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-secondary/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float-reverse"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-accent/5 rounded-full blur-2xl animate-pulse-slow"></div>
      </div>

      {/* Main Content Container */}
      <div className="w-full max-w-6xl relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Panel - Branding & Benefits */}
          <div className="hidden lg:flex flex-col space-y-8 animate-fadeInUp">
            {/* Logo & Heading */}
            <div className="space-y-6">
              <div className="inline-block">
                <Logo size="lg" showText={true} linkTo="/" />
              </div>
              <div className="space-y-3">
                <h1 className="text-4xl xl:text-5xl font-bold text-base-content leading-tight">
                  Start Your Journey
                  <span className="block text-secondary mt-1 animate-gradient bg-gradient-to-r from-secondary via-primary to-secondary bg-clip-text text-transparent bg-[length:200%_auto]">
                    With Education
                  </span>
                </h1>
                <p className="text-base-content/70 text-lg leading-relaxed">
                  Create your account and get connected with your school's digital ecosystem instantly.
                </p>
              </div>
            </div>

            {/* Benefits List */}
            <div className="space-y-4">
              {benefits.map((benefit, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-4 p-4 rounded-xl bg-base-100/60 backdrop-blur-sm border border-base-300/50 hover:border-secondary/30 transition-all duration-300 hover:translate-x-2 group animate-fadeInUp"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className="p-3 rounded-lg bg-secondary/10 text-secondary group-hover:scale-110 transition-transform duration-300">
                    <benefit.icon className="text-xl" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base-content group-hover:text-secondary transition-colors">
                      {benefit.title}
                    </h3>
                    <p className="text-sm text-base-content/60 mt-0.5">
                      {benefit.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Links */}
            <div className="flex items-center gap-6 pt-4">
              <Link
                to="/login"
                className="text-sm text-base-content/70 hover:text-secondary transition-colors inline-flex items-center gap-2 group"
              >
                <FaSignInAlt className="group-hover:scale-110 transition-transform" />
                <span>Already have account?</span>
              </Link>
              <div className="w-px h-6 bg-base-300"></div>
              <Link
                to="/signup"
                className="text-sm text-base-content/70 hover:text-secondary transition-colors inline-flex items-center gap-2 group"
              >
                <FaSchool className="group-hover:scale-110 transition-transform" />
                <span>Create Organization</span>
              </Link>
            </div>
          </div>

          {/* Right Panel - Register Form */}
          <div className="w-full animate-fadeInUp" style={{ animationDelay: "200ms" }}>
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-6">
              <div className="inline-block">
                <Logo size="lg" showText={true} linkTo="/" />
              </div>
              <h1 className="text-2xl font-bold text-base-content mt-4">
                Create Account
              </h1>
              <p className="text-base-content/60 text-sm mt-2">
                Join your school's digital platform
              </p>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="mb-4 p-4 bg-error/10 border border-error/20 rounded-xl text-error text-sm flex items-start gap-3 animate-shake">
                <div className="text-lg">⚠️</div>
                <div className="flex-1">{error}</div>
              </div>
            )}

            {/* Form Card */}
            <div className="bg-base-100 rounded-2xl shadow-2xl border border-base-300/50 p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden">
              {/* Decorative Corner Gradient */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-secondary/10 to-transparent rounded-bl-full blur-2xl pointer-events-none"></div>

              <form onSubmit={handleSubmit} className="space-y-5 relative">
                {/* Header */}
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-base-content flex items-center gap-2">
                    <FaUserPlus className="text-secondary" />
                    Create Your Account
                  </h2>
                  <p className="text-sm text-base-content/60 mt-1">
                    Fill in your details to get started
                  </p>
                </div>

                {/* Name */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium text-base-content">
                      Full Name <span className="text-error">*</span>
                    </span>
                  </label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-base-content/40 group-focus-within:text-secondary transition-colors pointer-events-none">
                      <FaUser />
                    </div>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      required
                      className="input input-bordered w-full pl-11 pr-4 bg-base-100 border-2 border-base-300 focus:border-secondary focus:outline-none focus:ring-4 focus:ring-secondary/10 transition-all duration-300 hover:border-base-content/20"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium text-base-content">
                      Email Address <span className="text-error">*</span>
                    </span>
                  </label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-base-content/40 group-focus-within:text-secondary transition-colors pointer-events-none">
                      <FaEnvelope />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className="input input-bordered w-full pl-11 pr-4 bg-base-100 border-2 border-base-300 focus:border-secondary focus:outline-none focus:ring-4 focus:ring-secondary/10 transition-all duration-300 hover:border-base-content/20"
                    />
                  </div>
                </div>

                {/* Password Fields - Two Column */}
                <div className="grid sm:grid-cols-2 gap-4">
                  {/* Password */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium text-base-content">
                        Password <span className="text-error">*</span>
                      </span>
                    </label>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-base-content/40 group-focus-within:text-secondary transition-colors pointer-events-none">
                        <FaLock />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Min. 6 characters"
                        required
                        className="input input-bordered w-full pl-11 pr-4 bg-base-100 border-2 border-base-300 focus:border-secondary focus:outline-none focus:ring-4 focus:ring-secondary/10 transition-all duration-300 hover:border-base-content/20"
                      />
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium text-base-content">
                        Confirm <span className="text-error">*</span>
                      </span>
                    </label>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-base-content/40 group-focus-within:text-secondary transition-colors pointer-events-none">
                        <FaLock />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repeat password"
                        required
                        className="input input-bordered w-full pl-11 pr-4 bg-base-100 border-2 border-base-300 focus:border-secondary focus:outline-none focus:ring-4 focus:ring-secondary/10 transition-all duration-300 hover:border-base-content/20"
                      />
                    </div>
                  </div>
                </div>

                {/* Show Password Toggle */}
                <div className="form-control">
                  <label className="label cursor-pointer justify-start gap-3">
                    <input
                      type="checkbox"
                      checked={showPassword}
                      onChange={() => setShowPassword(!showPassword)}
                      className="checkbox checkbox-sm checkbox-secondary"
                    />
                    <span className="label-text text-base-content/70 text-sm flex items-center gap-2">
                      {showPassword ? <FaEye /> : <FaEyeSlash />}
                      Show passwords
                    </span>
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-secondary w-full text-base gap-2 shadow-lg shadow-secondary/20 hover:shadow-xl hover:shadow-secondary/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 group mt-6"
                >
                  {loading ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <FaUserPlus className="group-hover:scale-110 transition-transform" />
                      <span>Create Account</span>
                    </>
                  )}
                </button>

                {/* Info Notice */}
                <div className="alert bg-secondary/5 border border-secondary/10 rounded-xl p-3 mt-4">
                  <div className="flex items-start gap-2 text-xs text-base-content/70">
                    <FaCheckCircle className="text-success flex-shrink-0 mt-0.5" />
                    <span>By creating an account, you'll be able to join your school once an administrator adds you to the system.</span>
                  </div>
                </div>
              </form>
            </div>

            {/* Footer Links */}
            <div className="text-center mt-6 space-y-3">
              <p className="text-sm text-base-content/60">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-secondary hover:text-secondary/80 font-medium inline-flex items-center gap-1 group"
                >
                  <span>Sign In</span>
                  <FaSignInAlt className="group-hover:translate-x-1 transition-transform text-xs" />
                </Link>
              </p>
              <p className="text-sm text-base-content/60">
                Want to create a school?{" "}
                <Link
                  to="/signup"
                  className="text-success hover:text-success/80 font-medium inline-flex items-center gap-1 group"
                >
                  <span>Organization Signup</span>
                  <FaSchool className="group-hover:scale-110 transition-transform text-xs" />
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-20px) scale(1.05); }
        }

        @keyframes float-reverse {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(20px) scale(1.05); }
        }

        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }

        .animate-float { animation: float 8s ease-in-out infinite; }
        .animate-float-reverse { animation: float-reverse 10s ease-in-out infinite; }
        .animate-gradient { animation: gradient 3s ease infinite; }
        .animate-shake { animation: shake 0.5s ease-in-out; }
      `}</style>
    </div>
  );
};

export default Register;
