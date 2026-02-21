import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import useAuth from "../../hooks/useAuth";
import { useNotification } from "../../contexts/NotificationContext";
import ConfirmModal from "../../components/ConfirmModal";
import EmptyState from "../../components/EmptyState";
import Loader from "../../components/Loader";
import { FaPlus, FaEdit, FaTrash, FaLayerGroup, FaChartLine, FaGraduationCap, FaTimes, FaSchool, FaSortNumericDown, FaCalendarAlt, FaToggleOn } from "react-icons/fa";

const Classes = () => {
  const axiosSecure = useAxiosSecure();
  const { organizationId } = useAuth();
  const { success, error: showError } = useNotification();
  const navigate = useNavigate();

  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    numericLevel: "",
    academicYear: new Date().getFullYear().toString(),
    status: "active",
  });

  const fetchClasses = async () => {
    try {
      const res = await axiosSecure.get("/classes");
      if (res.data.success) {
        setClasses(res.data.data);
      }
    } catch (err) {
      showError("Failed to load classes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreateModal = () => {
    setEditingClass(null);
    setForm({
      name: "",
      numericLevel: "",
      academicYear: new Date().getFullYear().toString(),
      status: "active",
    });
    setModalOpen(true);
  };

  const openEditModal = (cls) => {
    setEditingClass(cls);
    setForm({
      name: cls.name,
      numericLevel: cls.numericLevel?.toString() || "",
      academicYear: cls.academicYear || new Date().getFullYear().toString(),
      status: cls.status || "active",
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.numericLevel || !form.academicYear) {
      showError("Please fill all required fields");
      return;
    }

    setSaving(true);
    try {
      if (editingClass) {
        await axiosSecure.patch(`/classes/${editingClass._id}`, form);
        success("Class updated successfully");
      } else {
        await axiosSecure.post("/classes", form);
        success("Class created successfully");
      }
      setModalOpen(false);
      fetchClasses();
    } catch (err) {
      showError(err.response?.data?.message || "Operation failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await axiosSecure.delete(`/classes/${deleteTarget._id}`);
      success("Class deleted successfully");
      setDeleteTarget(null);
      fetchClasses();
    } catch (err) {
      showError(err.response?.data?.message || "Failed to delete class");
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Animated gradient background blobs */}
      <div className="fixed top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 rounded-full blur-3xl animate-pulse pointer-events-none opacity-30" />
      <div className="fixed bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-info/20 via-success/20 to-warning/20 rounded-full blur-3xl animate-pulse pointer-events-none opacity-30 animation-delay-2000" />

      {/* Header with gradient */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-secondary p-8 shadow-lg">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAtNi42MjcgNS4zNzMtMTIgMTItMTJzMTIgNS4zNzMgMTIgMTItNS4zNzMgMTItMTIgMTItMTItNS4zNzMtMTItMTJ6bS0xMiAxMmMwLTYuNjI3IDUuMzczLTEyIDEyLTEyczEyIDUuMzczIDEyIDEyLTUuMzczIDEyLTEyIDEyLTEyLTUuMzczLTEyLTEyem0wIDI0YzAtNi42MjcgNS4zNzMtMTIgMTItMTJzMTIgNS4zNzMgMTIgMTItNS4zNzMgMTItMTIgMTItMTItNS4zNzMtMTItMTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-10" />

        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl shadow-lg animate-bounce-slow">
              <FaGraduationCap className="text-4xl text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                Classes Management
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium animate-pulse">
                  <FaChartLine className="text-xs" />
                  {classes.length}
                </span>
              </h1>
              <p className="text-white/80 text-sm mt-2">
                Manage academic classes and their structure
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate("/dashboard/classes/add")}
            className="btn btn-sm gap-2 bg-white text-primary hover:bg-white/90 border-none shadow-lg hover:scale-105 transition-all duration-300"
          >
            <FaPlus /> Add Class
          </button>
        </div>
      </div>

      {/* Classes Grid */}
      {classes.length === 0 ? (
        <EmptyState
          icon={FaLayerGroup}
          title="No classes yet"
          message="Create your first class to get started with academic structure."
          action={() => navigate("/dashboard/classes/add")}
          actionLabel="Create Class"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {classes.map((cls, index) => (
            <div
              key={cls._id}
              className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-base-100 to-base-200/50 border border-base-300/50 hover:border-primary/50 shadow-md hover:shadow-2xl transition-all duration-500 hover:scale-105 animate-in slide-in-from-bottom"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Animated gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              {/* Animated gradient border top */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-accent opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-gradient-x" />

              <div className="relative p-5">
                <div className="flex items-start justify-between mb-4">
                  {/* Class Level Badge with gradient */}
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary rounded-xl opacity-20 blur-sm group-hover:opacity-40 transition-opacity" />
                    <div className="relative w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center border-2 border-primary/30 group-hover:border-primary/60 transition-all">
                      <span className="text-primary font-bold text-xl group-hover:scale-110 transition-transform">
                        {cls.numericLevel}
                      </span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`badge badge-sm ${
                      cls.status === "active"
                        ? "bg-gradient-to-r from-success/20 to-success/10 text-success border-success/30"
                        : "bg-gradient-to-r from-warning/20 to-warning/10 text-warning border-warning/30"
                    }`}
                  >
                    {cls.status}
                  </span>
                </div>

                {/* Class Info */}
                <div className="mb-4">
                  <h3 className="font-bold text-lg text-base-content mb-1 group-hover:text-primary transition-colors">
                    {cls.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="badge badge-ghost badge-xs">
                      📅 {cls.academicYear}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-3 border-t border-base-300/50">
                  <button
                    onClick={() => openEditModal(cls)}
                    className="btn btn-sm flex-1 bg-gradient-to-r from-info/20 to-info/10 text-info border-info/30 hover:from-info hover:to-info/80 hover:text-white transition-all duration-300 hover:scale-105"
                  >
                    <FaEdit /> Edit
                  </button>
                  <button
                    onClick={() => setDeleteTarget(cls)}
                    className="btn btn-sm flex-1 bg-gradient-to-r from-error/20 to-error/10 text-error border-error/30 hover:from-error hover:to-error/80 hover:text-white transition-all duration-300 hover:scale-105"
                  >
                    <FaTrash /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modern Slide-in Drawer for Create/Edit Class */}
      {modalOpen && (
        <>
          {/* Backdrop with blur */}
          <div
            className="fixed inset-0 bg-base-content/40 backdrop-blur-sm z-[9998] animate-in fade-in duration-300"
            onClick={() => setModalOpen(false)}
          />

          {/* Slide-in Drawer Panel */}
          <div className="fixed top-0 right-0 h-full w-full sm:w-[500px] lg:w-[600px] bg-gradient-to-br from-base-100 via-base-100 to-base-200/30 shadow-2xl z-[9999] animate-in slide-in-from-right duration-300 flex flex-col">
            {/* Animated left border */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary via-secondary to-accent animate-gradient-y" />

            {/* Header Section */}
            <div className="relative overflow-hidden bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 border-b border-base-300/50 backdrop-blur-sm">
              {/* Decorative background pattern */}
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMDAiIGZpbGwtb3BhY2l0eT0iMC4wMiI+PHBhdGggZD0iTTM2IDE2YzAtNi42MjcgNS4zNzMtMTIgMTItMTJzMTIgNS4zNzMgMTIgMTItNS4zNzMgMTItMTIgMTItMTItNS4zNzMtMTItMTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />

              <div className="relative p-6 sm:p-8">
                {/* Close Button */}
                <button
                  onClick={() => setModalOpen(false)}
                  className="absolute top-4 right-4 btn btn-circle btn-ghost btn-sm hover:bg-error/10 hover:text-error hover:rotate-90 transition-all duration-300"
                >
                  <FaTimes className="text-lg" />
                </button>

                {/* Header Content */}
                <div className="flex items-start gap-4 pr-12">
                  <div className="p-4 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl border-2 border-primary/30 shadow-lg">
                    <FaGraduationCap className="text-3xl text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-base-content mb-2">
                      {editingClass ? "Edit Class" : "Create New Class"}
                    </h2>
                    <p className="text-sm text-base-content/60">
                      {editingClass
                        ? "Update the class information below"
                        : "Add a new academic class to your organization"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Section - Scrollable */}
            <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Class Name Field */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-bold text-base flex items-center gap-2">
                      <FaSchool className="text-primary" />
                      Class Name
                      <span className="text-error">*</span>
                    </span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered w-full focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    placeholder="e.g., Class 1, HSC 1st Year, Grade 10"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                  <label className="label">
                    <span className="label-text-alt text-base-content/50 flex items-center gap-1">
                      💡 Enter the official name of the class
                    </span>
                  </label>
                </div>

                {/* Numeric Level Field */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-bold text-base flex items-center gap-2">
                      <FaSortNumericDown className="text-secondary" />
                      Numeric Level
                      <span className="text-error">*</span>
                    </span>
                  </label>
                  <input
                    type="number"
                    className="input input-bordered w-full focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all"
                    placeholder="e.g., 1, 2, 10"
                    value={form.numericLevel}
                    onChange={(e) => setForm({ ...form, numericLevel: e.target.value })}
                    min="1"
                    max="20"
                    required
                  />
                  <label className="label">
                    <span className="label-text-alt text-base-content/50 flex items-center gap-1">
                      📊 Used for sorting classes (1 = lowest, higher numbers = advanced)
                    </span>
                  </label>
                </div>

                {/* Academic Year Field */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-bold text-base flex items-center gap-2">
                      <FaCalendarAlt className="text-accent" />
                      Academic Year
                      <span className="text-error">*</span>
                    </span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered w-full focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
                    placeholder="e.g., 2026, 2026-2027"
                    value={form.academicYear}
                    onChange={(e) => setForm({ ...form, academicYear: e.target.value })}
                    required
                  />
                  <label className="label">
                    <span className="label-text-alt text-base-content/50 flex items-center gap-1">
                      📅 The academic year this class belongs to
                    </span>
                  </label>
                </div>

                {/* Status Field */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-bold text-base flex items-center gap-2">
                      <FaToggleOn className="text-info" />
                      Status
                    </span>
                  </label>
                  <select
                    className="select select-bordered w-full focus:border-info focus:ring-2 focus:ring-info/20 transition-all"
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                  >
                    <option value="active">✅ Active - Currently in use</option>
                    <option value="archived">📦 Archived - Past academic year</option>
                  </select>
                  <label className="label">
                    <span className="label-text-alt text-base-content/50 flex items-center gap-1">
                      🔄 Active classes appear in dropdowns and reports
                    </span>
                  </label>
                </div>

                {/* Info Alert */}
                <div className="alert bg-gradient-to-r from-info/10 to-info/5 border border-info/20 shadow-sm">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-info w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    </div>
                    <div className="text-sm text-base-content/70">
                      <p className="font-semibold mb-1">Quick Tip:</p>
                      <p>After creating a class, you can add sections and subjects to organize your curriculum.</p>
                    </div>
                  </div>
                </div>
              </form>
            </div>

            {/* Footer Actions - Sticky */}
            <div className="border-t border-base-300/50 bg-gradient-to-r from-base-100 to-base-200/50 backdrop-blur-sm p-6 sm:p-8">
              <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="btn btn-ghost hover:bg-base-200 transition-all"
                  disabled={saving}
                >
                  <FaTimes /> Cancel
                </button>
                <button
                  type="submit"
                  onClick={handleSubmit}
                  className="btn bg-gradient-to-r from-primary via-primary to-secondary text-white border-none hover:scale-105 hover:shadow-xl transition-all duration-300 shadow-lg"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <span className="loading loading-spinner loading-sm" />
                      {editingClass ? "Updating..." : "Creating..."}
                    </>
                  ) : (
                    <>
                      <FaPlus />
                      {editingClass ? "Update Class" : "Create Class"}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Class?"
        message={`This will cascade delete all sections, subjects, and soft-delete students in "${deleteTarget?.name}". This action cannot be undone.`}
        confirmText="Delete"
        loading={deleteLoading}
        variant="danger"
      />

      <style jsx>{`
        @keyframes gradient-x {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        @keyframes gradient-y {
          0%, 100% {
            background-position: 50% 0%;
          }
          50% {
            background-position: 50% 100%;
          }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 3s ease infinite;
        }
        .animate-gradient-y {
          background-size: 200% 200%;
          animation: gradient-y 3s ease infinite;
        }
        .animate-bounce-slow {
          animation: bounce 3s infinite;
        }
        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
};

export default Classes;
