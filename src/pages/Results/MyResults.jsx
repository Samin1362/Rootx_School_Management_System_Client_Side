import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import useAuth from "../../hooks/useAuth";
import { useNotification } from "../../contexts/NotificationContext";
import Loader from "../../components/Loader";
import EmptyState from "../../components/EmptyState";
import { FaTrophy } from "react-icons/fa";

const MyResults = () => {
  const axiosSecure = useAxiosSecure();
  const { dbUser, userRole } = useAuth();
  const { error: showError } = useNotification();
  const navigate = useNavigate();

  const [studentDoc, setStudentDoc] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyResults = async () => {
      try {
        // For student role, find their student document first
        if (userRole === "student") {
          const studentsRes = await axiosSecure.get("/students?limit=100");
          if (studentsRes.data.success) {
            const myStudent = studentsRes.data.data.find(
              (s) => String(s.userId) === String(dbUser._id)
            );
            if (myStudent) {
              setStudentDoc(myStudent);
              const resultsRes = await axiosSecure.get(`/results/student/${myStudent._id}`);
              if (resultsRes.data.success) setResults(resultsRes.data.data);
            }
          }
        } else if (userRole === "parent") {
          // Parent: get children's results
          // For now, show first child's results
          const studentsRes = await axiosSecure.get("/students?limit=100");
          if (studentsRes.data.success && studentsRes.data.data.length > 0) {
            const child = studentsRes.data.data[0];
            setStudentDoc(child);
            const resultsRes = await axiosSecure.get(`/results/student/${child._id}`);
            if (resultsRes.data.success) setResults(resultsRes.data.data);
          }
        }
      } catch (err) {
        showError(err.response?.data?.message || "Failed to load results");
      } finally {
        setLoading(false);
      }
    };
    fetchMyResults();
  }, []);

  if (loading) return <Loader />;

  if (!results || !results.results || results.results.length === 0) {
    return (
      <div className="p-4 md:p-6">
        <h1 className="text-2xl font-bold mb-4">My Results</h1>
        <EmptyState icon={FaTrophy} title="No Results" message="No published results available yet." />
      </div>
    );
  }

  const { student, results: resultsList } = results;

  // Group results by exam
  const groupedByExam = {};
  resultsList.forEach((r) => {
    const key = r.examId;
    if (!groupedByExam[key]) {
      groupedByExam[key] = { examName: r.examName, academicYear: r.academicYear, subjects: [] };
    }
    groupedByExam[key].subjects.push(r);
  });

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Results</h1>
        <p className="text-base-content/60 text-sm">
          {student.name} | {student.className} - {student.sectionName} | Roll: {student.rollNumber}
        </p>
      </div>

      {Object.entries(groupedByExam).map(([examId, examData]) => (
        <div key={examId} className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <div className="flex justify-between items-center">
              <h2 className="card-title text-base">{examData.examName} ({examData.academicYear})</h2>
              {studentDoc && (
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => navigate(`/dashboard/report-card/${studentDoc._id}/${examId}`)}
                >
                  View Report Card
                </button>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="table table-sm w-full">
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th>Full Marks</th>
                    <th>Obtained</th>
                    <th>Grade</th>
                    <th>GPA</th>
                    <th>Result</th>
                  </tr>
                </thead>
                <tbody>
                  {examData.subjects.map((s, idx) => (
                    <tr key={idx}>
                      <td>{s.subjectName}</td>
                      <td>{s.fullMarks}</td>
                      <td className="font-medium">{s.obtainedMarks}</td>
                      <td><span className={`badge badge-sm ${s.grade === "F" ? "badge-error" : "badge-success"}`}>{s.grade}</span></td>
                      <td>{s.gradePoint}</td>
                      <td>{s.passed ? <span className="text-success text-xs">Pass</span> : <span className="text-error text-xs">Fail</span>}</td>
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

export default MyResults;
