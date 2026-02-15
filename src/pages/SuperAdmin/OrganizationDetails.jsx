import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import { useNotification } from "../../contexts/NotificationContext";
import Loader from "../../components/Loader";
import {
  FaBuilding,
  FaBan,
  FaCheckCircle,
  FaCrown,
  FaTrash,
  FaEdit,
  FaArrowLeft,
  FaUsers,
  FaUserGraduate,
  FaChalkboardTeacher,
  FaLayerGroup,
} from "react-icons/fa";

const OrganizationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const axiosSecure = useAxiosSecure();
  const { success: showSuccess, error: showError } = useNotification();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [showReactivateModal, setShowReactivateModal] = useState(false);
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Form states
  const [suspendReason, setSuspendReason] = useState("");
  const [reactivateComment, setReactivateComment] = useState("");
  const [overrideLimits, setOverrideLimits] = useState({});
  const [overrideReason, setOverrideReason] = useState("");
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [deleteAllData, setDeleteAllData] = useState(false);

  useEffect(() => {
    fetchDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchDetails = async () => {
    try {
      const res = await axiosSecure.get(`/super-admin/organizations/${id}`);
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (error) {
      showError(error.response?.data?.message || "Failed to fetch organization details");
    } finally {
      setLoading(false);
    }
  };

  const handleSuspend = async () => {
    if (!suspendReason.trim()) {
      showError("Reason is required");
      return;
    }
    try {
      await axiosSecure.post(`/super-admin/organizations/${id}/suspend`, {
        reason: suspendReason,
      });
      showSuccess("Organization suspended successfully");
      setShowSuspendModal(false);
      setSuspendReason("");
      fetchDetails();
    } catch (error) {
      showError(error.response?.data?.message || "Failed to suspend organization");
    }
  };

  const handleReactivate = async () => {
    try {
      await axiosSecure.post(`/super-admin/organizations/${id}/reactivate`, {
        comment: reactivateComment,
      });
      showSuccess("Organization reactivated successfully");
      setShowReactivateModal(false);
      setReactivateComment("");
      fetchDetails();
    } catch (error) {
      showError(error.response?.data?.message || "Failed to reactivate organization");
    }
  };

  const handleOverrideLimits = async () => {
    if (!overrideReason.trim()) {
      showError("Reason is required");
      return;
    }
    if (Object.keys(overrideLimits).length === 0) {
      showError("At least one limit must be provided");
      return;
    }
    try {
      await axiosSecure.post(`/super-admin/organizations/${id}/override-limits`, {
        ...overrideLimits,
        reason: overrideReason,
      });
      showSuccess("Usage limits overridden successfully");
      setShowOverrideModal(false);
      setOverrideLimits({});
      setOverrideReason("");
      fetchDetails();
    } catch (error) {
      showError(error.response?.data?.message || "Failed to override limits");
    }
  };

  const handleDelete = async () => {
    if (deleteConfirmation !== data?.organization?.name) {
      showError("Confirmation name does not match");
      return;
    }
    try {
      await axiosSecure.delete(`/super-admin/organizations/${id}`, {
        data: { confirmation: deleteConfirmation, deleteAllData },
      });
      showSuccess("Organization deleted successfully");
      navigate("/dashboard/super-admin/organizations");
    } catch (error) {
      showError(error.response?.data?.message || "Failed to delete organization");
    }
  };

  if (loading) return <Loader />;

  const { organization, owner, subscription, statistics, recentActivity } = data || {};

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Background blobs */}
      <div className="fixed top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 rounded-full blur-3xl animate-pulse pointer-events-none opacity-30" />

      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-secondary p-8 shadow-lg">
        <div className="relative z-10">
          <button
            onClick={() => navigate("/dashboard/super-admin/organizations")}
            className="btn btn-sm btn-ghost text-white mb-4"
          >
            <FaArrowLeft /> Back to Organizations
          </button>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
              <FaBuilding className="text-2xl text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{organization?.name}</h1>
              <p className="text-white/70 text-sm">@{organization?.slug}</p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <span className={`badge ${organization?.status === "active" ? "badge-success" : "badge-error"} badge-lg`}>
                {organization?.status}
              </span>
              <span className="badge badge-secondary badge-lg">{organization?.subscriptionTier}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        {organization?.status === "active" ? (
          <button
            onClick={() => setShowSuspendModal(true)}
            className="btn btn-error"
          >
            <FaBan /> Suspend Organization
          </button>
        ) : (
          <button
            onClick={() => setShowReactivateModal(true)}
            className="btn btn-success"
          >
            <FaCheckCircle /> Reactivate Organization
          </button>
        )}
        <button
          onClick={() => setShowOverrideModal(true)}
          className="btn btn-warning"
        >
          <FaCrown /> Override Limits
        </button>
        <button
          onClick={() => navigate(`/dashboard/super-admin/organizations/${id}/edit`)}
          className="btn btn-info"
        >
          <FaEdit /> Edit Details
        </button>
        <button
          onClick={() => setShowDeleteModal(true)}
          className="btn btn-outline btn-error"
        >
          <FaTrash /> Delete Organization
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-base-100 to-base-200/50 border border-base-300/50 rounded-2xl shadow-md p-6">
          <div className="flex items-center gap-3">
            <FaUsers className="text-2xl text-primary" />
            <div>
              <p className="text-sm text-base-content/60">Total Users</p>
              <p className="text-2xl font-bold">{statistics?.totalUsers || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-base-100 to-base-200/50 border border-base-300/50 rounded-2xl shadow-md p-6">
          <div className="flex items-center gap-3">
            <FaUserGraduate className="text-2xl text-success" />
            <div>
              <p className="text-sm text-base-content/60">Students</p>
              <p className="text-2xl font-bold">{statistics?.totalStudents || 0}</p>
              <p className="text-xs text-base-content/60">{statistics?.usagePercentages?.students || 0}% used</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-base-100 to-base-200/50 border border-base-300/50 rounded-2xl shadow-md p-6">
          <div className="flex items-center gap-3">
            <FaChalkboardTeacher className="text-2xl text-info" />
            <div>
              <p className="text-sm text-base-content/60">Teachers</p>
              <p className="text-2xl font-bold">{statistics?.totalTeachers || 0}</p>
              <p className="text-xs text-base-content/60">{statistics?.usagePercentages?.teachers || 0}% used</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-base-100 to-base-200/50 border border-base-300/50 rounded-2xl shadow-md p-6">
          <div className="flex items-center gap-3">
            <FaLayerGroup className="text-2xl text-secondary" />
            <div>
              <p className="text-sm text-base-content/60">Classes</p>
              <p className="text-2xl font-bold">{statistics?.totalClasses || 0}</p>
              <p className="text-xs text-base-content/60">{statistics?.usagePercentages?.classes || 0}% used</p>
            </div>
          </div>
        </div>
      </div>

      {/* Organization Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-base-100 to-base-200/50 border border-base-300/50 rounded-2xl shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Organization Details</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-base-content/60">Name</p>
              <p className="font-semibold">{organization?.name}</p>
            </div>
            <div>
              <p className="text-sm text-base-content/60">Email</p>
              <p className="font-semibold">{organization?.email}</p>
            </div>
            <div>
              <p className="text-sm text-base-content/60">Phone</p>
              <p className="font-semibold">{organization?.phone || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-base-content/60">Address</p>
              <p className="font-semibold">{organization?.address || "N/A"}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-base-100 to-base-200/50 border border-base-300/50 rounded-2xl shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Owner Details</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-base-content/60">Name</p>
              <p className="font-semibold">{owner?.name || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-base-content/60">Email</p>
              <p className="font-semibold">{owner?.email || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-base-content/60">Phone</p>
              <p className="font-semibold">{owner?.phone || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-base-content/60">Last Login</p>
              <p className="font-semibold">
                {owner?.lastLogin ? new Date(owner.lastLogin).toLocaleString() : "Never"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Info */}
      {subscription && (
        <div className="bg-gradient-to-br from-base-100 to-base-200/50 border border-base-300/50 rounded-2xl shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Subscription Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-base-content/60">Tier</p>
              <p className="font-semibold">{subscription.tier}</p>
            </div>
            <div>
              <p className="text-sm text-base-content/60">Status</p>
              <p className="font-semibold">{subscription.status}</p>
            </div>
            <div>
              <p className="text-sm text-base-content/60">Billing Cycle</p>
              <p className="font-semibold">{subscription.billingCycle}</p>
            </div>
            <div>
              <p className="text-sm text-base-content/60">Amount</p>
              <p className="font-semibold">{subscription.currency} {subscription.amount}</p>
            </div>
            <div>
              <p className="text-sm text-base-content/60">Trial End Date</p>
              <p className="font-semibold">
                {subscription.trialEndDate ? new Date(subscription.trialEndDate).toLocaleDateString() : "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm text-base-content/60">Next Billing</p>
              <p className="font-semibold">
                {subscription.nextBillingDate ? new Date(subscription.nextBillingDate).toLocaleDateString() : "N/A"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Suspend Modal */}
      {showSuspendModal && (
        <dialog open className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Suspend Organization</h3>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Reason for suspension *</span>
              </label>
              <textarea
                className="textarea textarea-bordered h-24"
                placeholder="Enter reason..."
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
              />
            </div>
            <div className="modal-action">
              <button onClick={() => setShowSuspendModal(false)} className="btn">
                Cancel
              </button>
              <button onClick={handleSuspend} className="btn btn-error">
                Suspend
              </button>
            </div>
          </div>
        </dialog>
      )}

      {/* Reactivate Modal */}
      {showReactivateModal && (
        <dialog open className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Reactivate Organization</h3>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Comment (optional)</span>
              </label>
              <textarea
                className="textarea textarea-bordered h-24"
                placeholder="Enter comment..."
                value={reactivateComment}
                onChange={(e) => setReactivateComment(e.target.value)}
              />
            </div>
            <div className="modal-action">
              <button onClick={() => setShowReactivateModal(false)} className="btn">
                Cancel
              </button>
              <button onClick={handleReactivate} className="btn btn-success">
                Reactivate
              </button>
            </div>
          </div>
        </dialog>
      )}

      {/* Override Limits Modal */}
      {showOverrideModal && (
        <dialog open className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Override Usage Limits</h3>
            <div className="space-y-3">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Max Students (-1 for unlimited)</span>
                </label>
                <input
                  type="number"
                  className="input input-bordered"
                  placeholder="Leave empty to keep current"
                  onChange={(e) =>
                    setOverrideLimits((prev) => ({
                      ...prev,
                      maxStudents: e.target.value ? Number(e.target.value) : undefined,
                    }))
                  }
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Max Classes</span>
                </label>
                <input
                  type="number"
                  className="input input-bordered"
                  placeholder="Leave empty to keep current"
                  onChange={(e) =>
                    setOverrideLimits((prev) => ({
                      ...prev,
                      maxClasses: e.target.value ? Number(e.target.value) : undefined,
                    }))
                  }
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Max Teachers</span>
                </label>
                <input
                  type="number"
                  className="input input-bordered"
                  placeholder="Leave empty to keep current"
                  onChange={(e) =>
                    setOverrideLimits((prev) => ({
                      ...prev,
                      maxTeachers: e.target.value ? Number(e.target.value) : undefined,
                    }))
                  }
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Reason *</span>
                </label>
                <textarea
                  className="textarea textarea-bordered h-20"
                  placeholder="Enter reason..."
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                />
              </div>
            </div>
            <div className="modal-action">
              <button onClick={() => setShowOverrideModal(false)} className="btn">
                Cancel
              </button>
              <button onClick={handleOverrideLimits} className="btn btn-warning">
                Override
              </button>
            </div>
          </div>
        </dialog>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <dialog open className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg text-error mb-4">Delete Organization (DANGEROUS)</h3>
            <p className="mb-4">
              This action is permanent and cannot be undone. Please type the organization name exactly to confirm:
            </p>
            <p className="font-bold mb-2">{organization?.name}</p>
            <div className="form-control mb-3">
              <input
                type="text"
                className="input input-bordered"
                placeholder="Type organization name"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
              />
            </div>
            <div className="form-control">
              <label className="label cursor-pointer justify-start gap-2">
                <input
                  type="checkbox"
                  className="checkbox checkbox-error"
                  checked={deleteAllData}
                  onChange={(e) => setDeleteAllData(e.target.checked)}
                />
                <span className="label-text">Delete all associated data (users, students, classes, etc.)</span>
              </label>
            </div>
            <div className="modal-action">
              <button onClick={() => setShowDeleteModal(false)} className="btn">
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="btn btn-error"
                disabled={deleteConfirmation !== organization?.name}
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </dialog>
      )}
    </div>
  );
};

export default OrganizationDetails;
