import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router";
import { useOrganization } from "../../contexts/organization/OrganizationContext";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import { useNotification } from "../../contexts/NotificationContext";
import axios from "axios";
import { API_BASE_URL } from "../../config/api";
import {
  FaCrown,
  FaCheck,
  FaArrowUp,
  FaArrowDown,
  FaClock,
  FaCalendarAlt,
  FaUsers,
  FaLayerGroup,
  FaChalkboardTeacher,
  FaDatabase,
  FaInfoCircle,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
  FaTimes,
  FaStar,
  FaRocket,
  FaSync,
} from "react-icons/fa";

// ── helpers ───────────────────────────────────────────────────────────────────
const formatLimit = (v) => (v === -1 ? "Unlimited" : v?.toLocaleString() ?? "0");
const formatStorage = (mb) =>
  mb >= 1024 ? `${(mb / 1024).toFixed(0)} GB` : `${mb ?? 0} MB`;

const getDaysRemaining = (dateStr) => {
  if (!dateStr) return null;
  const diff = new Date(dateStr) - new Date();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

const tierOrder = { free: 0, basic: 1, professional: 2, enterprise: 3 };

// ── tier config (DaisyUI tokens, dark-mode safe) ──────────────────────────────
const tierConfig = {
  free:         { badge: "badge-ghost",   ring: "border-base-300/60",   gradient: "from-base-100 to-base-200",         label: "Free" },
  basic:        { badge: "badge-info",    ring: "border-info/40",        gradient: "from-info/5 to-base-100",           label: "Basic" },
  professional: { badge: "badge-primary", ring: "border-primary",        gradient: "from-primary/8 to-secondary/5",    label: "Professional" },
  enterprise:   { badge: "badge-warning", ring: "border-warning/40",     gradient: "from-warning/5 to-base-100",        label: "Enterprise" },
};

const statusConfig = {
  trial:     { badge: "badge-warning", icon: FaClock,            label: "Trial" },
  active:    { badge: "badge-success", icon: FaCheckCircle,      label: "Active" },
  cancelled: { badge: "badge-error",   icon: FaTimesCircle,      label: "Cancelled" },
  expired:   { badge: "badge-error",   icon: FaExclamationTriangle, label: "Expired" },
};

// ── sub-components ────────────────────────────────────────────────────────────
const UsageBar = ({ label, icon: Icon, current, max, color }) => {
  const pct = max === -1 ? 0 : Math.min(100, Math.round(((current ?? 0) / max) * 100));
  const unlimited = max === -1;
  const nearLimit = !unlimited && pct >= 80;

  return (
    <div className="bg-base-100/60 backdrop-blur-sm border border-base-300/50 rounded-2xl p-5 hover:border-primary/20 hover:shadow-md transition-all duration-300">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-lg ${color} bg-opacity-10`}>
            <Icon className={`text-base ${color.replace("bg-", "text-")}`} />
          </div>
          <span className="font-medium text-base-content text-sm">{label}</span>
        </div>
        <div className="text-right">
          <span className="text-lg font-bold text-base-content">{current ?? 0}</span>
          <span className="text-base-content/50 text-sm">
            {" "}/ {unlimited ? "∞" : max}
          </span>
        </div>
      </div>
      {unlimited ? (
        <div className="flex items-center gap-2 text-success text-xs font-medium">
          <FaCheckCircle className="text-xs" />
          Unlimited
        </div>
      ) : (
        <>
          <div className="w-full bg-base-200 rounded-full h-2 overflow-hidden">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${
                pct >= 90 ? "bg-error" : pct >= 80 ? "bg-warning" : "bg-primary"
              }`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-1.5">
            <span className={`text-xs ${nearLimit ? "text-warning font-medium" : "text-base-content/50"}`}>
              {pct}% used
            </span>
            {nearLimit && (
              <span className="text-xs text-warning flex items-center gap-1">
                <FaExclamationTriangle className="text-[10px]" />
                Near limit
              </span>
            )}
          </div>
        </>
      )}
    </div>
  );
};

