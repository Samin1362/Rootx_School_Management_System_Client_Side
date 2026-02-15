import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import { useNotification } from "../../contexts/NotificationContext";
import Loader from "../../components/Loader";
import { FaArrowLeft, FaReceipt } from "react-icons/fa";

const CATEGORIES = [
  { value: "utilities", label: "Utilities" },
  { value: "salary", label: "Salary" },
  { value: "maintenance", label: "Maintenance" },
  { value: "supplies", label: "Supplies" },
  { value: "transport", label: "Transport" },
  { value: "events", label: "Events" },
  { value: "others", label: "Others" },
];

const AddExpense = () => {
  const axiosSecure = useAxiosSecure();
  const navigate = useNavigate();
  const { expenseId } = useParams();
  const { success, error: showError } = useNotification();

  const isEdit = !!expenseId;
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    amount: "",
    category: "others",
    expenseMonth: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`,
    expenseDate: new Date().toISOString().split("T")[0],
    receiptUrl: "",
  });

  useEffect(() => {
    if (isEdit) {
      const fetchExpense = async () => {
        try {
          const res = await axiosSecure.get("/expenses", {
            params: { limit: 1000 },
          });
          if (res.data.success) {
            const exp = res.data.data.find((e) => e._id === expenseId);
            if (exp) {
              setForm({
                title: exp.title,
                description: exp.description || "",
                amount: exp.amount.toString(),
                category: exp.category,
                expenseMonth: exp.expenseMonth,
                expenseDate: exp.expenseDate
                  ? new Date(exp.expenseDate).toISOString().split("T")[0]
                  : "",
                receiptUrl: exp.receiptUrl || "",
              });
            }
          }
        } catch {
          showError("Failed to load expense");
        } finally {
          setLoading(false);
        }
      };
      fetchExpense();
    }
  }, [expenseId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.amount || !form.category || !form.expenseMonth) {
      showError("Please fill all required fields");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...form,
        amount: parseFloat(form.amount),
      };

      // Remove empty optional fields
      if (!payload.description) delete payload.description;
      if (!payload.receiptUrl) delete payload.receiptUrl;

      if (isEdit) {
        await axiosSecure.patch(`/expenses/${expenseId}`, payload);
        success("Expense updated successfully");
      } else {
        await axiosSecure.post("/expenses", payload);
        success("Expense added successfully");
      }
      navigate("/dashboard/expenses");
    } catch (err) {
      showError(err.response?.data?.message || "Failed to save expense");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader fullPage={false} />;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/dashboard/expenses")}
          className="btn btn-ghost btn-sm btn-circle"
        >
          <FaArrowLeft />
        </button>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-warning/10 rounded-lg">
            <FaReceipt className="text-xl text-warning" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              {isEdit ? "Edit Expense" : "Add New Expense"}
            </h1>
            <p className="text-base-content/60 text-sm">
              {isEdit ? "Update expense details" : "Record a new institutional expense"}
            </p>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div className="card bg-base-100 border border-base-300/50 shadow-sm max-w-2xl">
        <div className="card-body">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-control">
              <label className="label"><span className="label-text">Title *</span></label>
              <input
                type="text"
                name="title"
                className="input input-bordered input-sm w-full"
                placeholder="e.g., Electricity Bill January"
                value={form.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-control">
              <label className="label"><span className="label-text">Description</span></label>
              <textarea
                name="description"
                className="textarea textarea-bordered textarea-sm w-full"
                placeholder="Optional description"
                value={form.description}
                onChange={handleChange}
                rows={2}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label"><span className="label-text">Amount (৳) *</span></label>
                <input
                  type="number"
                  name="amount"
                  className="input input-bordered input-sm w-full"
                  placeholder="Enter amount"
                  value={form.amount}
                  onChange={handleChange}
                  required
                  min="0"
                />
              </div>

              <div className="form-control">
                <label className="label"><span className="label-text">Category *</span></label>
                <select
                  name="category"
                  className="select select-bordered select-sm w-full"
                  value={form.category}
                  onChange={handleChange}
                  required
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div className="form-control">
                <label className="label"><span className="label-text">Expense Month *</span></label>
                <input
                  type="month"
                  name="expenseMonth"
                  className="input input-bordered input-sm w-full"
                  value={form.expenseMonth}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-control">
                <label className="label"><span className="label-text">Expense Date</span></label>
                <input
                  type="date"
                  name="expenseDate"
                  className="input input-bordered input-sm w-full"
                  value={form.expenseDate}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-control">
              <label className="label"><span className="label-text">Receipt URL</span></label>
              <input
                type="url"
                name="receiptUrl"
                className="input input-bordered input-sm w-full"
                placeholder="https://..."
                value={form.receiptUrl}
                onChange={handleChange}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => navigate("/dashboard/expenses")}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary btn-sm gap-2"
                disabled={submitting}
              >
                {submitting && <span className="loading loading-spinner loading-xs" />}
                {submitting
                  ? "Saving..."
                  : isEdit
                  ? "Update Expense"
                  : "Add Expense"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddExpense;
