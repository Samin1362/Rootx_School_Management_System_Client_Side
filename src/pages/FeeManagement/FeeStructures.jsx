import { useState, useEffect } from "react";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import { useNotification } from "../../contexts/NotificationContext";
import ConfirmModal from "../../components/ConfirmModal";
import EmptyState from "../../components/EmptyState";
import Loader from "../../components/Loader";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaTimes,
  FaMoneyBillWave,
  FaLayerGroup,
  FaCalendarAlt,
  FaToggleOn,
  FaToggleOff,
} from "react-icons/fa";

const FeeStructures = () => {
  const axiosSecure = useAxiosSecure();
  const { success, error: showError } = useNotification();

  const [feeStructures, setFeeStructures] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Filters
  const [filterClassId, setFilterClassId] = useState("");
  const [filterAcademicYear, setFilterAcademicYear] = useState("");

  const [form, setForm] = useState({
    name: "",
    classId: "",
    academicYear: new Date().getFullYear().toString(),
    monthlyAmount: "",
    components: [{ title: "", amount: "" }],
  });

  const fetchFeeStructures = async () => {
    try {
      const params = {};
      if (filterClassId) params.classId = filterClassId;
      if (filterAcademicYear) params.academicYear = filterAcademicYear;

      const res = await axiosSecure.get("/fee-structures", { params });
      if (res.data.success) {
        setFeeStructures(res.data.data);
      }
    } catch (err) {
      showError("Failed to load fee structures");
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const res = await axiosSecure.get("/classes");
      if (res.data.success) {
        setClasses(res.data.data.filter((c) => c.status === "active"));
      }
    } catch {
      // silent
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    fetchFeeStructures();
  }, [filterClassId, filterAcademicYear]);

  const openCreateModal = () => {
    setEditing(null);
    setForm({
      name: "",
      classId: "",
      academicYear: new Date().getFullYear().toString(),
      monthlyAmount: "",
      components: [{ title: "", amount: "" }],
    });
    setModalOpen(true);
  };

  const openEditModal = (fs) => {
    setEditing(fs);
    setForm({
      name: fs.name,
      classId: fs.classId,
      academicYear: fs.academicYear,
      monthlyAmount: fs.monthlyAmount.toString(),
      components:
        fs.components?.length > 0
          ? fs.components.map((c) => ({
              title: c.title,
              amount: c.amount.toString(),
            }))
          : [{ title: "", amount: "" }],
    });
    setModalOpen(true);
  };

  const handleComponentChange = (index, field, value) => {
    const updated = [...form.components];
    updated[index][field] = value;
    setForm((prev) => ({ ...prev, components: updated }));
  };

  const addComponent = () => {
    setForm((prev) => ({
      ...prev,
      components: [...prev.components, { title: "", amount: "" }],
    }));
  };

  const removeComponent = (index) => {
    if (form.components.length <= 1) return;
    const updated = form.components.filter((_, i) => i !== index);
    setForm((prev) => ({ ...prev, components: updated }));
  };

  const calculateComponentTotal = () => {
    return form.components.reduce(
      (sum, c) => sum + (parseFloat(c.amount) || 0),
      0
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.classId || !form.monthlyAmount) {
      showError("Please fill all required fields");
      return;
    }

    const components = form.components
      .filter((c) => c.title && c.amount)
      .map((c) => ({ title: c.title, amount: parseFloat(c.amount) }));

    const payload = {
      name: form.name,
      classId: form.classId,
      academicYear: form.academicYear,
      monthlyAmount: parseFloat(form.monthlyAmount),
      components,
    };

    setSaving(true);
    try {
      if (editing) {
        await axiosSecure.patch(`/fee-structures/${editing._id}`, {
          name: payload.name,
          monthlyAmount: payload.monthlyAmount,
          components: payload.components,
        });
        success("Fee structure updated successfully");
      } else {
        await axiosSecure.post("/fee-structures", payload);
        success("Fee structure created successfully");
      }
      setModalOpen(false);
      fetchFeeStructures();
    } catch (err) {
      showError(err.response?.data?.message || "Failed to save fee structure");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await axiosSecure.delete(`/fee-structures/${deleteTarget._id}`);
      success("Fee structure deleted successfully");
      setDeleteTarget(null);
      fetchFeeStructures();
    } catch (err) {
      showError(
        err.response?.data?.message || "Failed to delete fee structure"
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleToggleActive = async (fs) => {
    try {
      await axiosSecure.patch(`/fee-structures/${fs._id}`, {
        isActive: !fs.isActive,
      });
      success(
        `Fee structure ${!fs.isActive ? "activated" : "deactivated"}`
      );
      fetchFeeStructures();
    } catch (err) {
      showError("Failed to update status");
    }
  };

  if (loading) return <Loader fullPage={false} message="Loading fee structures..." />;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-secondary p-8 shadow-lg">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
              <FaMoneyBillWave className="text-2xl text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Fee Structures</h1>
              <p className="text-white/70 text-sm">
                Manage monthly fee plans per class
              </p>
            </div>
          </div>
          <button onClick={openCreateModal} className="btn btn-sm bg-white/20 hover:bg-white/30 text-white border-0 gap-2">
            <FaPlus /> Add Fee Structure
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card bg-base-100 border border-base-300/50 shadow-sm">
        <div className="card-body p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label"><span className="label-text text-xs">Filter by Class</span></label>
              <select
                className="select select-bordered select-sm w-full"
                value={filterClassId}
                onChange={(e) => setFilterClassId(e.target.value)}
              >
                <option value="">All Classes</option>
                {classes.map((cls) => (
                  <option key={cls._id} value={cls._id}>{cls.name}</option>
                ))}
              </select>
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text text-xs">Academic Year</span></label>
              <select
                className="select select-bordered select-sm w-full"
                value={filterAcademicYear}
                onChange={(e) => setFilterAcademicYear(e.target.value)}
              >
                <option value="">All Years</option>
                {[...new Set(feeStructures.map((f) => f.academicYear))].map(
                  (year) => (
                    <option key={year} value={year}>{year}</option>
                  )
                )}
                <option value={new Date().getFullYear().toString()}>
                  {new Date().getFullYear()}
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Fee Structure Cards */}
      {feeStructures.length === 0 ? (
        <EmptyState
          icon={FaMoneyBillWave}
          title="No fee structures found"
          message="Create a fee structure to define monthly fees for a class."
          action={openCreateModal}
          actionLabel="Create Fee Structure"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {feeStructures.map((fs) => (
            <div
              key={fs._id}
              className={`card bg-base-100 border shadow-sm hover:shadow-md transition-shadow ${
                fs.isActive ? "border-base-300/50" : "border-error/30 opacity-60"
              }`}
            >
              <div className="card-body p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-base">{fs.name}</h3>
                    <p className="text-xs text-base-content/60 flex items-center gap-1 mt-1">
                      <FaLayerGroup className="text-primary" />
                      {fs.className}
                    </p>
                  </div>
                  <span
                    className={`badge badge-sm ${
                      fs.isActive ? "badge-success" : "badge-error"
                    }`}
                  >
                    {fs.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                <div className="mt-3">
                  <p className="text-2xl font-bold text-primary">
                    ৳{fs.monthlyAmount.toLocaleString()}
                    <span className="text-xs font-normal text-base-content/50">
                      /month
                    </span>
                  </p>
                </div>

                {fs.components?.length > 0 && (
                  <div className="mt-3 space-y-1">
                    <p className="text-xs font-semibold text-base-content/50 uppercase">
                      Components
                    </p>
                    {fs.components.map((c, i) => (
                      <div
                        key={i}
                        className="flex justify-between text-sm"
                      >
                        <span className="text-base-content/70">{c.title}</span>
                        <span className="font-medium">৳{c.amount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-1 mt-2 text-xs text-base-content/50">
                  <FaCalendarAlt />
                  <span>{fs.academicYear}</span>
                </div>

                <div className="card-actions justify-end mt-3 pt-3 border-t border-base-300/30">
                  <button
                    onClick={() => handleToggleActive(fs)}
                    className="btn btn-ghost btn-xs gap-1"
                    title={fs.isActive ? "Deactivate" : "Activate"}
                  >
                    {fs.isActive ? (
                      <FaToggleOn className="text-success" />
                    ) : (
                      <FaToggleOff className="text-error" />
                    )}
                  </button>
                  <button
                    onClick={() => openEditModal(fs)}
                    className="btn btn-ghost btn-xs gap-1"
                  >
                    <FaEdit className="text-info" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(fs)}
                    className="btn btn-ghost btn-xs gap-1"
                  >
                    <FaTrash className="text-error" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {modalOpen && (
        <div className="modal modal-open">
          <div className="modal-box max-w-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">
                {editing ? "Edit Fee Structure" : "Create Fee Structure"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="btn btn-ghost btn-sm btn-circle"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Name *</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered input-sm w-full"
                  placeholder="e.g., Class 8 Monthly Fee"
                  value={form.name}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  required
                />
              </div>

              {!editing && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Class *</span>
                    </label>
                    <select
                      className="select select-bordered select-sm w-full"
                      value={form.classId}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          classId: e.target.value,
                        }))
                      }
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
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Academic Year *</span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered input-sm w-full"
                      placeholder="2026"
                      value={form.academicYear}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          academicYear: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                </div>
              )}

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Monthly Amount (৳) *</span>
                </label>
                <input
                  type="number"
                  className="input input-bordered input-sm w-full"
                  placeholder="5000"
                  value={form.monthlyAmount}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      monthlyAmount: e.target.value,
                    }))
                  }
                  required
                  min="0"
                />
              </div>

              {/* Components */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="label-text font-semibold">
                    Fee Components
                  </label>
                  <button
                    type="button"
                    onClick={addComponent}
                    className="btn btn-ghost btn-xs gap-1"
                  >
                    <FaPlus /> Add
                  </button>
                </div>
                <div className="space-y-2">
                  {form.components.map((comp, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <input
                        type="text"
                        className="input input-bordered input-sm flex-1"
                        placeholder="Component title"
                        value={comp.title}
                        onChange={(e) =>
                          handleComponentChange(
                            index,
                            "title",
                            e.target.value
                          )
                        }
                      />
                      <input
                        type="number"
                        className="input input-bordered input-sm w-28"
                        placeholder="Amount"
                        value={comp.amount}
                        onChange={(e) =>
                          handleComponentChange(
                            index,
                            "amount",
                            e.target.value
                          )
                        }
                        min="0"
                      />
                      {form.components.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeComponent(index)}
                          className="btn btn-ghost btn-xs btn-circle"
                        >
                          <FaTimes className="text-error" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-base-content/50 mt-1">
                  Component total: ৳{calculateComponentTotal().toLocaleString()}
                  {form.monthlyAmount &&
                    Math.abs(
                      calculateComponentTotal() -
                        parseFloat(form.monthlyAmount)
                    ) > 0.01 && (
                      <span className="text-warning ml-2">
                        (Does not match monthly amount)
                      </span>
                    )}
                </p>
              </div>

              <div className="modal-action">
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => setModalOpen(false)}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm gap-2"
                  disabled={saving}
                >
                  {saving && (
                    <span className="loading loading-spinner loading-xs" />
                  )}
                  {saving
                    ? "Saving..."
                    : editing
                    ? "Update"
                    : "Create"}
                </button>
              </div>
            </form>
          </div>
          <div className="modal-backdrop" onClick={() => setModalOpen(false)} />
        </div>
      )}

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Fee Structure?"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        loading={deleteLoading}
      />
    </div>
  );
};

export default FeeStructures;
