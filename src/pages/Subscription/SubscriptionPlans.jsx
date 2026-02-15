import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import { API_BASE_URL } from "../../config/api";
import Logo from "../../components/Logo";
import Loader from "../../components/Loader";
import { FaCheck, FaArrowLeft, FaStar } from "react-icons/fa";

const SubscriptionPlans = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState("monthly");

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/subscriptions/plans`);
        if (res.data.success) {
          setPlans(res.data.data);
        }
      } catch (error) {
        console.error("Error fetching plans:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  if (loading) return <Loader />;

  const formatLimit = (value) => {
    if (value === -1) return "Unlimited";
    return value.toLocaleString();
  };

  const formatStorage = (mb) => {
    if (mb >= 1024) return `${(mb / 1024).toFixed(0)} GB`;
    return `${mb} MB`;
  };

  const tierColors = {
    free: { bg: "bg-gray-50", border: "border-gray-200", badge: "bg-gray-100 text-gray-600" },
    basic: { bg: "bg-blue-50/30", border: "border-blue-200", badge: "bg-blue-100 text-blue-600" },
    professional: { bg: "bg-emerald-50/30", border: "border-emerald-200", badge: "bg-emerald-100 text-emerald-600" },
    enterprise: { bg: "bg-amber-50/30", border: "border-amber-200", badge: "bg-amber-100 text-amber-600" },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-gray-50">
      {/* Header */}
      <div className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Logo size="sm" />
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            <FaArrowLeft className="text-xs" />
            Back
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-800">
            Choose the Right Plan for Your School
          </h1>
          <p className="text-gray-500 mt-3 max-w-lg mx-auto">
            Start with a 14-day free trial of Professional features. Upgrade
            anytime as your school grows.
          </p>

          {/* Billing toggle */}
          <div className="flex items-center justify-center gap-3 mt-6">
            <span className={`text-sm ${billingCycle === "monthly" ? "text-gray-800 font-medium" : "text-gray-400"}`}>
              Monthly
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === "monthly" ? "yearly" : "monthly")}
              className={`relative w-12 h-6 rounded-full transition-colors ${billingCycle === "yearly" ? "bg-blue-600" : "bg-gray-300"}`}
            >
              <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${billingCycle === "yearly" ? "translate-x-6.5" : "translate-x-0.5"}`} />
            </button>
            <span className={`text-sm ${billingCycle === "yearly" ? "text-gray-800 font-medium" : "text-gray-400"}`}>
              Yearly
              <span className="ml-1 text-xs text-emerald-500 font-medium">Save 17%</span>
            </span>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => {
            const colors = tierColors[plan.tier] || tierColors.free;
            const isPopular = plan.tier === "professional";
            const price =
              billingCycle === "monthly"
                ? plan.monthlyPrice
                : plan.yearlyPrice;

            return (
              <div
                key={plan._id}
                className={`relative ${colors.bg} border ${colors.border} rounded-2xl p-6 ${isPopular ? "ring-2 ring-emerald-400 shadow-lg scale-[1.02]" : "shadow-sm"} transition-all hover:shadow-md`}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-emerald-500 text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                      <FaStar className="text-[10px]" />
                      Popular
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <span className={`${colors.badge} text-xs font-semibold px-2.5 py-1 rounded-full`}>
                    {plan.name}
                  </span>
                  <p className="text-gray-500 text-xs mt-3">
                    {plan.description}
                  </p>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-gray-800">
                      {price === 0 ? "Free" : `${price.toLocaleString()}`}
                    </span>
                    {price > 0 && (
                      <span className="text-gray-500 text-sm">
                        BDT/{billingCycle === "monthly" ? "mo" : "yr"}
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FaCheck className="text-emerald-500 text-xs shrink-0" />
                    <span>
                      {formatLimit(plan.limits.maxStudents)} Students
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FaCheck className="text-emerald-500 text-xs shrink-0" />
                    <span>
                      {formatLimit(plan.limits.maxClasses)} Classes
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FaCheck className="text-emerald-500 text-xs shrink-0" />
                    <span>
                      {formatLimit(plan.limits.maxTeachers)} Teachers
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FaCheck className="text-emerald-500 text-xs shrink-0" />
                    <span>
                      {formatStorage(plan.limits.maxStorage)} Storage
                    </span>
                  </div>
                  {plan.limits.features?.slice(0, 3).map((feature, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 text-sm text-gray-600"
                    >
                      <FaCheck className="text-emerald-500 text-xs shrink-0" />
                      <span className="capitalize">
                        {feature.replace(/_/g, " ")}
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => navigate("/signup")}
                  className={`w-full py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isPopular
                      ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                      : "bg-white border border-gray-200 hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  Get Started
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer note */}
        <div className="text-center mt-12 text-sm text-gray-400">
          <p>All plans include a 14-day free trial with Professional features.</p>
          <p className="mt-1">No credit card required to start.</p>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPlans;
