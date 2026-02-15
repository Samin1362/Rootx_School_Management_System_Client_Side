import { useState, useEffect } from "react";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import { useNotification } from "../../contexts/NotificationContext";
import Loader from "../../components/Loader";
import {
  FaChartBar,
  FaMoneyBillWave,
  FaPercent,
  FaCalendar,
  FaReceipt,
} from "react-icons/fa";

const FeeReports = () => {
  const axiosSecure = useAxiosSecure();
  const { error: showError } = useNotification();

  const [report, setReport] = useState(null);
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

  const fetchReport = async () => {
    setLoading(true);
    try {
      const params = {};
      if (classId) params.classId = classId;
      if (month) params.month = month;

      const res = await axiosSecure.get("/fees/reports", { params });
      if (res.data.success) {
        setReport(res.data.data);
      }
    } catch (err) {
      showError("Failed to load fee reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    fetchReport();
  }, [classId, month]);

  if (loading) return <Loader fullPage={false} message="Generating fee reports..." />;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-secondary p-8 shadow-lg">
        <div className="relative z-10 flex items-center gap-4">
          <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
            <FaChartBar className="text-2xl text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Fee Reports</h1>
            <p className="text-white/70 text-sm">
              Fee collection analysis and statistics
            </p>
          </div>
        </div>
      </div>

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

      {report && (
        <>
          {/* Overall Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="card bg-base-100 border border-base-300/50 shadow-sm">
              <div className="card-body p-4 text-center">
                <FaMoneyBillWave className="text-xl text-primary mx-auto mb-1" />
                <p className="text-xl font-bold">
                  ৳{report.overall.totalPayable.toLocaleString()}
                </p>
                <p className="text-xs text-base-content/50">Total Payable</p>
              </div>
            </div>
            <div className="card bg-base-100 border border-base-300/50 shadow-sm">
              <div className="card-body p-4 text-center">
                <FaReceipt className="text-xl text-success mx-auto mb-1" />
                <p className="text-xl font-bold text-success">
                  ৳{report.overall.totalCollected.toLocaleString()}
                </p>
                <p className="text-xs text-base-content/50">Total Collected</p>
              </div>
            </div>
            <div className="card bg-base-100 border border-base-300/50 shadow-sm">
              <div className="card-body p-4 text-center">
                <FaMoneyBillWave className="text-xl text-error mx-auto mb-1" />
                <p className="text-xl font-bold text-error">
                  ৳{report.overall.totalDue.toLocaleString()}
                </p>
                <p className="text-xs text-base-content/50">Total Due</p>
              </div>
            </div>
            <div className="card bg-base-100 border border-base-300/50 shadow-sm">
              <div className="card-body p-4 text-center">
                <FaPercent className="text-xl text-info mx-auto mb-1" />
                <p className="text-xl font-bold text-info">
                  {report.overall.collectionRate}%
                </p>
                <p className="text-xs text-base-content/50">Collection Rate</p>
              </div>
            </div>
          </div>

          {/* Monthly Breakdown Table */}
          {report.monthly.length > 0 && (
            <div className="card bg-base-100 border border-base-300/50 shadow-sm">
              <div className="card-body">
                <h2 className="card-title text-base mb-4">
                  <FaCalendar className="text-primary" />
                  Monthly Breakdown
                </h2>
                <div className="overflow-x-auto">
                  <table className="table table-sm">
                    <thead>
                      <tr className="bg-base-200/50">
                        <th>Month</th>
                        <th>Students</th>
                        <th>Payable</th>
                        <th>Discount</th>
                        <th>Collected</th>
                        <th>Due</th>
                        <th>Paid</th>
                        <th>Partial</th>
                        <th>Pending</th>
                        <th>Overdue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.monthly.map((m) => (
                        <tr key={m.month} className="hover">
                          <td className="font-medium">{m.month}</td>
                          <td>{m.studentCount}</td>
                          <td>৳{m.totalPayable.toLocaleString()}</td>
                          <td>৳{m.totalDiscount.toLocaleString()}</td>
                          <td className="text-success font-medium">
                            ৳{m.totalCollected.toLocaleString()}
                          </td>
                          <td className="text-error font-medium">
                            ৳{m.totalDue.toLocaleString()}
                          </td>
                          <td>
                            <span className="badge badge-sm badge-success">{m.paidCount}</span>
                          </td>
                          <td>
                            <span className="badge badge-sm badge-warning">{m.partialCount}</span>
                          </td>
                          <td>
                            <span className="badge badge-sm badge-info">{m.pendingCount}</span>
                          </td>
                          <td>
                            <span className="badge badge-sm badge-error">{m.overdueCount}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Payment Mode Breakdown */}
          {Object.keys(report.paymentModes).length > 0 && (
            <div className="card bg-base-100 border border-base-300/50 shadow-sm">
              <div className="card-body">
                <h2 className="card-title text-base mb-4">
                  Payment Mode Breakdown
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(report.paymentModes).map(([mode, data]) => (
                    <div
                      key={mode}
                      className="p-4 rounded-lg border border-base-300/50 bg-base-200/30 text-center"
                    >
                      <p className="text-xs text-base-content/50 uppercase font-semibold mb-1">
                        {mode}
                      </p>
                      <p className="text-lg font-bold">
                        ৳{data.total.toLocaleString()}
                      </p>
                      <p className="text-xs text-base-content/50">
                        {data.count} payment(s)
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default FeeReports;
