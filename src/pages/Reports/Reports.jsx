import { useState, useEffect } from "react";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import useAuth from "../../hooks/useAuth";
import { useNotification } from "../../contexts/NotificationContext";
import Loader from "../../components/Loader";
import EmptyState from "../../components/EmptyState";
import {
  FaChartBar,
  FaChartLine,
  FaCalendarCheck,
  FaGraduationCap,
  FaMoneyBillWave,
  FaChalkboardTeacher,
  FaFilter,
  FaSearch,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaShieldAlt,
  FaPercentage,
  FaTrophy,
  FaDownload,
  FaReceipt,
  FaBalanceScale,
  FaBookOpen,
  FaUserGraduate,
} from "react-icons/fa";

const Reports = () => {
  const axiosSecure = useAxiosSecure();
  const { userRole } = useAuth();
  const { error: showError } = useNotification();

  const [activeTab, setActiveTab] = useState("attendance");
  const canExport = ["org_owner", "admin"].includes(userRole);

  const tabs = [
    { key: "attendance", label: "Attendance", icon: FaCalendarCheck },
    { key: "academic", label: "Academic", icon: FaGraduationCap },
    { key: "finance", label: "Finance", icon: FaMoneyBillWave },
    { key: "teacher-workload", label: "Teacher Workload", icon: FaChalkboardTeacher },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Background blobs */}
      <div className="fixed top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 rounded-full blur-3xl animate-pulse pointer-events-none opacity-30" />
      <div className="fixed bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-info/20 via-success/20 to-warning/20 rounded-full blur-3xl animate-pulse pointer-events-none opacity-30" />

      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-secondary p-8 shadow-lg">
        <div className="relative z-10 flex items-center gap-4">
          <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
            <FaChartBar className="text-2xl text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Reports & Analytics</h1>
            <p className="text-white/70 text-sm">Comprehensive reports across all modules</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-gradient-to-br from-base-100 to-base-200/50 border border-base-300/50 rounded-2xl shadow-md p-2">
        <div className="flex flex-wrap gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                activeTab === tab.key
                  ? "bg-primary text-primary-content shadow-md"
                  : "hover:bg-base-200 text-base-content/70 hover:text-base-content"
              }`}
            >
              <tab.icon className="text-sm" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "attendance" && <AttendanceReport axiosSecure={axiosSecure} showError={showError} canExport={canExport} />}
      {activeTab === "academic" && <AcademicReport axiosSecure={axiosSecure} showError={showError} canExport={canExport} />}
      {activeTab === "finance" && <FinanceReport axiosSecure={axiosSecure} showError={showError} canExport={canExport} />}
      {activeTab === "teacher-workload" && <TeacherWorkloadReport axiosSecure={axiosSecure} showError={showError} />}
    </div>
  );
};

// ==================== ATTENDANCE REPORT TAB ====================
const AttendanceReport = ({ axiosSecure, showError, canExport }) => {
  const [classes, setClasses] = useState([]);
  const [classId, setClassId] = useState("");
  const [month, setMonth] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await axiosSecure.get("/classes");
        if (res.data.success) setClasses(res.data.data.filter((c) => c.status === "active"));
      } catch { /* silent */ }
      finally { setLoadingClasses(false); }
    };
    fetchClasses();
  }, []);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const params = {};
      if (classId) params.classId = classId;
      if (month) params.month = month;

      const res = await axiosSecure.get("/reports/attendance", { params });
      if (res.data.success) setData(res.data.data);
    } catch {
      showError("Failed to load attendance report");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const params = {};
      if (classId) params.classId = classId;
      const res = await axiosSecure.get("/export/attendance", { params, responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "attendance_export.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      showError("Failed to export attendance");
    } finally {
      setExporting(false);
    }
  };

  const summary = data?.summary;

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-gradient-to-br from-base-100 to-base-200/50 border border-base-300/50 rounded-2xl shadow-md p-5">
        <div className="flex items-center gap-2 mb-3">
          <FaFilter className="text-primary text-sm" />
          <span className="font-bold text-sm">Generate Attendance Report</span>
        </div>
        <div className="flex flex-wrap gap-3 items-end">
          <div className="form-control">
            <label className="label py-1"><span className="label-text text-xs">Class</span></label>
            <select className="select select-bordered select-sm" value={classId} onChange={(e) => setClassId(e.target.value)} disabled={loadingClasses}>
              <option value="">All Classes</option>
              {classes.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
          <div className="form-control">
            <label className="label py-1"><span className="label-text text-xs">Month</span></label>
            <input type="month" className="input input-bordered input-sm" value={month} onChange={(e) => setMonth(e.target.value)} />
          </div>
          <button onClick={fetchReport} className="btn btn-sm btn-primary gap-1" disabled={loading}>
            <FaSearch className="text-xs" /> Generate
          </button>
          {canExport && (
            <button onClick={handleExport} className="btn btn-sm btn-outline gap-1" disabled={exporting}>
              <FaDownload className="text-xs" /> {exporting ? "Exporting..." : "Export CSV"}
            </button>
          )}
        </div>
      </div>

      {loading ? <Loader /> : !data ? (
        <EmptyState icon={FaCalendarCheck} title="Select Filters" message="Choose filters and click Generate to view the attendance report." />
      ) : (
        <>
          {/* Summary Cards */}
          {summary && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <SummaryCard icon={FaCalendarCheck} label="Total Days" value={summary.totalDays} color="primary" />
              <SummaryCard icon={FaCheckCircle} label="Present" value={summary.present} color="success" />
              <SummaryCard icon={FaTimesCircle} label="Absent" value={summary.absent} color="error" />
              <SummaryCard icon={FaClock} label="Late" value={summary.late} color="warning" />
              <SummaryCard icon={FaPercentage} label="Rate" value={`${summary.attendancePercentage}%`} color="info" />
            </div>
          )}

          {/* Class Breakdown */}
          {data.classBreakdown?.length > 0 && (
            <div className="bg-gradient-to-br from-base-100 to-base-200/50 border border-base-300/50 rounded-2xl shadow-md overflow-hidden">
              <div className="p-4 border-b border-base-300/50 bg-gradient-to-r from-primary/5 to-secondary/5">
                <h3 className="font-bold text-base-content flex items-center gap-2">
                  <FaChartBar className="text-primary" /> Class Breakdown
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="table table-sm w-full">
                  <thead>
                    <tr className="bg-base-200/30">
                      <th>Class</th>
                      <th className="text-center">Present</th>
                      <th className="text-center">Absent</th>
                      <th className="text-center">Late</th>
                      <th className="text-center">Excused</th>
                      <th className="text-center">Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.classBreakdown.map((cb, i) => (
                      <tr key={cb.classId || i} className="hover:bg-primary/5 transition-colors">
                        <td className="font-medium">{cb.className}</td>
                        <td className="text-center text-success font-medium">{cb.present}</td>
                        <td className="text-center text-error font-medium">{cb.absent}</td>
                        <td className="text-center text-warning font-medium">{cb.late}</td>
                        <td className="text-center text-info font-medium">{cb.excused || 0}</td>
                        <td className="text-center">
                          <span className={`badge badge-sm ${cb.attendancePercentage >= 90 ? "badge-success" : cb.attendancePercentage >= 75 ? "badge-warning" : "badge-error"}`}>
                            {cb.attendancePercentage}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Daily Trend */}
          {data.dailyTrend?.length > 0 && (
            <div className="bg-gradient-to-br from-base-100 to-base-200/50 border border-base-300/50 rounded-2xl shadow-md overflow-hidden">
              <div className="p-4 border-b border-base-300/50 bg-gradient-to-r from-primary/5 to-secondary/5">
                <h3 className="font-bold text-base-content flex items-center gap-2">
                  <FaChartLine className="text-primary" /> Daily Trend
                  <span className="badge badge-sm badge-primary">{data.dailyTrend.length} days</span>
                </h3>
              </div>
              <div className="overflow-x-auto max-h-64">
                <table className="table table-xs w-full">
                  <thead className="sticky top-0 bg-base-100">
                    <tr><th>Date</th><th className="text-center">Present</th><th className="text-center">Absent</th><th className="text-center">Late</th><th className="text-center">Total</th></tr>
                  </thead>
                  <tbody>
                    {data.dailyTrend.map((d, i) => (
                      <tr key={d.date || i} className="hover:bg-primary/5">
                        <td className="text-xs">{d.date}</td>
                        <td className="text-center text-success">{d.present}</td>
                        <td className="text-center text-error">{d.absent}</td>
                        <td className="text-center text-warning">{d.late}</td>
                        <td className="text-center font-medium">{d.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// ==================== ACADEMIC REPORT TAB ====================
const AcademicReport = ({ axiosSecure, showError, canExport }) => {
  const [exams, setExams] = useState([]);
  const [classes, setClasses] = useState([]);
  const [examId, setExamId] = useState("");
  const [classId, setClassId] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingFilters, setLoadingFilters] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [examsRes, classesRes] = await Promise.allSettled([
          axiosSecure.get("/exams"),
          axiosSecure.get("/classes"),
        ]);
        if (examsRes.status === "fulfilled" && examsRes.value.data.success)
          setExams(examsRes.value.data.data);
        if (classesRes.status === "fulfilled" && classesRes.value.data.success)
          setClasses(classesRes.value.data.data.filter((c) => c.status === "active"));
      } catch { /* silent */ }
      finally { setLoadingFilters(false); }
    };
    fetchFilters();
  }, []);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const params = {};
      if (examId) params.examId = examId;
      if (classId) params.classId = classId;

      const res = await axiosSecure.get("/reports/academic", { params });
      if (res.data.success) setData(res.data.data);
    } catch {
      showError("Failed to load academic report");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const params = {};
      if (examId) params.examId = examId;
      if (classId) params.classId = classId;
      const res = await axiosSecure.get("/export/results", { params, responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "results_export.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      showError("Failed to export results");
    } finally {
      setExporting(false);
    }
  };

  const summary = data?.summary;

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-gradient-to-br from-base-100 to-base-200/50 border border-base-300/50 rounded-2xl shadow-md p-5">
        <div className="flex items-center gap-2 mb-3">
          <FaFilter className="text-primary text-sm" />
          <span className="font-bold text-sm">Generate Academic Report</span>
        </div>
        <div className="flex flex-wrap gap-3 items-end">
          <div className="form-control">
            <label className="label py-1"><span className="label-text text-xs">Exam</span></label>
            <select className="select select-bordered select-sm" value={examId} onChange={(e) => setExamId(e.target.value)} disabled={loadingFilters}>
              <option value="">All Exams</option>
              {exams.map((e) => <option key={e._id} value={e._id}>{e.name}</option>)}
            </select>
          </div>
          <div className="form-control">
            <label className="label py-1"><span className="label-text text-xs">Class</span></label>
            <select className="select select-bordered select-sm" value={classId} onChange={(e) => setClassId(e.target.value)} disabled={loadingFilters}>
              <option value="">All Classes</option>
              {classes.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
          <button onClick={fetchReport} className="btn btn-sm btn-primary gap-1" disabled={loading}>
            <FaSearch className="text-xs" /> Generate
          </button>
          {canExport && (
            <button onClick={handleExport} className="btn btn-sm btn-outline gap-1" disabled={exporting}>
              <FaDownload className="text-xs" /> {exporting ? "Exporting..." : "Export CSV"}
            </button>
          )}
        </div>
      </div>

      {loading ? <Loader /> : !data ? (
        <EmptyState icon={FaGraduationCap} title="Select Filters" message="Choose filters and click Generate to view the academic report." />
      ) : (
        <>
          {/* Summary Cards */}
          {summary && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <SummaryCard icon={FaBookOpen} label="Submissions" value={summary.totalSubmissions} color="primary" />
              <SummaryCard icon={FaUserGraduate} label="Students Graded" value={summary.totalStudentGrades} color="secondary" />
              <SummaryCard icon={FaPercentage} label="Avg Marks" value={`${summary.averageMarks}%`} color="info" />
              <SummaryCard icon={FaTrophy} label="Pass Rate" value={`${summary.passRate}%`} color="success" />
            </div>
          )}

          {/* Grade Distribution */}
          {data.gradeDistribution && Object.keys(data.gradeDistribution).length > 0 && (
            <div className="bg-gradient-to-br from-base-100 to-base-200/50 border border-base-300/50 rounded-2xl shadow-md p-5">
              <h3 className="font-bold text-base-content mb-4 flex items-center gap-2">
                <FaChartBar className="text-primary" /> Grade Distribution
              </h3>
              <div className="flex flex-wrap gap-3">
                {Object.entries(data.gradeDistribution)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([grade, count]) => {
                    const gradeColors = {
                      "A+": "bg-success/10 text-success border-success/30",
                      "A": "bg-success/10 text-success border-success/30",
                      "A-": "bg-info/10 text-info border-info/30",
                      "B": "bg-info/10 text-info border-info/30",
                      "C": "bg-warning/10 text-warning border-warning/30",
                      "D": "bg-warning/10 text-warning border-warning/30",
                      "F": "bg-error/10 text-error border-error/30",
                    };
                    return (
                      <div key={grade} className={`px-4 py-3 rounded-xl border text-center min-w-[70px] ${gradeColors[grade] || "bg-base-200"}`}>
                        <p className="text-lg font-bold">{grade}</p>
                        <p className="text-xs opacity-70">{count} students</p>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Subject Breakdown */}
          {data.subjectBreakdown?.length > 0 && (
            <div className="bg-gradient-to-br from-base-100 to-base-200/50 border border-base-300/50 rounded-2xl shadow-md overflow-hidden">
              <div className="p-4 border-b border-base-300/50 bg-gradient-to-r from-primary/5 to-secondary/5">
                <h3 className="font-bold text-base-content flex items-center gap-2">
                  <FaBookOpen className="text-primary" /> Subject Breakdown
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="table table-sm w-full">
                  <thead><tr className="bg-base-200/30"><th>Subject</th><th className="text-center">Students</th><th className="text-center">Avg Marks</th><th className="text-center">Pass Rate</th></tr></thead>
                  <tbody>
                    {data.subjectBreakdown.map((s, i) => (
                      <tr key={s.subjectId || i} className="hover:bg-primary/5">
                        <td className="font-medium">{s.subjectName}</td>
                        <td className="text-center">{s.totalStudents}</td>
                        <td className="text-center">
                          <span className={`badge badge-sm ${s.averageMarks >= 70 ? "badge-success" : s.averageMarks >= 50 ? "badge-warning" : "badge-error"}`}>
                            {s.averageMarks}%
                          </span>
                        </td>
                        <td className="text-center">
                          <span className={`badge badge-sm ${s.passRate >= 80 ? "badge-success" : s.passRate >= 60 ? "badge-warning" : "badge-error"}`}>
                            {s.passRate}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Top Performers */}
          {data.topPerformers?.length > 0 && (
            <div className="bg-gradient-to-br from-base-100 to-base-200/50 border border-base-300/50 rounded-2xl shadow-md overflow-hidden">
              <div className="p-4 border-b border-base-300/50 bg-gradient-to-r from-primary/5 to-secondary/5">
                <h3 className="font-bold text-base-content flex items-center gap-2">
                  <FaTrophy className="text-warning" /> Top Performers
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="table table-sm w-full">
                  <thead><tr className="bg-base-200/30"><th>#</th><th>Student</th><th className="text-center">Roll No</th><th className="text-center">Average</th></tr></thead>
                  <tbody>
                    {data.topPerformers.map((tp, i) => (
                      <tr key={tp.studentId || i} className="hover:bg-primary/5">
                        <td>
                          {i < 3 ? (
                            <span className={`badge badge-sm ${i === 0 ? "badge-warning" : i === 1 ? "badge-ghost" : "badge-accent"}`}>
                              {i + 1}
                            </span>
                          ) : i + 1}
                        </td>
                        <td className="font-medium">{tp.studentName}</td>
                        <td className="text-center">{tp.rollNumber || "-"}</td>
                        <td className="text-center">
                          <span className="badge badge-sm badge-success">{tp.averagePercentage}%</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// ==================== FINANCE REPORT TAB ====================
const FinanceReport = ({ axiosSecure, showError, canExport }) => {
  const [month, setMonth] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const params = {};
      if (month) params.month = month;
      const res = await axiosSecure.get("/reports/finance", { params });
      if (res.data.success) setData(res.data.data);
    } catch {
      showError("Failed to load finance report");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const handleExport = async () => {
    setExporting(true);
    try {
      const params = {};
      if (month) params.month = month;
      const res = await axiosSecure.get("/export/fees", { params, responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "fees_export.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      showError("Failed to export fees");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-gradient-to-br from-base-100 to-base-200/50 border border-base-300/50 rounded-2xl shadow-md p-5">
        <div className="flex items-center gap-2 mb-3">
          <FaFilter className="text-primary text-sm" />
          <span className="font-bold text-sm">Finance Report</span>
        </div>
        <div className="flex flex-wrap gap-3 items-end">
          <div className="form-control">
            <label className="label py-1"><span className="label-text text-xs">Month</span></label>
            <input type="month" className="input input-bordered input-sm" value={month} onChange={(e) => setMonth(e.target.value)} />
          </div>
          <button onClick={fetchReport} className="btn btn-sm btn-primary gap-1" disabled={loading}>
            <FaSearch className="text-xs" /> Generate
          </button>
          {canExport && (
            <button onClick={handleExport} className="btn btn-sm btn-outline gap-1" disabled={exporting}>
              <FaDownload className="text-xs" /> {exporting ? "Exporting..." : "Export Fees CSV"}
            </button>
          )}
        </div>
      </div>

      {loading ? <Loader /> : !data ? (
        <EmptyState icon={FaMoneyBillWave} title="Generating Report" message="Loading financial data..." />
      ) : (
        <>
          {/* Net Position */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <SummaryCard icon={FaMoneyBillWave} label="Total Income" value={`৳${(data.income?.totalCollected || 0).toLocaleString()}`} color="success" />
            <SummaryCard icon={FaReceipt} label="Total Expenses" value={`৳${(data.expenses?.totalExpenses || 0).toLocaleString()}`} color="error" />
            <SummaryCard icon={FaChalkboardTeacher} label="Salary Paid" value={`৳${(data.salaries?.totalPaid || 0).toLocaleString()}`} color="warning" />
            <SummaryCard
              icon={FaBalanceScale}
              label="Net Balance"
              value={`৳${(data.netPosition?.netBalance || 0).toLocaleString()}`}
              color={data.netPosition?.netBalance >= 0 ? "info" : "error"}
            />
          </div>

          {/* Fee Dues */}
          <div className="bg-gradient-to-br from-base-100 to-base-200/50 border border-base-300/50 rounded-2xl shadow-md p-5">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <FaMoneyBillWave className="text-primary" /> Fee Collection Summary
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div className="text-center p-3 rounded-xl bg-base-200/30">
                <p className="text-lg font-bold">৳{(data.feeDues?.totalPayable || 0).toLocaleString()}</p>
                <p className="text-xs text-base-content/50">Total Payable</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-base-200/30">
                <p className="text-lg font-bold text-success">৳{(data.feeDues?.totalPaid || 0).toLocaleString()}</p>
                <p className="text-xs text-base-content/50">Collected</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-base-200/30">
                <p className="text-lg font-bold text-error">৳{(data.feeDues?.totalOutstanding || 0).toLocaleString()}</p>
                <p className="text-xs text-base-content/50">Outstanding</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-base-200/30">
                <p className="text-lg font-bold text-warning">{data.feeDues?.overdueCount || 0}</p>
                <p className="text-xs text-base-content/50">Overdue</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-base-200/30">
                <p className="text-lg font-bold">{data.feeDues?.totalFeeRecords || 0}</p>
                <p className="text-xs text-base-content/50">Total Records</p>
              </div>
            </div>
          </div>

          {/* Payment by Mode */}
          {data.income?.byPaymentMode && Object.keys(data.income.byPaymentMode).length > 0 && (
            <div className="bg-gradient-to-br from-base-100 to-base-200/50 border border-base-300/50 rounded-2xl shadow-md p-5">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <FaReceipt className="text-secondary" /> Payment by Mode
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(data.income.byPaymentMode).map(([mode, amount]) => (
                  <div key={mode} className="text-center p-3 rounded-xl border border-base-300/50">
                    <p className="text-xs text-base-content/50 capitalize mb-1">{mode}</p>
                    <p className="font-bold text-success">৳{amount.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Expenses by Category */}
          {data.expenses?.byCategory && Object.keys(data.expenses.byCategory).length > 0 && (
            <div className="bg-gradient-to-br from-base-100 to-base-200/50 border border-base-300/50 rounded-2xl shadow-md p-5">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <FaReceipt className="text-error" /> Expenses by Category
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(data.expenses.byCategory).map(([cat, amount]) => (
                  <div key={cat} className="text-center p-3 rounded-xl border border-base-300/50">
                    <p className="text-xs text-base-content/50 capitalize mb-1">{cat}</p>
                    <p className="font-bold text-error">৳{amount.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Salary Summary */}
          <div className="bg-gradient-to-br from-base-100 to-base-200/50 border border-base-300/50 rounded-2xl shadow-md p-5">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <FaChalkboardTeacher className="text-warning" /> Salary Summary
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="text-center p-3 rounded-xl bg-base-200/30">
                <p className="text-lg font-bold">৳{(data.salaries?.totalNetSalary || 0).toLocaleString()}</p>
                <p className="text-xs text-base-content/50">Total Net</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-base-200/30">
                <p className="text-lg font-bold text-success">৳{(data.salaries?.totalPaid || 0).toLocaleString()}</p>
                <p className="text-xs text-base-content/50">Paid</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-base-200/30">
                <p className="text-lg font-bold text-warning">৳{(data.salaries?.totalPending || 0).toLocaleString()}</p>
                <p className="text-xs text-base-content/50">Pending</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-base-200/30">
                <p className="text-lg font-bold">{data.salaries?.totalRecords || 0}</p>
                <p className="text-xs text-base-content/50">Records</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// ==================== TEACHER WORKLOAD REPORT TAB ====================
const TeacherWorkloadReport = ({ axiosSecure, showError }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await axiosSecure.get("/reports/teacher-workload");
      if (res.data.success) setData(res.data.data);
    } catch {
      showError("Failed to load teacher workload report");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  return (
    <div className="space-y-4">
      {loading ? <Loader /> : !data ? (
        <EmptyState icon={FaChalkboardTeacher} title="Loading" message="Loading teacher workload data..." />
      ) : (
        <>
          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <SummaryCard icon={FaChalkboardTeacher} label="Total Teachers" value={data.summary?.totalTeachers || 0} color="primary" />
            <SummaryCard icon={FaBookOpen} label="Total Subjects" value={data.summary?.totalSubjects || 0} color="secondary" />
            <SummaryCard icon={FaGraduationCap} label="Grade Submissions" value={data.summary?.totalGradeSubmissions || 0} color="info" />
          </div>

          {/* Teacher Table */}
          {data.teachers?.length > 0 && (
            <div className="bg-gradient-to-br from-base-100 to-base-200/50 border border-base-300/50 rounded-2xl shadow-md overflow-hidden">
              <div className="p-4 border-b border-base-300/50 bg-gradient-to-r from-primary/5 to-secondary/5">
                <h3 className="font-bold text-base-content flex items-center gap-2">
                  <FaChalkboardTeacher className="text-primary" /> Teacher Details
                  <span className="badge badge-sm badge-primary">{data.teachers.length}</span>
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="table table-sm w-full">
                  <thead>
                    <tr className="bg-base-200/30">
                      <th>#</th>
                      <th>Teacher</th>
                      <th className="text-center">Subjects</th>
                      <th className="text-center">Classes</th>
                      <th className="text-center">Grade Submissions</th>
                      <th className="text-center">Attendance Marked</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.teachers.map((t, i) => (
                      <tr key={t.teacherId || i} className="hover:bg-primary/5 transition-colors animate-in slide-in-from-bottom" style={{ animationDelay: `${i * 30}ms` }}>
                        <td className="text-base-content/50">{i + 1}</td>
                        <td>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                              <span className="text-primary font-bold text-xs">{t.teacherName?.charAt(0)?.toUpperCase()}</span>
                            </div>
                            <span className="font-medium">{t.teacherName}</span>
                          </div>
                        </td>
                        <td className="text-center">
                          <span className="badge badge-sm badge-primary">{t.totalSubjects}</span>
                        </td>
                        <td className="text-center">
                          <span className="badge badge-sm badge-secondary">{t.totalClasses}</span>
                        </td>
                        <td className="text-center">
                          <span className="badge badge-sm badge-info">{t.gradeSubmissions?.total || 0}</span>
                        </td>
                        <td className="text-center">
                          <span className="badge badge-sm badge-success">{t.attendanceMarked || 0}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// ==================== SHARED SUMMARY CARD ====================
const SummaryCard = ({ icon: Icon, label, value, color = "primary" }) => {
  const colorMap = {
    primary: "bg-primary/10 text-primary border-primary/20",
    secondary: "bg-secondary/10 text-secondary border-secondary/20",
    success: "bg-success/10 text-success border-success/20",
    error: "bg-error/10 text-error border-error/20",
    warning: "bg-warning/10 text-warning border-warning/20",
    info: "bg-info/10 text-info border-info/20",
    accent: "bg-accent/10 text-accent border-accent/20",
  };

  const iconBg = colorMap[color] || colorMap.primary;

  return (
    <div className="bg-gradient-to-br from-base-100 to-base-200/50 border border-base-300/50 rounded-2xl shadow-md p-4 hover:shadow-lg transition-all hover:scale-105">
      <div className="flex items-center gap-3 mb-2">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconBg}`}>
          <Icon className="text-sm" />
        </div>
      </div>
      <p className="text-xl font-bold text-base-content">{value}</p>
      <p className="text-xs text-base-content/50 mt-1">{label}</p>
    </div>
  );
};

export default Reports;
