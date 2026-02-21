import { useState } from "react";
import { useNavigate } from "react-router";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import { useNotification } from "../../contexts/NotificationContext";
import {
  FaArrowLeft,
  FaGraduationCap,
  FaSchool,
  FaSortNumericDown,
  FaCalendarAlt,
  FaToggleOn,
  FaCheckCircle,
  FaLayerGroup,
} from "react-icons/fa";

const AddClass = () => {
  const axiosSecure = useAxiosSecure();
  const navigate = useNavigate();
  const { success, error: showError } = useNotification();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    numericLevel: "",
    academicYear: new Date().getFullYear().toString(),
    status: "active",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.numericLevel || !form.academicYear) {
      showError("Please fill all required fields");
      return;
    }

    setSaving(true);
    try {
      const res = await axiosSecure.post("/classes", form);
      if (res.data.success) {
        success("Class created successfully");
        navigate("/dashboard/classes");
      }
    } catch (err) {
      showError(err.response?.data?.message || "Failed to create class");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-10 animate-in fade-in duration-500">

      {/* ── Animated background blobs ── */}
      <div className="fixed top-0 right-0 w-96 h-96 bg-linear-to-br from-primary/20 via-secondary/20 to-accent/20 rounded-full blur-3xl animate-pulse pointer-events-none opacity-30" />
      <div className="fixed bottom-0 left-0 w-72 h-72 bg-linear-to-tr from-info/20 via-success/20 to-warning/20 rounded-full blur-3xl animate-pulse pointer-events-none opacity-30 animation-delay-2000" />

      {/* ── Gradient Banner Header ── */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-primary via-primary/90 to-secondary p-6 sm:p-8 shadow-lg">
        {/* SVG dot pattern overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAtNi42MjcgNS4zNzMtMTIgMTItMTJzMTIgNS4zNzMgMTIgMTItNS4zNzMgMTItMTIgMTItMTItNS4zNzMtMTItMTJ6bS0xMiAxMmMwLTYuNjI3IDUuMzczLTEyIDEyLTEyczEyIDUuMzczIDEyIDEyLTUuMzczIDEyLTEyIDEyLTEyLTUuMzczLTEyLTEyem0wIDI0YzAtNi42MjcgNS4zNzMtMTIgMTItMTJzMTIgNS4zNzMgMTIgMTItNS4zNzMgMTItMTIgMTItMTItNS4zNzMtMTItMTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-10" />

        <div className="relative flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
          {/* Back button */}
          <button
            onClick={() => navigate("/dashboard/classes")}
            className="self-start btn btn-circle bg-white/10 hover:bg-white/20 border-white/20 text-white backdrop-blur-sm transition-all duration-300 hover:scale-110"
          >
            <FaArrowLeft className="text-lg" />
          </button>

          {/* Icon + Title */}
          <div className="flex items-center gap-4">
            <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl shadow-lg animate-bounce-slow">
              <FaGraduationCap className="text-3xl sm:text-4xl text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                Create New Class
              </h1>
              <p className="text-white/70 text-sm mt-1">
                Add a new academic class to your organization
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Form Card ── */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-base-100 to-base-200/50 border border-base-300/50 shadow-xl">
        {/* Animated gradient top border */}
        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-primary via-secondary to-accent animate-gradient-x" />

        <div className="p-5 sm:p-8 lg:p-10">
          <form onSubmit={handleSubmit} className="space-y-10">

            {/* ──── CLASS DETAILS ──── */}
            <fieldset
              className="space-y-6 animate-in slide-in-from-bottom duration-500"
              style={{ animationDelay: "100ms" }}
            >
              <legend className="flex items-center gap-3 pb-4 border-b border-base-300/50 w-full">
                <span className="p-2.5 rounded-xl bg-linear-to-br from-primary/20 to-secondary/20">
                  <FaLayerGroup className="text-primary text-lg" />
                </span>
                <span className="text-lg font-bold text-base-content">
                  Class Details
                </span>
              </legend>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">

                {/* Class Name */}
                <div className="form-control">
                  <label className="label pb-1.5">
                    <span className="label-text font-semibold flex items-center gap-2 text-base-content/80">
                      <FaSchool className="text-primary text-xs" />
                      Class Name <span className="text-error">*</span>
                    </span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    className="input input-bordered w-full bg-base-100/50 backdrop-blur-sm border-primary/30 focus:border-primary transition-all duration-300 hover:scale-[1.01]"
                    placeholder="e.g., Class 1, HSC 1st Year, Grade 10"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                  <label className="label pt-1">
                    <span className="label-text-alt text-base-content/40">
                      Enter the official name of the class
                    </span>
                  </label>
                </div>

                {/* Numeric Level */}
                <div className="form-control">
                  <label className="label pb-1.5">
                    <span className="label-text font-semibold flex items-center gap-2 text-base-content/80">
                      <FaSortNumericDown className="text-secondary text-xs" />
                      Numeric Level <span className="text-error">*</span>
                    </span>
                  </label>
                  <input
                    type="number"
                    name="numericLevel"
                    className="input input-bordered w-full bg-base-100/50 backdrop-blur-sm border-secondary/30 focus:border-secondary transition-all duration-300 hover:scale-[1.01]"
                    placeholder="e.g., 1, 2, 10"
                    value={form.numericLevel}
                    onChange={handleChange}
                    min="1"
                    max="20"
                    required
                  />
                  <label className="label pt-1">
                    <span className="label-text-alt text-base-content/40">
                      Used for sorting (1 = lowest, higher = advanced)
                    </span>
                  </label>
                </div>

                {/* Academic Year */}
                <div className="form-control">
                  <label className="label pb-1.5">
                    <span className="label-text font-semibold flex items-center gap-2 text-base-content/80">
                      <FaCalendarAlt className="text-accent text-xs" />
                      Academic Year <span className="text-error">*</span>
                    </span>
                  </label>
                  <input
                    type="text"
                    name="academicYear"
                    className="input input-bordered w-full bg-base-100/50 backdrop-blur-sm border-accent/30 focus:border-accent transition-all duration-300 hover:scale-[1.01]"
                    placeholder="e.g., 2026, 2026-2027"
                    value={form.academicYear}
                    onChange={handleChange}
                    required
                  />
                  <label className="label pt-1">
                    <span className="label-text-alt text-base-content/40">
                      The academic year this class belongs to
                    </span>
                  </label>
                </div>

                {/* Status */}
                <div className="form-control">
                  <label className="label pb-1.5">
                    <span className="label-text font-semibold flex items-center gap-2 text-base-content/80">
                      <FaToggleOn className="text-info text-xs" />
                      Status
                    </span>
                  </label>
                  <select
                    name="status"
                    className="select select-bordered w-full bg-base-100/50 backdrop-blur-sm border-info/30 focus:border-info transition-all duration-300 hover:scale-[1.01]"
                    value={form.status}
                    onChange={handleChange}
                  >
                    <option value="active">Active — Currently in use</option>
                    <option value="archived">Archived — Past academic year</option>
                  </select>
                  <label className="label pt-1">
                    <span className="label-text-alt text-base-content/40">
                      Active classes appear in dropdowns and reports
                    </span>
                  </label>
                </div>
              </div>
            </fieldset>

            {/* ── Info Tip ── */}
            <div
              className="rounded-2xl border border-info/20 bg-linear-to-r from-info/10 to-info/5 p-5 flex gap-4 items-start animate-in slide-in-from-bottom duration-500"
              style={{ animationDelay: "200ms" }}
            >
              <div className="p-2 rounded-xl bg-info/20 shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-info w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-sm">
                <p className="font-semibold text-base-content mb-1">Quick Tip</p>
                <p className="text-base-content/60">
                  After creating a class, you can add <span className="text-primary font-medium">sections</span> and <span className="text-secondary font-medium">subjects</span> to build out your curriculum structure.
                </p>
              </div>
            </div>

            {/* ──── FORM ACTIONS ──── */}
            <div
              className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6 border-t border-base-300/50 animate-in slide-in-from-bottom duration-500"
              style={{ animationDelay: "300ms" }}
            >
              <button
                type="button"
                className="btn btn-ghost hover:bg-primary/10 hover:text-primary transition-all duration-300 hover:scale-105"
                onClick={() => navigate("/dashboard/classes")}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn bg-linear-to-r from-primary to-primary/80 text-primary-content border-none gap-2 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40 hover:scale-105 transition-all duration-300"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <span className="loading loading-spinner loading-sm" />
                    Creating Class...
                  </>
                ) : (
                  <>
                    <FaCheckCircle />
                    Create Class
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

export default AddClass;