// ── main component ─────────────────────────────────────────────────────────────
const MySubscription = () => {
  const { subscription, organization, refreshOrganization } = useOrganization();
  const axiosSecure = useAxiosSecure();
  const { success, error: showError } = useNotification();

  const [plans, setPlans]                     = useState([]);
  const [plansLoading, setPlansLoading]         = useState(true);
  const [billingCycle, setBillingCycle]         = useState("monthly");
  const [myRequest, setMyRequest]               = useState(null);
  const [requestLoading, setRequestLoading]     = useState(true);

  // Modal state
  const [showModal, setShowModal]               = useState(false);
  const [selectedPlan, setSelectedPlan]         = useState(null);
  const [modalCycle, setModalCycle]             = useState("monthly");
  const [reason, setReason]                     = useState("");
  const [submitting, setSubmitting]             = useState(false);

  // Fetch all plans (public endpoint)
  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/subscriptions/plans`)
      .then((res) => { if (res.data.success) setPlans(res.data.data); })
      .catch(console.error)
      .finally(() => setPlansLoading(false));
  }, []);

  // Fetch my pending request
  const fetchMyRequest = useCallback(async () => {
    setRequestLoading(true);
    try {
      const res = await axiosSecure.get("/subscriptions/my-request");
      if (res.data.success) setMyRequest(res.data.data);
    } catch {
      // silently ignore – not a critical error
    } finally {
      setRequestLoading(false);
    }
  }, [axiosSecure]);

  useEffect(() => {
    fetchMyRequest();
  }, [fetchMyRequest]);

  // ── derived values ──────────────────────────────────────────────────────────
  const currentTier   = subscription?.tier || "free";
  const currentStatus = subscription?.status || "trial";
  const limits        = subscription?.planDetails?.limits || organization?.limits || {};
  const usage         = organization?.usage || {};

  const daysRemainingTrial  = getDaysRemaining(subscription?.trialEndDate);
  const daysRemainingPeriod = getDaysRemaining(subscription?.currentPeriodEnd);
  const isOnTrial = currentStatus === "trial";

  const statusCfg = statusConfig[currentStatus] || statusConfig.active;
  const tierCfg   = tierConfig[currentTier]   || tierConfig.free;

  // ── open upgrade modal ──────────────────────────────────────────────────────
  const openModal = (plan) => {
    setSelectedPlan(plan);
    setModalCycle(billingCycle);
    setReason("");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedPlan(null);
    setReason("");
  };

  // ── submit request ──────────────────────────────────────────────────────────
  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    if (!selectedPlan) return;
    setSubmitting(true);
    try {
      const res = await axiosSecure.post("/subscriptions/request", {
        requestedTier: selectedPlan.tier,
        requestedBillingCycle: modalCycle,
        reason,
      });
      if (res.data.success) {
        success(res.data.message);
        closeModal();
        fetchMyRequest();
        refreshOrganization();
      }
    } catch (err) {
      showError(err.response?.data?.message || "Failed to submit request");
    } finally {
      setSubmitting(false);
    }
  };

  const isUpgrade   = (tier) => tierOrder[tier] > tierOrder[currentTier];
  const isDowngrade = (tier) => tierOrder[tier] < tierOrder[currentTier];
  const isCurrent   = (tier) => tier === currentTier;

  // ── features list from current plan ────────────────────────────────────────
  const currentPlanFeatures = subscription?.planDetails?.limits?.features || [];

  return (
    <div className="space-y-6 animate-fadeInUp">

      {/* ── PENDING REQUEST BANNER ────────────────────────────────────────── */}
      {!requestLoading && myRequest && myRequest.status === "pending" && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-warning/10 border border-warning/30 animate-fadeInUp">
          <FaHourglassHalf className="text-warning text-lg flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-base-content text-sm">
              Upgrade Request Pending
            </p>
            <p className="text-base-content/70 text-xs mt-0.5">
              Your request to switch to the{" "}
              <span className="font-medium capitalize">{myRequest.requestedTier}</span> plan (
              {myRequest.requestedBillingCycle}) is under review. We'll notify you once it's processed.
            </p>
          </div>
        </div>
      )}

      {!requestLoading && myRequest && myRequest.status === "approved" && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-success/10 border border-success/30 animate-fadeInUp">
          <FaCheckCircle className="text-success text-lg flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-base-content text-sm">Request Approved!</p>
            <p className="text-base-content/70 text-xs mt-0.5">
              Your subscription has been upgraded to <span className="font-medium capitalize">{myRequest.requestedTier}</span>.
              {myRequest.comment && ` Comment: ${myRequest.comment}`}
            </p>
          </div>
        </div>
      )}

      {!requestLoading && myRequest && myRequest.status === "rejected" && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-error/10 border border-error/30 animate-fadeInUp">
          <FaTimesCircle className="text-error text-lg flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-base-content text-sm">Request Rejected</p>
            <p className="text-base-content/70 text-xs mt-0.5">
              Your request to switch to the{" "}
              <span className="font-medium capitalize">{myRequest.requestedTier}</span> plan was rejected.
              {myRequest.rejectionReason && ` Reason: ${myRequest.rejectionReason}`}
            </p>
          </div>
        </div>
      )}

      {/* ── HERO PLAN CARD ────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-secondary p-6 sm:p-8 shadow-xl shadow-primary/20">
        {/* Orb decorations */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl flex-shrink-0">
              <FaCrown className="text-2xl text-white" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-xl sm:text-2xl font-bold text-white capitalize">
                  {subscription?.planDetails?.name || currentTier} Plan
                </h1>
                <span className={`badge ${statusCfg.badge} gap-1 text-xs`}>
                  <statusCfg.icon className="text-[10px]" />
                  {statusCfg.label}
                </span>
              </div>
              <p className="text-white/70 text-sm">
                {subscription?.planDetails?.description || "Your current subscription plan"}
              </p>

              {/* Trial countdown */}
              {isOnTrial && daysRemainingTrial !== null && (
                <div className="flex items-center gap-2 mt-2 text-yellow-200 text-xs font-medium">
                  <FaClock className="text-[10px]" />
                  {daysRemainingTrial > 0
                    ? `Trial ends in ${daysRemainingTrial} day${daysRemainingTrial !== 1 ? "s" : ""}`
                    : "Trial expired"}
                </div>
              )}
            </div>
          </div>

          {/* Billing info + refresh */}
          <div className="flex flex-col items-start sm:items-end gap-2">
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-2xl font-bold text-white">
                  {subscription?.amount === 0
                    ? "Free"
                    : `৳${(subscription?.amount || 0).toLocaleString()}`}
                </div>
                {subscription?.amount > 0 && (
                  <div className="text-white/60 text-xs capitalize">
                    BDT / {subscription?.billingCycle || "month"}
                  </div>
                )}
              </div>
              <button
                onClick={refreshOrganization}
                className="btn btn-circle btn-ghost btn-sm text-white/70 hover:text-white hover:bg-white/10"
                title="Refresh"
              >
                <FaSync className="text-sm" />
              </button>
            </div>

            {/* Billing dates */}
            <div className="flex flex-col gap-1 text-white/60 text-xs">
              {subscription?.currentPeriodEnd && (
                <div className="flex items-center gap-1.5">
                  <FaCalendarAlt className="text-[10px]" />
                  Period ends:{" "}
                  {new Date(subscription.currentPeriodEnd).toLocaleDateString("en-BD", {
                    day: "numeric", month: "short", year: "numeric",
                  })}
                  {daysRemainingPeriod !== null && !isOnTrial && (
                    <span className="text-white/50">
                      ({daysRemainingPeriod}d left)
                    </span>
                  )}
                </div>
              )}
              {subscription?.nextBillingDate && subscription?.amount > 0 && (
                <div className="flex items-center gap-1.5">
                  <FaCalendarAlt className="text-[10px]" />
                  Next billing:{" "}
                  {new Date(subscription.nextBillingDate).toLocaleDateString("en-BD", {
                    day: "numeric", month: "short", year: "numeric",
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── USAGE OVERVIEW ───────────────────────────────────────────────── */}
      <div>
        <h2 className="text-base font-semibold text-base-content mb-3 flex items-center gap-2">
          <FaDatabase className="text-primary text-sm" />
          Usage Overview
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <UsageBar
            label="Students"
            icon={FaUsers}
            current={usage.currentStudents}
            max={limits.maxStudents}
            color="bg-primary"
          />
          <UsageBar
            label="Classes"
            icon={FaLayerGroup}
            current={usage.currentClasses}
            max={limits.maxClasses}
            color="bg-secondary"
          />
          <UsageBar
            label="Teachers"
            icon={FaChalkboardTeacher}
            current={usage.currentTeachers}
            max={limits.maxTeachers}
            color="bg-accent"
          />
          <UsageBar
            label="Storage"
            icon={FaDatabase}
            current={usage.storageUsed}
            max={limits.maxStorage}
            color="bg-info"
          />
        </div>
      </div>

      {/* ── CURRENT PLAN FEATURES ────────────────────────────────────────── */}
      {currentPlanFeatures.length > 0 && (
        <div className="bg-base-100/60 backdrop-blur-sm border border-base-300/50 rounded-2xl p-5">
          <h2 className="text-base font-semibold text-base-content mb-4 flex items-center gap-2">
            <FaCheckCircle className="text-success text-sm" />
            Included in Your Plan
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {currentPlanFeatures.map((feature) => (
              <div
                key={feature}
                className="flex items-center gap-2 text-sm text-base-content/70"
              >
                <FaCheck className="text-success text-xs flex-shrink-0" />
                <span className="capitalize">{feature.replace(/_/g, " ")}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── AVAILABLE PLANS ──────────────────────────────────────────────── */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <h2 className="text-base font-semibold text-base-content flex items-center gap-2">
            <FaRocket className="text-primary text-sm" />
            Available Plans
          </h2>

          {/* Billing toggle */}
          <div className="flex items-center gap-3 text-sm">
            <span className={billingCycle === "monthly" ? "text-base-content font-medium" : "text-base-content/40"}>
              Monthly
            </span>
            <button
              onClick={() => setBillingCycle((p) => (p === "monthly" ? "yearly" : "monthly"))}
              className={`relative w-11 h-6 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary/40 ${
                billingCycle === "yearly" ? "bg-primary" : "bg-base-300"
              }`}
              aria-label="Toggle billing cycle"
            >
              <span
                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${
                  billingCycle === "yearly" ? "translate-x-5.5" : "translate-x-0.5"
                }`}
              />
            </button>
            <span className={billingCycle === "yearly" ? "text-base-content font-medium" : "text-base-content/40"}>
              Yearly
              <span className="ml-1 text-xs text-success font-semibold">-17%</span>
            </span>
          </div>
        </div>

        {plansLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse bg-base-200 rounded-2xl h-72" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
            {plans.map((plan) => {
              const cfg   = tierConfig[plan.tier] || tierConfig.free;
              const price = billingCycle === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;
              const current   = isCurrent(plan.tier);
              const upgrade   = isUpgrade(plan.tier);
              const downgrade = isDowngrade(plan.tier);
              const popular   = plan.tier === "professional";
              const hasPendingRequest = myRequest?.status === "pending";

              const planFeatures = [
                `${formatLimit(plan.limits?.maxStudents)} Students`,
                `${formatLimit(plan.limits?.maxClasses)} Classes`,
                `${formatLimit(plan.limits?.maxTeachers)} Teachers`,
                `${formatStorage(plan.limits?.maxStorage)} Storage`,
                ...(plan.limits?.features || []).slice(0, 2).map((f) =>
                  f.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
                ),
              ];

              return (
                <div
                  key={plan._id}
                  className={`relative flex flex-col rounded-2xl p-5 border bg-gradient-to-br transition-all duration-300 ${cfg.gradient} ${
                    current
                      ? "border-2 border-primary shadow-lg shadow-primary/15 ring-2 ring-primary/10"
                      : popular
                      ? `border-2 ${cfg.ring} shadow-md`
                      : `border ${cfg.ring} hover:shadow-md hover:-translate-y-0.5`
                  }`}
                >
                  {/* Current plan ribbon */}
                  {current && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                      <span className="badge badge-primary gap-1 px-3 py-2.5 text-xs shadow-md shadow-primary/30">
                        <FaCheckCircle className="text-[9px]" />
                        Current Plan
                      </span>
                    </div>
                  )}

                  {/* Popular badge */}
                  {popular && !current && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                      <span className="badge badge-primary gap-1 px-3 py-2.5 text-xs shadow-md shadow-primary/20">
                        <FaStar className="text-[9px]" />
                        Popular
                      </span>
                    </div>
                  )}

                  {/* Tier badge */}
                  <div className="mb-3 mt-1">
                    <span className={`badge ${cfg.badge} text-xs font-semibold px-2.5 py-1.5`}>
                      {plan.name}
                    </span>
                  </div>

                  {/* Price */}
                  <div className="mb-4">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-base-content">
                        {price === 0 ? "Free" : `৳${price.toLocaleString()}`}
                      </span>
                      {price > 0 && (
                        <span className="text-base-content/50 text-xs">
                          /{billingCycle === "monthly" ? "mo" : "yr"}
                        </span>
                      )}
                    </div>
                    {plan.description && (
                      <p className="text-xs text-base-content/50 mt-1 leading-snug">{plan.description}</p>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="space-y-2 flex-1 mb-4">
                    {planFeatures.map((feat) => (
                      <li key={feat} className="flex items-start gap-2 text-xs text-base-content/70">
                        <FaCheck className="text-success text-[10px] flex-shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA button */}
                  {current ? (
                    <div className="btn btn-sm btn-primary w-full gap-2 cursor-default opacity-80">
                      <FaCheckCircle className="text-xs" />
                      Current Plan
                    </div>
                  ) : hasPendingRequest ? (
                    <div className="btn btn-sm btn-disabled w-full gap-2 text-xs">
                      <FaHourglassHalf className="text-xs" />
                      Request Pending
                    </div>
                  ) : (
                    <button
                      onClick={() => openModal(plan)}
                      className={`btn btn-sm w-full gap-2 transition-all duration-200 ${
                        upgrade
                          ? "btn-primary hover:shadow-md hover:shadow-primary/20"
                          : "btn-outline hover:btn-error"
                      }`}
                    >
                      {upgrade ? (
                        <><FaArrowUp className="text-[10px]" /> Upgrade</>
                      ) : (
                        <><FaArrowDown className="text-[10px]" /> Downgrade</>
                      )}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── INFO NOTE ─────────────────────────────────────────────────────── */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-info/8 border border-info/20 text-sm text-base-content/70">
        <FaInfoCircle className="text-info flex-shrink-0 mt-0.5" />
        <p>
          Plan changes are processed by our admin team. Submit a request and we'll activate the new plan shortly.
          For enterprise plans or custom requirements,{" "}
          <Link to="/contact" className="text-primary hover:underline font-medium">
            contact us
          </Link>
          .
        </p>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          UPGRADE / DOWNGRADE REQUEST MODAL
      ══════════════════════════════════════════════════════════════════ */}
      {showModal && selectedPlan && (
        <dialog className="modal modal-open">
          <div className="modal-box max-w-lg">
            {/* Modal header */}
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  {isUpgrade(selectedPlan.tier) ? (
                    <FaArrowUp className="text-primary" />
                  ) : (
                    <FaArrowDown className="text-error" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-base-content">
                    {isUpgrade(selectedPlan.tier) ? "Upgrade" : "Downgrade"} to{" "}
                    <span className="capitalize">{selectedPlan.name}</span>
                  </h3>
                  <p className="text-xs text-base-content/50 mt-0.5">
                    Current: <span className="capitalize font-medium">{currentTier}</span> →{" "}
                    Requested: <span className="capitalize font-medium">{selectedPlan.tier}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="btn btn-circle btn-ghost btn-sm"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmitRequest} className="space-y-4">
              {/* Plan summary */}
              <div className="bg-base-200/60 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-base-content/60">Plan</span>
                  <span className="font-semibold text-base-content capitalize">{selectedPlan.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-base-content/60">Monthly Price</span>
                  <span className="font-semibold text-base-content">
                    {selectedPlan.monthlyPrice === 0 ? "Free" : `৳${selectedPlan.monthlyPrice.toLocaleString()}/mo`}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-base-content/60">Yearly Price</span>
                  <span className="font-semibold text-base-content">
                    {selectedPlan.yearlyPrice === 0 ? "Free" : `৳${selectedPlan.yearlyPrice.toLocaleString()}/yr`}
                  </span>
                </div>
              </div>

              {/* Billing cycle */}
              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text font-medium">Preferred Billing Cycle</span>
                </label>
                <div className="flex gap-3">
                  {["monthly", "yearly"].map((cycle) => (
                    <label
                      key={cycle}
                      className={`flex-1 flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-200 ${
                        modalCycle === cycle
                          ? "border-primary bg-primary/5"
                          : "border-base-300/60 hover:border-primary/30"
                      }`}
                    >
                      <input
                        type="radio"
                        name="billingCycle"
                        value={cycle}
                        checked={modalCycle === cycle}
                        onChange={() => setModalCycle(cycle)}
                        className="radio radio-primary radio-sm"
                      />
                      <div>
                        <p className="text-sm font-medium text-base-content capitalize">{cycle}</p>
                        <p className="text-xs text-base-content/50">
                          {cycle === "yearly" ? "Save ~17%" : "Pay as you go"}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price display for selected cycle */}
              <div className="flex items-center justify-between bg-primary/5 border border-primary/15 rounded-xl px-4 py-3">
                <span className="text-sm text-base-content/70">
                  {modalCycle === "monthly" ? "Monthly" : "Yearly"} cost
                </span>
                <span className="text-lg font-bold text-primary">
                  {(modalCycle === "monthly" ? selectedPlan.monthlyPrice : selectedPlan.yearlyPrice) === 0
                    ? "Free"
                    : `৳${(modalCycle === "monthly" ? selectedPlan.monthlyPrice : selectedPlan.yearlyPrice).toLocaleString()}`}
                </span>
              </div>

              {/* Reason */}
              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text font-medium">Reason (optional)</span>
                </label>
                <textarea
                  className="textarea textarea-bordered w-full border-2 border-base-300 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 resize-none transition-all duration-200"
                  placeholder="Tell us why you want to change your plan..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Downgrade warning */}
              {isDowngrade(selectedPlan.tier) && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-warning/10 border border-warning/30 text-xs text-base-content/70">
                  <FaExclamationTriangle className="text-warning flex-shrink-0 mt-0.5" />
                  <span>
                    Downgrading may restrict access to features and data if usage exceeds the new plan limits.
                  </span>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={closeModal}
                  className="btn btn-ghost flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`btn flex-1 gap-2 ${
                    isUpgrade(selectedPlan.tier) ? "btn-primary" : "btn-error"
                  } disabled:opacity-60`}
                >
                  {submitting ? (
                    <><span className="loading loading-spinner loading-sm" /> Submitting...</>
                  ) : (
                    <><FaRocket className="text-xs" /> Submit Request</>
                  )}
                </button>
              </div>
            </form>
          </div>
          <div className="modal-backdrop" onClick={closeModal} />
        </dialog>
      )}
    </div>
  );
};

export default MySubscription;
