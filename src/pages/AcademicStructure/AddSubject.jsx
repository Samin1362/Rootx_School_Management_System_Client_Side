import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import { useNotification } from "../../contexts/NotificationContext";
import Loader from "../../components/Loader";
import {
  FaArrowLeft,
  FaBookOpen,
  FaSchool,
  FaChalkboardTeacher,
  FaHashtag,
  FaToggleOn,
  FaTrophy,
  FaCheckCircle,
  FaClipboardCheck,
} from "react-icons/fa";

const AddSubject = () => {
  const axiosSecure = useAxiosSecure();
  const navigate = useNavigate();
  const { success, error: showError } = useNotification();

  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    subjectCode: "",
    classId: "",
    teacherId: "",
    type: "mandatory",
    fullMarks: "100",
    passMarks: "33",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [classesRes, teachersRes] = await Promise.all([
          axiosSecure.get("/classes"),
          axiosSecure.get("/teachers").catch(() => ({ data: { data: [] } })),
        ]);
        if (classesRes.data.success) setClasses(classesRes.data.data);
        if (teachersRes.data?.data) setTeachers(teachersRes.data.data);
      } catch (err) {
        showError("Failed to load form data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.classId) {
      showError("Subject name and class are required");
      return;
    }

    setSaving(true);
    try {
      const payload = { ...form, teacherId: form.teacherId || null };
      const res = await axiosSecure.post("/subjects", payload);
      if (res.data.success) {
        success("Subject created successfully");
        navigate("/dashboard/subjects");
      }
    } catch (err) {
      showError(err.response?.data?.message || "Failed to create subject");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader fullPage={false} message="Loading form data..." />;

  return (
    <div className="space-y-6 sm:space-y-8 pb-10 animate-in fade-in duration-500">

      {/* ── Animated background blobs ── */}
      <div className="fixed top-0 right-0 w-96 h-96 bg-linear-to-br from-success/20 via-info/20 to-primary/20 rounded-full blur-3xl animate-pulse pointer-events-none opacity-30" />
      <div className="fixed bottom-0 left-0 w-72 h-72 bg-linear-to-tr from-accent/20 via-success/20 to-secondary/20 rounded-full blur-3xl animate-pulse pointer-events-none opacity-30 animation-delay-2000" />

      {/* ── Gradient Banner Header ── */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-success via-success/90 to-info p-6 sm:p-8 shadow-lg">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAtNi42MjcgNS4zNzMtMTIgMTItMTJzMTIgNS4zNzMgMTIgMTItNS4zNzMgMTItMTIgMTItMTItNS4zNzMtMTItMTJ6bS0xMiAxMmMwLTYuNjI3IDUuMzczLTEyIDEyLTEyczEyIDUuMzczIDEyIDEyLTUuMzczIDEyLTEyIDEyLTEyLTUuMzczLTEyLTEyem0wIDI0YzAtNi42MjcgNS4zNzMtMTIgMTItMTJzMTIgNS4zNzMgMTIgMTItNS4zNzMgMTItMTIgMTItMTItNS4zNzMtMTItMTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-10" />

        <div className="relative flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
          <button
            onClick={() => navigate("/dashboard/subjects")}
            className="self-start btn btn-circle bg-white/10 hover:bg-white/20 border-white/20 text-white backdrop-blur-sm transition-all duration-300 hover:scale-110"
          >
            <FaArrowLeft className="text-lg" />
          </button>

          <div className="flex items-center gap-4">
            <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl shadow-lg animate-bounce-slow">
              <FaBookOpen className="text-3xl sm:text-4xl text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                Add New Subject
              </h1>
              <p className="text-white/70 text-sm mt-1">
                Create a subject and assign it to a class and teacher
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Form Card ── */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-base-100 to-base-200/50 border border-base-300/50 shadow-xl">
        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-success via-info to-secondary animate-gradient-x" />

        <div className="p-5 sm:p-8 lg:p-10">
          <form onSubmit={handleSubmit} className="space-y-10">

            {/* ──── SUBJECT INFORMATION ──── */}
            <fieldset
              className="space-y-6 animate-in slide-in-from-bottom duration-500"
              style={{ animationDelay: "100ms" }}
            >
              <legend className="flex items-center gap-3 pb-4 border-b border-base-300/50 w-full">
                <span className="p-2.5 rounded-xl bg-linear-to-br from-success/20 to-info/20">
                  <FaBookOpen className="text-success text-lg" />
                </span>
                <span className="text-lg font-bold text-base-content">
                  Subject Information
                </span>
              </legend>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">

                {/* Subject Name */}
                <div className="form-control">
                  <label className="label pb-1.5">
                    <span className="label-text font-semibold flex items-center gap-2 text-base-content/80">
                      <FaBookOpen className="text-success text-xs" />
                      Subject Name <span className="text-error">*</span>
                    </span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    className="input input-bordered w-full bg-base-100/50 backdrop-blur-sm border-success/30 focus:border-success transition-all duration-300 hover:scale-[1.01]"
                    placeholder="e.g., Mathematics, Physics, English"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                  <label className="label pt-1">
                    <span className="label-text-alt text-base-content/40">
                      The full official name of the subject
                    </span>
                  </label>
                </div>

                {/* Subject Code */}
                <div className="form-control">
                  <label className="label pb-1.5">
                    <span className="label-text font-semibold flex items-center gap-2 text-base-content/80">
                      <FaHashtag className="text-success text-xs" />
                      Subject Code
                      <span className="text-base-content/40 font-normal text-xs">(optional)</span>
                    </span>
                  </label>
                  <input
                    type="text"
                    name="subjectCode"
                    className="input input-bordered w-full bg-base-100/50 backdrop-blur-sm border-success/30 focus:border-success transition-all duration-300 hover:scale-[1.01]"
                    placeholder="e.g., MATH-101, PHY-201"
                    value={form.subjectCode}
                    onChange={handleChange}
                  />
                  <label className="label pt-1">
                    <span className="label-text-alt text-base-content/40">
                      Must be unique within the selected class
                    </span>
                  </label>
                </div>

                {/* Class */}
                <div className="form-control">
                  <label className="label pb-1.5">
                    <span className="label-text font-semibold flex items-center gap-2 text-base-content/80">
                      <FaSchool className="text-info text-xs" />
                      Class <span className="text-error">*</span>
                    </span>
                  </label>
                  <select
                    name="classId"
                    className="select select-bordered w-full bg-base-100/50 backdrop-blur-sm border-info/30 focus:border-info transition-all duration-300 hover:scale-[1.01]"
                    value={form.classId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select a class</option>
                    {classes.map((cls) => (
                      <option key={cls._id} value={cls._id}>
                        {cls.name}
                      </option>
                    ))}
                  </select>
                  <label className="label pt-1">
                    <span className="label-text-alt text-base-content/40">
                      The class this subject will be taught in
                    </span>
                  </label>
                </div>

                {/* Teacher */}
                <div className="form-control">
                  <label className="label pb-1.5">
                    <span className="label-text font-semibold flex items-center gap-2 text-base-content/80">
                      <FaChalkboardTeacher className="text-info text-xs" />
                      Assigned Teacher
                      <span className="text-base-content/40 font-normal text-xs">(optional)</span>
                    </span>
                  </label>
                  <select
                    name="teacherId"
                    className="select select-bordered w-full bg-base-100/50 backdrop-blur-sm border-info/30 focus:border-info transition-all duration-300 hover:scale-[1.01]"
                    value={form.teacherId}
                    onChange={handleChange}
                  >
                    <option value="">No teacher assigned</option>
                    {teachers.map((t) => (
                      <option key={t._id} value={t._id}>
                        {t.user?.name || t.employeeId || "Teacher"}
                      </option>
                    ))}
                  </select>
                  <label className="label pt-1">
                    <span className="label-text-alt text-base-content/40">
                      Assigning a teacher links this subject to their profile
                    </span>
                  </label>
                </div>
              </div>
            </fieldset>

            {/* Divider */}
            <div className="divider text-base-content/30">
              <span className="badge badge-success badge-lg gap-2 font-semibold px-4 py-3 shadow-md shadow-success/20">
                <FaClipboardCheck />
                Assessment Configuration
              </span>
            </div>

            {/* ──── ASSESSMENT CONFIGURATION ──── */}
            <fieldset
              className="space-y-6 animate-in slide-in-from-bottom duration-500"
              style={{ animationDelay: "200ms" }}
            >
              <legend className="flex items-center gap-3 pb-4 border-b border-base-300/50 w-full">
                <span className="p-2.5 rounded-xl bg-linear-to-br from-success/20 to-info/20">
                  <FaTrophy className="text-success text-lg" />
                </span>
                <span className="text-lg font-bold text-base-content">
                  Marks &amp; Type
                </span>
              </legend>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-8 gap-y-5">

                {/* Subject Type */}
                <div className="form-control">
                  <label className="label pb-1.5">
                    <span className="label-text font-semibold flex items-center gap-2 text-base-content/80">
                      <FaToggleOn className="text-success text-xs" />
                      Subject Type
                    </span>
                  </label>
                  <select
                    name="type"
                    className="select select-bordered w-full bg-base-100/50 backdrop-blur-sm border-success/30 focus:border-success transition-all duration-300 hover:scale-[1.01]"
                    value={form.type}
                    onChange={handleChange}
                  >
                    <option value="mandatory">Mandatory</option>
                    <option value="optional">Optional</option>
                  </select>
                  <label className="label pt-1">
                    <span className="label-text-alt text-base-content/40">
                      Mandatory subjects are required for all students
                    </span>
                  </label>
                </div>

                {/* Full Marks */}
                <div className="form-control">
                  <label className="label pb-1.5">
                    <span className="label-text font-semibold flex items-center gap-2 text-base-content/80">
                      <FaTrophy className="text-info text-xs" />
                      Full Marks
                    </span>
                  </label>
                  <input
                    type="number"
                    name="fullMarks"
                    className="input input-bordered w-full bg-base-100/50 backdrop-blur-sm border-info/30 focus:border-info transition-all duration-300 hover:scale-[1.01]"
                    placeholder="100"
                    value={form.fullMarks}
                    onChange={handleChange}
                    min="1"
                  />
                  <label className="label pt-1">
                    <span className="label-text-alt text-base-content/40">
                      Maximum marks for this subject
                    </span>
                  </label>
                </div>

                {/* Pass Marks */}
                <div className="form-control">
                  <label className="label pb-1.5">
                    <span className="label-text font-semibold flex items-center gap-2 text-base-content/80">
                      <FaCheckCircle className="text-info text-xs" />
                      Pass Marks
                    </span>
                  </label>
                  <input
                    type="number"
                    name="passMarks"
                    className="input input-bordered w-full bg-base-100/50 backdrop-blur-sm border-info/30 focus:border-info transition-all duration-300 hover:scale-[1.01]"
                    placeholder="33"
                    value={form.passMarks}
                    onChange={handleChange}
                    min="1"
                  />
                  <label className="label pt-1">
                    <span className="label-text-alt text-base-content/40">
                      Minimum marks required to pass
                    </span>
                  </label>
                </div>
              </div>
            </fieldset>

            {/* ── Info Tip ── */}
            <div
              className="rounded-2xl border border-success/20 bg-linear-to-r from-success/10 to-info/5 p-5 flex gap-4 items-start animate-in slide-in-from-bottom duration-500"
              style={{ animationDelay: "250ms" }}
            >
              <div className="p-2 rounded-xl bg-success/20 shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-success w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-sm">
                <p className="font-semibold text-base-content mb-1">Quick Tip</p>
                <p className="text-base-content/60">
                  Assigning a teacher will automatically link this subject to their profile. You can create <span className="text-success font-medium">exams</span> and enter <span className="text-info font-medium">grades</span> for this subject once it's created.
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
                className="btn btn-ghost hover:bg-success/10 hover:text-success transition-all duration-300 hover:scale-105"
                onClick={() => navigate("/dashboard/subjects")}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn bg-linear-to-r from-success to-success/80 text-success-content border-none gap-2 shadow-lg shadow-success/25 hover:shadow-xl hover:shadow-success/40 hover:scale-105 transition-all duration-300"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <span className="loading loading-spinner loading-sm" />
                    Creating Subject...
                  </>
                ) : (
                  <>
                    <FaCheckCircle />
                    Create Subject
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

export default AddSubject;
