import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import useAuth from "../../hooks/useAuth";
import { useNotification } from "../../contexts/NotificationContext";
import Loader from "../../components/Loader";
import EmptyState from "../../components/EmptyState";
import {
  FaMoneyBillWave,
  FaReceipt,
  FaCheckCircle,
  FaExclamationTriangle,
  FaChild,
} from "react-icons/fa";

const statusColors = {
  paid: "badge-success",
  partial: "badge-warning",
  pending: "badge-info",
  overdue: "badge-error",
};

const ChildFees = () => {
  const axiosSecure = useAxiosSecure();
  const { dbUser } = useAuth();
  const { error: showError } = useNotification();
  const navigate = useNavigate();

  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [fees, setFees] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feesLoading, setFeesLoading] = useState(false);

  // Fetch children list
  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const studentsRes = await axiosSecure.get("/students?limit=100");
        if (studentsRes.data.success && studentsRes.data.data.length > 0) {
          setChildren(studentsRes.data.data);
          setSelectedChild(studentsRes.data.data[0]);
        }
      } catch (err) {
        showError(err.response?.data?.message || "Failed to load children");
      } finally {
        setLoading(false);
      }
    };
    fetchChildren();
  }, []);

  // Fetch fees for selected child
  useEffect(() => {
    if (!selectedChild) return;
    const fetchFees = async () => {
      setFeesLoading(true);
      try {
        const res = await axiosSecure.get(`/students/${selectedChild._id}/fees`);
        if (res.data.success) {
          setFees(res.data.data);
          setSummary(res.data.summary);
        }
      } catch (err) {
        showError(err.response?.data?.message || "Failed to load fees");
      } finally {
        setFeesLoading(false);
      }
    };
    fetchFees();
  }, [selectedChild]);

  if (loading) return <Loader fullPage={false} message="Loading..." />;

  if (children.length === 0) {
    return (
      <div className="p-4 md:p-6">
        <EmptyState
          icon={FaChild}
          title="No Children Found"
          message="No children linked to your account."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-500 via-violet-400 to-purple-500 p-8 shadow-lg">
        <div className="relative z-10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
              <FaChild className="text-2xl text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Child's Fees</h1>
              <p className="text-white/70 text-sm">View your children's fee status</p>
            </div>
          </div>
        </div>
      </div>

      {/* Child Selector */}
      {children.length > 1 && (
        <div className="card bg-base-100 border border-base-300/50 shadow-sm">
          <div className="card-body p-4">
            <div className="form-control max-w-xs">
              <label className="label">
                <span className="label-text text-xs">Select Child</span>
              </label>
              <select
                className="select select-bordered select-sm w-full"
                value={selectedChild?._id || ""}
                onChange={(e) => {
                  const child = children.find((c) => c._id === e.target.value);
                  setSelectedChild(child);
                }}
              >
                {children.map((child) => (
                  <option key={child._id} value={child._id}>
                    {child.name} - {child.className} ({child.sectionName})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Student Info */}
      {selectedChild && (
        <div className="card bg-base-100 border border-base-300/50 shadow-sm">
          <div className="card-body p-4">
            <p className="font-medium">{selectedChild.name}</p>
            <p className="text-sm text-base-content/60">
              {selectedChild.className} - {selectedChild.sectionName} | Roll:{" "}
              {selectedChild.rollNumber} | Admission: {selectedChild.admissionNumber}
            </p>
          </div>
        </div>
      )}

      {feesLoading ? (
        <Loader fullPage={false} message="Loading fees..." />
      ) : (
        <>
          {/* Summary Cards */}
          {summary && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="card bg-base-100 border border-base-300/50 shadow-sm">
                <div className="card-body p-4 text-center">
                  <p className="text-xs text-base-content/50">Total Payable</p>
                  <p className="text-xl font-bold">
                    ৳{summary.totalPayable.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="card bg-success/5 border border-success/20 shadow-sm">
                <div className="card-body p-4 text-center">
                  <FaCheckCircle className="text-success mx-auto mb-1" />
                  <p className="text-xs text-base-content/50">Total Paid</p>
                  <p className="text-xl font-bold text-success">
                    ৳{summary.totalPaid.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="card bg-error/5 border border-error/20 shadow-sm">
                <div className="card-body p-4 text-center">
                  <FaExclamationTriangle className="text-error mx-auto mb-1" />
                  <p className="text-xs text-base-content/50">Total Due</p>
                  <p className="text-xl font-bold text-error">
                    ৳{summary.totalDue.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="card bg-base-100 border border-base-300/50 shadow-sm">
                <div className="card-body p-4 text-center">
                  <p className="text-xs text-base-content/50">Months</p>
                  <p className="text-xl font-bold">{summary.totalMonths}</p>
                  <p className="text-xs text-base-content/50">
                    {summary.paidMonths} paid, {summary.overdueMonths} overdue
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Fees Table */}
          {fees.length === 0 ? (
            <EmptyState
              icon={FaMoneyBillWave}
              title="No Fees Found"
              message="No fee records found for this child."
            />
          ) : (
            <div className="overflow-x-auto rounded-xl border border-base-300/50 bg-base-100 shadow-sm">
              <table className="table table-sm">
                <thead>
                  <tr className="bg-base-200/50">
                    <th>Month</th>
                    <th>Payable</th>
                    <th>Discount</th>
                    <th>Paid</th>
                    <th>Due</th>
                    <th>Status</th>
                    <th>Due Date</th>
                    <th>Payments</th>
                  </tr>
                </thead>
                <tbody>
                  {fees.map((fee) => {
                    const netPayable = (fee.payableAmount || 0) - (fee.discount || 0);
                    const due = netPayable - (fee.paidAmount || 0);
                    return (
                      <tr key={fee._id} className="hover">
                        <td className="font-medium">{fee.month}</td>
                        <td>৳{(fee.payableAmount || 0).toLocaleString()}</td>
                        <td>
                          {fee.discount > 0 ? (
                            <span className="text-success">
                              -৳{fee.discount.toLocaleString()}
                            </span>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="text-success font-medium">
                          ৳{(fee.paidAmount || 0).toLocaleString()}
                        </td>
                        <td className={due > 0 ? "text-error font-bold" : "text-success"}>
                          ৳{due.toLocaleString()}
                        </td>
                        <td>
                          <span className={`badge badge-sm ${statusColors[fee.status]}`}>
                            {fee.status}
                          </span>
                        </td>
                        <td>
                          {fee.dueDate
                            ? new Date(fee.dueDate).toLocaleDateString("en-GB", {
                                day: "2-digit",
                                month: "short",
                              })
                            : "-"}
                        </td>
                        <td>
                          {fee.payments?.length > 0 ? (
                            <div className="flex gap-1 flex-wrap">
                              {fee.payments.map((p) => (
                                <button
                                  key={p._id}
                                  onClick={() => navigate(`/dashboard/receipt/${p._id}`)}
                                  className="btn btn-ghost btn-xs gap-1"
                                  title={`৳${p.amount} - ${p.receiptNumber}`}
                                >
                                  <FaReceipt className="text-primary" />
                                </button>
                              ))}
                            </div>
                          ) : (
                            <span className="text-xs text-base-content/40">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ChildFees;
