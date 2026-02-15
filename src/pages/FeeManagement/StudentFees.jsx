import { useState, useEffect } from "react";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import { useNotification } from "../../contexts/NotificationContext";
import EmptyState from "../../components/EmptyState";
import Loader from "../../components/Loader";
import {
  FaMoneyBillWave,
  FaFileInvoiceDollar,
  FaCog,
  FaSearch,
} from "react-icons/fa";

const StudentFees = () => {
  const axiosSecure = useAxiosSecure();
  const { success, error: showError } = useNotification();

  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState([]);
  const [feeStructures, setFeeStructures] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });

  // Filters
  const [classId, setClassId] = useState("");
  const [month, setMonth] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  // Generate modal
  const [generateModal, setGenerateModal] = useState(false);
  const [generateForm, setGenerateForm] = useState({
    feeStructureId: "",
    month: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`,
    dueDate: "",
  });
  const [generating, setGenerating] = useState(false);

  // Discount edit
  const [editingFee, setEditingFee] = useState(null);
  const [discountValue, setDiscountValue] = useState("");
  const [savingDiscount, setSavingDiscount] = useState(false);

  const fetchClasses = async () => {
    try {
      const res = await axiosSecure.get("/classes");
      if (res.data.success) setClasses(res.data.data.filter((c) => c.status === "active"));
    } catch { /* silent */ }
  };

  const fetchFeeStructures = async () => {
    try {
      const res = await axiosSecure.get("/fee-structures", { params: { isActive: true } });
      if (res.data.success) setFeeStructures(res.data.data);
    } catch { /* silent */ }
  };

  const fetchFees = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (classId) params.classId = classId;
      if (month) params.month = month;
      if (status) params.status = status;

      const res = await axiosSecure.get("/student-fees", { params });
      if (res.data.success) {
        setFees(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      showError("Failed to load student fees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
    fetchFeeStructures();
  }, []);

  useEffect(() => {
    fetchFees();
  }, [page, classId, month, status]);

  useEffect(() => {
    setPage(1);
  }, [classId, month, status]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!generateForm.feeStructureId || !generateForm.month) {
      showError("Please select fee structure and month");
      return;
    }
    setGenerating(true);
    try {
      const res = await axiosSecure.post("/student-fees/generate", generateForm);
      if (res.data.success) {
        success(res.data.message);
        setGenerateModal(false);
        fetchFees();
      }
    } catch (err) {
      showError(err.response?.data?.message || "Failed to generate fees");
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveDiscount = async () => {
    if (!editingFee) return;
    setSavingDiscount(true);
    try {
      await axiosSecure.patch(`/student-fees/${editingFee._id}`, {
        discount: parseFloat(discountValue) || 0,
      });
      success("Discount updated");
      setEditingFee(null);
      fetchFees();
    } catch (err) {
      showError(err.response?.data?.message || "Failed to update discount");
    } finally {
      setSavingDiscount(false);
    }
  };

  const statusColors = {
    paid: "badge-success",
    partial: "badge-warning",
    pending: "badge-info",
    overdue: "badge-error",
  };

  if (loading && fees.length === 0)
    return <Loader fullPage={false} message="Loading student fees..." />;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-secondary p-8 shadow-lg">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
              <FaFileInvoiceDollar className="text-2xl text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Student Fees</h1>
              <p className="text-white/70 text-sm">
                Month-wise fee records for all students
              </p>
            </div>
          </div>
          <button
            onClick={() => setGenerateModal(true)}
            className="btn btn-sm bg-white/20 hover:bg-white/30 text-white border-0 gap-2"
          >
            <FaCog /> Generate Fees
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card bg-base-100 border border-base-300/50 shadow-sm">
        <div className="card-body p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
            <div className="form-control">
              <label className="label"><span className="label-text text-xs">Status</span></label>
              <select
                className="select select-bordered select-sm w-full"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="partial">Partial</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Fees Table */}
      {fees.length === 0 ? (
        <EmptyState
          icon={FaMoneyBillWave}
          title="No fee records found"
          message="Generate monthly fees for a class to get started."
          action={() => setGenerateModal(true)}
          actionLabel="Generate Fees"
        />
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-base-300/50 bg-base-100 shadow-sm">
            <table className="table table-sm">
              <thead>
                <tr className="bg-base-200/50">
                  <th>#</th>
                  <th>Student</th>
                  <th>Roll</th>
                  <th>Month</th>
                  <th>Payable</th>
                  <th>Discount</th>
                  <th>Paid</th>
                  <th>Due</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {fees.map((fee, index) => {
                  const effectiveAmount = fee.payableAmount - (fee.discount || 0);
                  const due = effectiveAmount - (fee.paidAmount || 0);
                  return (
                    <tr key={fee._id} className="hover">
                      <td>{(page - 1) * 20 + index + 1}</td>
                      <td className="font-medium">
                        {fee.studentInfo?.name || "Unknown"}
                      </td>
                      <td>{fee.studentInfo?.rollNumber || "-"}</td>
                      <td>{fee.month}</td>
                      <td>৳{fee.payableAmount.toLocaleString()}</td>
                      <td>
                        {editingFee?._id === fee._id ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              className="input input-bordered input-xs w-20"
                              value={discountValue}
                              onChange={(e) => setDiscountValue(e.target.value)}
                              min="0"
                              max={fee.payableAmount}
                            />
                            <button
                              onClick={handleSaveDiscount}
                              className="btn btn-xs btn-primary"
                              disabled={savingDiscount}
                            >
                              {savingDiscount ? "..." : "Save"}
                            </button>
                            <button
                              onClick={() => setEditingFee(null)}
                              className="btn btn-xs btn-ghost"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <span
                            className="cursor-pointer hover:text-primary"
                            onClick={() => {
                              setEditingFee(fee);
                              setDiscountValue((fee.discount || 0).toString());
                            }}
                          >
                            ৳{(fee.discount || 0).toLocaleString()}
                          </span>
                        )}
                      </td>
                      <td className="text-success font-medium">
                        ৳{(fee.paidAmount || 0).toLocaleString()}
                      </td>
                      <td className={`font-medium ${due > 0 ? "text-error" : "text-success"}`}>
                        ৳{due.toLocaleString()}
                      </td>
                      <td>
                        <span className={`badge badge-sm ${statusColors[fee.status]}`}>
                          {fee.status}
                        </span>
                      </td>
                      <td>
                        {fee.status !== "paid" && (
                          <a
                            href={`/dashboard/fees/collect?studentFeeId=${fee._id}`}
                            className="btn btn-xs btn-primary gap-1"
                          >
                            Collect
                          </a>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between p-4">
              <p className="text-sm text-base-content/60">
                Showing {(page - 1) * 20 + 1} to{" "}
                {Math.min(page * 20, pagination.total)} of {pagination.total}
              </p>
              <div className="join">
                <button
                  className="join-item btn btn-sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  «
                </button>
                {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      className={`join-item btn btn-sm ${page === pageNum ? "btn-active" : ""}`}
                      onClick={() => setPage(pageNum)}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  className="join-item btn btn-sm"
                  onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                  disabled={page === pagination.pages}
                >
                  »
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Generate Fees Modal */}
      {generateModal && (
        <div className="modal modal-open">
          <div className="modal-box max-w-md">
            <h3 className="font-bold text-lg mb-4">Generate Monthly Fees</h3>
            <form onSubmit={handleGenerate} className="space-y-4">
              <div className="form-control">
                <label className="label"><span className="label-text">Fee Structure *</span></label>
                <select
                  className="select select-bordered select-sm w-full"
                  value={generateForm.feeStructureId}
                  onChange={(e) => setGenerateForm((prev) => ({ ...prev, feeStructureId: e.target.value }))}
                  required
                >
                  <option value="">Select Fee Structure</option>
                  {feeStructures.map((fs) => (
                    <option key={fs._id} value={fs._id}>
                      {fs.name} - {fs.className} (৳{fs.monthlyAmount})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Month *</span></label>
                <input
                  type="month"
                  className="input input-bordered input-sm w-full"
                  value={generateForm.month}
                  onChange={(e) => setGenerateForm((prev) => ({ ...prev, month: e.target.value }))}
                  required
                />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Due Date</span></label>
                <input
                  type="date"
                  className="input input-bordered input-sm w-full"
                  value={generateForm.dueDate}
                  onChange={(e) => setGenerateForm((prev) => ({ ...prev, dueDate: e.target.value }))}
                />
              </div>
              <div className="modal-action">
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setGenerateModal(false)} disabled={generating}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm gap-2" disabled={generating}>
                  {generating && <span className="loading loading-spinner loading-xs" />}
                  {generating ? "Generating..." : "Generate"}
                </button>
              </div>
            </form>
          </div>
          <div className="modal-backdrop" onClick={() => setGenerateModal(false)} />
        </div>
      )}
    </div>
  );
};

export default StudentFees;
