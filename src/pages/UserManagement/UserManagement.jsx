import { useState, useEffect } from "react";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import { useNotification } from "../../contexts/NotificationContext";
import ConfirmModal from "../../components/ConfirmModal";
import EmptyState from "../../components/EmptyState";
import Loader from "../../components/Loader";
import { FaPlus, FaTrash, FaUsers, FaSearch, FaUserShield } from "react-icons/fa";

const defaultImg =
  "https://static.vecteezy.com/system/resources/thumbnails/020/765/399/small/default-profile-account-unknown-icon-black-silhouette-free-vector.jpg";

const ROLES = ["admin", "moderator", "teacher", "student", "parent"];

const roleBadgeClass = (role) => {
  switch (role) {
    case "org_owner":
      return "badge-primary";
    case "admin":
      return "badge-secondary";
    case "moderator":
      return "badge-accent";
    case "teacher":
      return "badge-info";
    case "student":
      return "badge-success";
    case "parent":
      return "badge-warning";
    default:
      return "badge-ghost";
  }
};

const UserManagement = () => {
  const axiosSecure = useAxiosSecure();
  const { success, error: showError } = useNotification();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Invite modal state
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    email: "",
    role: "teacher",
    name: "",
  });
  const [inviting, setInviting] = useState(false);

  // Role change loading tracker
  const [roleChangeLoading, setRoleChangeLoading] = useState(null);

  const limit = 10;

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = { page, limit };
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
      if (statusFilter) params.status = statusFilter;

      const res = await axiosSecure.get("/users", { params });
      if (res.data.success) {
        setUsers(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      showError("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, roleFilter, statusFilter, search]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [roleFilter, statusFilter, search]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  // Invite user
  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteForm.email || !inviteForm.role) {
      showError("Email and role are required");
      return;
    }
    setInviting(true);
    try {
      const payload = {
        email: inviteForm.email,
        role: inviteForm.role,
      };
      if (inviteForm.name.trim()) {
        payload.name = inviteForm.name.trim();
      }
      await axiosSecure.post("/users/invite", payload);
      success("Invitation sent successfully");
      setInviteModalOpen(false);
      setInviteForm({ email: "", role: "teacher", name: "" });
      fetchUsers();
    } catch (err) {
      showError(err.response?.data?.message || "Failed to send invitation");
    } finally {
      setInviting(false);
    }
  };

  // Change role
  const handleRoleChange = async (userId, newRole) => {
    setRoleChangeLoading(userId);
    try {
      await axiosSecure.patch(`/users/${userId}/role`, { role: newRole });
      success("Role updated successfully");
      fetchUsers();
    } catch (err) {
      showError(err.response?.data?.message || "Failed to update role");
    } finally {
      setRoleChangeLoading(null);
    }
  };

  // Delete user
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await axiosSecure.delete(`/users/${deleteTarget._id}`);
      success("User removed successfully");
      setDeleteTarget(null);
      fetchUsers();
    } catch (err) {
      showError(err.response?.data?.message || "Failed to remove user");
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading && users.length === 0) return <Loader />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-base-content">User Management</h1>
          <p className="text-base-content/60 text-sm mt-1">
            Manage users, roles, and invitations for your organization
          </p>
        </div>
        <button
          onClick={() => {
            setInviteForm({ email: "", role: "teacher", name: "" });
            setInviteModalOpen(true);
          }}
          className="btn btn-primary btn-sm gap-2"
        >
          <FaPlus /> Invite User
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
          <div className="relative flex-1 max-w-sm">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/30 text-xs" />
            <input
              type="text"
              className="input input-bordered input-sm w-full pl-8"
              placeholder="Search by name, email..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-ghost btn-sm">
            Search
          </button>
        </form>
        <select
          className="select select-bordered select-sm"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="">All Roles</option>
          <option value="org_owner">Org Owner</option>
          <option value="admin">Admin</option>
          <option value="moderator">Moderator</option>
          <option value="teacher">Teacher</option>
          <option value="student">Student</option>
          <option value="parent">Parent</option>
        </select>
        <select
          className="select select-bordered select-sm"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Table */}
      {users.length === 0 && !loading ? (
        <EmptyState
          icon={FaUsers}
          title="No users found"
          message="No users match the current filters. Try adjusting your filters or invite a new user."
        />
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="table table-sm bg-base-100 border border-base-300/50 rounded-xl">
              <thead>
                <tr className="bg-base-200/50">
                  <th>User</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user._id}
                    className="hover:bg-base-200/30 transition-colors"
                  >
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="avatar">
                          <div className="w-8 rounded-full">
                            <img
                              src={user.photoURL || defaultImg}
                              alt={user.name}
                              onError={(e) => {
                                e.target.src = defaultImg;
                              }}
                            />
                          </div>
                        </div>
                        <div>
                          <p className="font-medium text-base-content text-sm">
                            {user.name || "Unknown"}
                          </p>
                          <p className="text-xs text-base-content/50">
                            {user.email || "---"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span
                        className={`badge badge-xs ${roleBadgeClass(user.role)}`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge badge-xs ${
                          user.status === "active"
                            ? "badge-success"
                            : "badge-error"
                        }`}
                      >
                        {user.status || "active"}
                      </span>
                    </td>
                    <td className="text-sm text-base-content/60">
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString()
                        : "---"}
                    </td>
                    <td className="text-right">
                      <div className="flex gap-1 items-center justify-end">
                        <select
                          className="select select-bordered select-xs"
                          value={user.role}
                          disabled={
                            user.role === "org_owner" ||
                            roleChangeLoading === user._id
                          }
                          onChange={(e) =>
                            handleRoleChange(user._id, e.target.value)
                          }
                        >
                          <option value="org_owner" disabled>
                            org_owner
                          </option>
                          {ROLES.map((r) => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}
                        </select>
                        {roleChangeLoading === user._id && (
                          <span className="loading loading-spinner loading-xs" />
                        )}
                        <button
                          onClick={() => setDeleteTarget(user)}
                          className="btn btn-ghost btn-xs text-error"
                          disabled={user.role === "org_owner"}
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

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-base-content/60">
                Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                {Math.min(
                  pagination.page * pagination.limit,
                  pagination.total
                )}{" "}
                of {pagination.total} users
              </p>
              <div className="join">
                <button
                  className="join-item btn btn-sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </button>
                {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                  .filter((p) => {
                    return (
                      p === 1 ||
                      p === pagination.pages ||
                      Math.abs(p - page) <= 1
                    );
                  })
                  .reduce((acc, p, idx, arr) => {
                    if (idx > 0 && p - arr[idx - 1] > 1) {
                      acc.push(
                        <button
                          key={`ellipsis-${p}`}
                          className="join-item btn btn-sm btn-disabled"
                        >
                          ...
                        </button>
                      );
                    }
                    acc.push(
                      <button
                        key={p}
                        className={`join-item btn btn-sm ${
                          p === page ? "btn-active" : ""
                        }`}
                        onClick={() => setPage(p)}
                      >
                        {p}
                      </button>
                    );
                    return acc;
                  }, [])}
                <button
                  className="join-item btn btn-sm"
                  disabled={page >= pagination.pages}
                  onClick={() =>
                    setPage((p) => Math.min(pagination.pages, p + 1))
                  }
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Loading overlay for subsequent fetches */}
      {loading && users.length > 0 && (
        <div className="fixed inset-0 bg-base-100/50 flex items-center justify-center z-40">
          <span className="loading loading-spinner loading-lg text-primary" />
        </div>
      )}

      {/* Invite Modal */}
      {inviteModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box max-w-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <FaUserShield className="text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-base-content">
                  Invite User
                </h3>
                <p className="text-xs text-base-content/50">
                  Send an invitation to join your organization
                </p>
              </div>
            </div>
            <form onSubmit={handleInvite} className="space-y-3">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Email Address *</span>
                </label>
                <input
                  type="email"
                  className="input input-bordered input-sm w-full"
                  placeholder="user@example.com"
                  value={inviteForm.email}
                  onChange={(e) =>
                    setInviteForm({ ...inviteForm, email: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Role *</span>
                </label>
                <select
                  className="select select-bordered select-sm w-full"
                  value={inviteForm.role}
                  onChange={(e) =>
                    setInviteForm({ ...inviteForm, role: e.target.value })
                  }
                  required
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r.charAt(0).toUpperCase() + r.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Name (optional)</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered input-sm w-full"
                  placeholder="Full name"
                  value={inviteForm.name}
                  onChange={(e) =>
                    setInviteForm({ ...inviteForm, name: e.target.value })
                  }
                />
              </div>
              <div className="modal-action">
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => setInviteModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={inviting}
                >
                  {inviting && (
                    <span className="loading loading-spinner loading-xs" />
                  )}
                  Send Invite
                </button>
              </div>
            </form>
          </div>
          <div
            className="modal-backdrop"
            onClick={() => setInviteModalOpen(false)}
          />
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Remove User?"
        message={`Are you sure you want to remove "${
          deleteTarget?.name || deleteTarget?.email || "this user"
        }" from the organization? This action cannot be undone.`}
        confirmText="Remove"
        loading={deleteLoading}
        variant="danger"
      />
    </div>
  );
};

export default UserManagement;
