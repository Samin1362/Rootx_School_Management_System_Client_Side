import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import { useNotification } from "../../contexts/NotificationContext";
import Loader from "../../components/Loader";
import {
  FaArrowLeft,
  FaMoneyCheckAlt,
  FaReceipt,
  FaUser,
  FaCalendar,
} from "react-icons/fa";

const CollectPayment = () => {
  const axiosSecure = useAxiosSecure();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { success, error: showError } = useNotification();

  const preselectedFeeId = searchParams.get("studentFeeId");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Selection state
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [studentFees, setStudentFees] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(
    `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`
  );

  // Selected fee for payment
  const [selectedFee, setSelectedFee] = useState(null);

  // Payment form
  const [form, setForm] = useState({
    amount: "",
    paymentMode: "cash",
    transactionId: "",
    notes: "",
    paymentDate: new Date().toISOString().split("T")[0],
  });

  // Last receipt
  const [lastReceipt, setLastReceipt] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        const classRes = await axiosSecure.get("/classes");
        if (classRes.data.success) {
          setClasses(classRes.data.data.filter((c) => c.status === "active"));
        }

        // If preselected fee ID, fetch it directly
        if (preselectedFeeId) {
          const feesRes = await axiosSecure.get("/student-fees", {
            params: { limit: 1000 },
          });
          if (feesRes.data.success) {
            const found = feesRes.data.data.find(
              (f) => f._id === preselectedFeeId
            );
            if (found) {
              setSelectedFee(found);
              const remaining =
                found.payableAmount -
                (found.discount || 0) -
                (found.paidAmount || 0);
              setForm((prev) => ({
                ...prev,
                amount: remaining.toString(),
              }));
            }
          }
        }
      } catch {
        showError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // Fetch unpaid fees when class or month changes
  useEffect(() => {
    if (!selectedClassId || preselectedFeeId) return;

    const fetchFees = async () => {
      try {
        const params = {
          classId: selectedClassId,
          limit: 1000,
        };
        if (selectedMonth) params.month = selectedMonth;

        const res = await axiosSecure.get("/student-fees", { params });
        if (res.data.success) {
          setStudentFees(
            res.data.data.filter((f) => f.status !== "paid")
          );
        }
      } catch {
        showError("Failed to load student fees");
      }
    };
    fetchFees();
  }, [selectedClassId, selectedMonth]);

  const selectFee = (fee) => {
    setSelectedFee(fee);
    const remaining =
      fee.payableAmount - (fee.discount || 0) - (fee.paidAmount || 0);
    setForm((prev) => ({ ...prev, amount: remaining.toString() }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFee) {
      showError("Please select a student fee to collect payment for");
      return;
    }
    if (!form.amount || parseFloat(form.amount) <= 0) {
      showError("Please enter a valid amount");
      return;
    }

    setSubmitting(true);
    try {
      const res = await axiosSecure.post("/payments", {
        studentMonthlyFeeId: selectedFee._id,
        amount: parseFloat(form.amount),
        paymentMode: form.paymentMode,
        transactionId: form.transactionId || undefined,
        notes: form.notes || undefined,
        paymentDate: form.paymentDate || undefined,
      });

      if (res.data.success) {
        success("Payment recorded successfully");
        setLastReceipt(res.data.data);

        // Reset
        setSelectedFee(null);
        setForm({
          amount: "",
          paymentMode: "cash",
          transactionId: "",
          notes: "",
          paymentDate: new Date().toISOString().split("T")[0],
        });

        // Refresh fees list
        if (selectedClassId) {
          const feesRes = await axiosSecure.get("/student-fees", {
            params: {
              classId: selectedClassId,
              month: selectedMonth,
              limit: 1000,
            },
          });
          if (feesRes.data.success) {
            setStudentFees(
              feesRes.data.data.filter((f) => f.status !== "paid")
            );
          }
        }
      }
    } catch (err) {
      showError(err.response?.data?.message || "Failed to record payment");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader fullPage={false} message="Loading..." />;

  const remaining = selectedFee
    ? selectedFee.payableAmount -
      (selectedFee.discount || 0) -
      (selectedFee.paidAmount || 0)
    : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/dashboard/fees")}
          className="btn btn-ghost btn-sm btn-circle"
        >
          <FaArrowLeft />
        </button>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <FaMoneyCheckAlt className="text-xl text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Collect Payment</h1>
            <p className="text-base-content/60 text-sm">
              Record fee payment for a student
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Student Fee Selection */}
        {!preselectedFeeId && (
          <div className="card bg-base-100 border border-base-300/50 shadow-sm">
            <div className="card-body">
              <h2 className="card-title text-base mb-4">Select Student Fee</h2>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="form-control">
                  <label className="label"><span className="label-text text-xs">Class</span></label>
                  <select
                    className="select select-bordered select-sm w-full"
                    value={selectedClassId}
                    onChange={(e) => {
                      setSelectedClassId(e.target.value);
                      setSelectedFee(null);
                    }}
                  >
                    <option value="">Select Class</option>
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
                    value={selectedMonth}
                    onChange={(e) => {
                      setSelectedMonth(e.target.value);
                      setSelectedFee(null);
                    }}
                  />
                </div>
              </div>

              {studentFees.length === 0 ? (
                <p className="text-sm text-base-content/50 text-center py-6">
                  {selectedClassId
                    ? "No unpaid fees found for this selection"
                    : "Select a class to see unpaid fees"}
                </p>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {studentFees.map((fee) => {
                    const due =
                      fee.payableAmount -
                      (fee.discount || 0) -
                      (fee.paidAmount || 0);
                    return (
                      <div
                        key={fee._id}
                        onClick={() => selectFee(fee)}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          selectedFee?._id === fee._id
                            ? "border-primary bg-primary/5"
                            : "border-base-300/50 hover:border-primary/30"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">
                              {fee.studentInfo?.name || "Unknown"}
                            </p>
                            <p className="text-xs text-base-content/50">
                              Roll: {fee.studentInfo?.rollNumber || "-"} | Adm: {fee.studentInfo?.admissionNumber || "-"}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-error text-sm">
                              ৳{due.toLocaleString()} due
                            </p>
                            <span className={`badge badge-xs ${
                              fee.status === "partial" ? "badge-warning" :
                              fee.status === "overdue" ? "badge-error" : "badge-info"
                            }`}>
                              {fee.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Right: Payment Form */}
        <div className={preselectedFeeId ? "col-span-1 lg:col-span-2 max-w-lg mx-auto w-full" : ""}>
          <div className="card bg-base-100 border border-base-300/50 shadow-sm">
            <div className="card-body">
              <h2 className="card-title text-base mb-4">Payment Details</h2>

              {selectedFee && (
                <div className="bg-base-200/50 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FaUser className="text-primary text-sm" />
                    <span className="font-medium">
                      {selectedFee.studentInfo?.name || "Unknown Student"}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-base-content/50">Month: </span>
                      <span className="font-medium">{selectedFee.month}</span>
                    </div>
                    <div>
                      <span className="text-base-content/50">Payable: </span>
                      <span>৳{selectedFee.payableAmount.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-base-content/50">Discount: </span>
                      <span>৳{(selectedFee.discount || 0).toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-base-content/50">Paid: </span>
                      <span className="text-success">৳{(selectedFee.paidAmount || 0).toLocaleString()}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-base-content/50">Remaining: </span>
                      <span className="font-bold text-error">৳{remaining.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="form-control">
                  <label className="label"><span className="label-text">Amount (৳) *</span></label>
                  <input
                    type="number"
                    className="input input-bordered input-sm w-full"
                    placeholder="Enter amount"
                    value={form.amount}
                    onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))}
                    required
                    min="1"
                    max={remaining || undefined}
                  />
                </div>

                <div className="form-control">
                  <label className="label"><span className="label-text">Payment Mode *</span></label>
                  <select
                    className="select select-bordered select-sm w-full"
                    value={form.paymentMode}
                    onChange={(e) => setForm((prev) => ({ ...prev, paymentMode: e.target.value }))}
                  >
                    <option value="cash">Cash</option>
                    <option value="bank">Bank Transfer</option>
                    <option value="online">Online</option>
                    <option value="cheque">Cheque</option>
                  </select>
                </div>

                {(form.paymentMode === "bank" ||
                  form.paymentMode === "online" ||
                  form.paymentMode === "cheque") && (
                  <div className="form-control">
                    <label className="label"><span className="label-text">Transaction ID / Reference</span></label>
                    <input
                      type="text"
                      className="input input-bordered input-sm w-full"
                      placeholder="Transaction reference number"
                      value={form.transactionId}
                      onChange={(e) => setForm((prev) => ({ ...prev, transactionId: e.target.value }))}
                    />
                  </div>
                )}

                <div className="form-control">
                  <label className="label"><span className="label-text">Payment Date</span></label>
                  <input
                    type="date"
                    className="input input-bordered input-sm w-full"
                    value={form.paymentDate}
                    onChange={(e) => setForm((prev) => ({ ...prev, paymentDate: e.target.value }))}
                  />
                </div>

                <div className="form-control">
                  <label className="label"><span className="label-text">Notes</span></label>
                  <textarea
                    className="textarea textarea-bordered textarea-sm w-full"
                    placeholder="Optional notes"
                    value={form.notes}
                    onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                    rows={2}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => navigate("/dashboard/fees")}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm gap-2"
                    disabled={submitting || !selectedFee}
                  >
                    {submitting && <span className="loading loading-spinner loading-xs" />}
                    {submitting ? "Processing..." : "Record Payment"}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Last Receipt */}
          {lastReceipt && (
            <div className="card bg-success/5 border border-success/20 shadow-sm mt-4">
              <div className="card-body p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FaReceipt className="text-success" />
                  <span className="font-bold text-success">Payment Recorded!</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-base-content/50">Receipt: </span>
                    <span className="font-mono font-bold">{lastReceipt.receiptNumber}</span>
                  </div>
                  <div>
                    <span className="text-base-content/50">Amount: </span>
                    <span className="font-bold">৳{lastReceipt.amount?.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-base-content/50">Status: </span>
                    <span className="font-medium">{lastReceipt.feeStatus}</span>
                  </div>
                  <div>
                    <span className="text-base-content/50">Remaining: </span>
                    <span className="font-medium">৳{lastReceipt.remaining?.toLocaleString()}</span>
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/dashboard/fees/receipt/${lastReceipt._id}`)}
                  className="btn btn-sm btn-outline btn-success mt-2 gap-1"
                >
                  <FaReceipt /> View Receipt
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CollectPayment;
