import { useState, useEffect } from "react";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import { useNotification } from "../../contexts/NotificationContext";
import Loader from "../../components/Loader";
import EmptyState from "../../components/EmptyState";
import {
  FaClipboardList,
  FaCheckCircle,
  FaTimesCircle,
  FaArrowRight,
  FaFilter,
} from "react-icons/fa";

const SubscriptionRequests = () => {
  const axiosSecure = useAxiosSecure();
  const { success, error: showError } = useNotification();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  // Approve Modal
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [approveComment, setApproveComment] = useState("");
  const [effectiveDate, setEffectiveDate] = useState("");

  // Reject Modal
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  // Filters
  const [statusFilter, setStatusFilter] = useState("pending");

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;

      const res = await axiosSecure.get("/super-admin/subscription-requests", { params });
      if (res.data.success) {
        setRequests(res.data.data);
      }
    } catch (error) {
      showError(error.response?.data?.message || "Failed to fetch subscription requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const handleApprove = async () => {
    if (!approveComment.trim() || !effectiveDate) {
      showError("Please provide a comment and effective date");
      return;
    }
    setActionLoading(selectedRequest._id);
    try {
      const res = await axiosSecure.post(
        `/super-admin/subscription-requests/${selectedRequest._id}/approve`,
        {
          comment: approveComment,
          effectiveDate,
        }
      );
      if (res.data.success) {
        success(res.data.message || "Request approved successfully");
        setShowApproveModal(false);
        setApproveComment("");
        setEffectiveDate("");
        setSelectedRequest(null);
        fetchRequests();
      }
    } catch (error) {
      showError(error.response?.data?.message || "Failed to approve request");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      showError("Please provide a reason for rejection");
      return;
    }
    setActionLoading(selectedRequest._id);
    try {
      const res = await axiosSecure.post(
        `/super-admin/subscription-requests/${selectedRequest._id}/reject`,
        {
          reason: rejectReason,
        }
      );
      if (res.data.success) {
        success(res.data.message || "Request rejected successfully");
        setShowRejectModal(false);
        setRejectReason("");
        setSelectedRequest(null);
        fetchRequests();
      }
    } catch (error) {
      showError(error.response?.data?.message || "Failed to reject request");
    } finally {
      setActionLoading(null);
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

  const getStatusBadge = (status) => {
    const colors = {
      pending: "badge-warning",
      approved: "badge-success",
      rejected: "badge-error",
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
            <FaClipboardList className="text-2xl text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Subscription Requests</h1>
            <p className="text-white/70 text-sm">Review and manage subscription upgrade/downgrade requests</p>
          </div>
          {requests.length > 0 && (
            <span className="ml-auto badge bg-white/20 text-white border-none">
              {requests.length} requests
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
        <div className="flex gap-3">
          <select
            className="select select-bordered"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Requests List */}
      {loading ? (
        <Loader />
      ) : requests.length === 0 ? (
        <EmptyState
          icon={FaClipboardList}
          title="No Subscription Requests"
          message="There are no subscription requests at the moment."
        />
      ) : (
        <div className="space-y-4">
          {requests.map((request, index) => (
            <div
              key={request._id}
              className="bg-gradient-to-br from-base-100 to-base-200/50 border border-base-300/50 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 p-6 animate-in slide-in-from-bottom"
              style={{ animationDelay: `${index * 30}ms` }}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-bold text-base-content">
                      {request.organizationName}
                    </h3>
                    <span className={`${getStatusBadge(request.status)} badge-sm`}>
                      {request.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-base-content/70 mb-2">
                    <span className={`${getTierBadge(request.currentTier)} badge-sm`}>
                      {request.currentTier}
                    </span>
                    <FaArrowRight className="text-primary" />
                    <span className={`${getTierBadge(request.requestedTier)} badge-sm`}>
                      {request.requestedTier}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-base-content/60">
                    <div>
                      <span className="font-medium">Requested by:</span> {request.requestedByName || "---"}
                    </div>
                    <div>
                      <span className="font-medium">Request Date:</span>{" "}
                      {request.createdAt ? new Date(request.createdAt).toLocaleDateString() : "---"}
                    </div>
                  </div>

                  {request.reason && (
                    <div className="mt-2 text-sm">
                      <span className="font-medium text-base-content/70">Reason:</span>
                      <p className="text-base-content/60 mt-1">{request.reason}</p>
                    </div>
                  )}

                  {request.rejectionReason && (
                    <div className="mt-2 text-sm">
                      <span className="font-medium text-error">Rejection Reason:</span>
                      <p className="text-base-content/60 mt-1">{request.rejectionReason}</p>
                    </div>
                  )}
                </div>

                {request.status === "pending" && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedRequest(request);
                        setShowApproveModal(true);
                      }}
                      className="btn btn-success btn-sm"
                      disabled={actionLoading === request._id}
                    >
                      <FaCheckCircle /> Approve
                    </button>
                    <button
                      onClick={() => {
                        setSelectedRequest(request);
                        setShowRejectModal(true);
                      }}
                      className="btn btn-error btn-sm"
                      disabled={actionLoading === request._id}
                    >
                      <FaTimesCircle /> Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Approve Modal */}
      {showApproveModal && selectedRequest && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                <FaCheckCircle className="text-success" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-base-content">Approve Subscription Request</h3>
                <p className="text-xs text-base-content/50">
                  {selectedRequest.organizationName}: {selectedRequest.currentTier} → {selectedRequest.requestedTier}
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Effective Date (required)</span>
                </label>
                <input
                  type="date"
                  className="input input-bordered w-full"
                  value={effectiveDate}
                  onChange={(e) => setEffectiveDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Comment (required)</span>
                </label>
                <textarea
                  className="textarea textarea-bordered w-full"
                  rows={3}
                  placeholder="Add any notes or comments..."
                  value={approveComment}
                  onChange={(e) => setApproveComment(e.target.value)}
                />
              </div>
            </div>
            <div className="modal-action">
              <button
                className="btn"
                onClick={() => {
                  setShowApproveModal(false);
                  setApproveComment("");
                  setEffectiveDate("");
                  setSelectedRequest(null);
                }}
              >
                Cancel
              </button>
              <button
                className="btn btn-success"
                onClick={handleApprove}
                disabled={!approveComment.trim() || !effectiveDate || actionLoading}
              >
                {actionLoading ? (
                  <span className="loading loading-spinner loading-sm" />
                ) : (
                  "Approve Request"
                )}
              </button>
            </div>
          </div>
          <div
            className="modal-backdrop"
            onClick={() => setShowApproveModal(false)}
          />
        </dialog>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedRequest && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-error/10 flex items-center justify-center">
                <FaTimesCircle className="text-error" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-base-content">Reject Subscription Request</h3>
                <p className="text-xs text-base-content/50">
                  {selectedRequest.organizationName}: {selectedRequest.currentTier} → {selectedRequest.requestedTier}
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Rejection Reason (required)</span>
                </label>
                <textarea
                  className="textarea textarea-bordered w-full"
                  rows={3}
                  placeholder="Provide a clear reason for rejection..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                />
              </div>
            </div>
            <div className="modal-action">
              <button
                className="btn"
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason("");
                  setSelectedRequest(null);
                }}
              >
                Cancel
              </button>
              <button
                className="btn btn-error"
                onClick={handleReject}
                disabled={!rejectReason.trim() || actionLoading}
              >
                {actionLoading ? (
                  <span className="loading loading-spinner loading-sm" />
                ) : (
                  "Reject Request"
                )}
              </button>
            </div>
          </div>
          <div
            className="modal-backdrop"
            onClick={() => setShowRejectModal(false)}
          />
        </dialog>
      )}
    </div>
  );
};

export default SubscriptionRequests;
