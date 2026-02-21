import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import { useNotification } from "../../contexts/NotificationContext";
import Loader from "../../components/Loader";
import {
  FaArrowLeft,
  FaClipboardList,
  FaSchool,
  FaUsers,
  FaChalkboardTeacher,
  FaCheckCircle,
} from "react-icons/fa";

const AddSection = () => {
  const axiosSecure = useAxiosSecure();
  const navigate = useNavigate();
  const { success, error: showError } = useNotification();

  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    classId: "",
    capacity: "40",
    classTeacherId: "",
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
      showError("Section name and class are required");
      return;
    }

    setSaving(true);
    try {
      const payload = { ...form, classTeacherId: form.classTeacherId || null };
      const res = await axiosSecure.post("/sections", payload);
      if (res.data.success) {
        success("Section created successfully");
        navigate("/dashboard/sections");
      }
    } catch (err) {
      showError(err.response?.data?.message || "Failed to create section");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader fullPage={false} message="Loading form data..." />;

  return (
    <div className="space-y-6 sm:space-y-8 pb-10 animate-in fade-in duration-500">

      {/* ── Animated background blobs ── */}
      <div className="fixed top-0 right-0 w-96 h-96 bg-linear-to-br from-accent/20 via-warning/20 to-primary/20 rounded-full blur-3xl animate-pulse pointer-events-none opacity-30" />
      <div className="fixed bottom-0 left-0 w-72 h-72 bg-linear-to-tr from-info/20 via-accent/20 to-success/20 rounded-full blur-3xl animate-pulse pointer-events-none opacity-30 animation-delay-2000" />

      {/* ── Gradient Banner Header ── */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-accent via-accent/90 to-warning p-6 sm:p-8 shadow-lg">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAtNi42MjcgNS4zNzMtMTIgMTItMTJzMTIgNS4zNzMgMTIgMTItNS4zNzMgMTItMTIgMTItMTItNS4zNzMtMTItMTJ6bS0xMiAxMmMwLTYuNjI3IDUuMzczLTEyIDEyLTEyczEyIDUuMzczIDEyIDEyLTUuMzczIDEyLTEyIDEyLTEyLTUuMzczLTEyLTEyem0wIDI0YzAtNi42MjcgNS4zNzMtMTIgMTItMTJzMTIgNS4zNzMgMTIgMTItNS4zNzMgMTItMTIgMTItMTItNS4zNzMtMTItMTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-10" />

        <div className="relative flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
          <button
            onClick={() => navigate("/dashboard/sections")}
            className="self-start btn btn-circle bg-white/10 hover:bg-white/20 border-white/20 text-white backdrop-blur-sm transition-all duration-300 hover:scale-110"
          >
            <FaArrowLeft className="text-lg" />
          </button>

          <div className="flex items-center gap-4">
            <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl shadow-lg animate-bounce-slow">
              <FaClipboardList className="text-3xl sm:text-4xl text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                Create New Section
              </h1>
              <p className="text-white/70 text-sm mt-1">
                Add a section to organize students within a class
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Form Card ── */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-base-100 to-base-200/50 border border-base-300/50 shadow-xl">
        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-accent via-warning to-success animate-gradient-x" />

        <div className="p-5 sm:p-8 lg:p-10">
          <form onSubmit={handleSubmit} className="space-y-10">

            {/* ──── SECTION DETAILS ──── */}
            <fieldset
              className="space-y-6 animate-in slide-in-from-bottom duration-500"
              style={{ animationDelay: "100ms" }}
            >
              <legend className="flex items-center gap-3 pb-4 border-b border-base-300/50 w-full">
                <span className="p-2.5 rounded-xl bg-linear-to-br from-accent/20 to-warning/20">
                  <FaClipboardList className="text-accent text-lg" />
                </span>
                <span className="text-lg font-bold text-base-content">
                  Section Details
                </span>
              </legend>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">

                {/* Section Name */}
                <div className="form-control">
                  <label className="label pb-1.5">
                    <span className="label-text font-semibold flex items-center gap-2 text-base-content/80">
                      <FaClipboardList className="text-accent text-xs" />
                      Section Name <span className="text-error">*</span>
                    </span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    className="input input-bordered w-full bg-base-100/50 backdrop-blur-sm border-accent/30 focus:border-accent transition-all duration-300 hover:scale-[1.01]"
                    placeholder="e.g., Section A, Section B, Blue House"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                  <label className="label pt-1">
                    <span className="label-text-alt text-base-content/40">
                      A unique name within the selected class
                    </span>
                  </label>
                </div>

                {/* Class */}
                <div className="form-control">
                  <label className="label pb-1.5">
                    <span className="label-text font-semibold flex items-center gap-2 text-base-content/80">
                      <FaSchool className="text-accent text-xs" />
                      Class <span className="text-error">*</span>
                    </span>
                  </label>
                  <select
                    name="classId"
                    className="select select-bordered w-full bg-base-100/50 backdrop-blur-sm border-accent/30 focus:border-accent transition-all duration-300 hover:scale-[1.01]"
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
                      The class this section belongs to
                    </span>
                  </label>
                </div>

                {/* Capacity */}
                <div className="form-control">
                  <label className="label pb-1.5">
                    <span className="label-text font-semibold flex items-center gap-2 text-base-content/80">
                      <FaUsers className="text-warning text-xs" />
                      Student Capacity
                    </span>
                  </label>
                  <input
                    type="number"
                    name="capacity"
                    className="input input-bordered w-full bg-base-100/50 backdrop-blur-sm border-warning/30 focus:border-warning transition-all duration-300 hover:scale-[1.01]"
                    placeholder="40"
                    value={form.capacity}
                    onChange={handleChange}
                    min="1"
                    max="200"
                  />
                  <label className="label pt-1">
                    <span className="label-text-alt text-base-content/40">
                      Maximum number of students (default: 40)
                    </span>
                  </label>
                </div>

                {/* Class Teacher */}
                <div className="form-control">
                  <label className="label pb-1.5">
                    <span className="label-text font-semibold flex items-center gap-2 text-base-content/80">
                      <FaChalkboardTeacher className="text-warning text-xs" />
                      Class Teacher
                      <span className="text-base-content/40 font-normal text-xs">(optional)</span>
                    </span>
                  </label>
                  <select
                    name="classTeacherId"
                    className="select select-bordered w-full bg-base-100/50 backdrop-blur-sm border-warning/30 focus:border-warning transition-all duration-300 hover:scale-[1.01]"
                    value={form.classTeacherId}
                    onChange={handleChange}
                  >
                    <option value="">No class teacher assigned</option>
                    {teachers.map((t) => (
                      <option key={t._id} value={t._id}>
                        {t.user?.name || t.employeeId || "Teacher"}
                      </option>
                    ))}
                  </select>
                  <label className="label pt-1">
                    <span className="label-text-alt text-base-content/40">
                      Can be assigned later from the section list
                    </span>
                  </label>
                </div>
              </div>
            </fieldset>

            {/* ── Info Tip ── */}
            <div
              className="rounded-2xl border border-accent/20 bg-linear-to-r from-accent/10 to-warning/5 p-5 flex gap-4 items-start animate-in slide-in-from-bottom duration-500"
              style={{ animationDelay: "200ms" }}
            >
              <div className="p-2 rounded-xl bg-accent/20 shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-accent w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-sm">
                <p className="font-semibold text-base-content mb-1">Quick Tip</p>
                <p className="text-base-content/60">
                  After creating a section, you can <span className="text-accent font-medium">enroll students</span> and assign <span className="text-warning font-medium">subjects</span> to complete the academic structure.
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
                className="btn btn-ghost hover:bg-accent/10 hover:text-accent transition-all duration-300 hover:scale-105"
                onClick={() => navigate("/dashboard/sections")}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn bg-linear-to-r from-accent to-accent/80 text-accent-content border-none gap-2 shadow-lg shadow-accent/25 hover:shadow-xl hover:shadow-accent/40 hover:scale-105 transition-all duration-300"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <span className="loading loading-spinner loading-sm" />
                    Creating Section...
                  </>
                ) : (
                  <>
                    <FaCheckCircle />
                    Create Section
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

export default AddSection;
