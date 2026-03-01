import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import { useNotification } from "../../contexts/NotificationContext";
import Loader from "../../components/Loader";
import {
  FaArrowLeft,
  FaCrown,
  FaTag,
  FaDollarSign,
  FaUserGraduate,
  FaSchool,
  FaChalkboardTeacher,
  FaToggleOn,
  FaCheckCircle,
  FaAlignLeft,
  FaLayerGroup,
} from "react-icons/fa";

const CreatePlan = () => {
  const axiosSecure = useAxiosSecure();
  const navigate = useNavigate();
  const { planId } = useParams();
  const { success, error: showError } = useNotification();

  const isEditing = !!planId;
  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    tier: "",
    name: "",
    description: "",
    monthlyPrice: "",
    yearlyPrice: "",
    maxStudents: "",
    maxClasses: "",
    maxTeachers: "",
    isActive: true,
  });

  // Fetch plan data when editing
  useEffect(() => {
    if (!isEditing) return;
    const fetchPlan = async () => {
      try {
        const res = await axiosSecure.get("/super-admin/plans");
        if (res.data.success) {
          const plan = res.data.data.find((p) => p._id === planId);
          if (!plan) {
            showError("Plan not found");
            navigate("/dashboard/super-admin/plans");
            return;
          }
          setForm({
            tier: plan.tier,
            name: plan.name,
            description: plan.description || "",
            monthlyPrice: plan.monthlyPrice.toString(),
            yearlyPrice: plan.yearlyPrice.toString(),
            maxStudents: plan.limits.maxStudents.toString(),
            maxClasses: plan.limits.maxClasses.toString(),
            maxTeachers: plan.limits.maxTeachers.toString(),
            isActive: plan.isActive,
          });
        }
      } catch (err) {
        showError(err.response?.data?.message || "Failed to load plan");
        navigate("/dashboard/super-admin/plans");
      } finally {
        setLoading(false);
      }
    };
    fetchPlan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.tier || !form.name || !form.description) {
      showError("Tier, name, and description are required");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        tier: form.tier,
        name: form.name,
        description: form.description,
        monthlyPrice: parseFloat(form.monthlyPrice) || 0,
        yearlyPrice: parseFloat(form.yearlyPrice) || 0,
        limits: {
          maxStudents: parseInt(form.maxStudents) || 0,
          maxClasses: parseInt(form.maxClasses) || 0,
          maxTeachers: parseInt(form.maxTeachers) || 0,
        },
        isActive: form.isActive,
      };

      if (isEditing) {
        const res = await axiosSecure.patch(`/super-admin/plans/${planId}`, payload);
        if (res.data.success) {
          success(res.data.message || "Plan updated successfully");
        }
      } else {
        const res = await axiosSecure.post("/super-admin/plans", payload);
        if (res.data.success) {
          success(res.data.message || "Plan created successfully");
        }
      }

      navigate("/dashboard/super-admin/plans");
    } catch (err) {
      showError(err.response?.data?.message || "Failed to save plan");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader fullPage={false} message="Loading plan data..." />;

  return (
    <div className="space-y-6 sm:space-y-8 pb-10 animate-in fade-in duration-500">

      {/* ── Animated background blobs ── */}
      <div className="fixed top-0 right-0 w-96 h-96 bg-linear-to-br from-primary/20 via-secondary/20 to-accent/20 rounded-full blur-3xl animate-pulse pointer-events-none opacity-30" />
      <div className="fixed bottom-0 left-0 w-72 h-72 bg-linear-to-tr from-info/20 via-success/20 to-warning/20 rounded-full blur-3xl animate-pulse pointer-events-none opacity-30 animation-delay-2000" />

      {/* ── Gradient Banner Header ── */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-primary via-primary/90 to-secondary p-6 sm:p-8 shadow-lg">
        {/* SVG dot pattern overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAtNi42MjcgNS4zNzMtMTIgMTItMTJzMTIgNS4zNzMgMTIgMTItNS4zNzMgMTItMTIgMTItMTItNS4zNzMtMTItMTJ6bS0xMiAxMmMwLTYuNjI3IDUuMzczLTEyIDEyLTEyczEyIDUuMzczIDEyIDEyLTUuMzczIDEyLTEyIDEyLTEyLTUuMzczLTEyLTEyem0wIDI0YzAtNi42MjcgNS4zNzMtMTIgMTItMTJzMTIgNS4zNzMgMTIgMTItNS4zNzMgMTItMTIgMTItMTItNS4zNzMtMTItMTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-10" />

        <div className="relative flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
          {/* Back button */}
          <button
            onClick={() => navigate("/dashboard/super-admin/plans")}
            className="self-start btn btn-circle bg-white/10 hover:bg-white/20 border-white/20 text-white backdrop-blur-sm transition-all duration-300 hover:scale-110"
          >
            <FaArrowLeft className="text-lg" />
          </button>

          {/* Icon + Title */}
          <div className="flex items-center gap-4">
            <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl shadow-lg animate-bounce-slow">
              <FaCrown className="text-3xl sm:text-4xl text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                {isEditing ? "Edit Plan" : "Create New Plan"}
              </h1>
              <p className="text-white/70 text-sm mt-1">
                {isEditing
                  ? "Update subscription plan details"
                  : "Add a new subscription plan to the platform"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Form Card ── */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-base-100 to-base-200/50 border border-base-300/50 shadow-xl">
        {/* Animated gradient top border */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-accent animate-gradient-x" />

        <div className="p-5 sm:p-8 lg:p-10">
          <form onSubmit={handleSubmit} className="space-y-10">

            {/* ──── PLAN IDENTITY ──── */}
            <fieldset
              className="space-y-6 animate-in slide-in-from-bottom duration-500"
              style={{ animationDelay: "100ms" }}
            >
              <legend className="flex items-center gap-3 pb-4 border-b border-base-300/50 w-full">
                <span className="p-2.5 rounded-xl bg-linear-to-br from-primary/20 to-secondary/20">
                  <FaCrown className="text-primary text-lg" />
                </span>
                <span className="text-lg font-bold text-base-content">
                  Plan Identity
                </span>
              </legend>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
                {/* Tier */}
                <div className="form-control">
                  <label className="label pb-1.5">
                    <span className="label-text font-semibold flex items-center gap-2 text-base-content/80">
                      <FaTag className="text-primary text-xs" />
                      Tier <span className="text-error">*</span>
                    </span>
                  </label>
                  <select
                    name="tier"
                    className="select select-bordered w-full bg-base-100/50 backdrop-blur-sm border-primary/30 focus:border-primary transition-all duration-300 hover:scale-[1.01] disabled:opacity-60 disabled:cursor-not-allowed"
                    value={form.tier}
                    onChange={handleChange}
                    required
                    disabled={isEditing}
                  >
                    <option value="">Select Tier</option>
                    <option value="free">Free</option>
                    <option value="basic">Basic</option>
                    <option value="professional">Professional</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                  {isEditing && (
                    <p className="text-xs text-base-content/40 mt-1">Tier cannot be changed after creation</p>
                  )}
                </div>

                {/* Name */}
                <div className="form-control">
                  <label className="label pb-1.5">
                    <span className="label-text font-semibold flex items-center gap-2 text-base-content/80">
                      <FaCrown className="text-primary text-xs" />
                      Plan Name <span className="text-error">*</span>
                    </span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    className="input input-bordered w-full bg-base-100/50 backdrop-blur-sm border-primary/30 focus:border-primary focus:input-primary transition-all duration-300 hover:scale-[1.01]"
                    placeholder="e.g., Basic Plan, Professional Plan"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div className="form-control">
                <label className="label pb-1.5">
                  <span className="label-text font-semibold flex items-center gap-2 text-base-content/80">
                    <FaAlignLeft className="text-primary text-xs" />
                    Description <span className="text-error">*</span>
                  </span>
                </label>
                <textarea
                  name="description"
                  className="textarea textarea-bordered w-full bg-base-100/50 backdrop-blur-sm border-primary/30 focus:border-primary focus:textarea-primary transition-all duration-300 resize-none hover:scale-[1.005]"
                  placeholder="e.g., For small schools getting started with digital management"
                  rows={3}
                  value={form.description}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Active toggle */}
              <div className="form-control">
                <label className="label cursor-pointer justify-start gap-4 w-fit">
                  <input
                    type="checkbox"
                    name="isActive"
                    className="checkbox checkbox-primary"
                    checked={form.isActive}
                    onChange={handleChange}
                  />
                  <span className="label-text font-semibold flex items-center gap-2 text-base-content/80">
                    <FaToggleOn className="text-primary text-xs" />
                    Active — available for subscription
                  </span>
                </label>
              </div>
            </fieldset>

            {/* ── Section Divider ── */}
            <div className="divider text-base-content/30">
              <span className="badge badge-primary badge-lg gap-2 font-semibold px-4 py-3 shadow-md shadow-primary/20">
                <FaDollarSign />
                Pricing
              </span>
            </div>

            {/* ──── PRICING ──── */}
            <fieldset
              className="space-y-6 animate-in slide-in-from-bottom duration-500"
              style={{ animationDelay: "200ms" }}
            >
              <legend className="flex items-center gap-3 pb-4 border-b border-base-300/50 w-full">
                <span className="p-2.5 rounded-xl bg-linear-to-br from-primary/20 to-secondary/20">
                  <FaDollarSign className="text-primary text-lg" />
                </span>
                <span className="text-lg font-bold text-base-content">
                  Pricing
                </span>
              </legend>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
                {/* Monthly Price */}
                <div className="form-control">
                  <label className="label pb-1.5">
                    <span className="label-text font-semibold flex items-center gap-2 text-base-content/80">
                      <FaDollarSign className="text-primary text-xs" />
                      Monthly Price (USD)
                    </span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40 font-semibold">$</span>
                    <input
                      type="number"
                      name="monthlyPrice"
                      className="input input-bordered w-full pl-7 bg-base-100/50 backdrop-blur-sm border-secondary/30 focus:border-secondary transition-all duration-300 hover:scale-[1.01]"
                      placeholder="0.00"
                      value={form.monthlyPrice}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                {/* Yearly Price */}
                <div className="form-control">
                  <label className="label pb-1.5">
                    <span className="label-text font-semibold flex items-center gap-2 text-base-content/80">
                      <FaDollarSign className="text-primary text-xs" />
                      Yearly Price (USD)
                    </span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40 font-semibold">$</span>
                    <input
                      type="number"
                      name="yearlyPrice"
                      className="input input-bordered w-full pl-7 bg-base-100/50 backdrop-blur-sm border-secondary/30 focus:border-secondary transition-all duration-300 hover:scale-[1.01]"
                      placeholder="0.00"
                      value={form.yearlyPrice}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
              </div>
            </fieldset>

            {/* ── Section Divider ── */}
            <div className="divider text-base-content/30">
              <span className="badge badge-primary badge-lg gap-2 font-semibold px-4 py-3 shadow-md shadow-primary/20">
                <FaLayerGroup />
                Usage Limits
              </span>
            </div>

            {/* ──── LIMITS ──── */}
            <fieldset
              className="space-y-6 animate-in slide-in-from-bottom duration-500"
              style={{ animationDelay: "300ms" }}
            >
              <legend className="flex items-center gap-3 pb-4 border-b border-base-300/50 w-full">
                <span className="p-2.5 rounded-xl bg-linear-to-br from-primary/20 to-secondary/20">
                  <FaLayerGroup className="text-primary text-lg" />
                </span>
                <span className="text-lg font-bold text-base-content">
                  Usage Limits
                </span>
              </legend>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-8 gap-y-5">
                {/* Max Students */}
                <div className="form-control">
                  <label className="label pb-1.5">
                    <span className="label-text font-semibold flex items-center gap-2 text-base-content/80">
                      <FaUserGraduate className="text-primary text-xs" />
                      Max Students
                    </span>
                  </label>
                  <input
                    type="number"
                    name="maxStudents"
                    className="input input-bordered w-full bg-base-100/50 backdrop-blur-sm border-accent/30 focus:border-accent transition-all duration-300 hover:scale-[1.01]"
                    placeholder="0 = unlimited"
                    value={form.maxStudents}
                    onChange={handleChange}
                    min="0"
                  />
                  <p className="text-xs text-base-content/40 mt-1">0 means unlimited</p>
                </div>

                {/* Max Classes */}
                <div className="form-control">
                  <label className="label pb-1.5">
                    <span className="label-text font-semibold flex items-center gap-2 text-base-content/80">
                      <FaSchool className="text-primary text-xs" />
                      Max Classes
                    </span>
                  </label>
                  <input
                    type="number"
                    name="maxClasses"
                    className="input input-bordered w-full bg-base-100/50 backdrop-blur-sm border-accent/30 focus:border-accent transition-all duration-300 hover:scale-[1.01]"
                    placeholder="0 = unlimited"
                    value={form.maxClasses}
                    onChange={handleChange}
                    min="0"
                  />
                  <p className="text-xs text-base-content/40 mt-1">0 means unlimited</p>
                </div>

                {/* Max Teachers */}
                <div className="form-control">
                  <label className="label pb-1.5">
                    <span className="label-text font-semibold flex items-center gap-2 text-base-content/80">
                      <FaChalkboardTeacher className="text-primary text-xs" />
                      Max Teachers
                    </span>
                  </label>
                  <input
                    type="number"
                    name="maxTeachers"
                    className="input input-bordered w-full bg-base-100/50 backdrop-blur-sm border-accent/30 focus:border-accent transition-all duration-300 hover:scale-[1.01]"
                    placeholder="0 = unlimited"
                    value={form.maxTeachers}
                    onChange={handleChange}
                    min="0"
                  />
                  <p className="text-xs text-base-content/40 mt-1">0 means unlimited</p>
                </div>
              </div>
            </fieldset>

            {/* ──── FORM ACTIONS ──── */}
            <div
              className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6 border-t border-base-300/50 animate-in slide-in-from-bottom duration-500"
              style={{ animationDelay: "400ms" }}
            >
              <button
                type="button"
                className="btn btn-ghost hover:bg-primary/10 hover:text-primary transition-all duration-300 hover:scale-105"
                onClick={() => navigate("/dashboard/super-admin/plans")}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn bg-linear-to-r from-primary to-primary/80 text-primary-content border-none gap-2 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40 hover:scale-105 transition-all duration-300"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span className="loading loading-spinner loading-sm" />
                    {isEditing ? "Updating Plan..." : "Creating Plan..."}
                  </>
                ) : (
                  <>
                    <FaCheckCircle />
                    {isEditing ? "Update Plan" : "Create Plan"}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Required fields note */}
      <p className="text-center text-sm text-base-content/40 pb-2">
        Fields marked with <span className="text-error font-semibold">*</span>{" "}
        are required
      </p>

      <style>{`
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 3s ease infinite;
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s infinite;
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
};

export default CreatePlan;
