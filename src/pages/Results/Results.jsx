import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import useAuth from "../../hooks/useAuth";
import { useNotification } from "../../contexts/NotificationContext";
import Loader from "../../components/Loader";
import EmptyState from "../../components/EmptyState";
import { FaTrophy, FaFileAlt } from "react-icons/fa";

const Results = () => {
  const axiosSecure = useAxiosSecure();
  const { userRole } = useAuth();
  const { error: showError } = useNotification();
  const navigate = useNavigate();

  const [results, setResults] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterClass, setFilterClass] = useState("");
  const [filterExam, setFilterExam] = useState("");
  const [exams, setExams] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 0 });

  useEffect(() => {
    const fetchInit = async () => {
      try {
        const [classesRes, examsRes] = await Promise.all([
          axiosSecure.get("/classes"),
          axiosSecure.get("/exams"),
        ]);
        if (classesRes.data.success) setClasses(classesRes.data.data);
        if (examsRes.data.success) setExams(examsRes.data.data);
      } catch {}
    };
    if (["org_owner", "admin", "moderator", "teacher"].includes(userRole)) {
      fetchInit();
    }
  }, []);

  useEffect(() => { fetchResults(); }, [filterClass, filterExam, page]);

  const fetchResults = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterClass) params.append("classId", filterClass);
      if (filterExam) params.append("examId", filterExam);
      params.append("page", page);
      params.append("limit", 10);
      const res = await axiosSecure.get(`/results?${params.toString()}`);
      if (res.data.success) {
        setResults(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch { showError("Failed to load results"); }
    finally { setLoading(false); }
  };

  if (loading && results.length === 0) return <Loader />;

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Published Results</h1>
        <p className="text-base-content/60 text-sm">View published examination results</p>
      </div>

      {["org_owner", "admin", "moderator", "teacher"].includes(userRole) && (
        <div className="flex flex-wrap gap-3">
          <select className="select select-bordered select-sm" value={filterExam} onChange={(e) => { setFilterExam(e.target.value); setPage(1); }}>
            <option value="">All Exams</option>
            {exams.map((e) => <option key={e._id} value={e._id}>{e.name} - {e.className}</option>)}
          </select>
          <select className="select select-bordered select-sm" value={filterClass} onChange={(e) => { setFilterClass(e.target.value); setPage(1); }}>
            <option value="">All Classes</option>
            {classes.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </div>
      )}

      {results.length === 0 ? (
        <EmptyState icon={FaTrophy} title="No Published Results" message="No results have been published yet." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.map((r) => (
            <div key={r._id} className="card bg-base-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(`/dashboard/grade-submissions/${r._id}`)}>
              <div className="card-body p-4">
                <h3 className="font-bold">{r.subjectName}</h3>
                <p className="text-sm text-base-content/60">{r.examName}</p>
                <div className="flex justify-between text-xs text-base-content/50 mt-2">
                  <span>{r.className} - {r.sectionName}</span>
                  <span>{r.studentCount} students</span>
                </div>
                <div className="flex justify-between text-xs mt-1">
                  <span>Full Marks: {r.fullMarks}</span>
                  <span>Published: {new Date(r.publishedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
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

export default Results;
