import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import { useNotification } from "../../contexts/NotificationContext";
import Loader from "../../components/Loader";
import EmptyState from "../../components/EmptyState";
import { FaSearch, FaEye, FaPlay } from "react-icons/fa";

const PendingReviews = () => {
  const axiosSecure = useAxiosSecure();
  const { success, error: showError } = useNotification();
  const navigate = useNavigate();

  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 0 });
  const [actionId, setActionId] = useState(null);

  useEffect(() => { fetchPending(); }, [page]);

  const fetchPending = async () => {
    setLoading(true);
    try {
      const res = await axiosSecure.get(`/grade-submissions/moderator/pending?page=${page}&limit=10`);
      if (res.data.success) {
        setSubmissions(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch { showError("Failed to load pending reviews"); }
    finally { setLoading(false); }
  };

  const handleStartReview = async (id) => {
    setActionId(id);
    try {
      const res = await axiosSecure.post(`/grade-submissions/${id}/start-review`);
      if (res.data.success) {
        success("Review started");
        navigate(`/dashboard/grade-submissions/${id}`);
      }
    } catch (err) {
      showError(err.response?.data?.message || "Failed to start review");
    } finally {
      setActionId(null);
    }
  };

  const getStatusBadge = (status) => {
    return `badge ${status === "submitted" ? "badge-accent" : "badge-warning"} badge-sm`;
  };

  if (loading && submissions.length === 0) return <Loader />;

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Pending Reviews</h1>
        <p className="text-base-content/60 text-sm">Grade submissions waiting for your review</p>
      </div>

      {submissions.length === 0 ? (
        <EmptyState icon={FaSearch} title="No Pending Reviews" message="All grade submissions have been reviewed." />
      ) : (
        <div className="overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th>Exam</th>
                <th>Class</th>
                <th>Section</th>
                <th>Subject</th>
                <th>Teacher</th>
                <th>Students</th>
                <th>Status</th>
                <th>Submitted</th>
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
                  <td>{sub.teacherName}</td>
                  <td>{sub.studentCount}</td>
                  <td><span className={getStatusBadge(sub.status)}>{sub.status.replace("_", " ")}</span></td>
                  <td className="text-xs">{sub.submittedAt ? new Date(sub.submittedAt).toLocaleDateString() : "-"}</td>
                  <td>
                    <div className="flex gap-1">
                      <button className="btn btn-ghost btn-xs" onClick={() => navigate(`/dashboard/grade-submissions/${sub._id}`)}>
                        <FaEye />
                      </button>
                      {sub.status === "submitted" && (
                        <button
                          className="btn btn-warning btn-xs"
                          onClick={() => handleStartReview(sub._id)}
                          disabled={actionId === sub._id}
                        >
                          {actionId === sub._id ? <span className="loading loading-spinner loading-xs" /> : <><FaPlay className="mr-1" /> Start Review</>}
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

export default PendingReviews;
