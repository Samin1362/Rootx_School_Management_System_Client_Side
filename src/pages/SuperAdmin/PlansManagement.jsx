import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
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
  const navigate = useNavigate();
  const { success, error: showError } = useNotification();

  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

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
            onClick={() => navigate("/dashboard/super-admin/plans/create")}
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
          action={() => navigate("/dashboard/super-admin/plans/create")}
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
                  onClick={() => navigate(`/dashboard/super-admin/plans/edit/${plan._id}`)}
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
