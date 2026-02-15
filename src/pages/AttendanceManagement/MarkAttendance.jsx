import { useState, useEffect } from "react";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import useAuth from "../../hooks/useAuth";
import { useNotification } from "../../contexts/NotificationContext";
import Loader from "../../components/Loader";
import EmptyState from "../../components/EmptyState";
import {
  FaClipboardCheck,
  FaChartLine,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaShieldAlt,
  FaUserGraduate,
  FaCheck,
  FaUsers,
} from "react-icons/fa";

const statusOptions = [
  { value: "present", label: "Present", icon: FaCheckCircle, color: "text-success", bg: "bg-success/10 border-success/30" },
  { value: "absent", label: "Absent", icon: FaTimesCircle, color: "text-error", bg: "bg-error/10 border-error/30" },
  { value: "late", label: "Late", icon: FaClock, color: "text-warning", bg: "bg-warning/10 border-warning/30" },
  { value: "excused", label: "Excused", icon: FaShieldAlt, color: "text-info", bg: "bg-info/10 border-info/30" },
];

const MarkAttendance = () => {
  const axiosSecure = useAxiosSecure();
  const { organizationId } = useAuth();
  const { success, error: showError } = useNotification();

  // Filter state
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  // Attendance state
  const [records, setRecords] = useState({});
  const [existingAttendance, setExistingAttendance] = useState(null);

  // UI state
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [loadingSections, setLoadingSections] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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
      setStudents([]);
      setRecords({});
      setExistingAttendance(null);
      return;
    }

    const fetchSections = async () => {
      setLoadingSections(true);
      setSections([]);
      setSelectedSection("");
      setStudents([]);
      setRecords({});
      setExistingAttendance(null);
      try {
        const res = await axiosSecure.get(
          `/sections?classId=${selectedClass}`
        );
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

  // Fetch students and existing attendance when section or date changes
  useEffect(() => {
    if (!selectedClass || !selectedSection || !selectedDate) {
      setStudents([]);
      setRecords({});
      setExistingAttendance(null);
      return;
    }

    const fetchStudentsAndAttendance = async () => {
      setLoadingStudents(true);
      try {
        // Fetch students and existing attendance in parallel
        const [studentsRes, attendanceRes] = await Promise.all([
          axiosSecure.get(
            `/students?classId=${selectedClass}&sectionId=${selectedSection}&limit=1000`
          ),
          axiosSecure.get(
            `/attendance?classId=${selectedClass}&sectionId=${selectedSection}&startDate=${selectedDate}&endDate=${selectedDate}&limit=1`
          ),
        ]);

        const studentList = studentsRes.data.success
          ? studentsRes.data.data
          : [];
        setStudents(studentList);

        // Check if attendance already exists for this date
        const attendanceRecords = attendanceRes.data.success
          ? attendanceRes.data.data
          : [];

        if (attendanceRecords.length > 0) {
          const existing = attendanceRecords[0];
          setExistingAttendance(existing);
          // Pre-fill statuses from existing attendance
          const prefilled = {};
          existing.records.forEach((r) => {
            prefilled[r.studentId] = r.status;
          });
          // Also set default for any students not in existing record
          studentList.forEach((s) => {
            if (!prefilled[s._id]) {
              prefilled[s._id] = "present";
            }
          });
          setRecords(prefilled);
        } else {
          setExistingAttendance(null);
          // Default all to present
          const defaults = {};
          studentList.forEach((s) => {
            defaults[s._id] = "present";
          });
          setRecords(defaults);
        }
      } catch {
        showError("Failed to load students");
      } finally {
        setLoadingStudents(false);
      }
    };

    fetchStudentsAndAttendance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClass, selectedSection, selectedDate]);

  const handleStatusChange = (studentId, status) => {
    setRecords((prev) => ({ ...prev, [studentId]: status }));
  };

  const markAll = (status) => {
    const updated = {};
    students.forEach((s) => {
      updated[s._id] = status;
    });
    setRecords(updated);
  };

  const handleSubmit = async () => {
    if (!selectedClass || !selectedSection || !selectedDate) {
      showError("Please select class, section, and date");
      return;
    }
    if (students.length === 0) {
      showError("No students to mark attendance for");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        classId: selectedClass,
        sectionId: selectedSection,
        date: selectedDate,
        records: Object.entries(records).map(([studentId, status]) => ({
          studentId,
          status,
        })),
      };

      const res = await axiosSecure.post("/attendance", payload);
      if (res.data.success) {
        success(
          existingAttendance
            ? "Attendance updated successfully"
            : "Attendance marked successfully"
        );
        setExistingAttendance(res.data.data);
      }
    } catch (err) {
      showError(err.response?.data?.message || "Failed to submit attendance");
    } finally {
      setSubmitting(false);
    }
  };

  // Count statuses
  const statusCounts = Object.values(records).reduce(
    (acc, status) => {
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    },
    {}
  );

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
              <FaClipboardCheck className="text-4xl text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                Mark Attendance
                {students.length > 0 && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium animate-pulse">
                    <FaUsers className="text-xs" />
                    {students.length} Students
                  </span>
                )}
              </h1>
              <p className="text-white/80 text-sm mt-2">
                {existingAttendance
                  ? "Editing existing attendance record"
                  : "Record daily attendance for students"}
              </p>
            </div>
          </div>
          {existingAttendance && (
            <span className="badge bg-white/20 text-white border-white/30 backdrop-blur-sm">
              Editing Existing
            </span>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-gradient-to-br from-base-100 to-base-200/50 border border-base-300/50 rounded-2xl shadow-md p-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Class Select */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-bold">Class</span>
            </label>
            <select
              className="select select-bordered w-full focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              <option value="">Select Class</option>
              {classes.map((cls) => (
                <option key={cls._id} value={cls._id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>

          {/* Section Select */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-bold">Section</span>
            </label>
            <select
              className="select select-bordered w-full focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              disabled={!selectedClass || loadingSections}
            >
              <option value="">
                {loadingSections ? "Loading..." : "Select Section"}
              </option>
              {sections.map((sec) => (
                <option key={sec._id} value={sec._id}>
                  {sec.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date Picker */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-bold">Date</span>
            </label>
            <input
              type="date"
              className="input input-bordered w-full focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              max={new Date().toISOString().split("T")[0]}
            />
          </div>
        </div>
      </div>

      {/* Quick Actions & Status Summary */}
      {students.length > 0 && (
        <div className="bg-gradient-to-br from-base-100 to-base-200/50 border border-base-300/50 rounded-2xl shadow-md p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-bold text-base-content/70 self-center mr-2">
                Quick Actions:
              </span>
              <button
                onClick={() => markAll("present")}
                className="btn btn-sm bg-success/10 text-success border-success/30 hover:bg-success hover:text-white transition-all"
              >
                <FaCheckCircle /> All Present
              </button>
              <button
                onClick={() => markAll("absent")}
                className="btn btn-sm bg-error/10 text-error border-error/30 hover:bg-error hover:text-white transition-all"
              >
                <FaTimesCircle /> All Absent
              </button>
            </div>

            {/* Status Summary */}
            <div className="flex flex-wrap gap-3">
              {statusOptions.map((opt) => (
                <div
                  key={opt.value}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${opt.bg}`}
                >
                  <opt.icon className={`text-sm ${opt.color}`} />
                  <span className={`text-sm font-semibold ${opt.color}`}>
                    {statusCounts[opt.value] || 0}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Students Table */}
      {loadingStudents ? (
        <Loader />
      ) : !selectedClass || !selectedSection ? (
        <EmptyState
          icon={FaClipboardCheck}
          title="Select Class & Section"
          message="Choose a class and section to start marking attendance."
        />
      ) : students.length === 0 ? (
        <EmptyState
          icon={FaUserGraduate}
          title="No Students Found"
          message="There are no active students in this class and section."
        />
      ) : (
        <>
          <div className="bg-gradient-to-br from-base-100 to-base-200/50 border border-base-300/50 rounded-2xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-primary/5 to-secondary/5 border-b border-base-300/50">
                    <th className="font-bold text-base-content/80">#</th>
                    <th className="font-bold text-base-content/80">Student</th>
                    <th className="font-bold text-base-content/80">Roll No</th>
                    <th className="font-bold text-base-content/80 text-center">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student, index) => (
                    <tr
                      key={student._id}
                      className="hover:bg-primary/5 transition-colors animate-in slide-in-from-bottom"
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      <td className="text-base-content/60">{index + 1}</td>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center border border-primary/20">
                            <span className="text-primary font-bold text-sm">
                              {student.name?.charAt(0)?.toUpperCase() || "?"}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-base-content">
                              {student.name}
                            </p>
                            <p className="text-xs text-base-content/50">
                              {student.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-ghost badge-sm">
                          {student.rollNumber || "—"}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center justify-center gap-2 flex-wrap">
                          {statusOptions.map((opt) => {
                            const isSelected =
                              records[student._id] === opt.value;
                            return (
                              <button
                                key={opt.value}
                                onClick={() =>
                                  handleStatusChange(student._id, opt.value)
                                }
                                className={`btn btn-sm gap-1 transition-all duration-300 ${
                                  isSelected
                                    ? `${opt.bg} ${opt.color} border-2 scale-105 shadow-md font-bold`
                                    : "btn-ghost btn-outline opacity-50 hover:opacity-100"
                                }`}
                                title={opt.label}
                              >
                                <opt.icon className="text-xs" />
                                <span className="hidden sm:inline text-xs">
                                  {opt.label}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="btn bg-gradient-to-r from-primary via-primary to-secondary text-white border-none hover:scale-105 hover:shadow-xl transition-all duration-300 shadow-lg px-8"
            >
              {submitting ? (
                <>
                  <span className="loading loading-spinner loading-sm" />
                  Submitting...
                </>
              ) : (
                <>
                  <FaCheck />
                  {existingAttendance
                    ? "Update Attendance"
                    : "Submit Attendance"}
                </>
              )}
            </button>
          </div>
        </>
      )}

      <style jsx>{`
        .animate-bounce-slow {
          animation: bounce 3s infinite;
        }
        @keyframes bounce {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
};

export default MarkAttendance;
