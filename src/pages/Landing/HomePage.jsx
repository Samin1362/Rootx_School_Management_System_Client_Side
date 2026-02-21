import { useState, useEffect } from "react";
import { Link } from "react-router";
import axios from "axios";
import { API_BASE_URL } from "../../config/api";
import {
  FaRocket,
  FaSignInAlt,
  FaCheckCircle,
  FaChevronDown,
  FaSchool,
  FaUserGraduate,
  FaChalkboardTeacher,
  FaShieldAlt,
  FaCalendarCheck,
  FaFileAlt,
  FaMoneyBillWave,
  FaBullhorn,
  FaChartBar,
  FaBolt,
  FaCrown,
  FaStar,
  FaCheck,
  FaArrowRight,
  FaEnvelope,
} from "react-icons/fa";

// ── helpers ──────────────────────────────────────────────────────────────────
const formatLimit = (value) => (value === -1 ? "Unlimited" : value.toLocaleString());
const formatStorage = (mb) => (mb >= 1024 ? `${(mb / 1024).toFixed(0)} GB` : `${mb} MB`);

// ── static data ───────────────────────────────────────────────────────────────
const stats = [
  { value: "500+",    label: "Schools Onboarded",  icon: FaSchool,            color: "text-primary",   bg: "bg-primary/10" },
  { value: "50,000+", label: "Students Managed",   icon: FaUserGraduate,      color: "text-secondary", bg: "bg-secondary/10" },
  { value: "3,000+",  label: "Teachers Registered",icon: FaChalkboardTeacher, color: "text-accent",    bg: "bg-accent/10" },
  { value: "99.9%",   label: "Uptime Guaranteed",  icon: FaShieldAlt,         color: "text-success",   bg: "bg-success/10" },
];

const features = [
  {
    icon: FaCalendarCheck,
    title: "Attendance Tracking",
    desc: "Mark and monitor attendance in real-time with automated reports and instant alerts for absences.",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: FaFileAlt,
    title: "Exam & Grade Management",
    desc: "Create exams, submit grades, and publish results through a 6-stage teacher → admin approval workflow.",
    color: "text-secondary",
    bg: "bg-secondary/10",
  },
  {
    icon: FaMoneyBillWave,
    title: "Fee & Finance Management",
    desc: "Generate class-based fee structures, collect payments, track dues, manage salaries and expenses.",
    color: "text-success",
    bg: "bg-success/10",
  },
  {
    icon: FaBullhorn,
    title: "Announcements & Communication",
    desc: "Broadcast school-wide or targeted announcements to specific classes, sections, or roles.",
    color: "text-warning",
    bg: "bg-warning/10",
  },
  {
    icon: FaChartBar,
    title: "Reports & Analytics",
    desc: "Generate comprehensive reports on attendance, academic performance, finances, and teacher workload.",
    color: "text-info",
    bg: "bg-info/10",
  },
  {
    icon: FaShieldAlt,
    title: "Role-Based Access Control",
    desc: "7 distinct roles with granular permissions: org owner, admin, moderator, teacher, student, and parent.",
    color: "text-accent",
    bg: "bg-accent/10",
  },
];

const tierConfig = {
  free:         { gradient: "from-base-100 to-base-200",         ring: "border-base-300/50",  badge: "badge-ghost",   popular: false },
  basic:        { gradient: "from-info/5 to-base-100",           ring: "border-info/30",      badge: "badge-info",    popular: false },
  professional: { gradient: "from-primary/8 to-secondary/5",    ring: "border-primary",      badge: "badge-primary", popular: true  },
  enterprise:   { gradient: "from-accent/8 to-base-100",         ring: "border-accent/30",    badge: "badge-warning", popular: false },
};

