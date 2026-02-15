import { useState } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import axios from "axios";
import useAuth from "../../hooks/useAuth";
import { API_BASE_URL } from "../../config/api";
import Logo from "../../components/Logo";
import {
  FaSchool,
  FaLink,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaUser,
  FaArrowRight,
  FaArrowLeft,
  FaCheckCircle,
  FaGraduationCap,
  FaChartLine,
  FaUsers,
} from "react-icons/fa";

const OrganizationSignup = () => {
  const { user, dbUser, refreshDbUser } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation("auth");

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    email: "",
    phone: "",
    address: "",
    ownerName: user?.displayName || "",
    ownerEmail: user?.email || "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Auto-generate slug from name
    if (name === "name") {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      setFormData((prev) => ({ ...prev, slug }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload = {
        ...formData,
        ownerFirebaseUid: user?.uid || "",
        ownerPhotoURL: user?.photoURL || "",
      };

      await axios.post(`${API_BASE_URL}/organizations`, payload);

      // Refresh DB user to get updated organizationId
      if (refreshDbUser) {
        await refreshDbUser();
      }

      navigate("/dashboard/overview");
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || t("registerFailed");
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // Features data
  const features = [
    {
      icon: FaUsers,
      title: "Student Management",
      desc: "Comprehensive student data tracking",
    },
    {
      icon: FaGraduationCap,
      title: "Grade Tracking",
      desc: "Monitor academic performance",
    },
    {
      icon: FaChartLine,
      title: "Analytics Dashboard",
      desc: "Real-time insights & reports",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-100 via-primary/5 to-base-100 flex items-center justify-center p-4 overflow-hidden relative">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating Circles */}
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
                  Transform Your
                  <span className="block text-primary mt-1 animate-gradient bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent bg-[length:200%_auto]">
                    School Management
                  </span>
                </h1>
                <p className="text-base-content/70 text-lg leading-relaxed">
                  Join thousands of schools using RootX to streamline operations, track performance, and empower education.
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

            {/* Trust Indicators */}
            <div className="flex items-center gap-8 pt-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">500+</div>
                <div className="text-sm text-base-content/60">Schools</div>
              </div>
              <div className="w-px h-12 bg-base-300"></div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">50K+</div>
                <div className="text-sm text-base-content/60">Students</div>
              </div>
              <div className="w-px h-12 bg-base-300"></div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">99.9%</div>
                <div className="text-sm text-base-content/60">Uptime</div>
              </div>
            </div>
          </div>

          {/* Right Panel - Form */}
          <div className="w-full animate-fadeInUp" style={{ animationDelay: "200ms" }}>
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-6">
              <div className="inline-block">
                <Logo size="lg" showText={true} linkTo="/" />
              </div>
              <h1 className="text-2xl font-bold text-base-content mt-4">
                Create Your School
              </h1>
              <p className="text-base-content/60 text-sm mt-2">
                Get started in just 2 simple steps
              </p>
            </div>

            {/* Progress Indicator */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                {[1, 2].map((s) => (
                  <div key={s} className="flex items-center flex-1">
                    <div
                      className={`relative flex items-center justify-center w-10 h-10 rounded-full font-semibold text-sm transition-all duration-500 ${
                        step >= s
                          ? "bg-primary text-primary-content scale-110 shadow-lg shadow-primary/30"
                          : "bg-base-200 text-base-content/40 scale-100"
                      }`}
                    >
                      {step > s ? (
                        <FaCheckCircle className="text-lg animate-scaleIn" />
                      ) : (
                        s
                      )}
                      {step === s && (
                        <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping"></div>
                      )}
                    </div>
                    {s < 2 && (
                      <div className="flex-1 mx-2 h-1 rounded-full bg-base-200 overflow-hidden">
                        <div
                          className={`h-full bg-primary transition-all duration-500 ${
                            step > s ? "w-full" : "w-0"
                          }`}
                        ></div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-between px-1">
                <span className={`text-xs font-medium transition-colors ${step >= 1 ? "text-primary" : "text-base-content/40"}`}>
                  School Info
                </span>
                <span className={`text-xs font-medium transition-colors ${step >= 2 ? "text-primary" : "text-base-content/40"}`}>
                  Owner Details
                </span>
              </div>
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
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-full blur-2xl pointer-events-none"></div>

              <form onSubmit={handleSubmit} className="relative">
                {/* Step 1: School Information */}
                {step === 1 && (
                  <div className="space-y-5 animate-slideIn">
                    <div className="mb-6">
                      <h2 className="text-xl font-bold text-base-content flex items-center gap-2">
                        <FaSchool className="text-primary" />
                        School Information
                      </h2>
                      <p className="text-sm text-base-content/60 mt-1">
                        Tell us about your institution
                      </p>
                    </div>

                    {/* School Name */}
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-medium text-base-content">
                          School Name <span className="text-error">*</span>
                        </span>
                      </label>
                      <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-base-content/40 group-focus-within:text-primary transition-colors pointer-events-none">
                          <FaSchool />
                        </div>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="e.g., Dhaka International School"
                          required
                          className="input input-bordered w-full pl-11 pr-4 bg-base-100 border-2 border-base-300 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all duration-300 hover:border-base-content/20"
                        />
                      </div>
                    </div>

                    {/* Slug */}
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-medium text-base-content">
                          School Identifier <span className="text-error">*</span>
                        </span>
                      </label>
                      <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-base-content/40 group-focus-within:text-primary transition-colors pointer-events-none">
                          <FaLink />
                        </div>
                        <input
                          type="text"
                          name="slug"
                          value={formData.slug}
                          onChange={handleChange}
                          placeholder="dhaka-international-school"
                          required
                          className="input input-bordered w-full pl-11 pr-4 bg-base-100 border-2 border-base-300 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all duration-300 hover:border-base-content/20 font-mono text-sm"
                        />
                      </div>
                      <label className="label">
                        <span className="label-text-alt text-base-content/50">
                          🔗 URL-friendly identifier (auto-generated)
                        </span>
                      </label>
                    </div>

                    {/* Two Column Layout for Email & Phone */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      {/* School Email */}
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text font-medium text-base-content">
                            Email <span className="text-error">*</span>
                          </span>
                        </label>
                        <div className="relative group">
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-base-content/40 group-focus-within:text-primary transition-colors pointer-events-none">
                            <FaEnvelope />
                          </div>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="admin@school.edu"
                            required
                            className="input input-bordered w-full pl-11 pr-4 bg-base-100 border-2 border-base-300 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all duration-300 hover:border-base-content/20"
                          />
                        </div>
                      </div>

                      {/* Phone */}
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text font-medium text-base-content">
                            Phone (Optional)
                          </span>
                        </label>
                        <div className="relative group">
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-base-content/40 group-focus-within:text-primary transition-colors pointer-events-none">
                            <FaPhone />
                          </div>
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="+880 1XXX-XXXXXX"
                            className="input input-bordered w-full pl-11 pr-4 bg-base-100 border-2 border-base-300 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all duration-300 hover:border-base-content/20"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Address */}
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-medium text-base-content">
                          Address (Optional)
                        </span>
                      </label>
                      <div className="relative group">
                        <div className="absolute left-4 top-4 text-base-content/40 group-focus-within:text-primary transition-colors pointer-events-none">
                          <FaMapMarkerAlt />
                        </div>
                        <textarea
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          placeholder="123 School Street, Dhaka"
                          rows={2}
                          className="textarea textarea-bordered w-full pl-11 pr-4 bg-base-100 border-2 border-base-300 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all duration-300 hover:border-base-content/20 resize-none"
                        />
                      </div>
                    </div>

                    {/* Next Button */}
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      disabled={!formData.name || !formData.slug || !formData.email}
                      className="btn btn-primary w-full text-base gap-2 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 group"
                    >
                      <span>Continue to Next Step</span>
                      <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                )}

                {/* Step 2: Owner Information */}
                {step === 2 && (
                  <div className="space-y-5 animate-slideIn">
                    <div className="mb-6">
                      <h2 className="text-xl font-bold text-base-content flex items-center gap-2">
                        <FaUser className="text-primary" />
                        Owner Information
                      </h2>
                      <p className="text-sm text-base-content/60 mt-1">
                        Your account details as school administrator
                      </p>
                    </div>

                    {/* Owner Name */}
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-medium text-base-content">
                          Full Name <span className="text-error">*</span>
                        </span>
                      </label>
                      <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-base-content/40 group-focus-within:text-primary transition-colors pointer-events-none">
                          <FaUser />
                        </div>
                        <input
                          type="text"
                          name="ownerName"
                          value={formData.ownerName}
                          onChange={handleChange}
                          placeholder="Your full name"
                          required
                          className="input input-bordered w-full pl-11 pr-4 bg-base-100 border-2 border-base-300 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all duration-300 hover:border-base-content/20"
                        />
                      </div>
                    </div>

                    {/* Owner Email */}
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
                          name="ownerEmail"
                          value={formData.ownerEmail}
                          onChange={handleChange}
                          placeholder="you@example.com"
                          required
                          className="input input-bordered w-full pl-11 pr-4 bg-base-100 border-2 border-base-300 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all duration-300 hover:border-base-content/20"
                        />
                      </div>
                      {user?.email && (
                        <label className="label">
                          <span className="label-text-alt text-base-content/50 flex items-center gap-1">
                            <FaCheckCircle className="text-success" /> Pre-filled from your account
                          </span>
                        </label>
                      )}
                    </div>

                    {/* Info Card */}
                    <div className="alert bg-primary/10 border border-primary/20 rounded-xl p-4">
                      <div className="flex gap-3">
                        <div className="text-primary text-xl">
                          <FaCheckCircle />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-base-content text-sm mb-2">
                            What happens next:
                          </h3>
                          <ul className="text-xs text-base-content/70 space-y-1.5">
                            <li className="flex items-start gap-2">
                              <span className="text-primary mt-0.5">•</span>
                              <span>14-day free trial with full access</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-primary mt-0.5">•</span>
                              <span>You'll be assigned as school owner</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-primary mt-0.5">•</span>
                              <span>Instant access to add students & staff</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="btn btn-outline flex-1 gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 group"
                      >
                        <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                        <span>Back</span>
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary flex-1 gap-2 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                      >
                        {loading ? (
                          <>
                            <span className="loading loading-spinner loading-sm"></span>
                            <span>Creating...</span>
                          </>
                        ) : (
                          <>
                            <FaSchool />
                            <span>Create School</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </form>
            </div>

            {/* Footer Link */}
            <div className="text-center mt-6">
              <button
                onClick={() => navigate(-1)}
                className="text-sm text-base-content/60 hover:text-base-content transition-colors inline-flex items-center gap-2 group"
              >
                <FaArrowLeft className="group-hover:-translate-x-1 transition-transform text-xs" />
                <span>Go back</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Animations */}
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

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }

        @keyframes scaleIn {
          from {
            transform: scale(0);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        .animate-float { animation: float 8s ease-in-out infinite; }
        .animate-float-reverse { animation: float-reverse 10s ease-in-out infinite; }
        .animate-gradient { animation: gradient 3s ease infinite; }
        .animate-slideIn { animation: slideIn 0.5s ease-out; }
        .animate-shake { animation: shake 0.5s ease-in-out; }
        .animate-scaleIn { animation: scaleIn 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default OrganizationSignup;
