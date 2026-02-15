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
} from "react-icons/fa";

const AddStudent = () => {
  const axiosSecure = useAxiosSecure();
  const navigate = useNavigate();
  const { success, error: showError } = useNotification();

  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

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

    setSubmitting(true);
    try {
      const payload = { ...form };
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
    <div className="space-y-6 sm:space-y-8 pb-8">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <button
          onClick={() => navigate("/dashboard/students")}
          className="btn btn-circle btn-ghost border border-base-300 hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all duration-300 self-start"
        >
          <FaArrowLeft className="text-lg" />
        </button>

        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary text-primary-content shadow-lg shadow-primary/25">
            <FaUserGraduate className="text-2xl" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-base-content">
              Add New Student
            </h1>
            <p className="text-sm text-base-content/50 mt-0.5">
              Enroll a new student to your institution
            </p>
          </div>
        </div>
      </div>

      {/* ─── Form Card ─── */}
      <div className="card bg-base-100 shadow-xl border border-base-300/50">
        <div className="card-body p-4 sm:p-6 lg:p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* ──── PERSONAL INFORMATION ──── */}
            <fieldset className="space-y-5">
              <legend className="flex items-center gap-3 pb-3 border-b border-base-300/50 w-full">
                <span className="p-2 rounded-lg bg-primary/10">
                  <FaUserGraduate className="text-primary text-lg" />
                </span>
                <span className="text-lg font-bold text-base-content">
                  Personal Information
                </span>
              </legend>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                {/* Name */}
                <div className="form-control">
                  <label className="label pb-1">
                    <span className="label-text font-semibold flex items-center gap-2 text-base-content/80">
                      <FaUserGraduate className="text-primary text-xs" />
                      Full Name <span className="text-error">*</span>
                    </span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    className="input input-bordered w-full focus:input-primary transition-colors"
                    placeholder="Enter student's full name"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Email */}
                <div className="form-control">
                  <label className="label pb-1">
                    <span className="label-text font-semibold flex items-center gap-2 text-base-content/80">
                      <FaEnvelope className="text-primary text-xs" />
                      Email <span className="text-error">*</span>
                    </span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    className="input input-bordered w-full focus:input-primary transition-colors"
                    placeholder="student@example.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Phone */}
                <div className="form-control">
                  <label className="label pb-1">
                    <span className="label-text font-semibold flex items-center gap-2 text-base-content/80">
                      <FaPhone className="text-primary text-xs" />
                      Phone Number
                    </span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    className="input input-bordered w-full focus:input-primary transition-colors"
                    placeholder="Enter phone number"
                    value={form.phone}
                    onChange={handleChange}
                  />
                </div>

                {/* Date of Birth */}
                <div className="form-control">
                  <label className="label pb-1">
                    <span className="label-text font-semibold flex items-center gap-2 text-base-content/80">
                      <FaCalendar className="text-primary text-xs" />
                      Date of Birth
                    </span>
                  </label>
                  <input
                    type="date"
                    name="dob"
                    className="input input-bordered w-full focus:input-primary transition-colors"
                    value={form.dob}
                    onChange={handleChange}
                  />
                </div>

                {/* Gender */}
                <div className="form-control">
                  <label className="label pb-1">
                    <span className="label-text font-semibold flex items-center gap-2 text-base-content/80">
                      <FaVenusMars className="text-primary text-xs" />
                      Gender
                    </span>
                  </label>
                  <select
                    name="gender"
                    className="select select-bordered w-full focus:select-primary transition-colors"
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
                  <label className="label pb-1">
                    <span className="label-text font-semibold flex items-center gap-2 text-base-content/80">
                      <FaTint className="text-primary text-xs" />
                      Blood Group
                    </span>
                  </label>
                  <select
                    name="bloodGroup"
                    className="select select-bordered w-full focus:select-primary transition-colors"
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
                <label className="label pb-1">
                  <span className="label-text font-semibold flex items-center gap-2 text-base-content/80">
                    <FaMapMarkerAlt className="text-primary text-xs" />
                    Address
                  </span>
                </label>
                <textarea
                  name="address"
                  className="textarea textarea-bordered w-full focus:textarea-primary transition-colors resize-none"
                  placeholder="Enter full address"
                  rows={3}
                  value={form.address}
                  onChange={handleChange}
                />
              </div>
            </fieldset>

            {/* Divider */}
            <div className="divider text-base-content/30">
              <span className="badge badge-primary badge-lg gap-2 font-semibold">
                <FaSchool />
                Academic Details
              </span>
            </div>

            {/* ──── ACADEMIC INFORMATION ──── */}
            <fieldset className="space-y-5">
              <legend className="flex items-center gap-3 pb-3 border-b border-base-300/50 w-full">
                <span className="p-2 rounded-lg bg-primary/10">
                  <FaGraduationCap className="text-primary text-lg" />
                </span>
                <span className="text-lg font-bold text-base-content">
                  Academic Information
                </span>
              </legend>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                {/* Admission Number */}
                <div className="form-control">
                  <label className="label pb-1">
                    <span className="label-text font-semibold flex items-center gap-2 text-base-content/80">
                      <FaIdCard className="text-primary text-xs" />
                      Admission Number <span className="text-error">*</span>
                    </span>
                  </label>
                  <input
                    type="text"
                    name="admissionNumber"
                    className="input input-bordered w-full focus:input-primary transition-colors"
                    placeholder="e.g., ADM-2026-001"
                    value={form.admissionNumber}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Academic Year */}
                <div className="form-control">
                  <label className="label pb-1">
                    <span className="label-text font-semibold flex items-center gap-2 text-base-content/80">
                      <FaCalendar className="text-primary text-xs" />
                      Academic Year
                    </span>
                  </label>
                  <input
                    type="text"
                    name="academicYear"
                    className="input input-bordered w-full focus:input-primary transition-colors"
                    placeholder="e.g., 2026"
                    value={form.academicYear}
                    onChange={handleChange}
                  />
                </div>

                {/* Class */}
                <div className="form-control">
                  <label className="label pb-1">
                    <span className="label-text font-semibold flex items-center gap-2 text-base-content/80">
                      <FaSchool className="text-primary text-xs" />
                      Class <span className="text-error">*</span>
                    </span>
                  </label>
                  <select
                    name="classId"
                    className="select select-bordered w-full focus:select-primary transition-colors"
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
                  <label className="label pb-1">
                    <span className="label-text font-semibold flex items-center gap-2 text-base-content/80">
                      <FaLayerGroup className="text-primary text-xs" />
                      Section <span className="text-error">*</span>
                    </span>
                  </label>
                  <select
                    name="sectionId"
                    className="select select-bordered w-full focus:select-primary transition-colors disabled:opacity-50"
                    value={form.sectionId}
                    onChange={handleChange}
                    required
                    disabled={!form.classId}
                  >
                    <option value="">
                      {form.classId
                        ? "Select Section"
                        : "Select a class first"}
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

                {/* Previous Institute */}
                <div className="form-control sm:col-span-2">
                  <label className="label pb-1">
                    <span className="label-text font-semibold flex items-center gap-2 text-base-content/80">
                      <FaGraduationCap className="text-primary text-xs" />
                      Previous Institute
                    </span>
                  </label>
                  <input
                    type="text"
                    name="previousInstitute"
                    className="input input-bordered w-full focus:input-primary transition-colors"
                    placeholder="Name of previous school/institute (if any)"
                    value={form.previousInstitute}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </fieldset>

            {/* ──── FORM ACTIONS ──── */}
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6 border-t border-base-300/50">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => navigate("/dashboard/students")}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary gap-2 shadow-md hover:shadow-lg hover:shadow-primary/25 transition-all duration-300"
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
      <p className="text-center text-sm text-base-content/40">
        Fields marked with <span className="text-error font-semibold">*</span>{" "}
        are required
      </p>
    </div>
  );
};

export default AddStudent;
