import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import { useNotification } from "../../contexts/NotificationContext";
import Loader from "../../components/Loader";
import EmptyState from "../../components/EmptyState";
import { FaCheckDouble, FaEye, FaBullhorn } from "react-icons/fa";

const GradeApproval = () => {
  const axiosSecure = useAxiosSecure();
  const { success, error: showError } = useNotification();
  const navigate = useNavigate();

  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 0 });
  const [publishingId, setPublishingId] = useState(null);

  useEffect(() => { fetchApproved(); }, [page]);

  const fetchApproved = async () => {
    setLoading(true);
    try {
      const res = await axiosSecure.get(`/grade-submissions/admin/approved?page=${page}&limit=10`);
      if (res.data.success) {
        setSubmissions(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch { showError("Failed to load approved submissions"); }
    finally { setLoading(false); }
  };

  const handlePublish = async (id) => {
    setPublishingId(id);
    try {
      const res = await axiosSecure.post(`/grade-submissions/${id}/publish`);
      if (res.data.success) {
        success("Grades published successfully! Students and parents will be notified.");
        fetchApproved();
      }
    } catch (err) {
      showError(err.response?.data?.message || "Failed to publish");
    } finally {
      setPublishingId(null);
    }
  };

  if (loading && submissions.length === 0) return <Loader />;

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Publish Grades</h1>
        <p className="text-base-content/60 text-sm">Approved submissions ready to be published</p>
      </div>

      {submissions.length === 0 ? (
        <EmptyState icon={FaCheckDouble} title="No Approved Submissions" message="No grade submissions are pending publication." />
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
                <th>Approved</th>
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
                  <td className="text-xs">{sub.approvedAt ? new Date(sub.approvedAt).toLocaleDateString() : "-"}</td>
                  <td>
                    <div className="flex gap-1">
                      <button className="btn btn-ghost btn-xs" onClick={() => navigate(`/dashboard/grade-submissions/${sub._id}`)}>
                        <FaEye />
                      </button>
                      <button
                        className="btn btn-success btn-xs"
                        onClick={() => handlePublish(sub._id)}
                        disabled={publishingId === sub._id}
                      >
                        {publishingId === sub._id ? <span className="loading loading-spinner loading-xs" /> : <><FaBullhorn className="mr-1" /> Publish</>}
                      </button>
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

export default GradeApproval;
