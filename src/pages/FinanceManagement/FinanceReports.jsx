import { useState, useEffect } from "react";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import { useNotification } from "../../contexts/NotificationContext";
import Loader from "../../components/Loader";
import {
  FaChartLine,
  FaMoneyBillWave,
  FaMoneyCheck,
  FaReceipt,
  FaBalanceScale,
} from "react-icons/fa";

const FinanceReports = () => {
  const axiosSecure = useAxiosSecure();
  const { error: showError } = useNotification();

  const [feeReport, setFeeReport] = useState(null);
  const [salaryReport, setSalaryReport] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [month, setMonth] = useState("");

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = {};
      if (month) params.month = month;

      const [feeRes, salaryRes] = await Promise.allSettled([
        axiosSecure.get("/fees/reports", { params }),
        axiosSecure.get("/salaries/reports", { params }),
      ]);

      if (feeRes.status === "fulfilled" && feeRes.value.data.success) {
        setFeeReport(feeRes.value.data.data);
      }
      if (salaryRes.status === "fulfilled" && salaryRes.value.data.success) {
        setSalaryReport(salaryRes.value.data.data);
      }
    } catch (err) {
      showError("Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [month]);

  if (loading) return <Loader fullPage={false} message="Generating finance reports..." />;

  const totalIncome = feeReport?.overall?.totalCollected || 0;
  const totalExpense = salaryReport?.overall?.totalPaid || 0;
  const balance = totalIncome - totalExpense;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-secondary p-8 shadow-lg">
        <div className="relative z-10 flex items-center gap-4">
          <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
            <FaChartLine className="text-2xl text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Finance Reports</h1>
            <p className="text-white/70 text-sm">Income vs expense overview</p>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="card bg-base-100 border border-base-300/50 shadow-sm">
        <div className="card-body p-4">
          <div className="form-control max-w-xs">
            <label className="label"><span className="label-text text-xs">Filter by Month</span></label>
            <input
              type="month"
              className="input input-bordered input-sm w-full"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card bg-success/5 border border-success/20 shadow-sm">
          <div className="card-body p-5 text-center">
            <FaMoneyBillWave className="text-3xl text-success mx-auto mb-2" />
            <p className="text-xs text-base-content/50 uppercase font-semibold">
              Total Fee Collection
            </p>
            <p className="text-3xl font-bold text-success">
              ৳{totalIncome.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="card bg-error/5 border border-error/20 shadow-sm">
          <div className="card-body p-5 text-center">
            <FaMoneyCheck className="text-3xl text-error mx-auto mb-2" />
            <p className="text-xs text-base-content/50 uppercase font-semibold">
              Total Salary Paid
            </p>
            <p className="text-3xl font-bold text-error">
              ৳{totalExpense.toLocaleString()}
            </p>
          </div>
        </div>

        <div
          className={`card shadow-sm ${
            balance >= 0
              ? "bg-info/5 border border-info/20"
              : "bg-warning/5 border border-warning/20"
          }`}
        >
          <div className="card-body p-5 text-center">
            <FaBalanceScale
              className={`text-3xl mx-auto mb-2 ${
                balance >= 0 ? "text-info" : "text-warning"
              }`}
            />
            <p className="text-xs text-base-content/50 uppercase font-semibold">
              Net Balance
            </p>
            <p
              className={`text-3xl font-bold ${
                balance >= 0 ? "text-info" : "text-warning"
              }`}
            >
              ৳{balance.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Fee Collection Details */}
      {feeReport && (
        <div className="card bg-base-100 border border-base-300/50 shadow-sm">
          <div className="card-body">
            <h2 className="card-title text-base flex items-center gap-2 mb-4">
              <FaMoneyBillWave className="text-success" />
              Fee Collection Summary
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center p-3 rounded-lg bg-base-200/30">
                <p className="text-lg font-bold">
                  ৳{feeReport.overall.totalPayable.toLocaleString()}
                </p>
                <p className="text-xs text-base-content/50">Total Payable</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-base-200/30">
                <p className="text-lg font-bold text-success">
                  ৳{feeReport.overall.totalCollected.toLocaleString()}
                </p>
                <p className="text-xs text-base-content/50">Collected</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-base-200/30">
                <p className="text-lg font-bold text-error">
                  ৳{feeReport.overall.totalDue.toLocaleString()}
                </p>
                <p className="text-xs text-base-content/50">Outstanding</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-base-200/30">
                <p className="text-lg font-bold text-info">
                  {feeReport.overall.collectionRate}%
                </p>
                <p className="text-xs text-base-content/50">Collection Rate</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Salary Details */}
      {salaryReport && (
        <div className="card bg-base-100 border border-base-300/50 shadow-sm">
          <div className="card-body">
            <h2 className="card-title text-base flex items-center gap-2 mb-4">
              <FaMoneyCheck className="text-secondary" />
              Salary Summary
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center p-3 rounded-lg bg-base-200/30">
                <p className="text-lg font-bold">
                  ৳{salaryReport.overall.totalNetAmount.toLocaleString()}
                </p>
                <p className="text-xs text-base-content/50">Total Net</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-base-200/30">
                <p className="text-lg font-bold text-success">
                  ৳{salaryReport.overall.totalPaid.toLocaleString()}
                </p>
                <p className="text-xs text-base-content/50">Paid</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-base-200/30">
                <p className="text-lg font-bold text-warning">
                  ৳{salaryReport.overall.totalPending.toLocaleString()}
                </p>
                <p className="text-xs text-base-content/50">Pending</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-base-200/30">
                <p className="text-lg font-bold">
                  {salaryReport.overall.totalRecords}
                </p>
                <p className="text-xs text-base-content/50">Total Records</p>
              </div>
            </div>

            {/* By Role */}
            {salaryReport.byRole?.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-semibold text-base-content/50 mb-2">
                  By Role
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {salaryReport.byRole.map((r) => (
                    <div
                      key={r.role}
                      className="p-3 rounded-lg border border-base-300/50 text-center"
                    >
                      <p className="text-xs text-base-content/50 capitalize mb-1">
                        {r.role?.replace(/_/g, " ")}
                      </p>
                      <p className="font-bold">
                        ৳{r.totalNetAmount.toLocaleString()}
                      </p>
                      <p className="text-xs text-base-content/50">
                        {r.staffCount} staff
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FinanceReports;
