import { useState, useEffect } from "react";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import { useNotification } from "../../contexts/NotificationContext";
import ConfirmModal from "../../components/ConfirmModal";
import EmptyState from "../../components/EmptyState";
import Loader from "../../components/Loader";
import { FaPlus, FaEdit, FaTrash, FaBookOpen } from "react-icons/fa";

const Subjects = () => {
  const axiosSecure = useAxiosSecure();
  const { success, error: showError } = useNotification();

  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filterClassId, setFilterClassId] = useState("");

  const [form, setForm] = useState({
    name: "",
    subjectCode: "",
    classId: "",
    teacherId: "",
    type: "mandatory",
    fullMarks: "100",
    passMarks: "33",
  });

  const fetchData = async () => {
    try {
      const [subjectsRes, classesRes, teachersRes] = await Promise.all([
        axiosSecure.get("/subjects", { params: filterClassId ? { classId: filterClassId } : {} }),
        axiosSecure.get("/classes"),
        axiosSecure.get("/teachers").catch(() => ({ data: { data: [] } })),
      ]);
      if (subjectsRes.data.success) setSubjects(subjectsRes.data.data);
      if (classesRes.data.success) setClasses(classesRes.data.data);
      if (teachersRes.data?.data) setTeachers(teachersRes.data.data);
    } catch (err) {
      showError("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [filterClassId]);

  const openCreateModal = () => {
    setEditingSubject(null);
    setForm({ name: "", subjectCode: "", classId: filterClassId || "", teacherId: "", type: "mandatory", fullMarks: "100", passMarks: "33" });
    setModalOpen(true);
  };

  const openEditModal = (sub) => {
    setEditingSubject(sub);
    setForm({
      name: sub.name,
      subjectCode: sub.subjectCode || "",
      classId: sub.classId,
      teacherId: sub.teacherId || "",
      type: sub.type || "mandatory",
      fullMarks: sub.fullMarks?.toString() || "100",
      passMarks: sub.passMarks?.toString() || "33",
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
      const payload = { ...form, teacherId: form.teacherId || null };
      if (editingSubject) {
        await axiosSecure.patch(`/subjects/${editingSubject._id}`, {
          name: form.name,
          subjectCode: form.subjectCode,
          teacherId: form.teacherId || null,
          type: form.type,
          fullMarks: form.fullMarks,
          passMarks: form.passMarks,
        });
        success("Subject updated successfully");
      } else {
        await axiosSecure.post("/subjects", payload);
        success("Subject created successfully");
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
      await axiosSecure.delete(`/subjects/${deleteTarget._id}`);
      success("Subject deleted successfully");
      setDeleteTarget(null);
      fetchData();
    } catch (err) {
      showError(err.response?.data?.message || "Failed to delete");
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-base-content">Subjects</h1>
          <p className="text-base-content/60 text-sm mt-1">Manage subjects and assign teachers</p>
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
            <FaPlus /> Add Subject
          </button>
        </div>
      </div>

      {subjects.length === 0 ? (
        <EmptyState
          icon={FaBookOpen}
          title="No subjects yet"
          message="Create subjects and assign them to classes and teachers."
          action={openCreateModal}
          actionLabel="Create Subject"
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="table table-sm bg-base-100 border border-base-300/50 rounded-xl">
            <thead>
              <tr className="bg-base-200/50">
                <th>Subject</th>
                <th>Code</th>
                <th>Class</th>
                <th>Teacher</th>
                <th>Type</th>
                <th>Marks</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((sub) => (
                <tr key={sub._id} className="hover:bg-base-200/30 transition-colors">
                  <td className="font-medium text-base-content">{sub.name}</td>
                  <td><span className="badge badge-ghost badge-xs">{sub.subjectCode || "—"}</span></td>
                  <td>{sub.className || "—"}</td>
                  <td className="text-sm">{sub.teacherName || "Unassigned"}</td>
                  <td>
                    <span className={`badge badge-xs ${sub.type === "mandatory" ? "badge-primary" : "badge-secondary"}`}>
                      {sub.type}
                    </span>
                  </td>
                  <td className="text-sm text-base-content/60">{sub.fullMarks}/{sub.passMarks}</td>
                  <td className="text-right">
                    <div className="flex gap-1 justify-end">
                      <button onClick={() => openEditModal(sub)} className="btn btn-ghost btn-xs text-info"><FaEdit /></button>
                      <button onClick={() => setDeleteTarget(sub)} className="btn btn-ghost btn-xs text-error"><FaTrash /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="modal modal-open">
          <div className="modal-box max-w-md">
            <h3 className="font-bold text-lg text-base-content">{editingSubject ? "Edit Subject" : "Create Subject"}</h3>
            <form onSubmit={handleSubmit} className="mt-4 space-y-3">
              <div className="form-control">
                <label className="label"><span className="label-text">Subject Name *</span></label>
                <input type="text" className="input input-bordered input-sm w-full" placeholder="e.g., Mathematics" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Subject Code</span></label>
                <input type="text" className="input input-bordered input-sm w-full" placeholder="e.g., MATH-101" value={form.subjectCode} onChange={(e) => setForm({ ...form, subjectCode: e.target.value })} />
              </div>
              {!editingSubject && (
                <div className="form-control">
                  <label className="label"><span className="label-text">Class *</span></label>
                  <select className="select select-bordered select-sm w-full" value={form.classId} onChange={(e) => setForm({ ...form, classId: e.target.value })} required>
                    <option value="">Select Class</option>
                    {classes.map((cls) => (<option key={cls._id} value={cls._id}>{cls.name}</option>))}
                  </select>
                </div>
              )}
              <div className="form-control">
                <label className="label"><span className="label-text">Teacher</span></label>
                <select className="select select-bordered select-sm w-full" value={form.teacherId} onChange={(e) => setForm({ ...form, teacherId: e.target.value })}>
                  <option value="">Unassigned</option>
                  {teachers.map((t) => (<option key={t._id} value={t._id}>{t.user?.name || "Teacher"}</option>))}
                </select>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="form-control">
                  <label className="label"><span className="label-text">Type</span></label>
                  <select className="select select-bordered select-sm w-full" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                    <option value="mandatory">Mandatory</option>
                    <option value="optional">Optional</option>
                  </select>
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">Full Marks</span></label>
                  <input type="number" className="input input-bordered input-sm w-full" value={form.fullMarks} onChange={(e) => setForm({ ...form, fullMarks: e.target.value })} />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">Pass Marks</span></label>
                  <input type="number" className="input input-bordered input-sm w-full" value={form.passMarks} onChange={(e) => setForm({ ...form, passMarks: e.target.value })} />
                </div>
              </div>
              <div className="modal-action">
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
                  {saving && <span className="loading loading-spinner loading-xs" />}
                  {editingSubject ? "Update" : "Create"}
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
        title="Delete Subject?"
        message={`Are you sure you want to delete "${deleteTarget?.name}"?`}
        confirmText="Delete"
        loading={deleteLoading}
        variant="danger"
      />
    </div>
  );
};

export default Subjects;