// ── component ─────────────────────────────────────────────────────────────────
const HomePage = () => {
  const [plans, setPlans]             = useState([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState("monthly");

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/subscriptions/plans`)
      .then((res) => { if (res.data.success) setPlans(res.data.data); })
      .catch(console.error)
      .finally(() => setPlansLoading(false));
  }, []);

  return (
    <div>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION A — HERO
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="min-h-screen relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-base-100 via-primary/5 to-base-100 pt-4 pb-24">

        {/* Floating background orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float pointer-events-none" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-float-reverse pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-accent/5 rounded-full blur-2xl animate-pulse pointer-events-none" />
        <div className="absolute top-40 right-20 w-48 h-48 bg-secondary/8 rounded-full blur-2xl animate-float pointer-events-none" />

        {/* Hero content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center animate-fadeInUp">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8">
            <FaRocket className="text-xs animate-pulse" />
            School Management Reimagined
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-base-content leading-tight mb-6">
            Manage Your School
            <span className="block mt-2 bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
              Smarter &amp; Faster
            </span>
          </h1>

          {/* Sub-headline */}
          <p className="text-lg sm:text-xl text-base-content/70 max-w-2xl mx-auto leading-relaxed mb-10">
            RootX SMS is a comprehensive, cloud-based school management platform for admins, teachers, students, and parents — all in one secure place.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
            <Link
              to="/signup"
              className="btn btn-primary btn-lg gap-2 shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/35 hover:scale-[1.03] transition-all duration-300"
            >
              <FaRocket />
              Get Started Free
            </Link>
            <Link
              to="/login"
              className="btn btn-outline btn-lg gap-2 hover:btn-primary hover:scale-[1.02] transition-all duration-300"
            >
              <FaSignInAlt />
              Sign In
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-base-content/50">
            {["No credit card required", "14-day free trial", "Cancel anytime"].map((text) => (
              <div key={text} className="flex items-center gap-2">
                <FaCheckCircle className="text-success flex-shrink-0" />
                {text}
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-base-content/30 animate-bounce text-xs">
          <span>Scroll to explore</span>
          <FaChevronDown />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION B — STATS ROW
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-16 px-4 bg-base-200/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, idx) => (
              <div
                key={stat.label}
                className="bg-base-100/60 backdrop-blur-sm border border-base-300/50 hover:border-primary/20 rounded-2xl p-6 text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300 animate-fadeInUp"
                style={{ animationDelay: `${idx * 80}ms` }}
              >
                <div className={`${stat.bg} w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3`}>
                  <stat.icon className={`${stat.color} text-2xl`} />
                </div>
                <div className="text-3xl font-bold text-base-content mb-1">{stat.value}</div>
                <div className="text-sm text-base-content/60">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION C — ABOUT / FEATURES
      ═══════════════════════════════════════════════════════════════════ */}
      <section id="features" className="py-20 px-4 bg-base-100">
        <div className="max-w-7xl mx-auto">

          {/* Section header */}
          <div className="text-center mb-16 animate-fadeInUp">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-sm font-medium mb-4">
              <FaBolt className="text-xs" />
              Why Choose RootX?
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-base-content mb-4">
              Everything Your School Needs,
              <span className="text-primary"> In One Platform</span>
            </h2>
            <p className="text-base-content/60 max-w-2xl mx-auto text-lg leading-relaxed">
              From attendance to finances, from exams to announcements — RootX covers every aspect of school administration so you can focus on education.
            </p>
          </div>

          {/* Features grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => (
              <div
                key={feature.title}
                className="group bg-base-100 border border-base-300/50 hover:border-primary/30 rounded-2xl p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-fadeInUp"
                style={{ animationDelay: `${idx * 80}ms` }}
              >
                <div
                  className={`${feature.bg} w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                >
                  <feature.icon className={`${feature.color} text-xl`} />
                </div>
                <h3 className="font-semibold text-base-content text-lg mb-2 group-hover:text-primary transition-colors duration-200">
                  {feature.title}
                </h3>
                <p className="text-base-content/60 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION D — PRICING
      ═══════════════════════════════════════════════════════════════════ */}
      <section id="pricing" className="py-20 px-4 bg-base-200/40">
        <div className="max-w-7xl mx-auto">

          {/* Section header */}
          <div className="text-center mb-12 animate-fadeInUp">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-medium mb-4">
              <FaCrown className="text-xs" />
              Transparent Pricing
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-base-content mb-4">
              Plans for Every School Size
            </h2>
            <p className="text-base-content/60 max-w-xl mx-auto mb-8 text-lg">
              Start free, upgrade as you grow. All plans include a 14-day Professional trial.
            </p>

            {/* Billing toggle */}
            <div className="flex items-center justify-center gap-3">
              <span
                className={`text-sm font-medium transition-colors duration-200 ${
                  billingCycle === "monthly" ? "text-base-content" : "text-base-content/40"
                }`}
              >
                Monthly
              </span>
              <button
                onClick={() =>
                  setBillingCycle((prev) => (prev === "monthly" ? "yearly" : "monthly"))
                }
                className={`relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary/40 ${
                  billingCycle === "yearly" ? "bg-primary" : "bg-base-300"
                }`}
                aria-label="Toggle billing cycle"
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${
                    billingCycle === "yearly" ? "translate-x-6" : "translate-x-0.5"
                  }`}
                />
              </button>
              <span
                className={`text-sm font-medium transition-colors duration-200 ${
                  billingCycle === "yearly" ? "text-base-content" : "text-base-content/40"
                }`}
              >
                Yearly
                <span className="ml-1.5 text-xs text-success font-semibold">Save 17%</span>
              </span>
            </div>
          </div>

          {/* Plan cards */}
          {plansLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse bg-base-200 rounded-2xl h-72" />
              ))}
            </div>
          ) : plans.length === 0 ? (
            <div className="text-center py-12 text-base-content/50">
              <p>Pricing information is temporarily unavailable.</p>
              <Link to="/plans" className="btn btn-primary btn-sm mt-4 gap-2">
                View Plans <FaArrowRight className="text-xs" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
              {plans.map((plan, idx) => {
                const config = tierConfig[plan.tier] || tierConfig.free;
                const price =
                  billingCycle === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;
                const features = [
                  `${formatLimit(plan.limits?.maxStudents ?? 0)} Students`,
                  `${formatLimit(plan.limits?.maxClasses ?? 0)} Classes`,
                  `${formatLimit(plan.limits?.maxTeachers ?? 0)} Teachers`,
                  `${formatStorage(plan.limits?.maxStorage ?? 0)} Storage`,
                  ...(plan.limits?.features || []).slice(0, 3).map((f) =>
                    f.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
                  ),
                ];

                return (
                  <div
                    key={plan._id}
                    className={`relative flex flex-col rounded-2xl p-6 border bg-gradient-to-br transition-all duration-300 animate-fadeInUp ${config.gradient} ${
                      config.popular
                        ? "border-2 border-primary shadow-2xl shadow-primary/20 scale-[1.02] z-10"
                        : `border ${config.ring} hover:shadow-lg hover:-translate-y-1`
                    }`}
                    style={{ animationDelay: `${idx * 80}ms` }}
                  >
                    {/* Most Popular badge */}
                    {config.popular && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                        <span className="badge badge-primary gap-1 px-3 py-3 text-xs shadow-lg shadow-primary/30">
                          <FaStar className="text-[9px]" />
                          Most Popular
                        </span>
                      </div>
                    )}

                    {/* Plan tier badge */}
                    <div className="mb-3 mt-1">
                      <span className={`badge ${config.badge} text-xs font-semibold px-3 py-2`}>
                        {plan.name}
                      </span>
                    </div>

                    {/* Price */}
                    <div className="mb-5">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-4xl font-bold text-base-content">
                          {price === 0 ? "Free" : `৳${price.toLocaleString()}`}
                        </span>
                        {price > 0 && (
                          <span className="text-base-content/50 text-sm">
                            /{billingCycle === "monthly" ? "mo" : "yr"}
                          </span>
                        )}
                      </div>
                      {plan.description && (
                        <p className="text-xs text-base-content/50 mt-1 leading-snug">
                          {plan.description}
                        </p>
                      )}
                    </div>

                    {/* Feature list */}
                    <ul className="space-y-2.5 flex-1 mb-6">
                      {features.map((feat) => (
                        <li key={feat} className="flex items-start gap-2 text-sm text-base-content/70">
                          <FaCheck className="text-success text-xs flex-shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    <Link
                      to="/signup"
                      className={`btn btn-sm w-full gap-2 transition-all duration-300 ${
                        config.popular
                          ? "btn-primary shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30"
                          : "btn-outline hover:btn-primary"
                      }`}
                    >
                      Get Started
                      <FaArrowRight className="text-xs" />
                    </Link>
                  </div>
                );
              })}
            </div>
          )}

          <p className="text-center text-sm text-base-content/40 mt-8">
            All plans include a 14-day free trial with Professional features. No credit card required.
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION E — CTA BANNER
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-20 px-4 bg-base-100">
        <div className="max-w-5xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary/90 to-secondary p-10 sm:p-16 text-center shadow-2xl shadow-primary/30 animate-fadeInUp">

            {/* Decorative orbs */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

            <div className="relative z-10">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 text-white/90 text-sm font-medium mb-6">
                <FaBolt className="text-yellow-300 animate-pulse text-xs" />
                Ready to Transform Your School?
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
                Start Your Free Trial Today
              </h2>
              <p className="text-white/70 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
                Join hundreds of schools already using RootX to manage their institutions efficiently. No setup fees. No credit card required.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/signup"
                  className="btn btn-lg bg-white text-primary hover:bg-white/90 gap-2 shadow-xl hover:scale-[1.03] transition-all duration-300"
                >
                  <FaRocket />
                  Create Free School Account
                </Link>
                <Link
                  to="/contact"
                  className="btn btn-lg btn-ghost text-white border border-white/30 hover:bg-white/10 hover:border-white/50 gap-2 transition-all duration-300"
                >
                  <FaEnvelope />
                  Talk to Sales
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Inline animation declarations ──────────────────────────────────── */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-20px) scale(1.05); }
        }
        @keyframes float-reverse {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(20px) scale(1.05); }
        }
        @keyframes gradient {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .animate-float         { animation: float 8s ease-in-out infinite; }
        .animate-float-reverse { animation: float-reverse 10s ease-in-out infinite; }
        .animate-gradient      { animation: gradient 3s ease infinite; }
      `}</style>
    </div>
  );
};

export default HomePage;
