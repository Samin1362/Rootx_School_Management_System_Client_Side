import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import { useNotification } from "../../contexts/NotificationContext";
import Loader from "../../components/Loader";
import {
  FaArrowLeft,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaBuilding,
  FaUserShield,
  FaBan,
  FaCheckCircle,
  FaCalendar,
  FaEdit,
} from "react-icons/fa";

const UserDetails = () => {
  const { userId } = useParams();
  const axiosSecure = useAxiosSecure();
  const navigate = useNavigate();
  const { success, error: showError } = useNotification();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Change Role Modal
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [newRole, setNewRole] = useState("");
  const [roleReason, setRoleReason] = useState("");

  // Change Status Modal
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [statusReason, setStatusReason] = useState("");

  const fetchUser = async () => {
    setLoading(true);
    try {
      const res = await axiosSecure.get(`/super-admin/users/${userId}`);
      if (res.data.success) {
        setUser(res.data.data);
      }
    } catch (error) {
      showError(error.response?.data?.message || "Failed to fetch user");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const handleChangeRole = async () => {
    if (!newRole || !roleReason.trim()) {
      showError("Please select a role and provide a reason");
      return;
    }
    setActionLoading(true);
    try {
      const res = await axiosSecure.patch(`/super-admin/users/${userId}/role`, {
        role: newRole,
        reason: roleReason,
      });
      if (res.data.success) {
        success(res.data.message || "Role updated successfully");
        setShowRoleModal(false);
        setRoleReason("");
        fetchUser();
      }
    } catch (error) {
      showError(error.response?.data?.message || "Failed to update role");
    } finally {
      setActionLoading(false);
    }
  };

  const handleChangeStatus = async () => {
    if (!newStatus || !statusReason.trim()) {
      showError("Please select a status and provide a reason");
      return;
    }
    setActionLoading(true);
    try {
      const res = await axiosSecure.patch(`/super-admin/users/${userId}/status`, {
        status: newStatus,
        reason: statusReason,
      });
      if (res.data.success) {
        success(res.data.message || "Status updated successfully");
        setShowStatusModal(false);
        setStatusReason("");
        fetchUser();
      }
    } catch (error) {
      showError(error.response?.data?.message || "Failed to update status");
    } finally {
      setActionLoading(false);
    }
  };

  const getRoleBadge = (role) => {
    const colors = {
      super_admin: "badge-error",
      org_owner: "badge-primary",
      admin: "badge-secondary",
      moderator: "badge-accent",
      teacher: "badge-info",
      student: "badge-success",
      parent: "badge-warning",
    };
    return `badge ${colors[role] || "badge-ghost"}`;
  };

  const getStatusBadge = (status) => {
    const colors = {
      active: "badge-success",
      inactive: "badge-ghost",
    };
    return `badge ${colors[status] || "badge-ghost"}`;
  };

  const defaultImg =
    "https://static.vecteezy.com/system/resources/thumbnails/020/765/399/small/default-profile-account-unknown-icon-black-silhouette-free-vector.jpg";

  if (loading) return <Loader />;
  if (!user) return <div className="p-6 text-center">User not found</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="btn btn-ghost btn-sm btn-square"
        >
          <FaArrowLeft />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-base-content">User Details</h1>
          <p className="text-base-content/60 text-sm">View and manage user information</p>
        </div>
      </div>

      {/* User Info Card */}
      <div className="bg-gradient-to-br from-base-100 to-base-200/50 border border-base-300/50 rounded-2xl shadow-md p-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-shrink-0">
            <div className="avatar">
              <div className="w-32 rounded-xl">
                <img
                  src={user.photoURL || defaultImg}
                  alt={user.name}
                  onError={(e) => {
                    e.target.src = defaultImg;
                  }}
                />
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-base-content">{user.name || "Unknown"}</h2>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className={`${getRoleBadge(user.role)} badge-lg`}>
                  {user.role}
                </span>
                <span className={`${getStatusBadge(user.status)} badge-lg`}>
                  {user.status || "active"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-base-content/70">
                <FaEnvelope className="text-primary" />
                <span>{user.email || "---"}</span>
              </div>
              <div className="flex items-center gap-2 text-base-content/70">
                <FaPhone className="text-primary" />
                <span>{user.phone || "---"}</span>
              </div>
              <div className="flex items-center gap-2 text-base-content/70">
                <FaBuilding className="text-primary" />
                <span>{user.organizationName || "---"} (@{user.organizationSlug || "---"})</span>
              </div>
              <div className="flex items-center gap-2 text-base-content/70">
                <FaCalendar className="text-primary" />
                <span>
                  Joined {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "---"}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  setNewRole(user.role);
                  setShowRoleModal(true);
                }}
                className="btn btn-primary btn-sm"
              >
                <FaUserShield /> Change Role
              </button>
              <button
                onClick={() => {
                  setNewStatus(user.status || "active");
                  setShowStatusModal(true);
                }}
                className="btn btn-secondary btn-sm"
              >
                <FaEdit /> Change Status
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Role-Specific Profile */}
      {user.roleProfile && (
        <div className="bg-gradient-to-br from-base-100 to-base-200/50 border border-base-300/50 rounded-2xl shadow-md p-6">
          <h3 className="text-lg font-bold text-base-content mb-4">
            {user.role.charAt(0).toUpperCase() + user.role.slice(1)} Profile
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.entries(user.roleProfile).map(([key, value]) => (
              <div key={key} className="text-sm">
                <span className="text-base-content/60 capitalize">
                  {key.replace(/([A-Z])/g, " $1").trim()}:
                </span>
                <p className="font-semibold text-base-content">
                  {typeof value === "object" ? JSON.stringify(value) : String(value) || "---"}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Organization Details */}
      {user.organization && (
        <div className="bg-gradient-to-br from-base-100 to-base-200/50 border border-base-300/50 rounded-2xl shadow-md p-6">
          <h3 className="text-lg font-bold text-base-content mb-4">Organization Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="text-sm">
              <span className="text-base-content/60">Name:</span>
              <p className="font-semibold text-base-content">{user.organization.name}</p>
            </div>
            <div className="text-sm">
              <span className="text-base-content/60">Slug:</span>
              <p className="font-semibold text-base-content">@{user.organization.slug}</p>
            </div>
            <div className="text-sm">
              <span className="text-base-content/60">Subscription Tier:</span>
              <p className="font-semibold text-base-content">{user.organization.subscriptionTier}</p>
            </div>
            <div className="text-sm">
              <span className="text-base-content/60">Status:</span>
              <p className="font-semibold text-base-content">{user.organization.status}</p>
            </div>
          </div>
          <button
            onClick={() => navigate(`/dashboard/super-admin/organizations/${user.organization._id}`)}
            className="btn btn-sm btn-outline btn-primary mt-4"
          >
            <FaBuilding /> View Organization
          </button>
        </div>
      )}

      {/* Change Role Modal */}
      {showRoleModal && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <FaUserShield className="text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-base-content">Change User Role</h3>
                <p className="text-xs text-base-content/50">
                  Update the role for {user.name}
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">New Role</span>
                </label>
                <select
                  className="select select-bordered w-full"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                >
                  <option value="">Select Role</option>
                  <option value="super_admin">Super Admin</option>
                  <option value="org_owner">Org Owner</option>
                  <option value="admin">Admin</option>
                  <option value="moderator">Moderator</option>
                  <option value="teacher">Teacher</option>
                  <option value="student">Student</option>
                  <option value="parent">Parent</option>
                </select>
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Reason (required)</span>
                </label>
                <textarea
                  className="textarea textarea-bordered w-full"
                  rows={3}
                  placeholder="Provide a reason for changing the role..."
                  value={roleReason}
                  onChange={(e) => setRoleReason(e.target.value)}
                />
              </div>
            </div>
            <div className="modal-action">
              <button
                className="btn"
                onClick={() => {
                  setShowRoleModal(false);
                  setRoleReason("");
                }}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleChangeRole}
                disabled={!newRole || !roleReason.trim() || actionLoading}
              >
                {actionLoading ? (
                  <span className="loading loading-spinner loading-sm" />
                ) : (
                  "Update Role"
                )}
              </button>
            </div>
          </div>
          <div
            className="modal-backdrop"
            onClick={() => setShowRoleModal(false)}
          />
        </dialog>
      )}

      {/* Change Status Modal */}
      {showStatusModal && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                <FaEdit className="text-secondary" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-base-content">Change User Status</h3>
                <p className="text-xs text-base-content/50">
                  Update the status for {user.name}
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">New Status</span>
                </label>
                <select
                  className="select select-bordered w-full"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                >
                  <option value="">Select Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Reason (required)</span>
                </label>
                <textarea
                  className="textarea textarea-bordered w-full"
                  rows={3}
                  placeholder="Provide a reason for changing the status..."
                  value={statusReason}
                  onChange={(e) => setStatusReason(e.target.value)}
                />
              </div>
            </div>
            <div className="modal-action">
              <button
                className="btn"
                onClick={() => {
                  setShowStatusModal(false);
                  setStatusReason("");
                }}
              >
                Cancel
              </button>
              <button
                className="btn btn-secondary"
                onClick={handleChangeStatus}
                disabled={!newStatus || !statusReason.trim() || actionLoading}
              >
                {actionLoading ? (
                  <span className="loading loading-spinner loading-sm" />
                ) : (
                  "Update Status"
                )}
              </button>
            </div>
          </div>
          <div
            className="modal-backdrop"
            onClick={() => setShowStatusModal(false)}
          />
        </dialog>
      )}
    </div>
  );
};

export default UserDetails;
