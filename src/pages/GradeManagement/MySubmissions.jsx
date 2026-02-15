import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import { useNotification } from "../../contexts/NotificationContext";
import Loader from "../../components/Loader";
import EmptyState from "../../components/EmptyState";
import { FaClipboardList, FaEye, FaPaperPlane } from "react-icons/fa";

const MySubmissions = () => {
  const axiosSecure = useAxiosSecure();
  const { success, error: showError } = useNotification();
  const navigate = useNavigate();

  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 0 });
  const [submittingId, setSubmittingId] = useState(null);

  useEffect(() => { fetchSubmissions(); }, [filterStatus, page]);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterStatus) params.append("status", filterStatus);
      params.append("page", page);
      params.append("limit", 10);
      const res = await axiosSecure.get(`/grade-submissions/teacher/my-submissions?${params.toString()}`);
      if (res.data.success) {
        setSubmissions(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch { showError("Failed to load submissions"); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (submissionId) => {
    setSubmittingId(submissionId);
    try {
      const res = await axiosSecure.post(`/grade-submissions/${submissionId}/submit`);
      if (res.data.success) {
        success("Grades submitted for review");
        fetchSubmissions();
      }
    } catch (err) {
      showError(err.response?.data?.message || "Failed to submit");
    } finally {
      setSubmittingId(null);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      draft: "badge-ghost", submitted: "badge-accent", under_review: "badge-warning",
      approved: "badge-info", published: "badge-success",
    };
    return `badge ${styles[status] || "badge-ghost"} badge-sm`;
  };

  if (loading && submissions.length === 0) return <Loader />;

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Submissions</h1>
        <p className="text-base-content/60 text-sm">View and manage your grade submissions</p>
      </div>

      <div className="flex gap-3">
        <select className="select select-bordered select-sm" value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}>
          <option value="">All Status</option>
          <option value="draft">Draft</option>
          <option value="submitted">Submitted</option>
          <option value="under_review">Under Review</option>
          <option value="approved">Approved</option>
          <option value="published">Published</option>
        </select>
      </div>

      {submissions.length === 0 ? (
        <EmptyState icon={FaClipboardList} title="No Submissions" message="You haven't created any grade submissions yet." />
      ) : (
        <div className="overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th>Exam</th>
                <th>Class</th>
                <th>Section</th>
                <th>Subject</th>
                <th>Students</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((sub) => (
                <tr key={sub._id}>
                  <td>{sub.examName}</td>
                  <td>{sub.className}</td>
                  <td>{sub.sectionName}</td>
                  <td>{sub.subjectName}</td>
                  <td>{sub.studentCount}</td>
                  <td>
                    <span className={getStatusBadge(sub.status)}>{sub.status.replace("_", " ")}</span>
                    {sub.rejectionReason && (
                      <div className="text-xs text-error mt-1">Rejected: {sub.rejectionReason}</div>
                    )}
                  </td>
                  <td>
                    <div className="flex gap-1">
                      <button className="btn btn-ghost btn-xs" onClick={() => navigate(`/dashboard/grade-submissions/${sub._id}`)}>
                        <FaEye />
                      </button>
                      {sub.status === "draft" && (
                        <button
                          className="btn btn-primary btn-xs"
                          onClick={() => handleSubmit(sub._id)}
                          disabled={submittingId === sub._id}
                        >
                          {submittingId === sub._id ? <span className="loading loading-spinner loading-xs" /> : <><FaPaperPlane className="mr-1" /> Submit</>}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pagination.pages > 1 && (
        <div className="flex justify-center gap-2">
          <button className="btn btn-sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
          <span className="btn btn-sm btn-disabled">{page} / {pagination.pages}</span>
          <button className="btn btn-sm" disabled={page >= pagination.pages} onClick={() => setPage(page + 1)}>Next</button>
        </div>
      )}
    </div>
  );
};

export default MySubmissions;
