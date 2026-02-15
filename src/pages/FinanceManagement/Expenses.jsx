import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import { useNotification } from "../../contexts/NotificationContext";
import ConfirmModal from "../../components/ConfirmModal";
import EmptyState from "../../components/EmptyState";
import Loader from "../../components/Loader";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaReceipt,
  FaFilter,
} from "react-icons/fa";

const CATEGORIES = [
  { value: "utilities", label: "Utilities" },
  { value: "salary", label: "Salary" },
  { value: "maintenance", label: "Maintenance" },
  { value: "supplies", label: "Supplies" },
  { value: "transport", label: "Transport" },
  { value: "events", label: "Events" },
  { value: "others", label: "Others" },
];

const categoryColors = {
  utilities: "badge-info",
  salary: "badge-primary",
  maintenance: "badge-warning",
  supplies: "badge-secondary",
  transport: "badge-accent",
  events: "badge-success",
  others: "badge-ghost",
};

const Expenses = () => {
  const axiosSecure = useAxiosSecure();
  const navigate = useNavigate();
  const { success, error: showError } = useNotification();

  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Filters
  const [category, setCategory] = useState("");
  const [expenseMonth, setExpenseMonth] = useState("");
  const [page, setPage] = useState(1);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (category) params.category = category;
      if (expenseMonth) params.expenseMonth = expenseMonth;

      const res = await axiosSecure.get("/expenses", { params });
      if (res.data.success) {
        setExpenses(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      showError("Failed to load expenses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [page, category, expenseMonth]);

  useEffect(() => {
    setPage(1);
  }, [category, expenseMonth]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await axiosSecure.delete(`/expenses/${deleteTarget._id}`);
      success("Expense deleted successfully");
      setDeleteTarget(null);
      fetchExpenses();
    } catch (err) {
      showError(err.response?.data?.message || "Failed to delete expense");
    } finally {
      setDeleteLoading(false);
    }
  };

  // Calculate total for current view
  const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);

  if (loading && expenses.length === 0)
    return <Loader fullPage={false} message="Loading expenses..." />;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-warning/80 via-warning/70 to-orange-500 p-8 shadow-lg">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
              <FaReceipt className="text-2xl text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Expenses</h1>
              <p className="text-white/70 text-sm">Track institutional expenses</p>
            </div>
          </div>
          <button
            onClick={() => navigate("/dashboard/expenses/add")}
            className="btn btn-sm bg-white/20 hover:bg-white/30 text-white border-0 gap-2"
          >
            <FaPlus /> Add Expense
          </button>
        </div>
      </div>

      {/* Total Card */}
      <div className="card bg-base-100 border border-base-300/50 shadow-sm">
        <div className="card-body p-4 flex flex-row items-center justify-between">
          <div>
            <p className="text-xs text-base-content/50">Total Expenses (current view)</p>
            <p className="text-2xl font-bold text-warning">৳{totalAmount.toLocaleString()}</p>
          </div>
          <p className="text-sm text-base-content/50">{pagination.total} record(s)</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card bg-base-100 border border-base-300/50 shadow-sm">
        <div className="card-body p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label"><span className="label-text text-xs">Category</span></label>
              <select
                className="select select-bordered select-sm w-full"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text text-xs">Month</span></label>
              <input
                type="month"
                className="input input-bordered input-sm w-full"
                value={expenseMonth}
                onChange={(e) => setExpenseMonth(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Expenses Table */}
      {expenses.length === 0 ? (
        <EmptyState
          icon={FaReceipt}
          title="No expenses found"
          message="Add an expense to start tracking institutional spending."
          action={() => navigate("/dashboard/expenses/add")}
          actionLabel="Add Expense"
        />
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-base-300/50 bg-base-100 shadow-sm">
            <table className="table table-sm">
              <thead>
                <tr className="bg-base-200/50">
                  <th>#</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Amount</th>
                  <th>Month</th>
                  <th>Date</th>
                  <th>Created By</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((exp, index) => (
                  <tr key={exp._id} className="hover">
                    <td>{(page - 1) * 20 + index + 1}</td>
                    <td>
                      <div>
                        <p className="font-medium">{exp.title}</p>
                        {exp.description && (
                          <p className="text-xs text-base-content/50 truncate max-w-48">
                            {exp.description}
                          </p>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={`badge badge-sm ${categoryColors[exp.category]}`}>
                        {exp.category}
                      </span>
                    </td>
                    <td className="font-bold">৳{exp.amount.toLocaleString()}</td>
                    <td>{exp.expenseMonth}</td>
                    <td>
                      {new Date(exp.expenseDate).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="text-sm">{exp.createdByName || "-"}</td>
                    <td>
                      <div className="flex gap-1">
                        <button
                          onClick={() => navigate(`/dashboard/expenses/edit/${exp._id}`)}
                          className="btn btn-ghost btn-xs"
                        >
                          <FaEdit className="text-info" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(exp)}
                          className="btn btn-ghost btn-xs"
                        >
                          <FaTrash className="text-error" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
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
                {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => (
                  <button
                    key={i + 1}
                    className={`join-item btn btn-sm ${page === i + 1 ? "btn-active" : ""}`}
                    onClick={() => setPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
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

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Expense?"
        message={`Are you sure you want to delete "${deleteTarget?.title}"?`}
        confirmText="Delete"
        variant="danger"
        loading={deleteLoading}
      />
    </div>
  );
};

export default Expenses;
