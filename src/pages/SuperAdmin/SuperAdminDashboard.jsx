import { useEffect, useState } from "react";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import { useNotification } from "../../contexts/NotificationContext";
import Loader from "../../components/Loader";
import {
  FaBuilding,
  FaUsers,
  FaUserGraduate,
  FaChalkboardTeacher,
  FaCrown,
  FaMoneyBillWave,
  FaChartLine,
  FaExclamationTriangle,
} from "react-icons/fa";
import { Link } from "react-router";
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

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

const SuperAdminDashboard = () => {
  const axiosSecure = useAxiosSecure();
  const { error: showError } = useNotification();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await axiosSecure.get("/super-admin/dashboard");
        if (res.data.success) {
          setDashboardData(res.data.data);
        }
      } catch (error) {
        showError(error.response?.data?.message || "Failed to fetch dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [axiosSecure, showError]);

  if (loading) return <Loader />;

  const { platformStats, subscriptionStats, recentActivity, revenueStats } = dashboardData || {};

  const statCards = [
    {
      label: "Total Organizations",
      value: platformStats?.totalOrganizations || 0,
      icon: FaBuilding,
      color: "text-primary",
      bg: "bg-primary/10",
      border: "border-primary/20",
    },
    {
      label: "Active Organizations",
      value: platformStats?.activeOrganizations || 0,
      icon: FaCrown,
      color: "text-success",
      bg: "bg-success/10",
      border: "border-success/20",
    },
    {
      label: "Total Users",
      value: platformStats?.totalUsers || 0,
      icon: FaUsers,
      color: "text-info",
      bg: "bg-info/10",
      border: "border-info/20",
    },
    {
      label: "Total Students",
      value: platformStats?.totalStudents || 0,
      icon: FaUserGraduate,
      color: "text-secondary",
      bg: "bg-secondary/10",
      border: "border-secondary/20",
    },
    {
      label: "Total Teachers",
      value: platformStats?.totalTeachers || 0,
      icon: FaChalkboardTeacher,
      color: "text-accent",
      bg: "bg-accent/10",
      border: "border-accent/20",
    },
    {
      label: "Suspended Orgs",
      value: platformStats?.suspendedOrganizations || 0,
      icon: FaExclamationTriangle,
      color: "text-error",
      bg: "bg-error/10",
      border: "border-error/20",
    },
  ];

  const subscriptionChartData = [
    { name: "Free", value: subscriptionStats?.free || 0 },
    { name: "Basic", value: subscriptionStats?.basic || 0 },
    { name: "Professional", value: subscriptionStats?.professional || 0 },
    { name: "Enterprise", value: subscriptionStats?.enterprise || 0 },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Background blobs */}
      <div className="fixed top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 rounded-full blur-3xl animate-pulse pointer-events-none opacity-30" />
      <div className="fixed bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-info/20 via-success/20 to-warning/20 rounded-full blur-3xl animate-pulse pointer-events-none opacity-30" />

      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-secondary p-8 shadow-lg">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-white mb-2">Super Admin Dashboard</h1>
          <p className="text-white/80">Platform Overview & Management</p>
        </div>
      </div>

      {/* Platform Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className={`bg-gradient-to-br from-base-100 to-base-200/50 border ${stat.border} rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 p-6 animate-in slide-in-from-bottom`}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-center gap-4">
              <div className={`p-4 ${stat.bg} rounded-xl`}>
                <stat.icon className={`text-2xl ${stat.color}`} />
              </div>
              <div className="flex-1">
                <p className="text-sm text-base-content/60 font-medium">{stat.label}</p>
                <p className="text-3xl font-bold text-base-content mt-1">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-base-100 to-base-200/50 border border-base-300/50 rounded-2xl shadow-md p-6">
          <div className="flex items-center gap-3 mb-4">
            <FaMoneyBillWave className="text-2xl text-success" />
            <h2 className="text-xl font-bold">Revenue Stats</h2>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-base-content/60">Monthly Revenue</p>
              <p className="text-2xl font-bold text-success">
                {revenueStats?.currency} {revenueStats?.monthlyRevenue?.toLocaleString() || 0}
              </p>
            </div>
            <div>
              <p className="text-sm text-base-content/60">Yearly Revenue</p>
              <p className="text-2xl font-bold text-info">
                {revenueStats?.currency} {revenueStats?.yearlyRevenue?.toLocaleString() || 0}
              </p>
            </div>
            <div className="pt-4 border-t border-base-300">
              <p className="text-sm text-base-content/60">Active Subscriptions</p>
              <p className="text-xl font-semibold">{subscriptionStats?.activeSubscriptions || 0}</p>
            </div>
            <div>
              <p className="text-sm text-base-content/60">Trial Organizations</p>
              <p className="text-xl font-semibold">{subscriptionStats?.trialOrganizations || 0}</p>
            </div>
          </div>
        </div>

        {/* Subscription Distribution Chart */}
        <div className="bg-gradient-to-br from-base-100 to-base-200/50 border border-base-300/50 rounded-2xl shadow-md p-6">
          <div className="flex items-center gap-3 mb-4">
            <FaChartLine className="text-2xl text-primary" />
            <h2 className="text-xl font-bold">Subscription Distribution</h2>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={subscriptionChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name}: ${entry.value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {subscriptionChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-gradient-to-br from-base-100 to-base-200/50 border border-base-300/50 rounded-2xl shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-base-200/50 rounded-xl border border-base-300/50">
            <p className="text-sm text-base-content/60 mb-1">New Organizations (This Month)</p>
            <p className="text-2xl font-bold text-primary">
              {recentActivity?.newOrganizationsThisMonth || 0}
            </p>
          </div>
          <div className="p-4 bg-base-200/50 rounded-xl border border-base-300/50">
            <p className="text-sm text-base-content/60 mb-1">Pending Subscription Requests</p>
            <p className="text-2xl font-bold text-warning">
              {recentActivity?.pendingSubscriptionRequests || 0}
            </p>
          </div>
          <div className="p-4 bg-base-200/50 rounded-xl border border-base-300/50">
            <p className="text-sm text-base-content/60 mb-1">Pending Reactivation Requests</p>
            <p className="text-2xl font-bold text-info">
              {recentActivity?.pendingReactivationRequests || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-br from-base-100 to-base-200/50 border border-base-300/50 rounded-2xl shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/dashboard/super-admin/organizations"
            className="btn btn-outline btn-primary"
          >
            <FaBuilding /> Manage Organizations
          </Link>
          <Link
            to="/dashboard/super-admin/subscription-requests"
            className="btn btn-outline btn-warning"
          >
            <FaCrown /> Review Requests
          </Link>
          <Link
            to="/dashboard/super-admin/users"
            className="btn btn-outline btn-info"
          >
            <FaUsers /> Manage Users
          </Link>
          <Link
            to="/dashboard/super-admin/reports"
            className="btn btn-outline btn-secondary"
          >
            <FaChartLine /> View Reports
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
