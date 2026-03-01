import { useEffect, useState } from "react";
import { Link } from "react-router";
import useAuth from "../../hooks/useAuth";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import { useOrganization } from "../../contexts/organization/OrganizationContext";
import Loader from "../../components/Loader";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  FaUserGraduate,
  FaChalkboardTeacher,
  FaLayerGroup,
  FaBookOpen,
  FaUsers,
  FaClipboardList,
  FaMoneyBillWave,
  FaFileAlt,
  FaChartLine,
  FaGraduationCap,
  FaTrophy,
  FaCalendarAlt,
  FaBolt,
  FaSchool,
  FaClipboardCheck,
  FaDollarSign,
  FaArrowRight,
  FaExclamationTriangle,
  FaCheckCircle,
  FaCrown,
} from "react-icons/fa";

/* ─── Constants ─── */
const FINANCE_ROLES = ["org_owner", "admin", "moderator"];
const STAFF_ROLES   = ["org_owner", "admin", "moderator", "teacher"];

const GRADE_COLORS = {
  "A+": "#10b981", A: "#22c55e", "A-": "#06b6d4",
  B: "#6366f1", C: "#f59e0b", D: "#f97316", F: "#ef4444",
};
const FIN_BAR_COLORS = ["#10b981", "#ef4444", "#f59e0b", "#6366f1"];
const FEE_STATUS_COLORS = { paid: "#10b981", partial: "#f59e0b", pending: "#06b6d4", overdue: "#ef4444" };
const ATTEND_COLORS = { Present: "#10b981", Absent: "#ef4444", Late: "#f59e0b", Excused: "#06b6d4" };

const ROLE_LABEL = {
  org_owner: "Owner", admin: "Admin", moderator: "Moderator",
  teacher: "Teacher", student: "Student", parent: "Parent",
};

const EXAM_BADGE = {
  upcoming: "badge-info", ongoing: "badge-warning", completed: "badge-success",
};
const MODE_BADGE = {
  cash: "badge-success", bank: "badge-primary", online: "badge-info", cheque: "badge-warning",
};
const SUB_STATUS_BADGE = {
  active: "badge-success", trial: "badge-warning",
  expired: "badge-error", suspended: "badge-error",
};

