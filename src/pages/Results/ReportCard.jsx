import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import { useNotification } from "../../contexts/NotificationContext";
import Loader from "../../components/Loader";
import { FaArrowLeft, FaPrint, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

const ReportCard = () => {
  const { studentId, examId } = useParams();
  const axiosSecure = useAxiosSecure();
  const { error: showError } = useNotification();
  const navigate = useNavigate();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await axiosSecure.get(`/results/report-card/${studentId}/${examId}`);
        if (res.data.success) setReport(res.data.data);
      } catch (err) {
        showError(err.response?.data?.message || "Failed to load report card");
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [studentId, examId]);

  if (loading) return <Loader />;
  if (!report) return <div className="p-6 text-center">Report card not available</div>;

  const { student, exam, subjects, summary, organization } = report;

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 print:hidden">
        <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)}>
          <FaArrowLeft />
        </button>
        <h1 className="text-2xl font-bold flex-1">Report Card</h1>
        <button className="btn btn-sm btn-outline" onClick={() => window.print()}>
          <FaPrint className="mr-1" /> Print
        </button>
      </div>

      {/* Report Card Content */}
      <div className="card bg-base-100 shadow-lg print:shadow-none" id="report-card">
        <div className="card-body">
          {/* School Header */}
          <div className="text-center border-b pb-4 mb-4">
            <h2 className="text-xl font-bold">{organization?.name || "School"}</h2>
            <p className="text-sm text-base-content/60">Academic Report Card</p>
          </div>

          {/* Student & Exam Info */}
          <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
            <div>
              <p><strong>Student:</strong> {student.name}</p>
              <p><strong>Admission No:</strong> {student.admissionNumber}</p>
              <p><strong>Roll No:</strong> {student.rollNumber}</p>
            </div>
            <div>
              <p><strong>Class:</strong> {student.className} - {student.sectionName}</p>
              <p><strong>Exam:</strong> {exam.name}</p>
              <p><strong>Academic Year:</strong> {exam.academicYear}</p>
            </div>
          </div>

          {/* Subject Marks Table */}
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Full Marks</th>
                  <th>Pass Marks</th>
                  <th>Obtained</th>
                  <th>Grade</th>
                  <th>GPA</th>
                  <th>Result</th>
                  <th>Teacher</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((s, idx) => (
                  <tr key={idx} className={!s.passed ? "text-error" : ""}>
                    <td>
                      <span className="font-medium">{s.subjectName}</span>
                      {s.subjectCode && <span className="text-xs text-base-content/50 ml-1">({s.subjectCode})</span>}
                    </td>
                    <td>{s.fullMarks}</td>
                    <td>{s.passMarks}</td>
                    <td className="font-medium">{s.obtainedMarks}</td>
                    <td><span className={`badge badge-sm ${s.grade === "F" ? "badge-error" : "badge-success"}`}>{s.grade}</span></td>
                    <td>{s.gradePoint}</td>
                    <td>
                      {s.passed ? (
                        <span className="flex items-center gap-1 text-success text-xs"><FaCheckCircle /> Pass</span>
                      ) : (
                        <span className="flex items-center gap-1 text-error text-xs"><FaTimesCircle /> Fail</span>
                      )}
                    </td>
                    <td className="text-xs">{s.teacherName}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="font-bold">
                  <td>Total</td>
                  <td>{summary.totalFullMarks}</td>
                  <td>-</td>
                  <td>{summary.totalObtainedMarks}</td>
                  <td colSpan={4}></td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="stat bg-base-200 rounded-lg p-3">
              <div className="stat-title text-xs">GPA</div>
              <div className="stat-value text-lg">{summary.gpa}</div>
            </div>
            <div className="stat bg-base-200 rounded-lg p-3">
              <div className="stat-title text-xs">Percentage</div>
              <div className="stat-value text-lg">{summary.averagePercentage}%</div>
            </div>
            <div className="stat bg-base-200 rounded-lg p-3">
              <div className="stat-title text-xs">Highest</div>
              <div className="stat-value text-lg">{summary.highestMarks?.marks}</div>
              <div className="stat-desc text-xs">{summary.highestMarks?.subjectName}</div>
            </div>
            <div className={`stat rounded-lg p-3 ${summary.overallResult === "Passed" ? "bg-success/10" : "bg-error/10"}`}>
              <div className="stat-title text-xs">Overall Result</div>
              <div className={`stat-value text-lg ${summary.overallResult === "Passed" ? "text-success" : "text-error"}`}>
                {summary.overallResult}
              </div>
              <div className="stat-desc text-xs">
                {summary.passedSubjects}/{summary.totalSubjects} passed
              </div>
            </div>
          </div>

          {/* Grade Scale */}
          <div className="mt-6 text-xs text-base-content/50">
            <p className="font-medium mb-1">Grade Scale:</p>
            <p>A+ (90-100) = 5.0 | A (80-89) = 4.0 | A- (70-79) = 3.5 | B (60-69) = 3.0 | C (50-59) = 2.0 | D (40-49) = 1.0 | F (0-39) = 0.0</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportCard;
