import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import { useNotification } from "../../contexts/NotificationContext";
import Loader from "../../components/Loader";
import {
  FaArrowLeft,
  FaFileAlt,
  FaSchool,
  FaCalendarAlt,
  FaCalendarCheck,
  FaToggleOn,
  FaCheckCircle,
  FaLayerGroup,
  FaClock,
} from "react-icons/fa";

const AddExam = () => {
  const axiosSecure = useAxiosSecure();
  const navigate = useNavigate();
  const { examId } = useParams();
  const { success, error: showError } = useNotification();

  const isEditing = !!examId;
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [classes, setClasses] = useState([]);

  const [form, setForm] = useState({
    name: "",
    classId: "",
    academicYear: new Date().getFullYear().toString(),
    startDate: "",
    endDate: "",
    status: "upcoming",
  });

  // Fetch classes for the dropdown
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await axiosSecure.get("/classes");
        if (res.data.success) {
          setClasses(res.data.data.filter((c) => c.status === "active"));
        }
      } catch {
        showError("Failed to load classes");
      }
    };
    fetchClasses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch exam data when editing
  useEffect(() => {
    if (!isEditing) return;
    const fetchExam = async () => {
      try {
        const res = await axiosSecure.get(`/exams/${examId}`);
        if (res.data.success) {
          const exam = res.data.data;
          setForm({
            name: exam.name,
            classId: String(exam.classId),
            academicYear: exam.academicYear,
            startDate: new Date(exam.startDate).toISOString().split("T")[0],
            endDate: new Date(exam.endDate).toISOString().split("T")[0],
            status: exam.status,
          });
        }
      } catch (err) {
        showError(err.response?.data?.message || "Failed to load exam");
        navigate("/dashboard/exams");
      } finally {
        setLoading(false);
      }
    };
    fetchExam();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examId]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.academicYear || !form.startDate || !form.endDate) {
      showError("Please fill all required fields");
      return;
    }
    if (!isEditing && !form.classId) {
      showError("Please select a class");
      return;
    }
    if (new Date(form.startDate) > new Date(form.endDate)) {
      showError("Start date must be before or equal to end date");
      return;
    }

    setSaving(true);
    try {
      if (isEditing) {
        const payload = {
          name: form.name,
          academicYear: form.academicYear,
          startDate: form.startDate,
          endDate: form.endDate,
          status: form.status,
        };
        const res = await axiosSecure.patch(`/exams/${examId}`, payload);
        if (res.data.success) {
          success("Exam updated successfully");
          navigate("/dashboard/exams");
        }
      } else {
        const payload = {
          name: form.name,
          classId: form.classId,
          academicYear: form.academicYear,
          startDate: form.startDate,
          endDate: form.endDate,
        };
        const res = await axiosSecure.post("/exams", payload);
        if (res.data.success) {
          success("Exam created successfully");
          navigate("/dashboard/exams");
        }
      }
    } catch (err) {
      showError(err.response?.data?.message || "Failed to save exam");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader fullPage={false} message="Loading exam data..." />;

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
            onClick={() => navigate("/dashboard/exams")}
            className="self-start btn btn-circle bg-white/10 hover:bg-white/20 border-white/20 text-white backdrop-blur-sm transition-all duration-300 hover:scale-110"
          >
            <FaArrowLeft className="text-lg" />
          </button>

          {/* Icon + Title */}
          <div className="flex items-center gap-4">
            <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl shadow-lg animate-bounce-slow">
              <FaFileAlt className="text-3xl sm:text-4xl text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                {isEditing ? "Edit Exam" : "Create New Exam"}
              </h1>
              <p className="text-white/70 text-sm mt-1">
                {isEditing
                  ? "Update examination details for your organization"
                  : "Schedule a new examination for your students"}
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

            {/* ──── EXAM DETAILS ──── */}
            <fieldset
              className="space-y-6 animate-in slide-in-from-bottom duration-500"
              style={{ animationDelay: "100ms" }}
            >
              <legend className="flex items-center gap-3 pb-4 border-b border-base-300/50 w-full">
                <span className="p-2.5 rounded-xl bg-linear-to-br from-primary/20 to-secondary/20">
                  <FaLayerGroup className="text-primary text-lg" />
                </span>
                <span className="text-lg font-bold text-base-content">
                  Exam Details
                </span>
              </legend>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">

                {/* Exam Name */}
                <div className="form-control sm:col-span-2">
                  <label className="label pb-1.5">
                    <span className="label-text font-semibold flex items-center gap-2 text-base-content/80">
                      <FaFileAlt className="text-primary text-xs" />
                      Exam Name <span className="text-error">*</span>
                    </span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    className="input input-bordered w-full bg-base-100/50 backdrop-blur-sm border-primary/30 focus:border-primary transition-all duration-300 hover:scale-[1.01]"
                    placeholder="e.g., 1st Term Exam, Midterm 2026, Final Examination"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                  <label className="label pt-1">
                    <span className="label-text-alt text-base-content/40">
                      Enter a clear, descriptive name for this examination
                    </span>
                  </label>
                </div>

                {/* Class — disabled on edit */}
                <div className="form-control">
                  <label className="label pb-1.5">
                    <span className="label-text font-semibold flex items-center gap-2 text-base-content/80">
                      <FaSchool className="text-primary text-xs" />
                      Class <span className="text-error">*</span>
                    </span>
                  </label>
                  <select
                    name="classId"
                    className="select select-bordered w-full bg-base-100/50 backdrop-blur-sm border-primary/30 focus:border-primary transition-all duration-300 hover:scale-[1.01] disabled:opacity-60 disabled:cursor-not-allowed"
                    value={form.classId}
                    onChange={handleChange}
                    required={!isEditing}
                    disabled={isEditing}
                  >
                    <option value="">Select Class</option>
                    {classes.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  {isEditing && (
                    <label className="label pt-1">
                      <span className="label-text-alt text-base-content/40">
                        Class cannot be changed after creation
                      </span>
                    </label>
                  )}
                </div>

                {/* Academic Year */}
                <div className="form-control">
                  <label className="label pb-1.5">
                    <span className="label-text font-semibold flex items-center gap-2 text-base-content/80">
                      <FaCalendarAlt className="text-secondary text-xs" />
                      Academic Year <span className="text-error">*</span>
                    </span>
                  </label>
                  <input
                    type="text"
                    name="academicYear"
                    className="input input-bordered w-full bg-base-100/50 backdrop-blur-sm border-secondary/30 focus:border-secondary transition-all duration-300 hover:scale-[1.01]"
                    placeholder="e.g., 2026, 2026-2027"
                    value={form.academicYear}
                    onChange={handleChange}
                    required
                  />
                  <label className="label pt-1">
                    <span className="label-text-alt text-base-content/40">
                      The academic year this exam belongs to
                    </span>
                  </label>
                </div>

                {/* Status — only on edit */}
                {isEditing && (
                  <div className="form-control sm:col-span-2">
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
                      <option value="upcoming">Upcoming — Not yet started</option>
                      <option value="ongoing">Ongoing — Currently in progress</option>
                      <option value="completed">Completed — Exam has ended</option>
                    </select>
                    <label className="label pt-1">
                      <span className="label-text-alt text-base-content/40">
                        Status is auto-determined on creation based on the scheduled dates
                      </span>
                    </label>
                  </div>
                )}
              </div>
            </fieldset>

            {/* ── Section Divider ── */}
            <div className="divider text-base-content/30">
              <span className="badge badge-primary badge-lg gap-2 font-semibold px-4 py-3 shadow-md shadow-primary/20">
                <FaClock />
                Schedule
              </span>
            </div>

            {/* ──── SCHEDULE ──── */}
            <fieldset
              className="space-y-6 animate-in slide-in-from-bottom duration-500"
              style={{ animationDelay: "200ms" }}
            >
              <legend className="flex items-center gap-3 pb-4 border-b border-base-300/50 w-full">
                <span className="p-2.5 rounded-xl bg-linear-to-br from-primary/20 to-secondary/20">
                  <FaCalendarCheck className="text-primary text-lg" />
                </span>
                <span className="text-lg font-bold text-base-content">
                  Exam Schedule
                </span>
              </legend>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
                {/* Start Date */}
                <div className="form-control">
                  <label className="label pb-1.5">
                    <span className="label-text font-semibold flex items-center gap-2 text-base-content/80">
                      <FaCalendarAlt className="text-primary text-xs" />
                      Start Date <span className="text-error">*</span>
                    </span>
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    className="input input-bordered w-full bg-base-100/50 backdrop-blur-sm border-primary/30 focus:border-primary transition-all duration-300 hover:scale-[1.01]"
                    value={form.startDate}
                    onChange={handleChange}
                    required
                  />
                  <label className="label pt-1">
                    <span className="label-text-alt text-base-content/40">
                      The first day of this examination period
                    </span>
                  </label>
                </div>

                {/* End Date */}
                <div className="form-control">
                  <label className="label pb-1.5">
                    <span className="label-text font-semibold flex items-center gap-2 text-base-content/80">
                      <FaCalendarCheck className="text-secondary text-xs" />
                      End Date <span className="text-error">*</span>
                    </span>
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    className="input input-bordered w-full bg-base-100/50 backdrop-blur-sm border-secondary/30 focus:border-secondary transition-all duration-300 hover:scale-[1.01]"
                    value={form.endDate}
                    onChange={handleChange}
                    min={form.startDate || undefined}
                    required
                  />
                  <label className="label pt-1">
                    <span className="label-text-alt text-base-content/40">
                      The last day of this examination period
                    </span>
                  </label>
                </div>
              </div>
            </fieldset>

            {/* ── Info Tip ── */}
            {!isEditing && (
              <div
                className="rounded-2xl border border-info/20 bg-linear-to-r from-info/10 to-info/5 p-5 flex gap-4 items-start animate-in slide-in-from-bottom duration-500"
                style={{ animationDelay: "300ms" }}
              >
                <div className="p-2 rounded-xl bg-info/20 shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-info w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="text-sm">
                  <p className="font-semibold text-base-content mb-1">Quick Tip</p>
                  <p className="text-base-content/60">
                    The exam status (<span className="text-info font-medium">Upcoming / Ongoing / Completed</span>) is automatically determined based on the scheduled dates. Teachers can then submit grades against this exam from the{" "}
                    <span className="text-primary font-medium">Grade Entry</span> section.
                  </p>
                </div>
              </div>
            )}

            {/* ──── FORM ACTIONS ──── */}
            <div
              className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6 border-t border-base-300/50 animate-in slide-in-from-bottom duration-500"
              style={{ animationDelay: "400ms" }}
            >
              <button
                type="button"
                className="btn btn-ghost hover:bg-primary/10 hover:text-primary transition-all duration-300 hover:scale-105"
                onClick={() => navigate("/dashboard/exams")}
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
                    {isEditing ? "Updating Exam..." : "Creating Exam..."}
                  </>
                ) : (
                  <>
                    <FaCheckCircle />
                    {isEditing ? "Update Exam" : "Create Exam"}
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

export default AddExam;
