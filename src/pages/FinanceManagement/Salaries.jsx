import { useState, useEffect } from "react";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import { useNotification } from "../../contexts/NotificationContext";
import ConfirmModal from "../../components/ConfirmModal";
import EmptyState from "../../components/EmptyState";
import Loader from "../../components/Loader";
import {
  FaMoneyCheck,
  FaCog,
  FaCheckCircle,
  FaClock,
  FaPlus,
  FaTimes,
} from "react-icons/fa";

const Salaries = () => {
  const axiosSecure = useAxiosSecure();
  const { success, error: showError } = useNotification();

  const [salaries, setSalaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });

  // Filters
  const [month, setMonth] = useState("");
  const [status, setStatus] = useState("");
  const [staffRole, setStaffRole] = useState("");
  const [page, setPage] = useState(1);

  // Pay confirmation
  const [payTarget, setPayTarget] = useState(null);
  const [payLoading, setPayLoading] = useState(false);

  // Generate modal
  const [generateModal, setGenerateModal] = useState(false);
  const [generateForm, setGenerateForm] = useState({
    month: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`,
    defaultBaseSalary: "",
  });
  const [generating, setGenerating] = useState(false);

  // Create single salary modal
  const [createModal, setCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    staffId: "",
    month: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`,
    baseSalary: "",
    allowances: "0",
    deductions: "0",
  });
  const [staffList, setStaffList] = useState([]);
  const [creating, setCreating] = useState(false);

  // Edit salary
  const [editTarget, setEditTarget] = useState(null);
  const [editForm, setEditForm] = useState({
    baseSalary: "",
    allowances: "",
    deductions: "",
  });
  const [saving, setSaving] = useState(false);

  const fetchSalaries = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (month) params.month = month;
      if (status) params.status = status;
      if (staffRole) params.staffRole = staffRole;

      const res = await axiosSecure.get("/salaries", { params });
      if (res.data.success) {
        setSalaries(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      showError("Failed to load salaries");
    } finally {
      setLoading(false);
    }
  };

  const fetchStaff = async () => {
    try {
      const res = await axiosSecure.get("/users", { params: { limit: 1000 } });
      if (res.data.success) {
        setStaffList(
          res.data.data.filter((u) =>
            ["org_owner", "admin", "moderator", "teacher"].includes(u.role)
          )
        );
      }
    } catch { /* silent */ }
  };

  useEffect(() => {
    fetchSalaries();
  }, [page, month, status, staffRole]);

  useEffect(() => {
    setPage(1);
  }, [month, status, staffRole]);

  const handleMarkPaid = async () => {
    if (!payTarget) return;
    setPayLoading(true);
    try {
      await axiosSecure.patch(`/salaries/${payTarget._id}`, {
        status: "paid",
      });
      success(`Salary for ${payTarget.staffName} marked as paid`);
      setPayTarget(null);
      fetchSalaries();
    } catch (err) {
      showError(err.response?.data?.message || "Failed to update salary");
    } finally {
      setPayLoading(false);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!generateForm.month) {
      showError("Please enter a month");
      return;
    }
    setGenerating(true);
    try {
      const res = await axiosSecure.post("/salaries/generate", generateForm);
      if (res.data.success) {
        success(res.data.message);
        setGenerateModal(false);
        fetchSalaries();
      }
    } catch (err) {
      showError(err.response?.data?.message || "Failed to generate salaries");
    } finally {
      setGenerating(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!createForm.staffId || !createForm.month || !createForm.baseSalary) {
      showError("Please fill required fields");
      return;
    }
    setCreating(true);
    try {
      const res = await axiosSecure.post("/salaries", createForm);
      if (res.data.success) {
        success("Salary record created");
        setCreateModal(false);
        fetchSalaries();
      }
    } catch (err) {
      showError(err.response?.data?.message || "Failed to create salary");
    } finally {
      setCreating(false);
    }
  };

  const startEdit = (sal) => {
    setEditTarget(sal);
    setEditForm({
      baseSalary: sal.baseSalary.toString(),
      allowances: sal.allowances.toString(),
      deductions: sal.deductions.toString(),
    });
  };

  const handleSaveEdit = async () => {
    if (!editTarget) return;
    setSaving(true);
    try {
      await axiosSecure.patch(`/salaries/${editTarget._id}`, {
        baseSalary: parseFloat(editForm.baseSalary),
        allowances: parseFloat(editForm.allowances),
        deductions: parseFloat(editForm.deductions),
      });
      success("Salary updated");
      setEditTarget(null);
      fetchSalaries();
    } catch (err) {
      showError(err.response?.data?.message || "Failed to update");
    } finally {
      setSaving(false);
    }
  };

  // Calculate totals
  const totalNet = salaries.reduce((sum, s) => sum + s.netAmount, 0);
  const paidCount = salaries.filter((s) => s.status === "paid").length;
  const pendingCount = salaries.filter((s) => s.status === "pending").length;

  if (loading && salaries.length === 0)
    return <Loader fullPage={false} message="Loading salaries..." />;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-secondary via-secondary/90 to-primary p-8 shadow-lg">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
              <FaMoneyCheck className="text-2xl text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Salaries</h1>
              <p className="text-white/70 text-sm">Monthly salary management</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                fetchStaff();
                setCreateModal(true);
              }}
              className="btn btn-sm bg-white/20 hover:bg-white/30 text-white border-0 gap-2"
            >
              <FaPlus /> Add Single
            </button>
            <button
              onClick={() => setGenerateModal(true)}
              className="btn btn-sm bg-white/20 hover:bg-white/30 text-white border-0 gap-2"
            >
              <FaCog /> Bulk Generate
            </button>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card bg-base-100 border border-base-300/50 shadow-sm">
          <div className="card-body p-4 text-center">
            <p className="text-xl font-bold">৳{totalNet.toLocaleString()}</p>
            <p className="text-xs text-base-content/50">Total Net (current view)</p>
          </div>
        </div>
        <div className="card bg-base-100 border border-base-300/50 shadow-sm">
          <div className="card-body p-4 text-center">
            <p className="text-xl font-bold text-success">{paidCount}</p>
            <p className="text-xs text-base-content/50">Paid</p>
          </div>
        </div>
        <div className="card bg-base-100 border border-base-300/50 shadow-sm">
          <div className="card-body p-4 text-center">
            <p className="text-xl font-bold text-warning">{pendingCount}</p>
            <p className="text-xs text-base-content/50">Pending</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card bg-base-100 border border-base-300/50 shadow-sm">
        <div className="card-body p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                <option value="">All</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
              </select>
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text text-xs">Role</span></label>
              <select
                className="select select-bordered select-sm w-full"
                value={staffRole}
                onChange={(e) => setStaffRole(e.target.value)}
              >
                <option value="">All Roles</option>
                <option value="org_owner">Owner</option>
                <option value="admin">Admin</option>
                <option value="moderator">Moderator</option>
                <option value="teacher">Teacher</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Salaries Table */}
      {salaries.length === 0 ? (
        <EmptyState
          icon={FaMoneyCheck}
          title="No salary records found"
          message="Generate salary records for your staff."
          action={() => setGenerateModal(true)}
          actionLabel="Generate Salaries"
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-base-300/50 bg-base-100 shadow-sm">
          <table className="table table-sm">
            <thead>
              <tr className="bg-base-200/50">
                <th>#</th>
                <th>Staff Name</th>
                <th>Role</th>
                <th>Month</th>
                <th>Base</th>
                <th>Allowances</th>
                <th>Deductions</th>
                <th>Net</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {salaries.map((sal, index) => (
                <tr key={sal._id} className="hover">
                  <td>{(page - 1) * 20 + index + 1}</td>
                  <td className="font-medium">{sal.staffName}</td>
                  <td>
                    <span className="badge badge-sm badge-ghost capitalize">
                      {sal.staffRole?.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td>{sal.month}</td>
                  <td>
                    {editTarget?._id === sal._id ? (
                      <input
                        type="number"
                        className="input input-bordered input-xs w-20"
                        value={editForm.baseSalary}
                        onChange={(e) => setEditForm((p) => ({ ...p, baseSalary: e.target.value }))}
                      />
                    ) : (
                      `৳${sal.baseSalary.toLocaleString()}`
                    )}
                  </td>
                  <td>
                    {editTarget?._id === sal._id ? (
                      <input
                        type="number"
                        className="input input-bordered input-xs w-20"
                        value={editForm.allowances}
                        onChange={(e) => setEditForm((p) => ({ ...p, allowances: e.target.value }))}
                      />
                    ) : (
                      `৳${sal.allowances.toLocaleString()}`
                    )}
                  </td>
                  <td>
                    {editTarget?._id === sal._id ? (
                      <input
                        type="number"
                        className="input input-bordered input-xs w-20"
                        value={editForm.deductions}
                        onChange={(e) => setEditForm((p) => ({ ...p, deductions: e.target.value }))}
                      />
                    ) : (
                      `৳${sal.deductions.toLocaleString()}`
                    )}
                  </td>
                  <td className="font-bold">৳{sal.netAmount.toLocaleString()}</td>
                  <td>
                    <span
                      className={`badge badge-sm ${
                        sal.status === "paid" ? "badge-success" : "badge-warning"
                      }`}
                    >
                      {sal.status === "paid" ? (
                        <><FaCheckCircle className="mr-1" /> Paid</>
                      ) : (
                        <><FaClock className="mr-1" /> Pending</>
                      )}
                    </span>
                  </td>
                  <td>
                    {editTarget?._id === sal._id ? (
                      <div className="flex gap-1">
                        <button
                          onClick={handleSaveEdit}
                          className="btn btn-xs btn-primary"
                          disabled={saving}
                        >
                          {saving ? "..." : "Save"}
                        </button>
                        <button
                          onClick={() => setEditTarget(null)}
                          className="btn btn-xs btn-ghost"
                        >
                          <FaTimes />
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-1">
                        {sal.status === "pending" && (
                          <>
                            <button
                              onClick={() => startEdit(sal)}
                              className="btn btn-xs btn-ghost text-info"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => setPayTarget(sal)}
                              className="btn btn-xs btn-success"
                            >
                              Pay
                            </button>
                          </>
                        )}
                        {sal.status === "paid" && sal.paidDate && (
                          <span className="text-xs text-base-content/50">
                            {new Date(sal.paidDate).toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "short",
                            })}
                          </span>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Mark as Paid Confirmation */}
      <ConfirmModal
        isOpen={!!payTarget}
        onClose={() => setPayTarget(null)}
        onConfirm={handleMarkPaid}
        title="Mark as Paid?"
        message={`Mark salary of ৳${payTarget?.netAmount?.toLocaleString()} for ${payTarget?.staffName} (${payTarget?.month}) as paid?`}
        confirmText="Mark Paid"
        variant="info"
        loading={payLoading}
      />

      {/* Generate Modal */}
      {generateModal && (
        <div className="modal modal-open">
          <div className="modal-box max-w-md">
            <h3 className="font-bold text-lg mb-4">Bulk Generate Salaries</h3>
            <p className="text-sm text-base-content/60 mb-4">
              This will create salary records for all active staff members.
            </p>
            <form onSubmit={handleGenerate} className="space-y-4">
              <div className="form-control">
                <label className="label"><span className="label-text">Month *</span></label>
                <input
                  type="month"
                  className="input input-bordered input-sm w-full"
                  value={generateForm.month}
                  onChange={(e) => setGenerateForm((p) => ({ ...p, month: e.target.value }))}
                  required
                />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Default Base Salary (৳)</span></label>
                <input
                  type="number"
                  className="input input-bordered input-sm w-full"
                  placeholder="Leave empty for 0"
                  value={generateForm.defaultBaseSalary}
                  onChange={(e) => setGenerateForm((p) => ({ ...p, defaultBaseSalary: e.target.value }))}
                  min="0"
                />
              </div>
              <div className="modal-action">
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setGenerateModal(false)} disabled={generating}>Cancel</button>
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

      {/* Create Single Salary Modal */}
      {createModal && (
        <div className="modal modal-open">
          <div className="modal-box max-w-md">
            <h3 className="font-bold text-lg mb-4">Create Salary Record</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="form-control">
                <label className="label"><span className="label-text">Staff Member *</span></label>
                <select
                  className="select select-bordered select-sm w-full"
                  value={createForm.staffId}
                  onChange={(e) => setCreateForm((p) => ({ ...p, staffId: e.target.value }))}
                  required
                >
                  <option value="">Select Staff</option>
                  {staffList.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name} ({s.role?.replace(/_/g, " ")})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Month *</span></label>
                <input
                  type="month"
                  className="input input-bordered input-sm w-full"
                  value={createForm.month}
                  onChange={(e) => setCreateForm((p) => ({ ...p, month: e.target.value }))}
                  required
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="form-control">
                  <label className="label"><span className="label-text text-xs">Base Salary *</span></label>
                  <input
                    type="number"
                    className="input input-bordered input-sm w-full"
                    value={createForm.baseSalary}
                    onChange={(e) => setCreateForm((p) => ({ ...p, baseSalary: e.target.value }))}
                    required
                    min="0"
                  />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text text-xs">Allowances</span></label>
                  <input
                    type="number"
                    className="input input-bordered input-sm w-full"
                    value={createForm.allowances}
                    onChange={(e) => setCreateForm((p) => ({ ...p, allowances: e.target.value }))}
                    min="0"
                  />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text text-xs">Deductions</span></label>
                  <input
                    type="number"
                    className="input input-bordered input-sm w-full"
                    value={createForm.deductions}
                    onChange={(e) => setCreateForm((p) => ({ ...p, deductions: e.target.value }))}
                    min="0"
                  />
                </div>
              </div>
              <div className="modal-action">
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setCreateModal(false)} disabled={creating}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm gap-2" disabled={creating}>
                  {creating && <span className="loading loading-spinner loading-xs" />}
                  {creating ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </div>
          <div className="modal-backdrop" onClick={() => setCreateModal(false)} />
        </div>
      )}
    </div>
  );
};

export default Salaries;
