import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import useAuth from "../../hooks/useAuth";
import { useNotification } from "../../contexts/NotificationContext";
import Loader from "../../components/Loader";
import EmptyState from "../../components/EmptyState";
import {
  FaChartBar,
  FaChartLine,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaShieldAlt,
  FaCalendarAlt,
  FaSearch,
  FaFilter,
  FaPercentage,
  FaUserGraduate,
} from "react-icons/fa";

const AttendanceReports = () => {
  const axiosSecure = useAxiosSecure();
  const { organizationId } = useAuth();
  const { error: showError } = useNotification();
  const navigate = useNavigate();

  // Filter state
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Data state
  const [reportData, setReportData] = useState(null);

  // UI state
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [loadingSections, setLoadingSections] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch classes on mount
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await axiosSecure.get("/classes");
        if (res.data.success) {
          setClasses(res.data.data.filter((c) => c.status === "active"));
        }
      } catch {
        showError("Failed to load classes");
      } finally {
        setLoadingClasses(false);
      }
    };
    fetchClasses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch sections when class changes
  useEffect(() => {
    if (!selectedClass) {
      setSections([]);
      setSelectedSection("");
      return;
    }
    const fetchSections = async () => {
      setLoadingSections(true);
      setSelectedSection("");
      try {
        const res = await axiosSecure.get(`/sections?classId=${selectedClass}`);
        if (res.data.success) {
          setSections(res.data.data);
        }
      } catch {
        showError("Failed to load sections");
      } finally {
        setLoadingSections(false);
      }
    };
    fetchSections();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClass]);

  // Fetch report
  const fetchReport = async () => {
    if (!selectedClass || !selectedSection) {
      showError("Please select a class and section");
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("classId", selectedClass);
      params.append("sectionId", selectedSection);
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const res = await axiosSecure.get(`/attendance/reports?${params.toString()}`);
      if (res.data.success) {
        setReportData(res.data.data);
      }
    } catch {
      showError("Failed to load attendance report");
    } finally {
      setLoading(false);
    }
  };

  // Get percentage color
  const getPercentageColor = (pct) => {
    if (pct >= 90) return "text-success";
    if (pct >= 75) return "text-warning";
    return "text-error";
  };

  const getPercentageBg = (pct) => {
    if (pct >= 90) return "bg-success/10 border-success/30";
    if (pct >= 75) return "bg-warning/10 border-warning/30";
    return "bg-error/10 border-error/30";
  };

  if (loadingClasses) return <Loader />;

  const summary = reportData?.summary;
  const students = reportData?.students || [];
  const totalDays = reportData?.totalDays || 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Background blobs */}
      <div className="fixed top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 rounded-full blur-3xl animate-pulse pointer-events-none opacity-30" />
      <div className="fixed bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-info/20 via-success/20 to-warning/20 rounded-full blur-3xl animate-pulse pointer-events-none opacity-30 animation-delay-2000" />

      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-secondary p-8 shadow-lg">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAtNi42MjcgNS4zNzMtMTIgMTItMTJzMTIgNS4zNzMgMTIgMTItNS4zNzMgMTItMTIgMTItMTItNS4zNzMtMTItMTJ6bS0xMiAxMmMwLTYuNjI3IDUuMzczLTEyIDEyLTEyczEyIDUuMzczIDEyIDEyLTUuMzczIDEyLTEyIDEyLTEyLTUuMzczLTEyLTEyem0wIDI0YzAtNi42MjcgNS4zNzMtMTIgMTItMTJzMTIgNS4zNzMgMTIgMTItNS4zNzMgMTItMTIgMTItMTItNS4zNzMtMTItMTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-10" />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl shadow-lg animate-bounce-slow">
              <FaChartBar className="text-4xl text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                Attendance Reports
                {totalDays > 0 && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium animate-pulse">
                    <FaCalendarAlt className="text-xs" />
                    {totalDays} Days
                  </span>
                )}
              </h1>
              <p className="text-white/80 text-sm mt-2">
                Aggregated attendance statistics and student summaries
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-gradient-to-br from-base-100 to-base-200/50 border border-base-300/50 rounded-2xl shadow-md p-6">
        <div className="flex items-center gap-2 mb-4">
          <FaFilter className="text-primary" />
          <span className="font-bold text-base-content">Generate Report</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Class */}
          <div className="form-control">
            <label className="label py-1">
              <span className="label-text font-semibold text-sm">Class *</span>
            </label>
            <select
              className="select select-bordered select-sm w-full focus:border-primary"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              <option value="">Select Class</option>
              {classes.map((cls) => (
                <option key={cls._id} value={cls._id}>{cls.name}</option>
              ))}
            </select>
          </div>

          {/* Section */}
          <div className="form-control">
            <label className="label py-1">
              <span className="label-text font-semibold text-sm">Section *</span>
            </label>
            <select
              className="select select-bordered select-sm w-full focus:border-primary"
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              disabled={!selectedClass || loadingSections}
            >
              <option value="">{loadingSections ? "Loading..." : "Select Section"}</option>
              {sections.map((sec) => (
                <option key={sec._id} value={sec._id}>{sec.name}</option>
              ))}
            </select>
          </div>

          {/* Start Date */}
          <div className="form-control">
            <label className="label py-1">
              <span className="label-text font-semibold text-sm">From</span>
            </label>
            <input
              type="date"
              className="input input-bordered input-sm w-full focus:border-primary"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          {/* End Date */}
          <div className="form-control">
            <label className="label py-1">
              <span className="label-text font-semibold text-sm">To</span>
            </label>
            <input
              type="date"
              className="input input-bordered input-sm w-full focus:border-primary"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          {/* Generate Button */}
          <div className="form-control">
            <label className="label py-1">
              <span className="label-text text-sm">&nbsp;</span>
            </label>
            <button
              onClick={fetchReport}
              className="btn btn-sm bg-gradient-to-r from-primary to-secondary text-white border-none hover:scale-105 transition-all"
            >
              <FaSearch /> Generate
            </button>
          </div>
        </div>
      </div>

      {/* Report Content */}
      {loading ? (
        <Loader />
      ) : !reportData ? (
        <EmptyState
          icon={FaChartBar}
          title="Select Filters"
          message="Choose a class and section, then click Generate to view attendance reports."
        />
      ) : totalDays === 0 ? (
        <EmptyState
          icon={FaCalendarAlt}
          title="No Attendance Data"
          message="No attendance records found for the selected filters."
        />
      ) : (
        <>
          {/* Summary Cards */}
          {summary && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {/* Total Days */}
              <div className="bg-gradient-to-br from-base-100 to-base-200/50 border border-base-300/50 rounded-2xl shadow-md p-5 hover:shadow-lg transition-all hover:scale-105">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <FaCalendarAlt className="text-primary" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-base-content">{totalDays}</p>
                <p className="text-xs text-base-content/50 mt-1">Total Days</p>
              </div>

              {/* Present */}
              <div className="bg-gradient-to-br from-base-100 to-base-200/50 border border-success/20 rounded-2xl shadow-md p-5 hover:shadow-lg transition-all hover:scale-105">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
                    <FaCheckCircle className="text-success" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-success">{summary.present || 0}</p>
                <p className="text-xs text-base-content/50 mt-1">Present</p>
              </div>

              {/* Absent */}
              <div className="bg-gradient-to-br from-base-100 to-base-200/50 border border-error/20 rounded-2xl shadow-md p-5 hover:shadow-lg transition-all hover:scale-105">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-error/10 flex items-center justify-center">
                    <FaTimesCircle className="text-error" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-error">{summary.absent || 0}</p>
                <p className="text-xs text-base-content/50 mt-1">Absent</p>
              </div>

              {/* Late */}
              <div className="bg-gradient-to-br from-base-100 to-base-200/50 border border-warning/20 rounded-2xl shadow-md p-5 hover:shadow-lg transition-all hover:scale-105">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
                    <FaClock className="text-warning" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-warning">{summary.late || 0}</p>
                <p className="text-xs text-base-content/50 mt-1">Late</p>
              </div>

              {/* Excused */}
              <div className="bg-gradient-to-br from-base-100 to-base-200/50 border border-info/20 rounded-2xl shadow-md p-5 hover:shadow-lg transition-all hover:scale-105">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-info/10 flex items-center justify-center">
                    <FaShieldAlt className="text-info" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-info">{summary.excused || 0}</p>
                <p className="text-xs text-base-content/50 mt-1">Excused</p>
              </div>
            </div>
          )}

          {/* Per-Student Table */}
          {students.length > 0 && (
            <div className="bg-gradient-to-br from-base-100 to-base-200/50 border border-base-300/50 rounded-2xl shadow-md overflow-hidden">
              <div className="p-5 border-b border-base-300/50 bg-gradient-to-r from-primary/5 to-secondary/5">
                <h2 className="font-bold text-lg text-base-content flex items-center gap-2">
                  <FaUserGraduate className="text-primary" />
                  Per-Student Summary
                  <span className="badge badge-primary badge-sm">{students.length}</span>
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="table w-full">
                  <thead>
                    <tr className="bg-base-200/30">
                      <th className="font-bold text-base-content/70">#</th>
                      <th className="font-bold text-base-content/70">Student</th>
                      <th className="font-bold text-base-content/70 text-center">
                        <FaCheckCircle className="inline text-success mr-1" />Present
                      </th>
                      <th className="font-bold text-base-content/70 text-center">
                        <FaTimesCircle className="inline text-error mr-1" />Absent
                      </th>
                      <th className="font-bold text-base-content/70 text-center">
                        <FaClock className="inline text-warning mr-1" />Late
                      </th>
                      <th className="font-bold text-base-content/70 text-center">
                        <FaShieldAlt className="inline text-info mr-1" />Excused
                      </th>
                      <th className="font-bold text-base-content/70 text-center">
                        <FaPercentage className="inline text-primary mr-1" />Attendance
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student, index) => {
                      const pct = student.attendancePercentage ?? 0;
                      return (
                        <tr
                          key={student.studentId || index}
                          className="hover:bg-primary/5 transition-colors cursor-pointer animate-in slide-in-from-bottom"
                          style={{ animationDelay: `${index * 30}ms` }}
                          onClick={() => {
                            if (student.studentId) {
                              navigate(`/dashboard/students/${student.studentId}`);
                            }
                          }}
                        >
                          <td className="text-base-content/50">{index + 1}</td>
                          <td>
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center border border-primary/20">
                                <span className="text-primary font-bold text-xs">
                                  {student.studentName?.charAt(0)?.toUpperCase() || "?"}
                                </span>
                              </div>
                              <span className="font-semibold text-base-content">
                                {student.studentName || "Unknown"}
                              </span>
                            </div>
                          </td>
                          <td className="text-center font-medium text-success">
                            {student.present || 0}
                          </td>
                          <td className="text-center font-medium text-error">
                            {student.absent || 0}
                          </td>
                          <td className="text-center font-medium text-warning">
                            {student.late || 0}
                          </td>
                          <td className="text-center font-medium text-info">
                            {student.excused || 0}
                          </td>
                          <td className="text-center">
                            <span
                              className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg border text-sm font-bold ${getPercentageBg(pct)} ${getPercentageColor(pct)}`}
                            >
                              {pct.toFixed(1)}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      <style jsx>{`
        .animate-bounce-slow {
          animation: bounce 3s infinite;
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
};

export default AttendanceReports;
