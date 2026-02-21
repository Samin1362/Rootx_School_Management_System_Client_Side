import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import { useNotification } from "../../contexts/NotificationContext";
import Loader from "../../components/Loader";
import {
  FaArrowLeft,
  FaUserGraduate,
  FaEnvelope,
  FaPhone,
  FaCalendar,
  FaVenusMars,
  FaTint,
  FaMapMarkerAlt,
  FaIdCard,
  FaSchool,
  FaLayerGroup,
  FaGraduationCap,
  FaCheckCircle,
  FaLock,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";

const AddStudent = () => {
  const axiosSecure = useAxiosSecure();
  const navigate = useNavigate();
  const { success, error: showError } = useNotification();

  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    classId: "",
    sectionId: "",
    admissionNumber: "",
    dob: "",
    gender: "",
    address: "",
    bloodGroup: "",
    academicYear: new Date().getFullYear().toString(),
    previousInstitute: "",
  });

  // Fetch classes on mount
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await axiosSecure.get("/classes");
        if (res.data.success) {
          setClasses(res.data.data);
        }
      } catch (err) {
        showError("Failed to load classes", err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch sections when classId changes
  useEffect(() => {
    if (!form.classId) {
      setSections([]);
      setForm((prev) => ({ ...prev, sectionId: "" }));
      return;
    }

    const fetchSections = async () => {
      try {
        const res = await axiosSecure.get("/sections", {
          params: { classId: form.classId },
        });
        if (res.data.success) {
          setSections(res.data.data);
        }
      } catch (err) {
        showError("Failed to load sections", err.message);
        setSections([]);
      }
    };
    fetchSections();
    setForm((prev) => ({ ...prev, sectionId: "" }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.classId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !form.name ||
      !form.email ||
      !form.classId ||
      !form.sectionId ||
      !form.admissionNumber
    ) {
      showError("Please fill all required fields");
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

    setSubmitting(true);
    try {
      const payload = { ...form, password };
      Object.keys(payload).forEach((key) => {
        if (payload[key] === "") delete payload[key];
      });

      await axiosSecure.post("/students", payload);
      success("Student added successfully");
      navigate("/dashboard/students");
    } catch (err) {
      showError(err.response?.data?.message || "Failed to add student");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader fullPage={false} message="Loading form data..." />;

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
            onClick={() => navigate("/dashboard/students")}
            className="self-start btn btn-circle bg-white/10 hover:bg-white/20 border-white/20 text-white backdrop-blur-sm transition-all duration-300 hover:scale-110"
          >
            <FaArrowLeft className="text-lg" />
          </button>

          {/* Icon + Title */}
          <div className="flex items-center gap-4">
            <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl shadow-lg animate-bounce-slow">
              <FaUserGraduate className="text-3xl sm:text-4xl text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                Add New Student
              </h1>
              <p className="text-white/70 text-sm mt-1">
                Enroll a new student to your institution
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Form Card ── */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-base-100 to-base-200/50 border border-base-300/50 shadow-xl">
        {/* Animated gradient top border */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-accent animate-gradient-x" />

        <div className="p-5 sm:p-8 lg:p-10">
          <form onSubmit={handleSubmit} className="space-y-10">

            {/* ──── PERSONAL INFORMATION ──── */}
            <fieldset
              className="space-y-6 animate-in slide-in-from-bottom duration-500"
              style={{ animationDelay: "100ms" }}
            >
              <legend className="flex items-center gap-3 pb-4 border-b border-base-300/50 w-full">
                <span className="p-2.5 rounded-xl bg-linear-to-br from-primary/20 to-secondary/20">
                  <FaUserGraduate className="text-primary text-lg" />
                </span>
                <span className="text-lg font-bold text-base-content">
                  Personal Information
                </span>
              </legend>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
                {/* Name */}
                <div className="form-control">
                  <label className="label pb-1.5">
                    <span className="label-text font-semibold flex items-center gap-2 text-base-content/80">
                      <FaUserGraduate className="text-primary text-xs" />
                      Full Name <span className="text-error">*</span>
                    </span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    className="input input-bordered w-full bg-base-100/50 backdrop-blur-sm border-primary/30 focus:border-primary focus:input-primary transition-all duration-300 hover:scale-[1.01]"
                    placeholder="Enter student's full name"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Email */}
                <div className="form-control">
                  <label className="label pb-1.5">
                    <span className="label-text font-semibold flex items-center gap-2 text-base-content/80">
                      <FaEnvelope className="text-primary text-xs" />
                      Email <span className="text-error">*</span>
                    </span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    className="input input-bordered w-full bg-base-100/50 backdrop-blur-sm border-primary/30 focus:border-primary focus:input-primary transition-all duration-300 hover:scale-[1.01]"
                    placeholder="student@example.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Phone */}
                <div className="form-control">
                  <label className="label pb-1.5">
                    <span className="label-text font-semibold flex items-center gap-2 text-base-content/80">
                      <FaPhone className="text-primary text-xs" />
                      Phone Number
                    </span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    className="input input-bordered w-full bg-base-100/50 backdrop-blur-sm border-secondary/30 focus:border-secondary focus:input-primary transition-all duration-300 hover:scale-[1.01]"
                    placeholder="Enter phone number"
                    value={form.phone}
                    onChange={handleChange}
                  />
                </div>

                {/* Date of Birth */}
                <div className="form-control">
                  <label className="label pb-1.5">
                    <span className="label-text font-semibold flex items-center gap-2 text-base-content/80">
                      <FaCalendar className="text-primary text-xs" />
                      Date of Birth
                    </span>
                  </label>
                  <input
                    type="date"
                    name="dob"
                    className="input input-bordered w-full bg-base-100/50 backdrop-blur-sm border-secondary/30 focus:border-secondary focus:input-primary transition-all duration-300 hover:scale-[1.01]"
                    value={form.dob}
                    onChange={handleChange}
                  />
                </div>

                {/* Gender */}
                <div className="form-control">
                  <label className="label pb-1.5">
                    <span className="label-text font-semibold flex items-center gap-2 text-base-content/80">
                      <FaVenusMars className="text-primary text-xs" />
                      Gender
                    </span>
                  </label>
                  <select
                    name="gender"
                    className="select select-bordered w-full bg-base-100/50 backdrop-blur-sm border-accent/30 focus:border-accent transition-all duration-300 hover:scale-[1.01]"
                    value={form.gender}
                    onChange={handleChange}
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Blood Group */}
                <div className="form-control">
                  <label className="label pb-1.5">
                    <span className="label-text font-semibold flex items-center gap-2 text-base-content/80">
                      <FaTint className="text-primary text-xs" />
                      Blood Group
                    </span>
                  </label>
                  <select
                    name="bloodGroup"
                    className="select select-bordered w-full bg-base-100/50 backdrop-blur-sm border-accent/30 focus:border-accent transition-all duration-300 hover:scale-[1.01]"
                    value={form.bloodGroup}
                    onChange={handleChange}
                  >
                    <option value="">Select Blood Group</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
              </div>

              {/* Address (full width) */}
              <div className="form-control">
                <label className="label pb-1.5">
                  <span className="label-text font-semibold flex items-center gap-2 text-base-content/80">
                    <FaMapMarkerAlt className="text-primary text-xs" />
                    Address
                  </span>
                </label>
                <textarea
                  name="address"
                  className="textarea textarea-bordered w-full bg-base-100/50 backdrop-blur-sm border-primary/30 focus:border-primary focus:textarea-primary transition-all duration-300 resize-none hover:scale-[1.005]"
                  placeholder="Enter full address"
                  rows={3}
                  value={form.address}
                  onChange={handleChange}
                />
              </div>

              {/* Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
                <div className="form-control">
                  <label className="label pb-1.5">
                    <span className="label-text font-semibold flex items-center gap-2 text-base-content/80">
                      <FaLock className="text-primary text-xs" />
                      Login Password <span className="text-error">*</span>
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="input input-bordered w-full pr-12 bg-base-100/50 backdrop-blur-sm border-primary/30 focus:border-primary transition-all duration-300 hover:scale-[1.01]"
                      placeholder="Min. 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-primary transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                <div className="form-control">
                  <label className="label pb-1.5">
                    <span className="label-text font-semibold flex items-center gap-2 text-base-content/80">
                      <FaLock className="text-primary text-xs" />
                      Confirm Password <span className="text-error">*</span>
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirm ? "text" : "password"}
                      className={`input input-bordered w-full pr-12 bg-base-100/50 backdrop-blur-sm transition-all duration-300 hover:scale-[1.01] ${
                        confirmPassword && confirmPassword !== password
                          ? "border-error focus:border-error"
                          : "border-primary/30 focus:border-primary"
                      }`}
                      placeholder="Re-enter password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-primary transition-colors"
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
              <span className="badge badge-primary badge-lg gap-2 font-semibold px-4 py-3 shadow-md shadow-primary/20">
                <FaSchool />
                Academic Details
              </span>
            </div>

            {/* ──── ACADEMIC INFORMATION ──── */}
            <fieldset
              className="space-y-6 animate-in slide-in-from-bottom duration-500"
              style={{ animationDelay: "200ms" }}
            >
              <legend className="flex items-center gap-3 pb-4 border-b border-base-300/50 w-full">
                <span className="p-2.5 rounded-xl bg-linear-to-br from-primary/20 to-secondary/20">
                  <FaGraduationCap className="text-primary text-lg" />
                </span>
                <span className="text-lg font-bold text-base-content">
                  Academic Information
                </span>
              </legend>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
                {/* Admission Number */}
                <div className="form-control">
                  <label className="label pb-1.5">
                    <span className="label-text font-semibold flex items-center gap-2 text-base-content/80">
                      <FaIdCard className="text-primary text-xs" />
                      Admission Number <span className="text-error">*</span>
                    </span>
                  </label>
                  <input
                    type="text"
                    name="admissionNumber"
                    className="input input-bordered w-full bg-base-100/50 backdrop-blur-sm border-primary/30 focus:border-primary focus:input-primary transition-all duration-300 hover:scale-[1.01]"
                    placeholder="e.g., ADM-2026-001"
                    value={form.admissionNumber}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Academic Year */}
                <div className="form-control">
                  <label className="label pb-1.5">
                    <span className="label-text font-semibold flex items-center gap-2 text-base-content/80">
                      <FaCalendar className="text-primary text-xs" />
                      Academic Year
                    </span>
                  </label>
                  <input
                    type="text"
                    name="academicYear"
                    className="input input-bordered w-full bg-base-100/50 backdrop-blur-sm border-secondary/30 focus:border-secondary focus:input-primary transition-all duration-300 hover:scale-[1.01]"
                    placeholder="e.g., 2026"
                    value={form.academicYear}
                    onChange={handleChange}
                  />
                </div>

                {/* Class */}
                <div className="form-control">
                  <label className="label pb-1.5">
                    <span className="label-text font-semibold flex items-center gap-2 text-base-content/80">
                      <FaSchool className="text-primary text-xs" />
                      Class <span className="text-error">*</span>
                    </span>
                  </label>
                  <select
                    name="classId"
                    className="select select-bordered w-full bg-base-100/50 backdrop-blur-sm border-primary/30 focus:border-primary transition-all duration-300 hover:scale-[1.01]"
                    value={form.classId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Class</option>
                    {classes.map((cls) => (
                      <option key={cls._id} value={cls._id}>
                        {cls.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Section */}
                <div className="form-control">
                  <label className="label pb-1.5">
                    <span className="label-text font-semibold flex items-center gap-2 text-base-content/80">
                      <FaLayerGroup className="text-primary text-xs" />
                      Section <span className="text-error">*</span>
                    </span>
                  </label>
                  <select
                    name="sectionId"
                    className="select select-bordered w-full bg-base-100/50 backdrop-blur-sm border-secondary/30 focus:border-secondary transition-all duration-300 hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed"
                    value={form.sectionId}
                    onChange={handleChange}
                    required
                    disabled={!form.classId}
                  >
                    <option value="">
                      {form.classId ? "Select Section" : "Select a class first"}
                    </option>
                    {sections.map((sec) => (
                      <option key={sec._id} value={sec._id}>
                        {sec.name}
                      </option>
                    ))}
                  </select>
                  {form.classId && sections.length === 0 && (
                    <p className="text-warning text-xs mt-1.5 flex items-center gap-1">
                      No sections found for the selected class
                    </p>
                  )}
                </div>

                {/* Previous Institute (full width) */}
                <div className="form-control sm:col-span-2">
                  <label className="label pb-1.5">
                    <span className="label-text font-semibold flex items-center gap-2 text-base-content/80">
                      <FaGraduationCap className="text-primary text-xs" />
                      Previous Institute
                    </span>
                  </label>
                  <input
                    type="text"
                    name="previousInstitute"
                    className="input input-bordered w-full bg-base-100/50 backdrop-blur-sm border-info/30 focus:border-info focus:input-primary transition-all duration-300 hover:scale-[1.005]"
                    placeholder="Name of previous school/institute (if any)"
                    value={form.previousInstitute}
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
                className="btn btn-ghost hover:bg-primary/10 hover:text-primary transition-all duration-300 hover:scale-105"
                onClick={() => navigate("/dashboard/students")}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn bg-linear-to-r from-primary to-primary/80 text-primary-content border-none gap-2 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40 hover:scale-105 transition-all duration-300"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span className="loading loading-spinner loading-sm" />
                    Adding Student...
                  </>
                ) : (
                  <>
                    <FaCheckCircle />
                    Add Student
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

export default AddStudent;
