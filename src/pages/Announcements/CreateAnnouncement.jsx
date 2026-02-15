import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import useAuth from "../../hooks/useAuth";
import { useNotification } from "../../contexts/NotificationContext";
import Loader from "../../components/Loader";
import {
  FaBullhorn,
  FaArrowLeft,
  FaSchool,
  FaLayerGroup,
  FaClipboardList,
  FaUsers,
} from "react-icons/fa";

const CreateAnnouncement = () => {
  const axiosSecure = useAxiosSecure();
  const { userRole } = useAuth();
  const { success, error: showError } = useNotification();
  const navigate = useNavigate();
  const { announcementId } = useParams();

  const isEditing = !!announcementId;

  const [form, setForm] = useState({
    title: "",
    message: "",
    target: "school",
    targetId: "",
    targetRole: "",
    priority: "normal",
    expiresAt: "",
  });

  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [loadingSections, setLoadingSections] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loadingData, setLoadingData] = useState(false);

  // Teachers can only create class/section announcements
  const isTeacher = userRole === "teacher";

  // Fetch classes on mount
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await axiosSecure.get("/classes");
        if (res.data.success) {
          setClasses(res.data.data.filter((c) => c.status === "active"));
        }
      } catch {
        // silent
      } finally {
        setLoadingClasses(false);
      }
    };
    fetchClasses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch sections when class-targeted and targetId changes
  useEffect(() => {
    if (form.target === "section" && form.targetId) {
      // When target is section, targetId IS the section - we need class first
      // Actually for sections we need all sections from a class
      // Let's fetch all sections for the org
    }
    if (form.target !== "class" && form.target !== "section") return;

    const fetchSections = async () => {
      if (form.target === "class" && form.targetId) {
        setLoadingSections(true);
        try {
          const res = await axiosSecure.get(`/sections?classId=${form.targetId}`);
          if (res.data.success) {
            setSections(res.data.data);
          }
        } catch {
          setSections([]);
        } finally {
          setLoadingSections(false);
        }
      }
    };
    fetchSections();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.target, form.targetId]);

  // Load existing announcement for editing
  useEffect(() => {
    if (!isEditing) return;
    const loadAnnouncement = async () => {
      setLoadingData(true);
      try {
        const res = await axiosSecure.get("/announcements", { params: { limit: 100 } });
        if (res.data.success) {
          const found = res.data.data.find((a) => a._id === announcementId);
          if (found) {
            setForm({
              title: found.title || "",
              message: found.message || "",
              target: found.target || "school",
              targetId: found.targetId || "",
              targetRole: found.targetRole || "",
              priority: found.priority || "normal",
              expiresAt: found.expiresAt
                ? new Date(found.expiresAt).toISOString().split("T")[0]
                : "",
            });
          } else {
            showError("Announcement not found");
            navigate("/dashboard/announcements");
          }
        }
      } catch {
        showError("Failed to load announcement");
        navigate("/dashboard/announcements");
      } finally {
        setLoadingData(false);
      }
    };
    loadAnnouncement();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [announcementId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const updated = { ...prev, [name]: value };
      // Reset dependent fields on target change
      if (name === "target") {
        updated.targetId = "";
        updated.targetRole = "";
      }
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim() || !form.message.trim()) {
      showError("Title and message are required");
      return;
    }

    if ((form.target === "class" || form.target === "section") && !form.targetId) {
      showError(`Please select a ${form.target}`);
      return;
    }

    if (form.target === "role" && !form.targetRole) {
      showError("Please select a target role");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title: form.title.trim(),
        message: form.message.trim(),
        target: form.target,
        priority: form.priority,
      };

      if (form.target === "class" || form.target === "section") {
        payload.targetId = form.targetId;
      }
      if (form.target === "role") {
        payload.targetRole = form.targetRole;
      }
      if (form.expiresAt) {
        payload.expiresAt = form.expiresAt;
      }

      if (isEditing) {
        await axiosSecure.patch(`/announcements/${announcementId}`, payload);
        success("Announcement updated successfully");
      } else {
        await axiosSecure.post("/announcements", payload);
        success("Announcement created successfully");
      }
      navigate("/dashboard/announcements");
    } catch (err) {
      showError(err.response?.data?.message || `Failed to ${isEditing ? "update" : "create"} announcement`);
    } finally {
      setSubmitting(false);
    }
  };

  const targetOptions = isTeacher
    ? [
        { value: "class", label: "Class", icon: FaLayerGroup, desc: "Send to a specific class" },
        { value: "section", label: "Section", icon: FaClipboardList, desc: "Send to a specific section" },
      ]
    : [
        { value: "school", label: "School", icon: FaSchool, desc: "Send to entire school" },
        { value: "class", label: "Class", icon: FaLayerGroup, desc: "Send to a specific class" },
        { value: "section", label: "Section", icon: FaClipboardList, desc: "Send to a specific section" },
        { value: "role", label: "Role", icon: FaUsers, desc: "Send to a specific role" },
      ];

  if (loadingData || loadingClasses) return <Loader />;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-secondary p-8 shadow-lg">
        <div className="relative z-10 flex items-center gap-4">
          <button
            onClick={() => navigate("/dashboard/announcements")}
            className="btn btn-sm btn-circle bg-white/20 hover:bg-white/30 text-white border-none"
          >
            <FaArrowLeft />
          </button>
          <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
            <FaBullhorn className="text-2xl text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">
              {isEditing ? "Edit Announcement" : "Create Announcement"}
            </h1>
            <p className="text-white/70 text-sm">
              {isEditing ? "Update announcement details" : "Create a new notice for your school"}
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-3xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Target Selection */}
          <div className="bg-gradient-to-br from-base-100 to-base-200/50 border border-base-300/50 rounded-2xl shadow-md p-6">
            <h2 className="font-bold text-base-content mb-4">Target Audience</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {targetOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleChange({ target: { name: "target", value: opt.value } })}
                  className={`p-4 rounded-xl border-2 text-center transition-all duration-300 hover:scale-105 ${
                    form.target === opt.value
                      ? "border-primary bg-primary/10 shadow-md"
                      : "border-base-300/50 hover:border-primary/30"
                  }`}
                >
                  <opt.icon
                    className={`text-2xl mx-auto mb-2 ${
                      form.target === opt.value ? "text-primary" : "text-base-content/50"
                    }`}
                  />
                  <p className={`text-sm font-bold ${form.target === opt.value ? "text-primary" : ""}`}>
                    {opt.label}
                  </p>
                  <p className="text-xs text-base-content/50 mt-1">{opt.desc}</p>
                </button>
              ))}
            </div>

            {/* Target-specific selectors */}
            {form.target === "class" && (
              <div className="form-control mt-4">
                <label className="label">
                  <span className="label-text font-semibold">Select Class *</span>
                </label>
                <select
                  name="targetId"
                  className="select select-bordered select-sm w-full"
                  value={form.targetId}
                  onChange={handleChange}
                >
                  <option value="">Choose a class</option>
                  {classes.map((cls) => (
                    <option key={cls._id} value={cls._id}>{cls.name}</option>
                  ))}
                </select>
              </div>
            )}

            {form.target === "section" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Select Class *</span>
                  </label>
                  <select
                    className="select select-bordered select-sm w-full"
                    value={form._classForSection || ""}
                    onChange={async (e) => {
                      const classId = e.target.value;
                      setForm((prev) => ({ ...prev, _classForSection: classId, targetId: "" }));
                      if (classId) {
                        setLoadingSections(true);
                        try {
                          const res = await axiosSecure.get(`/sections?classId=${classId}`);
                          if (res.data.success) setSections(res.data.data);
                        } catch {
                          setSections([]);
                        } finally {
                          setLoadingSections(false);
                        }
                      } else {
                        setSections([]);
                      }
                    }}
                  >
                    <option value="">Choose a class</option>
                    {classes.map((cls) => (
                      <option key={cls._id} value={cls._id}>{cls.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Select Section *</span>
                  </label>
                  <select
                    name="targetId"
                    className="select select-bordered select-sm w-full"
                    value={form.targetId}
                    onChange={handleChange}
                    disabled={loadingSections || sections.length === 0}
                  >
                    <option value="">
                      {loadingSections ? "Loading..." : "Choose a section"}
                    </option>
                    {sections.map((sec) => (
                      <option key={sec._id} value={sec._id}>{sec.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {form.target === "role" && (
              <div className="form-control mt-4">
                <label className="label">
                  <span className="label-text font-semibold">Select Role *</span>
                </label>
                <select
                  name="targetRole"
                  className="select select-bordered select-sm w-full"
                  value={form.targetRole}
                  onChange={handleChange}
                >
                  <option value="">Choose a role</option>
                  <option value="teacher">Teachers</option>
                  <option value="student">Students</option>
                  <option value="parent">Parents</option>
                </select>
              </div>
            )}
          </div>

          {/* Announcement Details */}
          <div className="bg-gradient-to-br from-base-100 to-base-200/50 border border-base-300/50 rounded-2xl shadow-md p-6">
            <h2 className="font-bold text-base-content mb-4">Announcement Details</h2>
            <div className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Title *</span>
                </label>
                <input
                  type="text"
                  name="title"
                  className="input input-bordered input-sm w-full"
                  placeholder="Announcement title"
                  value={form.title}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Message *</span>
                </label>
                <textarea
                  name="message"
                  className="textarea textarea-bordered w-full h-32"
                  placeholder="Write your announcement message..."
                  value={form.message}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Priority</span>
                  </label>
                  <select
                    name="priority"
                    className="select select-bordered select-sm w-full"
                    value={form.priority}
                    onChange={handleChange}
                  >
                    <option value="normal">Normal</option>
                    <option value="important">Important</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Expires On (optional)</span>
                  </label>
                  <input
                    type="date"
                    name="expiresAt"
                    className="input input-bordered input-sm w-full"
                    value={form.expiresAt}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate("/dashboard/announcements")}
              className="btn btn-ghost btn-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-sm gap-2"
              disabled={submitting}
            >
              {submitting && <span className="loading loading-spinner loading-xs" />}
              {isEditing ? "Update" : "Create"} Announcement
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAnnouncement;
