import { useEffect, useState } from "react";
import useAuth from "../../hooks/useAuth";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import { useOrganization } from "../../contexts/organization/OrganizationContext";
import Loader from "../../components/Loader";
import {
  FaUserGraduate,
  FaChalkboardTeacher,
  FaLayerGroup,
  FaBookOpen,
  FaUsers,
  FaClipboardList,
} from "react-icons/fa";
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
} from "recharts";

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

const Overview = () => {
  const axiosSecure = useAxiosSecure();
  const { organizationId } = useAuth();
  const { organization } = useOrganization();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!organizationId) return;
      try {
        const res = await axiosSecure.get(`/organizations/${organizationId}/stats`);
        if (res.data.success) {
          setStats(res.data.data);
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [organizationId, axiosSecure]);

  if (loading) return <Loader />;

  const statCards = [
    {
      label: "Students",
      value: stats?.totalStudents || 0,
      limit: stats?.limits?.maxStudents,
      icon: FaUserGraduate,
      color: "text-primary",
      bg: "bg-primary/10",
      border: "border-primary/20",
    },
    {
      label: "Teachers",
      value: stats?.totalTeachers || 0,
      limit: stats?.limits?.maxTeachers,
      icon: FaChalkboardTeacher,
      color: "text-secondary",
      bg: "bg-secondary/10",
      border: "border-secondary/20",
    },
    {
      label: "Classes",
      value: stats?.totalClasses || 0,
      limit: stats?.limits?.maxClasses,
      icon: FaLayerGroup,
      color: "text-accent",
      bg: "bg-accent/10",
      border: "border-accent/20",
    },
    {
      label: "Sections",
      value: stats?.totalSections || 0,
      icon: FaClipboardList,
      color: "text-info",
      bg: "bg-info/10",
      border: "border-info/20",
    },
    {
      label: "Subjects",
      value: stats?.totalSubjects || 0,
      icon: FaBookOpen,
      color: "text-warning",
      bg: "bg-warning/10",
      border: "border-warning/20",
    },
    {
      label: "Users",
      value: stats?.totalUsers || 0,
      icon: FaUsers,
      color: "text-success",
      bg: "bg-success/10",
      border: "border-success/20",
    },
  ];

  const barChartData = [
    { name: "Students", count: stats?.totalStudents || 0 },
    { name: "Teachers", count: stats?.totalTeachers || 0 },
    { name: "Classes", count: stats?.totalClasses || 0 },
    { name: "Sections", count: stats?.totalSections || 0 },
    { name: "Subjects", count: stats?.totalSubjects || 0 },
  ];

  const pieData = barChartData.filter((d) => d.count > 0);

  const formatLimit = (limit) => {
    if (limit === -1 || limit === undefined) return "Unlimited";
    return limit;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-base-content">Dashboard Overview</h1>
        <p className="text-base-content/60 mt-1">
          Welcome to {organization?.name || "your school"}. Here&apos;s a quick summary.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((card, index) => (
          <div
            key={card.label}
            className={`card bg-base-100 border ${card.border} shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1`}
            style={{ animationDelay: `${index * 80}ms` }}
          >
            <div className="card-body p-4 items-center text-center">
              <div className={`w-12 h-12 rounded-xl ${card.bg} flex items-center justify-center`}>
                <card.icon className={`text-xl ${card.color}`} />
              </div>
              <p className="text-2xl font-bold text-base-content">{card.value}</p>
              <p className="text-xs text-base-content/50">{card.label}</p>
              {card.limit !== undefined && (
                <p className="text-xs text-base-content/40">
                  Limit: {formatLimit(card.limit)}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="card bg-base-100 border border-base-300/50 shadow-sm">
          <div className="card-body">
            <h2 className="card-title text-base text-base-content/80">Resource Distribution</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.7 0 0 / 0.2)" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid oklch(0.7 0 0 / 0.2)",
                    }}
                  />
                  <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="card bg-base-100 border border-base-300/50 shadow-sm">
          <div className="card-body">
            <h2 className="card-title text-base text-base-content/80">Composition</h2>
            <div className="h-64">
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={90}
                      dataKey="count"
                      nameKey="name"
                      label={({ name, count }) => `${name}: ${count}`}
                    >
                      {pieData.map((_, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-base-content/40">
                  No data to display yet
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Info */}
      <div className="card bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/20 shadow-sm">
        <div className="card-body p-4 flex-row items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-sm text-base-content/60">Current Plan</p>
            <p className="text-lg font-bold text-primary capitalize">
              {stats?.subscriptionTier || "Free"} Plan
            </p>
          </div>
          <div>
            <p className="text-sm text-base-content/60">Status</p>
            <span
              className={`badge badge-sm ${
                stats?.subscriptionStatus === "active"
                  ? "badge-success"
                  : stats?.subscriptionStatus === "trial"
                  ? "badge-warning"
                  : "badge-error"
              }`}
            >
              {stats?.subscriptionStatus || "Unknown"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
