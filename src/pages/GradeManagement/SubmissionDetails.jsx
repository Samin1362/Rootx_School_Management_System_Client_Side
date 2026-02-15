import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import useAuth from "../../hooks/useAuth";
import { useNotification } from "../../contexts/NotificationContext";
import Loader from "../../components/Loader";
import {
  FaArrowLeft, FaCheckCircle, FaTimesCircle, FaPaperPlane, FaBullhorn, FaPlay, FaHistory,
} from "react-icons/fa";

const SubmissionDetails = () => {
  const { submissionId } = useParams();
  const axiosSecure = useAxiosSecure();
  const { userRole } = useAuth();
  const { success, error: showError } = useNotification();
  const navigate = useNavigate();

  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [approveComment, setApproveComment] = useState("");

  useEffect(() => { fetchSubmission(); }, [submissionId]);

  const fetchSubmission = async () => {
    try {
      const res = await axiosSecure.get(`/grade-submissions/${submissionId}`);
      if (res.data.success) setSubmission(res.data.data);
    } catch (err) {
      showError(err.response?.data?.message || "Failed to load submission");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action, body = {}) => {
    setActionLoading(true);
    try {
      const res = await axiosSecure.post(`/grade-submissions/${submissionId}/${action}`, body);
      if (res.data.success) {
        success(res.data.message);
        fetchSubmission();
        setShowRejectModal(false);
        setRejectReason("");
      }
    } catch (err) {
      showError(err.response?.data?.message || `Failed to ${action}`);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      draft: "badge-ghost", submitted: "badge-accent", under_review: "badge-warning",
      approved: "badge-info", published: "badge-success",
    };
    return `badge ${styles[status] || "badge-ghost"}`;
  };

  if (loading) return <Loader />;
  if (!submission) return <div className="p-6 text-center">Submission not found</div>;

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)}>
          <FaArrowLeft />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{submission.subjectName} Grades</h1>
          <p className="text-base-content/60 text-sm">
            {submission.examName} | {submission.className} - {submission.sectionName} | Teacher: {submission.teacherName}
          </p>
        </div>
        <span className={getStatusBadge(submission.status)}>{submission.status.replace("_", " ")}</span>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="stat bg-base-100 rounded-lg shadow-sm p-3">
          <div className="stat-title text-xs">Full Marks</div>
          <div className="stat-value text-lg">{submission.fullMarks}</div>
        </div>
        <div className="stat bg-base-100 rounded-lg shadow-sm p-3">
          <div className="stat-title text-xs">Pass Marks</div>
          <div className="stat-value text-lg">{submission.passMarks}</div>
        </div>
        <div className="stat bg-base-100 rounded-lg shadow-sm p-3">
          <div className="stat-title text-xs">Students</div>
          <div className="stat-value text-lg">{submission.grades?.length || 0}</div>
        </div>
        <div className="stat bg-base-100 rounded-lg shadow-sm p-3">
          <div className="stat-title text-xs">Status</div>
          <div className="stat-value text-lg capitalize">{submission.status.replace("_", " ")}</div>
        </div>
      </div>

      {/* Rejection reason */}
      {submission.rejectionReason && (
        <div className="alert alert-error">
          <FaTimesCircle />
          <span><strong>Rejection Reason:</strong> {submission.rejectionReason}</span>
        </div>
      )}

      {/* Grades table */}
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <h2 className="card-title text-base">Student Grades</h2>
          <div className="overflow-x-auto">
            <table className="table table-sm w-full">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Student</th>
                  <th>Roll No</th>
                  <th>Marks</th>
                  <th>Grade</th>
                  <th>GPA</th>
                  <th>Pass/Fail</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {submission.grades?.map((g, idx) => (
                  <tr key={g.studentId}>
                    <td>{idx + 1}</td>
                    <td>{g.studentName || "Unknown"}</td>
                    <td>{g.rollNumber || "-"}</td>
                    <td>{g.marks ?? "-"}</td>
                    <td><span className={`badge badge-sm ${g.grade === "F" ? "badge-error" : "badge-success"}`}>{g.grade || "-"}</span></td>
                    <td>{g.gradePoint ?? "-"}</td>
                    <td>
                      {g.marks !== null && g.marks !== undefined ? (
                        g.marks >= (submission.passMarks || 33) ?
                          <span className="text-success text-xs">Pass</span> :
                          <span className="text-error text-xs">Fail</span>
                      ) : "-"}
                    </td>
                    <td className="text-xs">{g.remarks || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2">
        {submission.status === "draft" && userRole === "teacher" && (
          <button className="btn btn-primary btn-sm" onClick={() => handleAction("submit")} disabled={actionLoading}>
            <FaPaperPlane className="mr-1" /> Submit for Review
          </button>
        )}
        {submission.status === "submitted" && ["moderator", "admin", "org_owner"].includes(userRole) && (
          <button className="btn btn-warning btn-sm" onClick={() => handleAction("start-review")} disabled={actionLoading}>
            <FaPlay className="mr-1" /> Start Review
          </button>
        )}
        {submission.status === "under_review" && ["moderator", "admin", "org_owner"].includes(userRole) && (
          <>
            <button className="btn btn-success btn-sm" onClick={() => handleAction("approve", { comment: approveComment })} disabled={actionLoading}>
              <FaCheckCircle className="mr-1" /> Approve
            </button>
            <button className="btn btn-error btn-sm" onClick={() => setShowRejectModal(true)} disabled={actionLoading}>
              <FaTimesCircle className="mr-1" /> Reject
            </button>
            <input
              type="text"
              className="input input-bordered input-sm flex-1"
              placeholder="Optional review comment..."
              value={approveComment}
              onChange={(e) => setApproveComment(e.target.value)}
            />
          </>
        )}
        {submission.status === "approved" && ["admin", "org_owner"].includes(userRole) && (
          <button className="btn btn-success btn-sm" onClick={() => handleAction("publish")} disabled={actionLoading}>
            <FaBullhorn className="mr-1" /> Publish
          </button>
        )}
      </div>

      {/* Audit History */}
      {submission.auditHistory && submission.auditHistory.length > 0 && (
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h2 className="card-title text-base"><FaHistory className="mr-1" /> Audit History</h2>
            <ul className="timeline timeline-vertical timeline-compact">
              {submission.auditHistory.map((entry, idx) => (
                <li key={idx}>
                  {idx > 0 && <hr />}
                  <div className="timeline-start text-xs text-base-content/60">
                    {new Date(entry.timestamp).toLocaleString()}
                  </div>
                  <div className="timeline-middle">
                    <FaCheckCircle className="text-primary" />
                  </div>
                  <div className="timeline-end timeline-box text-sm">
                    <span className="font-medium capitalize">{entry.action.replace("_", " ")}</span>
                    <span className="text-base-content/60"> by {entry.userName} ({entry.role})</span>
                    {entry.comment && <p className="text-xs mt-1 text-base-content/60">{entry.comment}</p>}
                  </div>
                  <hr />
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Reject Submission</h3>
            <p className="text-sm text-base-content/60 mt-2">Provide a reason for rejection. The teacher will be notified.</p>
            <textarea
              className="textarea textarea-bordered w-full mt-4"
              rows={3}
              placeholder="Rejection reason (required)"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <div className="modal-action">
              <button className="btn" onClick={() => { setShowRejectModal(false); setRejectReason(""); }}>Cancel</button>
              <button
                className="btn btn-error"
                onClick={() => handleAction("reject", { rejectionReason: rejectReason })}
                disabled={!rejectReason.trim() || actionLoading}
              >
                {actionLoading ? <span className="loading loading-spinner loading-sm" /> : "Reject"}
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setShowRejectModal(false)} />
        </dialog>
      )}
    </div>
  );
};

export default SubmissionDetails;
