import { useState, useEffect } from "react";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import useAuth from "../../hooks/useAuth";
import { useNotification } from "../../contexts/NotificationContext";
import Loader from "../../components/Loader";
import EmptyState from "../../components/EmptyState";
import {
  FaCalendarCheck,
  FaChartLine,
  FaChevronDown,
  FaChevronUp,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaShieldAlt,
  FaSearch,
  FaFilter,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";

const statusConfig = {
  present: { icon: FaCheckCircle, color: "text-success", bg: "bg-success/10 border-success/30", label: "Present" },
  absent: { icon: FaTimesCircle, color: "text-error", bg: "bg-error/10 border-error/30", label: "Absent" },
  late: { icon: FaClock, color: "text-warning", bg: "bg-warning/10 border-warning/30", label: "Late" },
  excused: { icon: FaShieldAlt, color: "text-info", bg: "bg-info/10 border-info/30", label: "Excused" },
};

const AttendanceHistory = () => {
  const axiosSecure = useAxiosSecure();
  const { organizationId } = useAuth();
  const { error: showError } = useNotification();

  // Filter state
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Data state
  const [records, setRecords] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [expandedRecord, setExpandedRecord] = useState(null);

  // UI state
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [loadingSections, setLoadingSections] = useState(false);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

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

  // Fetch attendance records
  const fetchRecords = async (pageNum = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedClass) params.append("classId", selectedClass);
      if (selectedSection) params.append("sectionId", selectedSection);
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      params.append("page", pageNum);
      params.append("limit", 10);

      const res = await axiosSecure.get(`/attendance?${params.toString()}`);
      if (res.data.success) {
        setRecords(res.data.data);
        setPagination(res.data.pagination || { page: pageNum, totalPages: 1, total: 0 });
      }
    } catch {
      showError("Failed to load attendance records");
    } finally {
      setLoading(false);
    }
  };

  // Search handler
  const handleSearch = () => {
    setPage(1);
    fetchRecords(1);
  };

  // Pagination
  const handlePageChange = (newPage) => {
    setPage(newPage);
    fetchRecords(newPage);
  };

  // Toggle record expansion
  const toggleExpand = (recordId) => {
    setExpandedRecord(expandedRecord === recordId ? null : recordId);
  };

  // Count statuses in a record
  const getStatusCounts = (attendanceRecords) => {
    return attendanceRecords.reduce(
      (acc, r) => {
        acc[r.status] = (acc[r.status] || 0) + 1;
        return acc;
      },
      { present: 0, absent: 0, late: 0, excused: 0 }
    );
  };

  if (loadingClasses) return <Loader />;

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
              <FaCalendarCheck className="text-4xl text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                Attendance History
                {pagination.total > 0 && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium animate-pulse">
                    <FaChartLine className="text-xs" />
                    {pagination.total} Records
                  </span>
                )}
              </h1>
              <p className="text-white/80 text-sm mt-2">
                View and review past attendance records
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-gradient-to-br from-base-100 to-base-200/50 border border-base-300/50 rounded-2xl shadow-md p-6">
        <div className="flex items-center gap-2 mb-4">
          <FaFilter className="text-primary" />
          <span className="font-bold text-base-content">Filters</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Class */}
          <div className="form-control">
            <label className="label py-1">
              <span className="label-text font-semibold text-sm">Class</span>
            </label>
            <select
              className="select select-bordered select-sm w-full focus:border-primary"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              <option value="">All Classes</option>
              {classes.map((cls) => (
                <option key={cls._id} value={cls._id}>{cls.name}</option>
              ))}
            </select>
          </div>

          {/* Section */}
          <div className="form-control">
            <label className="label py-1">
              <span className="label-text font-semibold text-sm">Section</span>
            </label>
            <select
              className="select select-bordered select-sm w-full focus:border-primary"
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              disabled={!selectedClass || loadingSections}
            >
              <option value="">{loadingSections ? "Loading..." : "All Sections"}</option>
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

          {/* Search Button */}
          <div className="form-control">
            <label className="label py-1">
              <span className="label-text text-sm">&nbsp;</span>
            </label>
            <button
              onClick={handleSearch}
              className="btn btn-sm bg-gradient-to-r from-primary to-secondary text-white border-none hover:scale-105 transition-all"
            >
              <FaSearch /> Search
            </button>
          </div>
        </div>
      </div>

      {/* Records */}
      {loading ? (
        <Loader />
      ) : records.length === 0 ? (
        <EmptyState
          icon={FaCalendarCheck}
          title="No Records Found"
          message="Use the filters above and click Search to view attendance records."
          action={handleSearch}
          actionLabel="Search Records"
        />
      ) : (
        <div className="space-y-4">
          {records.map((record, index) => {
            const counts = getStatusCounts(record.records);
            const isExpanded = expandedRecord === record._id;
            const totalStudents = record.records.length;

            return (
              <div
                key={record._id}
                className="bg-gradient-to-br from-base-100 to-base-200/50 border border-base-300/50 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden animate-in slide-in-from-bottom"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Record Header */}
                <div
                  className="p-5 cursor-pointer hover:bg-primary/5 transition-colors"
                  onClick={() => toggleExpand(record._id)}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      {/* Date Badge */}
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex flex-col items-center justify-center border border-primary/30">
                        <span className="text-xs text-primary/70 font-medium">
                          {new Date(record.date).toLocaleDateString("en", { month: "short" })}
                        </span>
                        <span className="text-xl font-bold text-primary">
                          {new Date(record.date).getDate()}
                        </span>
                        <span className="text-xs text-primary/70">
                          {new Date(record.date).getFullYear()}
                        </span>
                      </div>

                      <div>
                        <h3 className="font-bold text-base-content text-lg">
                          {record.className || "Class"} - {record.sectionName || "Section"}
                        </h3>
                        <p className="text-sm text-base-content/50">
                          {totalStudents} students | Marked by {record.markedByName || "—"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Status Counts */}
                      <div className="flex gap-2">
                        {Object.entries(statusConfig).map(([key, cfg]) => (
                          counts[key] > 0 && (
                            <div
                              key={key}
                              className={`flex items-center gap-1 px-2 py-1 rounded-lg border ${cfg.bg}`}
                            >
                              <cfg.icon className={`text-xs ${cfg.color}`} />
                              <span className={`text-xs font-bold ${cfg.color}`}>
                                {counts[key]}
                              </span>
                            </div>
                          )
                        ))}
                      </div>

                      {/* Expand Icon */}
                      <button className="btn btn-circle btn-ghost btn-sm">
                        {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Student Details */}
                {isExpanded && (
                  <div className="border-t border-base-300/50 bg-base-200/20 animate-in fade-in duration-200">
                    <div className="overflow-x-auto">
                      <table className="table table-sm w-full">
                        <thead>
                          <tr className="bg-primary/5">
                            <th className="font-bold text-base-content/70">#</th>
                            <th className="font-bold text-base-content/70">Student</th>
                            <th className="font-bold text-base-content/70 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {record.records.map((r, i) => {
                            const cfg = statusConfig[r.status] || statusConfig.present;
                            return (
                              <tr key={r.studentId || i} className="hover:bg-primary/5">
                                <td className="text-base-content/50">{i + 1}</td>
                                <td className="font-medium">{r.studentName || r.studentId}</td>
                                <td className="text-center">
                                  <span
                                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-bold ${cfg.bg} ${cfg.color}`}
                                  >
                                    <cfg.icon className="text-xs" />
                                    {cfg.label}
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
              </div>
            );
          })}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1}
                className="btn btn-sm btn-ghost disabled:opacity-30"
              >
                <FaChevronLeft />
              </button>

              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === pagination.totalPages || Math.abs(p - page) <= 1)
                .map((p, idx, arr) => (
                  <span key={p}>
                    {idx > 0 && arr[idx - 1] !== p - 1 && (
                      <span className="px-1 text-base-content/40">...</span>
                    )}
                    <button
                      onClick={() => handlePageChange(p)}
                      className={`btn btn-sm ${
                        p === page
                          ? "bg-gradient-to-r from-primary to-secondary text-white border-none"
                          : "btn-ghost"
                      }`}
                    >
                      {p}
                    </button>
                  </span>
                ))}

              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= pagination.totalPages}
                className="btn btn-sm btn-ghost disabled:opacity-30"
              >
                <FaChevronRight />
              </button>
            </div>
          )}
        </div>
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

export default AttendanceHistory;
