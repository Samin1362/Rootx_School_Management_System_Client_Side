import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import { useNotification } from "../../contexts/NotificationContext";
import Loader from "../../components/Loader";
import { FaArrowLeft, FaCheckCircle, FaClock, FaEdit, FaPaperPlane, FaEye } from "react-icons/fa";

const ExamDetails = () => {
  const { examId } = useParams();
  const axiosSecure = useAxiosSecure();
  const { error: showError } = useNotification();
  const navigate = useNavigate();

  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExam();
  }, [examId]);

  const fetchExam = async () => {
    try {
      const res = await axiosSecure.get(`/exams/${examId}`);
      if (res.data.success) {
        setExam(res.data.data);
      }
    } catch (err) {
      showError(err.response?.data?.message || "Failed to load exam details");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "published": return <FaCheckCircle className="text-success" />;
      case "approved": return <FaCheckCircle className="text-info" />;
      case "submitted":
      case "under_review": return <FaPaperPlane className="text-warning" />;
      case "draft": return <FaEdit className="text-base-content/40" />;
      default: return <FaClock className="text-base-content/20" />;
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      published: "badge-success",
      approved: "badge-info",
      under_review: "badge-warning",
      submitted: "badge-accent",
      draft: "badge-ghost",
      not_started: "badge-outline",
    };
    return `badge ${styles[status] || "badge-ghost"} badge-xs`;
  };

  if (loading) return <Loader />;
  if (!exam) return <div className="p-6 text-center">Exam not found</div>;

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button className="btn btn-ghost btn-sm" onClick={() => navigate("/dashboard/exams")}>
          <FaArrowLeft />
        </button>
        <div>
          <h1 className="text-2xl font-bold">{exam.name}</h1>
          <p className="text-base-content/60 text-sm">
            {exam.className} | {exam.academicYear} | {new Date(exam.startDate).toLocaleDateString()} - {new Date(exam.endDate).toLocaleDateString()}
          </p>
        </div>
        <span className={`badge ${exam.status === "upcoming" ? "badge-info" : exam.status === "ongoing" ? "badge-warning" : "badge-success"} ml-auto`}>
          {exam.status}
        </span>
      </div>

      {/* Progress summary */}
      <div className="stats shadow w-full">
        <div className="stat">
          <div className="stat-title">Total Expected</div>
          <div className="stat-value text-lg">{exam.totalExpected}</div>
          <div className="stat-desc">subject-section combinations</div>
        </div>
        <div className="stat">
          <div className="stat-title">Submissions</div>
          <div className="stat-value text-lg">{exam.totalSubmissions}</div>
          <div className="stat-desc">grade submissions created</div>
        </div>
      </div>

      {/* Section-wise subject status grid */}
      {exam.sections && exam.sections.map((section) => (
        <div key={section._id} className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h2 className="card-title text-base">{section.name}</h2>
            <div className="overflow-x-auto">
              <table className="table table-sm w-full">
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th>Teacher</th>
                    <th>Status</th>
                    <th>Students</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {section.subjects.map((subject) => (
                    <tr key={subject._id}>
                      <td>
                        <div>
                          <span className="font-medium">{subject.name}</span>
                          {subject.subjectCode && (
                            <span className="text-xs text-base-content/50 ml-1">({subject.subjectCode})</span>
                          )}
                        </div>
                      </td>
                      <td className="text-sm">{subject.teacherName}</td>
                      <td>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(subject.submission.status)}
                          <span className={getStatusBadge(subject.submission.status)}>
                            {subject.submission.status.replace("_", " ")}
                          </span>
                        </div>
                      </td>
                      <td>{subject.submission.studentCount || "-"}</td>
                      <td>
                        {subject.submission._id && (
                          <button
                            className="btn btn-ghost btn-xs"
                            onClick={() => navigate(`/dashboard/grade-submissions/${subject.submission._id}`)}
                          >
                            <FaEye /> View
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ExamDetails;
