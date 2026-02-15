import { useState, useEffect } from "react";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import { useNotification } from "../../contexts/NotificationContext";
import ConfirmModal from "../../components/ConfirmModal";
import EmptyState from "../../components/EmptyState";
import Loader from "../../components/Loader";
import { FaPlus, FaEdit, FaTrash, FaClipboardList } from "react-icons/fa";

const Sections = () => {
  const axiosSecure = useAxiosSecure();
  const { success, error: showError } = useNotification();

  const [sections, setSections] = useState([]);
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filterClassId, setFilterClassId] = useState("");

  const [form, setForm] = useState({
    name: "",
    classId: "",
    capacity: "40",
    classTeacherId: "",
  });

  const fetchData = async () => {
    try {
      const [sectionsRes, classesRes, teachersRes] = await Promise.all([
        axiosSecure.get("/sections", { params: filterClassId ? { classId: filterClassId } : {} }),
        axiosSecure.get("/classes"),
        axiosSecure.get("/teachers").catch(() => ({ data: { data: [] } })),
      ]);
      if (sectionsRes.data.success) setSections(sectionsRes.data.data);
      if (classesRes.data.success) setClasses(classesRes.data.data);
      if (teachersRes.data?.data) setTeachers(teachersRes.data.data);
    } catch (err) {
      showError("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterClassId]);

  const openCreateModal = () => {
    setEditingSection(null);
    setForm({ name: "", classId: filterClassId || "", capacity: "40", classTeacherId: "" });
    setModalOpen(true);
  };

  const openEditModal = (sec) => {
    setEditingSection(sec);
    setForm({
      name: sec.name,
      classId: sec.classId,
      capacity: sec.capacity?.toString() || "40",
      classTeacherId: sec.classTeacherId || "",
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.classId) {
      showError("Name and class are required");
      return;
    }

    setSaving(true);
    try {
      const payload = { ...form, classTeacherId: form.classTeacherId || null };
      if (editingSection) {
        await axiosSecure.patch(`/sections/${editingSection._id}`, {
          name: form.name,
          capacity: form.capacity,
          classTeacherId: form.classTeacherId || null,
        });
        success("Section updated successfully");
      } else {
        await axiosSecure.post("/sections", payload);
        success("Section created successfully");
      }
      setModalOpen(false);
      fetchData();
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
      await axiosSecure.delete(`/sections/${deleteTarget._id}`);
      success("Section deleted successfully");
      setDeleteTarget(null);
      fetchData();
    } catch (err) {
      showError(err.response?.data?.message || "Failed to delete section");
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-base-content">Sections</h1>
          <p className="text-base-content/60 text-sm mt-1">Manage sections within classes</p>
        </div>
        <div className="flex gap-2 items-center">
          <select
            className="select select-bordered select-sm"
            value={filterClassId}
            onChange={(e) => setFilterClassId(e.target.value)}
          >
            <option value="">All Classes</option>
            {classes.map((cls) => (
              <option key={cls._id} value={cls._id}>{cls.name}</option>
            ))}
          </select>
          <button onClick={openCreateModal} className="btn btn-primary btn-sm gap-2">
            <FaPlus /> Add Section
          </button>
        </div>
      </div>

      {sections.length === 0 ? (
        <EmptyState
          icon={FaClipboardList}
          title="No sections yet"
          message="Create sections to organize students within classes."
          action={openCreateModal}
          actionLabel="Create Section"
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="table table-sm bg-base-100 border border-base-300/50 rounded-xl">
            <thead>
              <tr className="bg-base-200/50">
                <th>Section Name</th>
                <th>Class</th>
                <th>Capacity</th>
                <th>Class Teacher</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sections.map((sec) => (
                <tr key={sec._id} className="hover:bg-base-200/30 transition-colors">
                  <td className="font-medium text-base-content">{sec.name}</td>
                  <td>
                    <span className="badge badge-ghost badge-sm">{sec.className || "—"}</span>
                  </td>
                  <td>{sec.capacity || 40}</td>
                  <td className="text-base-content/60 text-sm">
                    {sec.classTeacherId ? "Assigned" : "—"}
                  </td>
                  <td className="text-right">
                    <div className="flex gap-1 justify-end">
                      <button
                        onClick={() => openEditModal(sec)}
                        className="btn btn-ghost btn-xs text-info"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(sec)}
                        className="btn btn-ghost btn-xs text-error"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create/Edit Modal */}
      {modalOpen && (
        <div className="modal modal-open">
          <div className="modal-box max-w-md">
            <h3 className="font-bold text-lg text-base-content">
              {editingSection ? "Edit Section" : "Create Section"}
            </h3>
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div className="form-control">
                <label className="label"><span className="label-text">Section Name *</span></label>
                <input
                  type="text"
                  className="input input-bordered input-sm w-full"
                  placeholder="e.g., Section A, Section B"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              {!editingSection && (
                <div className="form-control">
                  <label className="label"><span className="label-text">Class *</span></label>
                  <select
                    className="select select-bordered select-sm w-full"
                    value={form.classId}
                    onChange={(e) => setForm({ ...form, classId: e.target.value })}
                    required
                  >
                    <option value="">Select Class</option>
                    {classes.map((cls) => (
                      <option key={cls._id} value={cls._id}>{cls.name}</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="form-control">
                <label className="label"><span className="label-text">Capacity</span></label>
                <input
                  type="number"
                  className="input input-bordered input-sm w-full"
                  placeholder="40"
                  value={form.capacity}
                  onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                  min="1"
                />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Class Teacher (Optional)</span></label>
                <select
                  className="select select-bordered select-sm w-full"
                  value={form.classTeacherId}
                  onChange={(e) => setForm({ ...form, classTeacherId: e.target.value })}
                >
                  <option value="">None</option>
                  {teachers.map((t) => (
                    <option key={t._id} value={t._id}>{t.user?.name || t.employeeId || "Teacher"}</option>
                  ))}
                </select>
              </div>
              <div className="modal-action">
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
                  {saving && <span className="loading loading-spinner loading-xs" />}
                  {editingSection ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
          <div className="modal-backdrop" onClick={() => setModalOpen(false)} />
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Section?"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? Sections with active students cannot be deleted.`}
        confirmText="Delete"
        loading={deleteLoading}
        variant="danger"
      />
    </div>
  );
};

export default Sections;
