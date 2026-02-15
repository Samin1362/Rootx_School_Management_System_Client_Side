import { useState, useEffect } from "react";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import { useNotification } from "../../contexts/NotificationContext";
import EmptyState from "../../components/EmptyState";
import Loader from "../../components/Loader";
import { useNavigate } from "react-router";
import {
  FaExclamationTriangle,
  FaMoneyBillWave,
  FaUsers,
  FaCalendar,
} from "react-icons/fa";

const FeeDues = () => {
  const axiosSecure = useAxiosSecure();
  const navigate = useNavigate();
  const { error: showError } = useNotification();

  const [dues, setDues] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState([]);

  // Filters
  const [classId, setClassId] = useState("");
  const [month, setMonth] = useState("");

  const fetchClasses = async () => {
    try {
      const res = await axiosSecure.get("/classes");
      if (res.data.success) setClasses(res.data.data.filter((c) => c.status === "active"));
    } catch { /* silent */ }
  };

  const fetchDues = async () => {
    setLoading(true);
    try {
      const params = {};
      if (classId) params.classId = classId;
      if (month) params.month = month;

      const res = await axiosSecure.get("/fees/dues", { params });
      if (res.data.success) {
        setDues(res.data.data);
        setSummary(res.data.summary);
      }
    } catch (err) {
      showError("Failed to load dues");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    fetchDues();
  }, [classId, month]);

  const statusColors = {
    pending: "badge-info",
    partial: "badge-warning",
    overdue: "badge-error",
  };

  if (loading) return <Loader fullPage={false} message="Loading outstanding dues..." />;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-error/80 via-error/70 to-warning p-8 shadow-lg">
        <div className="relative z-10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
              <FaExclamationTriangle className="text-2xl text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Outstanding Dues</h1>
              <p className="text-white/70 text-sm">Students with pending fee payments</p>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card bg-base-100 border border-base-300/50 shadow-sm">
            <div className="card-body p-4 text-center">
              <FaMoneyBillWave className="text-2xl text-error mx-auto" />
              <p className="text-2xl font-bold text-error">৳{summary.totalDue.toLocaleString()}</p>
              <p className="text-xs text-base-content/50">Total Due</p>
            </div>
          </div>
          <div className="card bg-base-100 border border-base-300/50 shadow-sm">
            <div className="card-body p-4 text-center">
              <FaUsers className="text-2xl text-primary mx-auto" />
              <p className="text-2xl font-bold">{summary.totalStudents}</p>
              <p className="text-xs text-base-content/50">Students</p>
            </div>
          </div>
          <div className="card bg-base-100 border border-base-300/50 shadow-sm">
            <div className="card-body p-4 text-center">
              <p className="text-2xl font-bold text-warning">{summary.byStatus.partial}</p>
              <p className="text-xs text-base-content/50">Partial Payments</p>
            </div>
          </div>
          <div className="card bg-base-100 border border-base-300/50 shadow-sm">
            <div className="card-body p-4 text-center">
              <p className="text-2xl font-bold text-error">{summary.byStatus.overdue}</p>
              <p className="text-xs text-base-content/50">Overdue</p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card bg-base-100 border border-base-300/50 shadow-sm">
        <div className="card-body p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label"><span className="label-text text-xs">Class</span></label>
              <select
                className="select select-bordered select-sm w-full"
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
              >
                <option value="">All Classes</option>
                {classes.map((cls) => (
                  <option key={cls._id} value={cls._id}>{cls.name}</option>
                ))}
              </select>
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text text-xs">Month</span></label>
              <input
                type="month"
                className="input input-bordered input-sm w-full"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Dues Table */}
      {dues.length === 0 ? (
        <EmptyState
          icon={FaMoneyBillWave}
          title="No outstanding dues"
          message="All fees are up to date! Great job."
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-base-300/50 bg-base-100 shadow-sm">
          <table className="table table-sm">
            <thead>
              <tr className="bg-base-200/50">
                <th>#</th>
                <th>Student</th>
                <th>Class</th>
                <th>Section</th>
                <th>Month</th>
                <th>Payable</th>
                <th>Paid</th>
                <th>Due</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {dues.map((due, index) => (
                <tr key={due._id} className="hover">
                  <td>{index + 1}</td>
                  <td className="font-medium">
                    {due.studentInfo?.name || "Unknown"}
                  </td>
                  <td>{due.studentInfo?.className || "-"}</td>
                  <td>{due.studentInfo?.sectionName || "-"}</td>
                  <td>{due.month}</td>
                  <td>৳{due.payableAmount.toLocaleString()}</td>
                  <td className="text-success">
                    ৳{(due.paidAmount || 0).toLocaleString()}
                  </td>
                  <td className="font-bold text-error">
                    ৳{due.dueAmount.toLocaleString()}
                  </td>
                  <td>
                    <span className={`badge badge-sm ${statusColors[due.status]}`}>
                      {due.status}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() =>
                        navigate(`/dashboard/fees/collect?studentFeeId=${due._id}`)
                      }
                      className="btn btn-xs btn-primary"
                    >
                      Collect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default FeeDues;
