import { useState, useEffect } from "react";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import { useNotification } from "../../contexts/NotificationContext";
import ConfirmModal from "../../components/ConfirmModal";
import Loader from "../../components/Loader";
import EmptyState from "../../components/EmptyState";
import {
  FaCrown,
  FaPlus,
  FaEdit,
  FaTrash,
  FaCheckCircle,
  FaBan,
} from "react-icons/fa";

const PlansManagement = () => {
  const axiosSecure = useAxiosSecure();
  const { success, error: showError } = useNotification();

  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Create/Edit Modal
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [formData, setFormData] = useState({
    tier: "",
    name: "",
    monthlyPrice: "",
    yearlyPrice: "",
    maxStudents: "",
    maxClasses: "",
    maxTeachers: "",
    isActive: true,
  });

  // Delete Modal
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const res = await axiosSecure.get("/super-admin/plans");
      if (res.data.success) {
        setPlans(res.data.data);
      }
    } catch (error) {
      showError(error.response?.data?.message || "Failed to fetch plans");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.tier || !formData.name) {
      showError("Tier and name are required");
      return;
    }

    setActionLoading(true);
    try {
      const payload = {
        tier: formData.tier,
        name: formData.name,
        monthlyPrice: parseFloat(formData.monthlyPrice) || 0,
        yearlyPrice: parseFloat(formData.yearlyPrice) || 0,
        limits: {
          maxStudents: parseInt(formData.maxStudents) || 0,
          maxClasses: parseInt(formData.maxClasses) || 0,
          maxTeachers: parseInt(formData.maxTeachers) || 0,
        },
        isActive: formData.isActive,
      };

      if (editingPlan) {
        const res = await axiosSecure.patch(`/super-admin/plans/${editingPlan._id}`, payload);
        if (res.data.success) {
          success(res.data.message || "Plan updated successfully");
        }
      } else {
        const res = await axiosSecure.post("/super-admin/plans", payload);
        if (res.data.success) {
          success(res.data.message || "Plan created successfully");
        }
      }

      setShowModal(false);
      setEditingPlan(null);
      setFormData({
        tier: "",
        name: "",
        monthlyPrice: "",
        yearlyPrice: "",
        maxStudents: "",
        maxClasses: "",
        maxTeachers: "",
        isActive: true,
      });
      fetchPlans();
    } catch (error) {
      showError(error.response?.data?.message || "Failed to save plan");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEdit = (plan) => {
    setEditingPlan(plan);
    setFormData({
      tier: plan.tier,
      name: plan.name,
      monthlyPrice: plan.monthlyPrice.toString(),
      yearlyPrice: plan.yearlyPrice.toString(),
      maxStudents: plan.limits.maxStudents.toString(),
      maxClasses: plan.limits.maxClasses.toString(),
      maxTeachers: plan.limits.maxTeachers.toString(),
      isActive: plan.isActive,
    });
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res = await axiosSecure.delete(`/super-admin/plans/${deleteTarget._id}`);
      if (res.data.success) {
        success(res.data.message || "Plan deleted successfully");
        setDeleteTarget(null);
        fetchPlans();
      }
    } catch (error) {
      showError(error.response?.data?.message || "Failed to delete plan");
    } finally {
      setDeleteLoading(false);
    }
  };

  const getTierBadge = (tier) => {
    const colors = {
      free: "badge-ghost",
      basic: "badge-info",
      professional: "badge-primary",
      enterprise: "badge-secondary",
    };
    return `badge ${colors[tier] || "badge-ghost"}`;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Background blobs */}
      <div className="fixed top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 rounded-full blur-3xl animate-pulse pointer-events-none opacity-30" />
      <div className="fixed bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-info/20 via-success/20 to-warning/20 rounded-full blur-3xl animate-pulse pointer-events-none opacity-30" />

      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-secondary p-8 shadow-lg">
        <div className="relative z-10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
              <FaCrown className="text-2xl text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Plans Management</h1>
              <p className="text-white/70 text-sm">Manage subscription plans and pricing</p>
            </div>
          </div>
          <button
            onClick={() => {
              setEditingPlan(null);
              setFormData({
                tier: "",
                name: "",
                monthlyPrice: "",
                yearlyPrice: "",
                maxStudents: "",
                maxClasses: "",
                maxTeachers: "",
                isActive: true,
              });
              setShowModal(true);
            }}
            className="btn btn-sm bg-white/20 hover:bg-white/30 text-white border-none"
          >
            <FaPlus /> Create Plan
          </button>
        </div>
      </div>

      {/* Plans List */}
      {loading ? (
        <Loader />
      ) : plans.length === 0 ? (
        <EmptyState
          icon={FaCrown}
          title="No Plans Found"
          message="Create your first subscription plan to get started."
          action={() => setShowModal(true)}
          actionLabel="Create Plan"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map((plan, index) => (
            <div
              key={plan._id}
              className="bg-gradient-to-br from-base-100 to-base-200/50 border border-base-300/50 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 p-6 animate-in slide-in-from-bottom"
              style={{ animationDelay: `${index * 30}ms` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className={`${getTierBadge(plan.tier)} badge-lg`}>
                    {plan.tier}
                  </span>
                  {plan.isActive ? (
                    <FaCheckCircle className="text-success" />
                  ) : (
                    <FaBan className="text-error" />
                  )}
                </div>
              </div>

              <h3 className="text-xl font-bold text-base-content mb-2">{plan.name}</h3>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-base-content/60">Monthly:</span>
                  <span className="font-semibold text-base-content">${plan.monthlyPrice}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-base-content/60">Yearly:</span>
                  <span className="font-semibold text-base-content">${plan.yearlyPrice}</span>
                </div>
              </div>

              <div className="divider my-3"></div>

              <div className="space-y-2 mb-4">
                <h4 className="text-sm font-semibold text-base-content/70">Limits</h4>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="text-center">
                    <p className="font-bold text-base-content">{plan.limits.maxStudents}</p>
                    <p className="text-base-content/60">Students</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-base-content">{plan.limits.maxClasses}</p>
                    <p className="text-base-content/60">Classes</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-base-content">{plan.limits.maxTeachers}</p>
                    <p className="text-base-content/60">Teachers</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(plan)}
                  className="btn btn-sm btn-primary flex-1"
                >
                  <FaEdit /> Edit
                </button>
                <button
                  onClick={() => setDeleteTarget(plan)}
                  className="btn btn-sm btn-error btn-square"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <dialog className="modal modal-open">
          <div className="modal-box max-w-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <FaCrown className="text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-base-content">
                  {editingPlan ? "Edit Plan" : "Create New Plan"}
                </h3>
                <p className="text-xs text-base-content/50">
                  {editingPlan ? "Update plan details" : "Add a new subscription plan"}
                </p>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Tier *</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered w-full"
                    placeholder="e.g., basic, professional"
                    value={formData.tier}
                    onChange={(e) => setFormData({ ...formData, tier: e.target.value.toLowerCase() })}
                    required
                    disabled={!!editingPlan}
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Name *</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered w-full"
                    placeholder="e.g., Basic Plan"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Monthly Price</span>
                  </label>
                  <input
                    type="number"
                    className="input input-bordered w-full"
                    placeholder="0"
                    value={formData.monthlyPrice}
                    onChange={(e) => setFormData({ ...formData, monthlyPrice: e.target.value })}
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Yearly Price</span>
                  </label>
                  <input
                    type="number"
                    className="input input-bordered w-full"
                    placeholder="0"
                    value={formData.yearlyPrice}
                    onChange={(e) => setFormData({ ...formData, yearlyPrice: e.target.value })}
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="divider">Limits</div>

              <div className="grid grid-cols-3 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Max Students</span>
                  </label>
                  <input
                    type="number"
                    className="input input-bordered w-full"
                    placeholder="0"
                    value={formData.maxStudents}
                    onChange={(e) => setFormData({ ...formData, maxStudents: e.target.value })}
                    min="0"
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Max Classes</span>
                  </label>
                  <input
                    type="number"
                    className="input input-bordered w-full"
                    placeholder="0"
                    value={formData.maxClasses}
                    onChange={(e) => setFormData({ ...formData, maxClasses: e.target.value })}
                    min="0"
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Max Teachers</span>
                  </label>
                  <input
                    type="number"
                    className="input input-bordered w-full"
                    placeholder="0"
                    value={formData.maxTeachers}
                    onChange={(e) => setFormData({ ...formData, maxTeachers: e.target.value })}
                    min="0"
                  />
                </div>
              </div>

              <div className="form-control">
                <label className="label cursor-pointer justify-start gap-3">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-primary"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                  <span className="label-text">Active (available for subscription)</span>
                </label>
              </div>

              <div className="modal-action">
                <button
                  type="button"
                  className="btn"
                  onClick={() => {
                    setShowModal(false);
                    setEditingPlan(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <span className="loading loading-spinner loading-sm" />
                  ) : editingPlan ? (
                    "Update Plan"
                  ) : (
                    "Create Plan"
                  )}
                </button>
              </div>
            </form>
          </div>
          <div className="modal-backdrop" onClick={() => setShowModal(false)} />
        </dialog>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Plan?"
        message={`Are you sure you want to delete the "${deleteTarget?.name}" plan? This action cannot be undone.`}
        confirmText="Delete"
        loading={deleteLoading}
        variant="danger"
      />
    </div>
  );
};

export default PlansManagement;
