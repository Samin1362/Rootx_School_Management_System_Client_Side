import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import useAuth from "../../hooks/useAuth";
import Logo from "../../components/Logo";
import {
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaSignInAlt,
  FaShieldAlt,
  FaRocket,
  FaBolt,
  FaCheckCircle,
  FaUserPlus,
  FaSchool,
} from "react-icons/fa";

const Login = () => {
  const { signInUser } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation("auth");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showRegisterHint, setShowRegisterHint] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { dbUser } = await signInUser(email, password);

      // Check if user is super admin using the returned dbUser
      if (dbUser?.isSuperAdmin === true || dbUser?.role === "super_admin") {
        navigate("/dashboard/super-admin");
      } else {
        navigate("/dashboard/overview");
      }
    } catch (err) {
      console.error("Login error:", err);
      const code = err.code;

      switch (code) {
        case "auth/user-not-found":
        case "auth/wrong-password":
        case "auth/invalid-credential":
        case "auth/invalid-email":
          setError("Invalid email or password. Please check your credentials and try again.");
          setShowRegisterHint(true);
          break;
        case "auth/too-many-requests":
          setError("Too many failed login attempts. Please try again later or reset your password.");
          break;
        case "auth/user-disabled":
          setError("This account has been disabled. Please contact support.");
          break;
        case "auth/network-request-failed":
          setError("Network error. Please check your internet connection and try again.");
          break;
        default:
          setError(err.message || "Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Features for left panel
  const features = [
    {
      icon: FaShieldAlt,
      title: "Secure Access",
      desc: "Enterprise-grade security for your data",
    },
    {
      icon: FaRocket,
      title: "Lightning Fast",
      desc: "Optimized performance for smooth experience",
    },
    {
      icon: FaBolt,
      title: "Real-time Updates",
      desc: "Stay connected with instant notifications",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-100 via-primary/5 to-base-100 flex items-center justify-center p-4 overflow-hidden relative">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-float-reverse"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-accent/5 rounded-full blur-2xl animate-pulse-slow"></div>
      </div>

      {/* Main Content Container */}
      <div className="w-full max-w-6xl relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Panel - Branding & Features */}
          <div className="hidden lg:flex flex-col space-y-8 animate-fadeInUp">
            {/* Logo & Heading */}
            <div className="space-y-6">
              <div className="inline-block">
                <Logo size="lg" showText={true} linkTo="/" />
              </div>
              <div className="space-y-3">
                <h1 className="text-4xl xl:text-5xl font-bold text-base-content leading-tight">
                  Welcome Back to
                  <span className="block text-primary mt-1 animate-gradient bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent bg-[length:200%_auto]">
                    Your Dashboard
                  </span>
                </h1>
                <p className="text-base-content/70 text-lg leading-relaxed">
                  Access your school management system and continue making education excellence a reality.
                </p>
              </div>
            </div>

            {/* Features List */}
            <div className="space-y-4">
              {features.map((feature, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-4 p-4 rounded-xl bg-base-100/60 backdrop-blur-sm border border-base-300/50 hover:border-primary/30 transition-all duration-300 hover:translate-x-2 group animate-fadeInUp"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className="p-3 rounded-lg bg-primary/10 text-primary group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="text-xl" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base-content group-hover:text-primary transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-base-content/60 mt-0.5">
                      {feature.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Links */}
            <div className="flex items-center gap-6 pt-4">
              <Link
                to="/signup"
                className="text-sm text-base-content/70 hover:text-primary transition-colors inline-flex items-center gap-2 group"
              >
                <FaSchool className="group-hover:scale-110 transition-transform" />
                <span>Create Organization</span>
              </Link>
              <div className="w-px h-6 bg-base-300"></div>
              <Link
                to="/register"
                className="text-sm text-base-content/70 hover:text-primary transition-colors inline-flex items-center gap-2 group"
              >
                <FaUserPlus className="group-hover:scale-110 transition-transform" />
                <span>Join as Member</span>
              </Link>
            </div>
          </div>

          {/* Right Panel - Login Form */}
          <div className="w-full animate-fadeInUp" style={{ animationDelay: "200ms" }}>
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-6">
              <div className="inline-block">
                <Logo size="lg" showText={true} linkTo="/" />
              </div>
              <h1 className="text-2xl font-bold text-base-content mt-4">
                Welcome Back
              </h1>
              <p className="text-base-content/60 text-sm mt-2">
                Sign in to your account
              </p>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="mb-4 p-4 bg-error/10 border border-error/20 rounded-xl text-error text-sm flex items-start gap-3 animate-shake">
                <div className="text-lg">⚠️</div>
                <div className="flex-1">
                  <p>{error}</p>
                  {showRegisterHint && (
                    <div className="mt-3 pt-3 border-t border-error/20">
                      <p className="font-semibold mb-1">Don't have an account yet?</p>
                      <Link
                        to="/register"
                        className="text-primary hover:text-primary/80 font-medium inline-flex items-center gap-1 group"
                      >
                        <span>Register here to create a new account</span>
                        <FaUserPlus className="group-hover:translate-x-1 transition-transform text-xs" />
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Form Card */}
            <div className="bg-base-100 rounded-2xl shadow-2xl border border-base-300/50 p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden">
              {/* Decorative Corner Gradient */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-full blur-2xl pointer-events-none"></div>

              <form onSubmit={handleSubmit} className="space-y-5 relative">
                {/* Header */}
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-base-content flex items-center gap-2">
                    <FaSignInAlt className="text-primary" />
                    Sign In
                  </h2>
                  <p className="text-sm text-base-content/60 mt-1">
                    Enter your credentials to access your account
                  </p>
                </div>

                {/* Email */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium text-base-content">
                      Email Address <span className="text-error">*</span>
                    </span>
                  </label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-base-content/40 group-focus-within:text-primary transition-colors pointer-events-none">
                      <FaEnvelope />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@school.com"
                      required
                      className="input input-bordered w-full pl-11 pr-4 bg-base-100 border-2 border-base-300 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all duration-300 hover:border-base-content/20"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium text-base-content">
                      Password <span className="text-error">*</span>
                    </span>
                  </label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-base-content/40 group-focus-within:text-primary transition-colors pointer-events-none">
                      <FaLock />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                      className="input input-bordered w-full pl-11 pr-12 bg-base-100 border-2 border-base-300 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all duration-300 hover:border-base-content/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-primary transition-colors"
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary w-full text-base gap-2 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 group mt-6"
                >
                  {loading ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      <span>Signing In...</span>
                    </>
                  ) : (
                    <>
                      <FaSignInAlt className="group-hover:translate-x-1 transition-transform" />
                      <span>Sign In</span>
                    </>
                  )}
                </button>

                {/* Security Notice */}
                <div className="alert bg-primary/5 border border-primary/10 rounded-xl p-3 mt-4">
                  <div className="flex items-center gap-2 text-xs text-base-content/70">
                    <FaCheckCircle className="text-success flex-shrink-0" />
                    <span>Your connection is secure and encrypted</span>
                  </div>
                </div>
              </form>
            </div>

            {/* Footer Links */}
            <div className="text-center mt-6 space-y-3">
              <p className="text-sm text-base-content/60">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="text-primary hover:text-primary/80 font-medium inline-flex items-center gap-1 group"
                >
                  <span>Sign Up</span>
                  <FaUserPlus className="group-hover:translate-x-1 transition-transform text-xs" />
                </Link>
              </p>
              <p className="text-sm text-base-content/60">
                Need to create a school?{" "}
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

export default Login;
