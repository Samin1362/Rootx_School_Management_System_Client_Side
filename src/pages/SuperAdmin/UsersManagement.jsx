import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import { useNotification } from "../../contexts/NotificationContext";
import Loader from "../../components/Loader";
import EmptyState from "../../components/EmptyState";
import {
  FaUsers,
  FaSearch,
  FaFilter,
  FaEye,
  FaUserShield,
} from "react-icons/fa";

const UsersManagement = () => {
  const axiosSecure = useAxiosSecure();
  const navigate = useNavigate();
  const { error: showError } = useNotification();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [organizationId, setOrganizationId] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = { page, limit };
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
      if (statusFilter) params.status = statusFilter;
      if (organizationId) params.organizationId = organizationId;

      const res = await axiosSecure.get("/super-admin/users", { params });
      if (res.data.success) {
        setUsers(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch (error) {
      showError(error.response?.data?.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, roleFilter, statusFilter, organizationId]);

  useEffect(() => {
    setPage(1);
  }, [search, roleFilter, statusFilter, organizationId]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
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

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Background blobs */}
      <div className="fixed top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 rounded-full blur-3xl animate-pulse pointer-events-none opacity-30" />
      <div className="fixed bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-info/20 via-success/20 to-warning/20 rounded-full blur-3xl animate-pulse pointer-events-none opacity-30" />

      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-secondary p-8 shadow-lg">
        <div className="relative z-10 flex items-center gap-4">
          <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
            <FaUsers className="text-2xl text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Users Management</h1>
            <p className="text-white/70 text-sm">Manage all platform users across organizations</p>
          </div>
          {pagination.total > 0 && (
            <span className="ml-auto badge bg-white/20 text-white border-none">
              {pagination.total} users
            </span>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gradient-to-br from-base-100 to-base-200/50 border border-base-300/50 rounded-2xl shadow-md p-5">
        <div className="flex items-center gap-2 mb-3">
          <FaFilter className="text-primary text-sm" />
          <span className="font-bold text-sm text-base-content">Filters</span>
        </div>
        <div className="flex flex-wrap gap-3">
          <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-[250px]">
            <div className="relative flex-1">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" />
              <input
                type="text"
                className="input input-bordered w-full pl-10"
                placeholder="Search by name, email, phone..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary">
              Search
            </button>
          </form>
          <select
            className="select select-bordered"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="">All Roles</option>
            <option value="super_admin">Super Admin</option>
            <option value="org_owner">Org Owner</option>
            <option value="admin">Admin</option>
            <option value="moderator">Moderator</option>
            <option value="teacher">Teacher</option>
            <option value="student">Student</option>
            <option value="parent">Parent</option>
          </select>
          <select
            className="select select-bordered"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      {loading && users.length === 0 ? (
        <Loader />
      ) : users.length === 0 ? (
        <EmptyState
          icon={FaUsers}
          title="No Users Found"
          message="No users match your filters."
        />
      ) : (
        <div className="space-y-4">
          <div className="overflow-x-auto bg-gradient-to-br from-base-100 to-base-200/50 border border-base-300/50 rounded-2xl shadow-md">
            <table className="table table-sm">
              <thead>
                <tr className="bg-base-200/50">
                  <th>User</th>
                  <th>Organization</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Phone</th>
                  <th>Joined</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-base-200/30 transition-colors">
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="avatar">
                          <div className="w-10 rounded-full">
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
                          <p className="font-medium text-base-content">
                            {user.name || "Unknown"}
                          </p>
                          <p className="text-xs text-base-content/50">
                            {user.email || "---"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div>
                        <p className="font-medium text-sm">{user.organizationName || "---"}</p>
                        <p className="text-xs text-base-content/50">
                          @{user.organizationSlug || "---"}
                        </p>
                      </div>
                    </td>
                    <td>
                      <span className={`${getRoleBadge(user.role)} badge-sm`}>
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <span className={`${getStatusBadge(user.status)} badge-sm`}>
                        {user.status || "active"}
                      </span>
                    </td>
                    <td className="text-sm text-base-content/60">
                      {user.phone || "---"}
                    </td>
                    <td className="text-sm text-base-content/60">
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString()
                        : "---"}
                    </td>
                    <td className="text-right">
                      <button
                        onClick={() => navigate(`/dashboard/super-admin/users/${user._id}`)}
                        className="btn btn-sm btn-ghost btn-square"
                      >
                        <FaEye />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-center mt-6">
              <div className="join">
                <button
                  className="join-item btn btn-sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </button>
                {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === pagination.pages || Math.abs(p - page) <= 1)
                  .map((p, idx, arr) => (
                    <span key={p}>
                      {idx > 0 && arr[idx - 1] !== p - 1 && (
                        <button className="join-item btn btn-sm btn-disabled">...</button>
                      )}
                      <button
                        className={`join-item btn btn-sm ${page === p ? "btn-primary" : ""}`}
                        onClick={() => setPage(p)}
                      >
                        {p}
                      </button>
                    </span>
                  ))}
                <button
                  className="join-item btn btn-sm"
                  onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                  disabled={page === pagination.pages}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UsersManagement;