/* ─── Helpers ─── */
const fmt = (n) => (n || 0).toLocaleString();
const fmtCurrency = (n) => `$${(n || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

const getUsagePct = (value, limit) => {
  if (!limit || limit <= 0) return null;
  return Math.min(100, Math.round((value / limit) * 100));
};
const getUsageColor = (pct) => {
  if (pct >= 90) return "bg-error";
  if (pct >= 70) return "bg-warning";
  return "bg-success";
};

/* ─── Sub-components ─── */
const SectionHeader = ({ icon: Icon, iconColor, iconBg, title, subtitle, linkTo, linkLabel }) => (
  <div className="flex items-start justify-between mb-5 gap-3">
    <div className="flex items-center gap-3">
      <div className={`p-2.5 rounded-xl ${iconBg} shrink-0`}>
        <Icon className={`${iconColor} text-lg`} />
      </div>
      <div>
        <h2 className="text-lg font-bold text-base-content">{title}</h2>
        {subtitle && <p className="text-xs text-base-content/50 mt-0.5">{subtitle}</p>}
      </div>
    </div>
    {linkTo && (
      <Link
        to={linkTo}
        className="btn btn-ghost btn-sm gap-1 text-primary shrink-0 hover:bg-primary/10 transition-all"
      >
        {linkLabel || "View All"} <FaArrowRight className="text-xs" />
      </Link>
    )}
  </div>
);

const ChartTooltipStyle = {
  borderRadius: "12px",
  border: "1px solid oklch(0.7 0 0 / 0.15)",
  boxShadow: "0 4px 20px oklch(0 0 0 / 0.1)",
  fontSize: "12px",
};

const EmptyChart = ({ message = "No data available yet" }) => (
  <div className="flex flex-col items-center justify-center h-full gap-2 text-base-content/30">
    <FaChartLine className="text-3xl" />
    <p className="text-sm">{message}</p>
  </div>
);

/* ─── Main Component ─── */
const Overview = () => {
  const axiosSecure  = useAxiosSecure();
  const { organizationId, userRole } = useAuth();
  const { organization } = useOrganization();

  const [loading, setLoading]               = useState(true);
  const [stats, setStats]                   = useState(null);
  const [finance, setFinance]               = useState(null);
  const [attendance, setAttendance]         = useState(null);
  const [academic, setAcademic]             = useState(null);
  const [recentExams, setRecentExams]       = useState([]);
  const [recentPayments, setRecentPayments] = useState([]);

  const canSeeFinance  = FINANCE_ROLES.includes(userRole);
  const canSeeReports  = STAFF_ROLES.includes(userRole);
  const currentMonth   = new Date().toISOString().slice(0, 7);
  const today          = new Date().toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  useEffect(() => {
    if (!organizationId) return;

    const fetchAll = async () => {
      const calls = [
        axiosSecure.get(`/organizations/${organizationId}/stats`),
        canSeeFinance  ? axiosSecure.get("/reports/finance") : Promise.resolve(null),
        canSeeReports  ? axiosSecure.get(`/reports/attendance?month=${currentMonth}`) : Promise.resolve(null),
        canSeeReports  ? axiosSecure.get("/reports/academic") : Promise.resolve(null),
        axiosSecure.get("/exams?limit=5&page=1"),
        canSeeFinance  ? axiosSecure.get("/payments?limit=5") : Promise.resolve(null),
      ];

      const results = await Promise.allSettled(calls);

      if (results[0].status === "fulfilled" && results[0].value?.data?.success)
        setStats(results[0].value.data.data);
      if (results[1].status === "fulfilled" && results[1].value?.data?.success)
        setFinance(results[1].value.data.data);
      if (results[2].status === "fulfilled" && results[2].value?.data?.success)
        setAttendance(results[2].value.data.data);
      if (results[3].status === "fulfilled" && results[3].value?.data?.success)
        setAcademic(results[3].value.data.data);
      if (results[4].status === "fulfilled" && results[4].value?.data?.success)
        setRecentExams(results[4].value.data.data || []);
      if (results[5].status === "fulfilled" && results[5].value?.data?.success)
        setRecentPayments(results[5].value.data.data || []);

      setLoading(false);
    };

    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizationId, userRole]);

  if (loading) return <Loader />;

  /* ── Derived chart data ── */
  const peopleCards = [
    { label: "Students",  value: stats?.totalStudents  || 0, limit: stats?.limits?.maxStudents,  icon: FaUserGraduate,    color: "text-primary",   bg: "bg-primary/10",   border: "border-primary/20"   },
    { label: "Teachers",  value: stats?.totalTeachers  || 0, limit: stats?.limits?.maxTeachers,  icon: FaChalkboardTeacher, color: "text-secondary", bg: "bg-secondary/10", border: "border-secondary/20" },
    { label: "Classes",   value: stats?.totalClasses   || 0, limit: stats?.limits?.maxClasses,   icon: FaLayerGroup,      color: "text-accent",    bg: "bg-accent/10",    border: "border-accent/20"    },
    { label: "Sections",  value: stats?.totalSections  || 0, limit: undefined,                   icon: FaClipboardList,   color: "text-info",      bg: "bg-info/10",      border: "border-info/20"      },
    { label: "Subjects",  value: stats?.totalSubjects  || 0, limit: undefined,                   icon: FaBookOpen,        color: "text-warning",   bg: "bg-warning/10",   border: "border-warning/20"   },
    { label: "Users",     value: stats?.totalUsers     || 0, limit: undefined,                   icon: FaUsers,           color: "text-success",   bg: "bg-success/10",   border: "border-success/20"   },
  ];

  const netBal = finance?.netPosition?.netBalance ?? 0;
  const financeCards = [
    { label: "Total Collected",  value: fmtCurrency(finance?.income?.totalCollected),      icon: FaMoneyBillWave,       color: "text-success", bg: "bg-success/10",  border: "border-success/20",  sub: `${fmt(finance?.income?.paymentCount)} payments` },
    { label: "Outstanding Fees", value: fmtCurrency(finance?.feeDues?.totalOutstanding),   icon: FaExclamationTriangle, color: "text-warning", bg: "bg-warning/10",  border: "border-warning/20",  sub: `${fmt(finance?.feeDues?.overdueCount)} overdue` },
    { label: "Total Expenses",   value: fmtCurrency((finance?.expenses?.totalExpenses || 0) + (finance?.salaries?.totalPaid || 0)), icon: FaChartLine, color: "text-error", bg: "bg-error/10", border: "border-error/20", sub: "Expenses + salaries" },
    { label: "Net Balance",      value: fmtCurrency(netBal),                               icon: FaDollarSign,          color: netBal >= 0 ? "text-success" : "text-error", bg: netBal >= 0 ? "bg-success/10" : "bg-error/10", border: netBal >= 0 ? "border-success/20" : "border-error/20", sub: netBal >= 0 ? "Positive balance" : "Deficit" },
  ];

  const attendancePie = attendance?.summary
    ? [
        { name: "Present", value: attendance.summary.present  || 0 },
        { name: "Absent",  value: attendance.summary.absent   || 0 },
        { name: "Late",    value: attendance.summary.late     || 0 },
        { name: "Excused", value: attendance.summary.excused  || 0 },
      ].filter((d) => d.value > 0)
    : [];

  const gradeBarData = academic?.gradeDistribution
    ? Object.entries(GRADE_COLORS).map(([grade, fill]) => ({
        grade,
        count: academic.gradeDistribution[grade] || 0,
        fill,
      }))
    : [];

  const financeBarData = finance
    ? [
        { name: "Collected",   value: finance.income?.totalCollected   || 0 },
        { name: "Expenses",    value: finance.expenses?.totalExpenses  || 0 },
        { name: "Salaries",    value: finance.salaries?.totalPaid      || 0 },
        { name: "Outstanding", value: finance.feeDues?.totalOutstanding || 0 },
      ]
    : [];

  const feeStatusPie = finance?.feeDues?.byStatus
    ? Object.entries(FEE_STATUS_COLORS).map(([k, fill]) => ({
        name: k.charAt(0).toUpperCase() + k.slice(1),
        value: finance.feeDues.byStatus[k] || 0,
        fill,
      })).filter((d) => d.value > 0)
    : [];

  /* ── Quick actions by role ── */
  const ALL_ACTIONS = [
    { to: "/dashboard/students",       icon: FaUserGraduate,      label: "Students",        color: "btn-primary",   roles: ["org_owner","admin","moderator"] },
    { to: "/dashboard/teachers",       icon: FaChalkboardTeacher, label: "Teachers",        color: "btn-secondary", roles: ["org_owner","admin","moderator"] },
    { to: "/dashboard/classes",        icon: FaSchool,            label: "Classes",         color: "btn-accent",    roles: ["org_owner","admin"] },
    { to: "/dashboard/attendance/mark",icon: FaClipboardCheck,    label: "Mark Attendance", color: "btn-info",      roles: ["org_owner","admin","moderator","teacher"] },
    { to: "/dashboard/exams",          icon: FaFileAlt,           label: "Exams",           color: "btn-warning",   roles: ["org_owner","admin","moderator","teacher","student","parent"] },
    { to: "/dashboard/grade-entry",    icon: FaGraduationCap,     label: "Grade Entry",     color: "btn-primary",   roles: ["teacher"] },
    { to: "/dashboard/my-submissions", icon: FaClipboardList,     label: "My Submissions",  color: "btn-secondary", roles: ["teacher"] },
    { to: "/dashboard/collect-payment",icon: FaMoneyBillWave,     label: "Collect Payment", color: "btn-success",   roles: ["org_owner","admin"] },
    { to: "/dashboard/reports",        icon: FaChartLine,         label: "Reports",         color: "btn-info",      roles: ["org_owner","admin","moderator","teacher"] },
    { to: "/dashboard/announcements",  icon: FaBolt,              label: "Announcements",   color: "btn-accent",    roles: ["org_owner","admin","moderator","teacher","student","parent"] },
    { to: "/dashboard/my-results",     icon: FaTrophy,            label: "My Results",      color: "btn-success",   roles: ["student"] },
    { to: "/dashboard/my-fees",        icon: FaMoneyBillWave,     label: "My Fees",         color: "btn-warning",   roles: ["student"] },
    { to: "/dashboard/child-fees",     icon: FaMoneyBillWave,     label: "Child Fees",      color: "btn-success",   roles: ["parent"] },
    { to: "/dashboard/activity-logs",  icon: FaClipboardList,     label: "Activity Logs",   color: "btn-ghost",     roles: ["org_owner","admin"] },
  ];
  const quickActions = ALL_ACTIONS.filter((a) => a.roles.includes(userRole));

  /* ─────────────────────────────────────── RENDER ─────────────────────────────────────── */
  return (
    <div className="space-y-6 sm:space-y-8 pb-10 animate-in fade-in duration-500">

      {/* ── Fixed background blobs ── */}
      <div className="fixed top-0 right-0 w-96 h-96 bg-linear-to-br from-primary/20 via-secondary/20 to-accent/20 rounded-full blur-3xl animate-pulse pointer-events-none opacity-30" />
      <div className="fixed bottom-0 left-0 w-72 h-72 bg-linear-to-tr from-info/20 via-success/20 to-warning/20 rounded-full blur-3xl animate-pulse pointer-events-none opacity-30 animation-delay-2000" />

      {/* ════════════════════════════════════════
          §1  GRADIENT BANNER HEADER
      ════════════════════════════════════════ */}
      <div
        className="relative overflow-hidden rounded-2xl bg-linear-to-br from-primary via-primary/90 to-secondary p-6 sm:p-8 shadow-lg animate-in slide-in-from-bottom duration-500"
        style={{ animationDelay: "0ms" }}
      >
        {/* dot pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAtNi42MjcgNS4zNzMtMTIgMTItMTJzMTIgNS4zNzMgMTIgMTItNS4zNzMgMTItMTIgMTItMTItNS4zNzMtMTItMTJ6bS0xMiAxMmMwLTYuNjI3IDUuMzczLTEyIDEyLTEyczEyIDUuMzczIDEyIDEyLTUuMzczIDEyLTEyIDEyLTEyLTUuMzczLTEyLTEyem0wIDI0YzAtNi42MjcgNS4zNzMtMTIgMTItMTJzMTIgNS4zNzMgMTIgMTItNS4zNzMgMTItMTIgMTItMTItNS4zNzMtMTItMTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-10" />

        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Left: org + date */}
          <div className="flex items-center gap-4">
            <div className="p-3 sm:p-4 bg-white/10 backdrop-blur-sm rounded-2xl shadow-lg animate-bounce-slow shrink-0">
              <FaSchool className="text-2xl sm:text-4xl text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-3xl font-bold text-white leading-tight">
                {organization?.name || "School Dashboard"}
              </h1>
              <p className="text-white/70 text-xs sm:text-sm mt-1 flex items-center gap-1.5">
                <FaCalendarAlt className="text-white/50 shrink-0" />
                {today}
              </p>
            </div>
          </div>

          {/* Right: badges */}
          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            {userRole && (
              <span className="badge badge-lg bg-white/15 text-white border-white/20 backdrop-blur-sm font-semibold capitalize">
                {ROLE_LABEL[userRole] || userRole}
              </span>
            )}
            <span className="badge badge-lg bg-white/15 text-white border-white/20 backdrop-blur-sm capitalize">
              <FaCrown className="mr-1 text-yellow-300" />
              {stats?.subscriptionTier || "Free"} Plan
            </span>
            <span className={`badge badge-lg ${SUB_STATUS_BADGE[stats?.subscriptionStatus] || "badge-ghost"} capitalize`}>
              {stats?.subscriptionStatus || "Unknown"}
            </span>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════
          §2  PEOPLE & RESOURCES STAT CARDS
      ════════════════════════════════════════ */}
      <div
        className="animate-in slide-in-from-bottom duration-500"
        style={{ animationDelay: "80ms" }}
      >
        <div className="flex items-center gap-2 mb-4">
          <FaUsers className="text-primary" />
          <h2 className="text-base font-bold text-base-content/70 uppercase tracking-wide text-sm">
            People & Resources
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {peopleCards.map((card, idx) => {
            const pct = getUsagePct(card.value, card.limit);
            return (
              <div
                key={card.label}
                className={`relative overflow-hidden bg-gradient-to-br from-base-100 to-base-200/50 border ${card.border} rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 p-4 sm:p-5`}
                style={{ animationDelay: `${80 + idx * 55}ms` }}
              >
                {/* subtle top accent */}
                <div className={`absolute top-0 left-0 w-full h-0.5 ${card.bg.replace("/10", "")}`} />
                <div className="flex flex-col items-center text-center gap-2">
                  <div className={`w-11 h-11 rounded-xl ${card.bg} flex items-center justify-center`}>
                    <card.icon className={`text-xl ${card.color}`} />
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold text-base-content tabular-nums">
                    {fmt(card.value)}
                  </p>
                  <p className="text-xs font-medium text-base-content/50">{card.label}</p>

                  {/* Usage bar */}
                  {pct !== null && (
                    <div className="w-full mt-1">
                      <div className="flex justify-between text-[10px] text-base-content/40 mb-1">
                        <span>{pct}% used</span>
                        <span>/{fmt(card.limit)}</span>
                      </div>
                      <div className="w-full h-1.5 bg-base-300/50 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${getUsageColor(pct)} rounded-full transition-all duration-700`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ════════════════════════════════════════
          §3  FINANCIAL SUMMARY CARDS  (finance roles)
      ════════════════════════════════════════ */}
      {canSeeFinance && (
        <div
          className="animate-in slide-in-from-bottom duration-500"
          style={{ animationDelay: "200ms" }}
        >
          <div className="flex items-center gap-2 mb-4">
            <FaMoneyBillWave className="text-success" />
            <h2 className="text-base font-bold text-base-content/70 uppercase tracking-wide text-sm">
              Financial Summary
            </h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {financeCards.map((card, idx) => (
              <div
                key={card.label}
                className={`bg-gradient-to-br from-base-100 to-base-200/50 border ${card.border} rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 p-4 sm:p-5`}
                style={{ animationDelay: `${200 + idx * 55}ms` }}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2.5 ${card.bg} rounded-xl shrink-0`}>
                    <card.icon className={`${card.color} text-lg`} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-base-content/50 font-medium truncate">{card.label}</p>
                    <p className={`text-xl sm:text-2xl font-bold ${card.color} mt-0.5 tabular-nums`}>
                      {finance ? card.value : "—"}
                    </p>
                    {card.sub && (
                      <p className="text-[10px] text-base-content/40 mt-1">{card.sub}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════
          §4  ATTENDANCE + ACADEMIC  (staff roles)
      ════════════════════════════════════════ */}
      {canSeeReports && (
        <div
          className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 animate-in slide-in-from-bottom duration-500"
          style={{ animationDelay: "300ms" }}
        >
          {/* ── Attendance card ── */}
          <div className="bg-gradient-to-br from-base-100 to-base-200/50 border border-base-300/50 rounded-2xl shadow-md p-5 sm:p-6">
            <SectionHeader
              icon={FaClipboardCheck}
              iconColor="text-info"
              iconBg="bg-info/10"
              title="Attendance Overview"
              subtitle={`This month · ${currentMonth}`}
              linkTo="/dashboard/attendance/reports"
              linkLabel="Reports"
            />

            {attendance?.summary ? (
              <>
                {/* Hero % */}
                <div className="flex flex-wrap gap-3 mb-5">
                  {[
                    { label: "Present",  value: attendance.summary.present,  color: "bg-success/10 text-success border-success/20" },
                    { label: "Absent",   value: attendance.summary.absent,   color: "bg-error/10 text-error border-error/20"       },
                    { label: "Late",     value: attendance.summary.late,     color: "bg-warning/10 text-warning border-warning/20" },
                    { label: "Excused",  value: attendance.summary.excused,  color: "bg-info/10 text-info border-info/20"          },
                  ].map((s) => (
                    <div
                      key={s.label}
                      className={`flex-1 min-w-[60px] border rounded-xl p-2.5 text-center ${s.color}`}
                    >
                      <p className="text-lg font-bold tabular-nums">{fmt(s.value)}</p>
                      <p className="text-[10px] font-medium">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Donut chart */}
                {attendancePie.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={attendancePie}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        dataKey="value"
                        paddingAngle={3}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {attendancePie.map((entry, i) => (
                          <Cell key={i} fill={ATTEND_COLORS[entry.name] || "#6366f1"} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={ChartTooltipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-48"><EmptyChart message="No attendance data this month" /></div>
                )}

                {/* Attendance % footer */}
                <div className="mt-3 flex items-center justify-between text-sm border-t border-base-300/50 pt-3">
                  <span className="text-base-content/50 font-medium">Overall Attendance</span>
                  <span
                    className={`font-bold text-base ${
                      (attendance.summary.attendancePercentage || 0) >= 75 ? "text-success" : "text-error"
                    }`}
                  >
                    {(attendance.summary.attendancePercentage || 0).toFixed(1)}%
                  </span>
                </div>
              </>
            ) : (
              <div className="h-48 flex items-center justify-center text-base-content/30 text-sm">
                Attendance data not available
              </div>
            )}
          </div>

          {/* ── Academic performance card ── */}
          <div className="bg-gradient-to-br from-base-100 to-base-200/50 border border-base-300/50 rounded-2xl shadow-md p-5 sm:p-6">
            <SectionHeader
              icon={FaGraduationCap}
              iconColor="text-secondary"
              iconBg="bg-secondary/10"
              title="Academic Performance"
              subtitle="All published grades"
              linkTo="/dashboard/results"
              linkLabel="Results"
            />

            {academic?.summary ? (
              <>
                {/* Hero stats */}
                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div className="bg-secondary/5 border border-secondary/20 rounded-xl p-3 text-center">
                    <p className="text-2xl sm:text-3xl font-bold text-secondary tabular-nums">
                      {(academic.summary.averageMarks || 0).toFixed(1)}%
                    </p>
                    <p className="text-xs text-base-content/50 mt-1 font-medium">Avg. Marks</p>
                  </div>
                  <div className="bg-success/5 border border-success/20 rounded-xl p-3 text-center">
                    <p className="text-2xl sm:text-3xl font-bold text-success tabular-nums">
                      {(academic.summary.passRate || 0).toFixed(1)}%
                    </p>
                    <p className="text-xs text-base-content/50 mt-1 font-medium">Pass Rate</p>
                  </div>
                </div>

                {/* Grade distribution bar */}
                {gradeBarData.some((d) => d.count > 0) ? (
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={gradeBarData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.7 0 0 / 0.15)" />
                      <XAxis dataKey="grade" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip
                        contentStyle={ChartTooltipStyle}
                        formatter={(v) => [v, "Students"]}
                      />
                      <Bar dataKey="count" radius={[5, 5, 0, 0]}>
                        {gradeBarData.map((entry, i) => (
                          <Cell key={i} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-44"><EmptyChart message="No published grades yet" /></div>
                )}
              </>
            ) : (
              <div className="h-48 flex items-center justify-center text-base-content/30 text-sm">
                Academic data not available
              </div>
            )}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════
          §5  FINANCIAL CHARTS  (finance roles)
      ════════════════════════════════════════ */}
      {canSeeFinance && finance && (
        <div
          className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 animate-in slide-in-from-bottom duration-500"
          style={{ animationDelay: "380ms" }}
        >
          {/* Income vs Expenses bar chart */}
          <div className="bg-gradient-to-br from-base-100 to-base-200/50 border border-base-300/50 rounded-2xl shadow-md p-5 sm:p-6">
            <SectionHeader
              icon={FaChartLine}
              iconColor="text-primary"
              iconBg="bg-primary/10"
              title="Financial Breakdown"
              subtitle="Income, expenses & outstanding"
              linkTo="/dashboard/finance-reports"
              linkLabel="Finance Reports"
            />

            {financeBarData.some((d) => d.value > 0) ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={financeBarData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.7 0 0 / 0.15)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis
                    tick={{ fontSize: 10 }}
                    tickFormatter={(v) =>
                      v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`
                    }
                    width={50}
                  />
                  <Tooltip
                    contentStyle={ChartTooltipStyle}
                    formatter={(v) => [fmtCurrency(v), ""]}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {financeBarData.map((_, i) => (
                      <Cell key={i} fill={FIN_BAR_COLORS[i % FIN_BAR_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-52"><EmptyChart message="No financial data available" /></div>
            )}
          </div>

          {/* Fee status donut */}
          <div className="bg-gradient-to-br from-base-100 to-base-200/50 border border-base-300/50 rounded-2xl shadow-md p-5 sm:p-6">
            <SectionHeader
              icon={FaDollarSign}
              iconColor="text-warning"
              iconBg="bg-warning/10"
              title="Fee Collection Status"
              subtitle="Current fee dues breakdown"
              linkTo="/dashboard/fee-dues"
              linkLabel="Fee Dues"
            />

            {feeStatusPie.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={feeStatusPie}
                      cx="50%"
                      cy="50%"
                      innerRadius={52}
                      outerRadius={85}
                      dataKey="value"
                      paddingAngle={3}
                    >
                      {feeStatusPie.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={ChartTooltipStyle} />
                    <Legend
                      iconType="circle"
                      iconSize={8}
                      formatter={(v) => <span style={{ fontSize: 11 }}>{v}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>

                {/* Summary row */}
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {feeStatusPie.map((s) => (
                    <div
                      key={s.name}
                      className="flex items-center gap-2 p-2 rounded-xl bg-base-200/40"
                    >
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.fill }} />
                      <span className="text-xs text-base-content/60 font-medium truncate">{s.name}</span>
                      <span className="text-xs font-bold text-base-content ml-auto tabular-nums">{fmt(s.value)}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-52"><EmptyChart message="No fee records available" /></div>
            )}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════
          §6  RECENT EXAMS TABLE  (all roles)
      ════════════════════════════════════════ */}
      <div
        className="bg-gradient-to-br from-base-100 to-base-200/50 border border-base-300/50 rounded-2xl shadow-md p-5 sm:p-6 animate-in slide-in-from-bottom duration-500"
        style={{ animationDelay: "450ms" }}
      >
        <SectionHeader
          icon={FaFileAlt}
          iconColor="text-accent"
          iconBg="bg-accent/10"
          title="Recent Exams"
          subtitle="Latest 5 examinations"
          linkTo="/dashboard/exams"
        />

        {recentExams.length > 0 ? (
          <div className="overflow-x-auto -mx-5 sm:-mx-6 px-5 sm:px-6">
            <table className="table table-sm w-full min-w-[560px]">
              <thead>
                <tr className="text-base-content/50 text-xs uppercase tracking-wide">
                  <th className="bg-transparent font-semibold">Exam</th>
                  <th className="bg-transparent font-semibold">Class</th>
                  <th className="bg-transparent font-semibold hidden sm:table-cell">Year</th>
                  <th className="bg-transparent font-semibold hidden md:table-cell">Dates</th>
                  <th className="bg-transparent font-semibold">Status</th>
                  <th className="bg-transparent font-semibold">Submissions</th>
                </tr>
              </thead>
              <tbody>
                {recentExams.map((exam) => {
                  const subStatus = exam.submissionStatus || {};
                  const total     = Object.values(subStatus).reduce((a, b) => a + b, 0);
                  const published = subStatus.published || 0;
                  const pubPct    = total > 0 ? Math.round((published / total) * 100) : 0;
                  return (
                    <tr key={exam._id} className="hover:bg-base-200/50 transition-colors">
                      <td className="font-semibold text-base-content">
                        <Link
                          to={`/dashboard/exams/${exam._id}`}
                          className="hover:text-primary transition-colors"
                        >
                          {exam.name}
                        </Link>
                      </td>
                      <td className="text-base-content/70 text-xs">{exam.className}</td>
                      <td className="text-base-content/60 text-xs hidden sm:table-cell">{exam.academicYear}</td>
                      <td className="text-base-content/60 text-xs hidden md:table-cell whitespace-nowrap">
                        {new Date(exam.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        {" → "}
                        {new Date(exam.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </td>
                      <td>
                        <span className={`badge badge-sm ${EXAM_BADGE[exam.status] || "badge-ghost"} capitalize`}>
                          {exam.status}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-base-300 rounded-full overflow-hidden hidden sm:block">
                            <div
                              className="h-full bg-success rounded-full"
                              style={{ width: `${pubPct}%` }}
                            />
                          </div>
                          <span className="text-xs text-base-content/60 tabular-nums whitespace-nowrap">
                            {published}/{total}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 gap-2 text-base-content/30">
            <FaFileAlt className="text-3xl" />
            <p className="text-sm">No exams created yet</p>
            {["org_owner","admin","teacher"].includes(userRole) && (
              <Link to="/dashboard/exams/add" className="btn btn-sm btn-primary mt-2">
                Create Exam
              </Link>
            )}
          </div>
        )}
      </div>

      {/* ════════════════════════════════════════
          §7  RECENT PAYMENTS TABLE  (finance roles)
      ════════════════════════════════════════ */}
      {canSeeFinance && (
        <div
          className="bg-gradient-to-br from-base-100 to-base-200/50 border border-base-300/50 rounded-2xl shadow-md p-5 sm:p-6 animate-in slide-in-from-bottom duration-500"
          style={{ animationDelay: "500ms" }}
        >
          <SectionHeader
            icon={FaMoneyBillWave}
            iconColor="text-success"
            iconBg="bg-success/10"
            title="Recent Payments"
            subtitle="Latest 5 fee collections"
            linkTo="/dashboard/student-fees"
            linkLabel="All Fees"
          />

          {recentPayments.length > 0 ? (
            <div className="overflow-x-auto -mx-5 sm:-mx-6 px-5 sm:px-6">
              <table className="table table-sm w-full min-w-[500px]">
                <thead>
                  <tr className="text-base-content/50 text-xs uppercase tracking-wide">
                    <th className="bg-transparent font-semibold">Student</th>
                    <th className="bg-transparent font-semibold">Amount</th>
                    <th className="bg-transparent font-semibold hidden sm:table-cell">Mode</th>
                    <th className="bg-transparent font-semibold hidden md:table-cell">Receipt</th>
                    <th className="bg-transparent font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentPayments.map((pmt) => (
                    <tr key={pmt._id} className="hover:bg-base-200/50 transition-colors">
                      <td>
                        <div>
                          <p className="font-semibold text-base-content text-sm">
                            {pmt.studentInfo?.name || "—"}
                          </p>
                          <p className="text-[10px] text-base-content/40">
                            {pmt.studentInfo?.admissionNumber}
                          </p>
                        </div>
                      </td>
                      <td className="font-bold text-success tabular-nums">
                        {fmtCurrency(pmt.amount)}
                      </td>
                      <td className="hidden sm:table-cell">
                        <span className={`badge badge-sm ${MODE_BADGE[pmt.paymentMode] || "badge-ghost"} capitalize`}>
                          {pmt.paymentMode}
                        </span>
                      </td>
                      <td className="text-xs text-base-content/50 hidden md:table-cell font-mono">
                        {pmt.receiptNumber}
                      </td>
                      <td className="text-xs text-base-content/60 whitespace-nowrap">
                        {new Date(pmt.paymentDate).toLocaleDateString("en-US", {
                          month: "short", day: "numeric", year: "numeric",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 gap-2 text-base-content/30">
              <FaMoneyBillWave className="text-3xl" />
              <p className="text-sm">No payments recorded yet</p>
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════
          §8  QUICK ACTIONS
      ════════════════════════════════════════ */}
      {quickActions.length > 0 && (
        <div
          className="bg-gradient-to-br from-base-100 to-base-200/50 border border-base-300/50 rounded-2xl shadow-md p-5 sm:p-6 animate-in slide-in-from-bottom duration-500"
          style={{ animationDelay: "560ms" }}
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2.5 rounded-xl bg-primary/10 shrink-0">
              <FaBolt className="text-primary text-lg" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-base-content">Quick Actions</h2>
              <p className="text-xs text-base-content/50 mt-0.5">Jump to frequently used sections</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {quickActions.map((action) => (
              <Link
                key={action.to}
                to={action.to}
                className={`btn btn-outline ${action.color} btn-sm h-auto py-3 flex flex-col gap-1.5 hover:scale-105 transition-all duration-200`}
              >
                <action.icon className="text-lg" />
                <span className="text-xs font-semibold leading-tight text-center">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── Inline keyframes ── */}
      <style>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .animate-bounce-slow { animation: bounce-slow 3s ease-in-out infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
      `}</style>
    </div>
  );
};

export default Overview;
