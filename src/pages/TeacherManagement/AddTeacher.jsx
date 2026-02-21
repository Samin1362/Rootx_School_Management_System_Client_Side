import { useState } from "react";
import { useNavigate } from "react-router";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import { useNotification } from "../../contexts/NotificationContext";
import {
  FaArrowLeft,
  FaChalkboardTeacher,
  FaUserTie,
  FaEnvelope,
  FaPhone,
  FaIdCard,
  FaGraduationCap,
  FaBrain,
  FaCalendar,
  FaBriefcase,
  FaCheckCircle,
  FaLock,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";

const AddTeacher = () => {
  const axiosSecure = useAxiosSecure();
  const navigate = useNavigate();
  const { success, error: showError } = useNotification();
  const [saving, setSaving] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    employeeId: "",
    qualification: "",
    specialization: "",
    joiningDate: new Date().toISOString().split("T")[0],
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email) {
      showError("Name and email are required");
      return;
    }
    if (!password) {
      showError("Password is required");
      return;
    }
    if (password.length < 6) {
      showError("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      showError("Passwords do not match");
      return;
    }

    setSaving(true);
    try {
      const res = await axiosSecure.post("/teachers", { ...form, password });
      if (res.data.success) {
        success("Teacher created successfully");
        navigate("/dashboard/teachers");
      }
    } catch (err) {
      showError(err.response?.data?.message || "Failed to create teacher");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-10 animate-in fade-in duration-500">

      {/* ── Animated background blobs ── */}
      <div className="fixed top-0 right-0 w-96 h-96 bg-linear-to-br from-secondary/20 via-primary/20 to-accent/20 rounded-full blur-3xl animate-pulse pointer-events-none opacity-30" />
      <div className="fixed bottom-0 left-0 w-72 h-72 bg-linear-to-tr from-info/20 via-success/20 to-secondary/20 rounded-full blur-3xl animate-pulse pointer-events-none opacity-30 animation-delay-2000" />

      {/* ── Gradient Banner Header ── */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-secondary via-secondary/90 to-primary p-6 sm:p-8 shadow-lg">
        {/* SVG dot pattern overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAtNi42MjcgNS4zNzMtMTIgMTItMTJzMTIgNS4zNzMgMTIgMTItNS4zNzMgMTItMTIgMTItMTItNS4zNzMtMTItMTJ6bS0xMiAxMmMwLTYuNjI3IDUuMzczLTEyIDEyLTEyczEyIDUuMzczIDEyIDEyLTUuMzczIDEyLTEyIDEyLTEyLTUuMzczLTEyLTEyem0wIDI0YzAtNi42MjcgNS4zNzMtMTIgMTItMTJzMTIgNS4zNzMgMTIgMTItNS4zNzMgMTItMTIgMTItMTItNS4zNzMtMTItMTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-10" />

        <div className="relative flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
          {/* Back button */}
          <button
            onClick={() => navigate("/dashboard/teachers")}
            className="self-start btn btn-circle bg-white/10 hover:bg-white/20 border-white/20 text-white backdrop-blur-sm transition-all duration-300 hover:scale-110"
          >
            <FaArrowLeft className="text-lg" />
          </button>

          {/* Icon + Title */}
          <div className="flex items-center gap-4">
            <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl shadow-lg animate-bounce-slow">
              <FaChalkboardTeacher className="text-3xl sm:text-4xl text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                Add New Teacher
              </h1>
              <p className="text-white/70 text-sm mt-1">
                Register a new teacher to your institution
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Form Card ── */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-base-100 to-base-200/50 border border-base-300/50 shadow-xl">
        {/* Animated gradient top border */}
        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-secondary via-primary to-accent animate-gradient-x" />

        <div className="p-5 sm:p-8 lg:p-10">
          <form onSubmit={handleSubmit} className="space-y-10">

            {/* ──── PERSONAL INFORMATION ──── */}
            <fieldset
              className="space-y-6 animate-in slide-in-from-bottom duration-500"
              style={{ animationDelay: "100ms" }}
            >
              <legend className="flex items-center gap-3 pb-4 border-b border-base-300/50 w-full">
                <span className="p-2.5 rounded-xl bg-linear-to-br from-secondary/20 to-primary/20">
                  <FaUserTie className="text-secondary text-lg" />
                </span>
                <span className="text-lg font-bold text-base-content">
                  Personal Information
                </span>
              </legend>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
                {/* Full Name */}
                <div className="form-control">
                  <label className="label pb-1.5">
                    <span className="label-text font-semibold flex items-center gap-2 text-base-content/80">
                      <FaUserTie className="text-secondary text-xs" />
                      Full Name <span className="text-error">*</span>
                    </span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    className="input input-bordered w-full bg-base-100/50 backdrop-blur-sm border-secondary/30 focus:border-secondary transition-all duration-300 hover:scale-[1.01]"
                    placeholder="Enter teacher's full name"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Email */}
                <div className="form-control">
                  <label className="label pb-1.5">
                    <span className="label-text font-semibold flex items-center gap-2 text-base-content/80">
                      <FaEnvelope className="text-secondary text-xs" />
                      Email Address <span className="text-error">*</span>
                    </span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    className="input input-bordered w-full bg-base-100/50 backdrop-blur-sm border-secondary/30 focus:border-secondary transition-all duration-300 hover:scale-[1.01]"
                    placeholder="teacher@example.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Phone (full width) */}
                <div className="form-control sm:col-span-2">
                  <label className="label pb-1.5">
                    <span className="label-text font-semibold flex items-center gap-2 text-base-content/80">
                      <FaPhone className="text-secondary text-xs" />
                      Phone Number
                    </span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    className="input input-bordered w-full bg-base-100/50 backdrop-blur-sm border-primary/30 focus:border-primary transition-all duration-300 hover:scale-[1.005]"
                    placeholder="e.g., +880..."
                    value={form.phone}
                    onChange={handleChange}
                  />
                </div>

                {/* Password */}
                <div className="form-control">
                  <label className="label pb-1.5">
                    <span className="label-text font-semibold flex items-center gap-2 text-base-content/80">
                      <FaLock className="text-secondary text-xs" />
                      Login Password <span className="text-error">*</span>
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="input input-bordered w-full pr-12 bg-base-100/50 backdrop-blur-sm border-secondary/30 focus:border-secondary transition-all duration-300 hover:scale-[1.01]"
                      placeholder="Min. 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-secondary transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="form-control">
                  <label className="label pb-1.5">
                    <span className="label-text font-semibold flex items-center gap-2 text-base-content/80">
                      <FaLock className="text-secondary text-xs" />
                      Confirm Password <span className="text-error">*</span>
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirm ? "text" : "password"}
                      className={`input input-bordered w-full pr-12 bg-base-100/50 backdrop-blur-sm transition-all duration-300 hover:scale-[1.01] ${
                        confirmPassword && confirmPassword !== password
                          ? "border-error focus:border-error"
                          : "border-secondary/30 focus:border-secondary"
                      }`}
                      placeholder="Re-enter password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-secondary transition-colors"
                      onClick={() => setShowConfirm(!showConfirm)}
                    >
                      {showConfirm ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {confirmPassword && confirmPassword !== password && (
                    <p className="text-error text-xs mt-1">Passwords do not match</p>
                  )}
                </div>
              </div>
            </fieldset>

            {/* ── Section Divider ── */}
            <div className="divider text-base-content/30">
              <span className="badge badge-secondary badge-lg gap-2 font-semibold px-4 py-3 shadow-md shadow-secondary/20">
                <FaBriefcase />
                Professional Details
              </span>
            </div>

            {/* ──── PROFESSIONAL INFORMATION ──── */}
            <fieldset
              className="space-y-6 animate-in slide-in-from-bottom duration-500"
              style={{ animationDelay: "200ms" }}
            >
              <legend className="flex items-center gap-3 pb-4 border-b border-base-300/50 w-full">
                <span className="p-2.5 rounded-xl bg-linear-to-br from-secondary/20 to-primary/20">
                  <FaChalkboardTeacher className="text-secondary text-lg" />
                </span>
                <span className="text-lg font-bold text-base-content">
                  Professional Information
                </span>
              </legend>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
                {/* Employee ID */}
                <div className="form-control">
                  <label className="label pb-1.5">
                    <span className="label-text font-semibold flex items-center gap-2 text-base-content/80">
                      <FaIdCard className="text-secondary text-xs" />
                      Employee ID
                    </span>
                  </label>
                  <input
                    type="text"
                    name="employeeId"
                    className="input input-bordered w-full bg-base-100/50 backdrop-blur-sm border-secondary/30 focus:border-secondary transition-all duration-300 hover:scale-[1.01]"
                    placeholder="e.g., TCH-001"
                    value={form.employeeId}
                    onChange={handleChange}
                  />
                </div>

                {/* Joining Date */}
                <div className="form-control">
                  <label className="label pb-1.5">
                    <span className="label-text font-semibold flex items-center gap-2 text-base-content/80">
                      <FaCalendar className="text-secondary text-xs" />
                      Joining Date
                    </span>
                  </label>
                  <input
                    type="date"
                    name="joiningDate"
                    className="input input-bordered w-full bg-base-100/50 backdrop-blur-sm border-primary/30 focus:border-primary transition-all duration-300 hover:scale-[1.01]"
                    value={form.joiningDate}
                    onChange={handleChange}
                  />
                </div>

                {/* Qualification */}
                <div className="form-control">
                  <label className="label pb-1.5">
                    <span className="label-text font-semibold flex items-center gap-2 text-base-content/80">
                      <FaGraduationCap className="text-secondary text-xs" />
                      Qualification
                    </span>
                  </label>
                  <input
                    type="text"
                    name="qualification"
                    className="input input-bordered w-full bg-base-100/50 backdrop-blur-sm border-accent/30 focus:border-accent transition-all duration-300 hover:scale-[1.01]"
                    placeholder="e.g., M.Sc in Mathematics"
                    value={form.qualification}
                    onChange={handleChange}
                  />
                </div>

                {/* Specialization */}
                <div className="form-control">
                  <label className="label pb-1.5">
                    <span className="label-text font-semibold flex items-center gap-2 text-base-content/80">
                      <FaBrain className="text-secondary text-xs" />
                      Specialization
                    </span>
                  </label>
                  <input
                    type="text"
                    name="specialization"
                    className="input input-bordered w-full bg-base-100/50 backdrop-blur-sm border-accent/30 focus:border-accent transition-all duration-300 hover:scale-[1.01]"
                    placeholder="e.g., Advanced Calculus"
                    value={form.specialization}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </fieldset>

            {/* ──── FORM ACTIONS ──── */}
            <div
              className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6 border-t border-base-300/50 animate-in slide-in-from-bottom duration-500"
              style={{ animationDelay: "300ms" }}
            >
              <button
                type="button"
                className="btn btn-ghost hover:bg-secondary/10 hover:text-secondary transition-all duration-300 hover:scale-105"
                onClick={() => navigate("/dashboard/teachers")}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn bg-linear-to-r from-secondary to-secondary/80 text-secondary-content border-none gap-2 shadow-lg shadow-secondary/25 hover:shadow-xl hover:shadow-secondary/40 hover:scale-105 transition-all duration-300"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <span className="loading loading-spinner loading-sm" />
                    Creating Teacher...
                  </>
                ) : (
                  <>
                    <FaCheckCircle />
                    Create Teacher
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Required fields note */}
      <p className="text-center text-sm text-base-content/40 pb-2">
        Fields marked with <span className="text-error font-semibold">*</span>{" "}
        are required
      </p>

      <style>{`
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 3s ease infinite;
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s infinite;
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
};

export default AddTeacher;
