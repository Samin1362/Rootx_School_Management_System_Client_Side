import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import { useNotification } from "../../contexts/NotificationContext";
import Loader from "../../components/Loader";
import EmptyState from "../../components/EmptyState";
import {
  FaBuilding,
  FaSearch,
  FaFilter,
  FaEye,
  FaCheckCircle,
  FaBan,
  FaCrown,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";

const OrganizationsManagement = () => {
  const axiosSecure = useAxiosSecure();
  const navigate = useNavigate();
  const { error: showError } = useNotification();

  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [tierFilter, setTierFilter] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });

  // Accordion state for mobile
  const [expandedOrg, setExpandedOrg] = useState(null);

  const fetchOrganizations = async () => {
    setLoading(true);
    try {
      const params = { page, limit };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (tierFilter) params.subscriptionTier = tierFilter;

      const res = await axiosSecure.get("/super-admin/organizations", { params });
      if (res.data.success) {
        setOrganizations(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch (error) {
      showError(error.response?.data?.message || "Failed to fetch organizations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, statusFilter, tierFilter]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, tierFilter]);

  const getStatusBadge = (status) => {
    const colors = {
      active: "badge-success",
      suspended: "badge-error",
      inactive: "badge-ghost",
    };
    return `badge ${colors[status] || "badge-ghost"}`;
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
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-secondary p-5 lg:p-8 shadow-lg">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="p-2 lg:p-3 bg-white/20 backdrop-blur-sm rounded-xl">
            <FaBuilding className="text-xl lg:text-2xl text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl lg:text-2xl font-bold text-white">Organizations Management</h1>
            <p className="text-white/70 text-xs lg:text-sm mt-1">Manage all platform organizations</p>
          </div>
          {pagination.total > 0 && (
            <span className="badge badge-sm lg:badge-md bg-white/20 text-white border-none self-start sm:self-center">
              {pagination.total} organizations
            </span>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gradient-to-br from-base-100 to-base-200/50 border border-base-300/50 rounded-2xl shadow-md p-4 lg:p-5">
        <div className="flex items-center gap-2 mb-3">
          <FaFilter className="text-primary text-sm" />
          <span className="font-bold text-sm text-base-content">Filters</span>
        </div>
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Search - Full width on mobile, flexible on desktop */}
          <div className="relative flex-1 lg:min-w-[200px]">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40 text-sm" />
            <input
              type="text"
              className="input input-bordered w-full pl-10 input-sm lg:input-md"
              placeholder="Search by name, email, slug..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <select
            className="select select-bordered w-full lg:w-auto select-sm lg:select-md"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="inactive">Inactive</option>
          </select>

          {/* Tier Filter */}
          <select
            className="select select-bordered w-full lg:w-auto select-sm lg:select-md"
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
          >
            <option value="">All Tiers</option>
            <option value="free">Free</option>
            <option value="basic">Basic</option>
            <option value="professional">Professional</option>
            <option value="enterprise">Enterprise</option>
          </select>
        </div>
      </div>

      {/* Organizations Table */}
      {loading && organizations.length === 0 ? (
        <Loader />
      ) : organizations.length === 0 ? (
        <EmptyState
          icon={FaBuilding}
          title="No Organizations Found"
          message="No organizations match your filters."
        />
      ) : (
        <div className="space-y-4">
          {organizations.map((org, index) => {
            const isExpanded = expandedOrg === org._id;

            return (
              <div
                key={org._id}
                className="bg-gradient-to-br from-base-100 to-base-200/50 border border-base-300/50 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden animate-in slide-in-from-bottom"
                style={{ animationDelay: `${index * 30}ms` }}
              >
                {/* Mobile Accordion Header - Visible on small screens */}
                <div className="lg:hidden">
                  <button
                    onClick={() => setExpandedOrg(isExpanded ? null : org._id)}
                    className="w-full p-4 flex items-center gap-3 hover:bg-base-200/30 transition-colors"
                  >
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        {org.logo ? (
                          <img src={org.logo} alt={org.name} className="w-full h-full rounded-lg object-cover" />
                        ) : (
                          <FaBuilding className="text-xl text-primary" />
                        )}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0 text-left">
                      <h3 className="font-bold text-base-content truncate text-base">{org.name}</h3>
                      <p className="text-xs text-base-content/60">@{org.slug}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`${getStatusBadge(org.status)} badge-xs px-2 py-1 font-medium capitalize`}>
                          {org.status}
                        </span>
                        <span className={`${getTierBadge(org.subscriptionTier)} badge-xs px-2 py-1 font-medium capitalize`}>
                          {org.subscriptionTier}
                        </span>
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      {isExpanded ? (
                        <FaChevronUp className="text-base-content/60" />
                      ) : (
                        <FaChevronDown className="text-base-content/60" />
                      )}
                    </div>
                  </button>

                  {/* Mobile Accordion Content */}
                  <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="p-4 pt-0 space-y-3 border-t border-base-300/30">
                      {/* Owner Info */}
                      <div className="bg-base-200/50 rounded-xl p-3 border border-base-300/30">
                        <span className="text-xs text-base-content/60 uppercase tracking-wider font-semibold">Owner</span>
                        <p className="font-semibold text-base-content text-sm mt-1">
                          {org.ownerName}
                        </p>
                        <p className="text-xs text-base-content/50">{org.ownerEmail}</p>
                      </div>

                      {/* Email */}
                      <div className="bg-base-200/50 rounded-xl p-3 border border-base-300/30">
                        <span className="text-xs text-base-content/60 uppercase tracking-wider font-semibold">Email</span>
                        <p className="font-semibold text-base-content text-sm mt-1">{org.email}</p>
                      </div>

                      {/* Subscription */}
                      <div className="bg-base-200/50 rounded-xl p-3 border border-base-300/30">
                        <span className="text-xs text-base-content/60 uppercase tracking-wider font-semibold">Subscription</span>
                        <p className="font-semibold text-base-content text-sm mt-1 capitalize">{org.subscriptionStatus}</p>
                      </div>

                      {/* Usage Stats */}
                      <div className="flex flex-col gap-2">
                        <div className="px-3 py-2 rounded-lg bg-info/10 border border-info/20">
                          <span className="text-xs text-base-content/60">Students: </span>
                          <span className="font-bold text-info">
                            {org.usagePercentages?.students || 0}%
                          </span>
                        </div>
                        <div className="px-3 py-2 rounded-lg bg-success/10 border border-success/20">
                          <span className="text-xs text-base-content/60">Classes: </span>
                          <span className="font-bold text-success">
                            {org.usagePercentages?.classes || 0}%
                          </span>
                        </div>
                        <div className="px-3 py-2 rounded-lg bg-warning/10 border border-warning/20">
                          <span className="text-xs text-base-content/60">Teachers: </span>
                          <span className="font-bold text-warning">
                            {org.usagePercentages?.teachers || 0}%
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2 pt-2">
                        <button
                          onClick={() => navigate(`/dashboard/super-admin/organizations/${org._id}`)}
                          className="btn btn-sm btn-primary gap-2 w-full hover:shadow-lg transition-all duration-300"
                        >
                          <FaEye className="text-sm" /> View Details
                        </button>
                        {org.status === "active" && (
                          <span className="badge badge-sm badge-success gap-1 w-full py-3">
                            <FaCheckCircle className="text-xs" /> Active Organization
                          </span>
                        )}
                        {org.status === "suspended" && (
                          <span className="badge badge-sm badge-error gap-1 w-full py-3">
                            <FaBan className="text-xs" /> Suspended Organization
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Desktop Card View - Visible on large screens */}
                <div className="hidden lg:block p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center">
                        {org.logo ? (
                          <img src={org.logo} alt={org.name} className="w-full h-full rounded-xl object-cover" />
                        ) : (
                          <FaBuilding className="text-2xl text-primary" />
                        )}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold text-base-content truncate">{org.name}</h3>
                          <p className="text-sm text-base-content/60">@{org.slug}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className={`${getStatusBadge(org.status)} badge-sm px-3 py-2 font-medium capitalize`}>
                            {org.status}
                          </span>
                          <span className={`${getTierBadge(org.subscriptionTier)} badge-sm px-3 py-2 font-medium capitalize`}>
                            {org.subscriptionTier}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                        <div className="bg-base-200/50 rounded-xl p-3 border border-base-300/30">
                          <span className="text-xs text-base-content/60 uppercase tracking-wider font-semibold">Owner</span>
                          <p className="font-semibold text-base-content text-sm mt-1 truncate">
                            {org.ownerName}
                          </p>
                          <p className="text-xs text-base-content/50 truncate">{org.ownerEmail}</p>
                        </div>
                        <div className="bg-base-200/50 rounded-xl p-3 border border-base-300/30">
                          <span className="text-xs text-base-content/60 uppercase tracking-wider font-semibold">Email</span>
                          <p className="font-semibold text-base-content text-sm mt-1 truncate">{org.email}</p>
                        </div>
                        <div className="bg-base-200/50 rounded-xl p-3 border border-base-300/30">
                          <span className="text-xs text-base-content/60 uppercase tracking-wider font-semibold">Subscription</span>
                          <p className="font-semibold text-base-content text-sm mt-1 capitalize">{org.subscriptionStatus}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 mb-4 flex-wrap">
                        <div className="px-3 py-2 rounded-lg bg-info/10 border border-info/20">
                          <span className="text-xs text-base-content/60">Students: </span>
                          <span className="font-bold text-info">
                            {org.usagePercentages?.students || 0}%
                          </span>
                        </div>
                        <div className="px-3 py-2 rounded-lg bg-success/10 border border-success/20">
                          <span className="text-xs text-base-content/60">Classes: </span>
                          <span className="font-bold text-success">
                            {org.usagePercentages?.classes || 0}%
                          </span>
                        </div>
                        <div className="px-3 py-2 rounded-lg bg-warning/10 border border-warning/20">
                          <span className="text-xs text-base-content/60">Teachers: </span>
                          <span className="font-bold text-warning">
                            {org.usagePercentages?.teachers || 0}%
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-base-300/30">
                        <button
                          onClick={() => navigate(`/dashboard/super-admin/organizations/${org._id}`)}
                          className="btn btn-sm btn-primary gap-2 hover:shadow-lg transition-all duration-300"
                        >
                          <FaEye className="text-sm" /> View Details
                        </button>
                        {org.status === "active" && (
                          <span className="badge badge-sm badge-success gap-1">
                            <FaCheckCircle className="text-xs" /> Active
                          </span>
                        )}
                        {org.status === "suspended" && (
                          <span className="badge badge-sm badge-error gap-1">
                            <FaBan className="text-xs" /> Suspended
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

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

export default OrganizationsManagement;
