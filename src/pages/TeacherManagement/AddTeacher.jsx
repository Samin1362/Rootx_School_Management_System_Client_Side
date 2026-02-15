import { useState } from "react";
import { useNavigate, Link } from "react-router";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import { useNotification } from "../../contexts/NotificationContext";
import { FaArrowLeft, FaChalkboardTeacher } from "react-icons/fa";

const AddTeacher = () => {
  const axiosSecure = useAxiosSecure();
  const navigate = useNavigate();
  const { success, error: showError } = useNotification();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    employeeId: "",
    qualification: "",
    specialization: "",
    joiningDate: new Date().toISOString().split("T")[0],
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email) {
      showError("Name and email are required");
      return;
    }

    setSaving(true);
    try {
      const res = await axiosSecure.post("/teachers", form);
      if (res.data.success) {
        success("Teacher created successfully");
        navigate("/dashboard/teachers");
      }
    } catch (err) {
      showError(err.response?.data?.message || "Failed to create teacher");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <Link to="/dashboard/teachers" className="btn btn-ghost btn-sm gap-2 text-base-content/60">
        <FaArrowLeft /> Back to Teachers
      </Link>

      <div className="card bg-base-100 border border-base-300/50 shadow-sm">
        <div className="card-body">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
              <FaChalkboardTeacher className="text-secondary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-base-content">Add New Teacher</h1>
              <p className="text-xs text-base-content/50">Fill in the teacher details</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label"><span className="label-text">Full Name *</span></label>
                <input
                  type="text"
                  name="name"
                  className="input input-bordered input-sm w-full"
                  placeholder="Teacher's full name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Email Address *</span></label>
                <input
                  type="email"
                  name="email"
                  className="input input-bordered input-sm w-full"
                  placeholder="teacher@example.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Phone Number</span></label>
                <input
                  type="text"
                  name="phone"
                  className="input input-bordered input-sm w-full"
                  placeholder="+880..."
                  value={form.phone}
                  onChange={handleChange}
                />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Employee ID</span></label>
                <input
                  type="text"
                  name="employeeId"
                  className="input input-bordered input-sm w-full"
                  placeholder="e.g., TCH-001"
                  value={form.employeeId}
                  onChange={handleChange}
                />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Qualification</span></label>
                <input
                  type="text"
                  name="qualification"
                  className="input input-bordered input-sm w-full"
                  placeholder="e.g., M.Sc in Mathematics"
                  value={form.qualification}
                  onChange={handleChange}
                />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Specialization</span></label>
                <input
                  type="text"
                  name="specialization"
                  className="input input-bordered input-sm w-full"
                  placeholder="e.g., Advanced Calculus"
                  value={form.specialization}
                  onChange={handleChange}
                />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Joining Date</span></label>
                <input
                  type="date"
                  name="joiningDate"
                  className="input input-bordered input-sm w-full"
                  value={form.joiningDate}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t border-base-300/50">
              <Link to="/dashboard/teachers" className="btn btn-ghost btn-sm">Cancel</Link>
              <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
                {saving && <span className="loading loading-spinner loading-xs" />}
                Create Teacher
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddTeacher;
