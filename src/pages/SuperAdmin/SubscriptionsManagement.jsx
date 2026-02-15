import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import { useNotification } from "../../contexts/NotificationContext";
import Loader from "../../components/Loader";
import EmptyState from "../../components/EmptyState";
import {
  FaCreditCard,
  FaSearch,
  FaFilter,
  FaEye,
  FaCrown,
} from "react-icons/fa";

const SubscriptionsManagement = () => {
  const axiosSecure = useAxiosSecure();
  const navigate = useNavigate();
  const { error: showError } = useNotification();

  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [tierFilter, setTierFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [billingCycleFilter, setBillingCycleFilter] = useState("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const params = { page, limit };
      if (tierFilter) params.tier = tierFilter;
      if (statusFilter) params.status = statusFilter;
      if (billingCycleFilter) params.billingCycle = billingCycleFilter;
      if (search) params.search = search;

      const res = await axiosSecure.get("/super-admin/subscriptions", { params });
      if (res.data.success) {
        setSubscriptions(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch (error) {
      showError(error.response?.data?.message || "Failed to fetch subscriptions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, tierFilter, statusFilter, billingCycleFilter, search]);

  useEffect(() => {
    setPage(1);
  }, [tierFilter, statusFilter, billingCycleFilter, search]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
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

  const getStatusBadge = (status) => {
    const colors = {
      active: "badge-success",
      inactive: "badge-ghost",
      suspended: "badge-error",
      cancelled: "badge-warning",
    };
    return `badge ${colors[status] || "badge-ghost"}`;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Background blobs */}
      <div className="fixed top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 rounded-full blur-3xl animate-pulse pointer-events-none opacity-30" />
      <div className="fixed bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-info/20 via-success/20 to-warning/20 rounded-full blur-3xl animate-pulse pointer-events-none opacity-30" />

      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-secondary p-8 shadow-lg">
        <div className="relative z-10 flex items-center gap-4">
          <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
            <FaCreditCard className="text-2xl text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Subscriptions Management</h1>
            <p className="text-white/70 text-sm">Manage all platform subscriptions</p>
          </div>
          {pagination.total > 0 && (
            <span className="ml-auto badge bg-white/20 text-white border-none">
              {pagination.total} subscriptions
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
                placeholder="Search by organization name..."
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
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
          >
            <option value="">All Tiers</option>
            <option value="free">Free</option>
            <option value="basic">Basic</option>
            <option value="professional">Professional</option>
            <option value="enterprise">Enterprise</option>
          </select>
          <select
            className="select select-bordered"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select
            className="select select-bordered"
            value={billingCycleFilter}
            onChange={(e) => setBillingCycleFilter(e.target.value)}
          >
            <option value="">All Billing Cycles</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
      </div>

      {/* Subscriptions Table */}
      {loading && subscriptions.length === 0 ? (
        <Loader />
      ) : subscriptions.length === 0 ? (
        <EmptyState
          icon={FaCreditCard}
          title="No Subscriptions Found"
          message="No subscriptions match your filters."
        />
      ) : (
        <div className="space-y-4">
          <div className="overflow-x-auto bg-gradient-to-br from-base-100 to-base-200/50 border border-base-300/50 rounded-2xl shadow-md">
            <table className="table table-sm">
              <thead>
                <tr className="bg-base-200/50">
                  <th>Organization</th>
                  <th>Tier</th>
                  <th>Status</th>
                  <th>Billing Cycle</th>
                  <th>Amount</th>
                  <th>Next Billing</th>
                  <th>Start Date</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.map((sub) => (
                  <tr key={sub._id} className="hover:bg-base-200/30 transition-colors">
                    <td>
                      <div>
                        <p className="font-medium text-base-content">
                          {sub.organizationName || "Unknown"}
                        </p>
                        <p className="text-xs text-base-content/50">
                          @{sub.organizationSlug || "---"}
                        </p>
                      </div>
                    </td>
                    <td>
                      <span className={`${getTierBadge(sub.tier)} badge-sm`}>
                        {sub.tier}
                      </span>
                    </td>
                    <td>
                      <span className={`${getStatusBadge(sub.status)} badge-sm`}>
                        {sub.status}
                      </span>
                    </td>
                    <td className="text-sm text-base-content/60">
                      {sub.billingCycle || "---"}
                    </td>
                    <td className="text-sm font-semibold text-base-content">
                      ${sub.amount || 0}
                    </td>
                    <td className="text-sm text-base-content/60">
                      {sub.nextBillingDate
                        ? new Date(sub.nextBillingDate).toLocaleDateString()
                        : "---"}
                    </td>
                    <td className="text-sm text-base-content/60">
                      {sub.startDate
                        ? new Date(sub.startDate).toLocaleDateString()
                        : "---"}
                    </td>
                    <td className="text-right">
                      <button
                        onClick={() =>
                          navigate(`/dashboard/super-admin/organizations/${sub.organizationId}`)
                        }
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

export default SubscriptionsManagement;
