import { useState, useEffect } from "react";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import { useNotification } from "../../contexts/NotificationContext";
import Loader from "../../components/Loader";
import {
  FaChartBar,
  FaBuilding,
  FaDollarSign,
  FaChartLine,
  FaUsers,
  FaDownload,
} from "react-icons/fa";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

const PlatformReports = () => {
  const axiosSecure = useAxiosSecure();
  const { success, error: showError } = useNotification();

  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("organizations");
  const [exporting, setExporting] = useState(null);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await axiosSecure.get("/super-admin/reports");
      if (res.data.success) {
        setReports(res.data.data);
      }
    } catch (error) {
      showError(error.response?.data?.message || "Failed to fetch reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleExport = async (type) => {
    setExporting(type);
    try {
      const res = await axiosSecure.get(`/super-admin/export/${type}`, {
        responseType: "blob",
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${type}_${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      success(`${type} data exported successfully`);
    } catch (error) {
      showError(error.response?.data?.message || `Failed to export ${type}`);
    } finally {
      setExporting(null);
    }
  };

  if (loading) return <Loader />;
  if (!reports) return <div className="p-6 text-center">No reports available</div>;

  const tabs = [
    { id: "organizations", label: "Organizations", icon: FaBuilding },
    { id: "revenue", label: "Revenue", icon: FaDollarSign },
    { id: "growth", label: "Growth", icon: FaChartLine },
    { id: "usage", label: "Usage", icon: FaUsers },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Background blobs */}
      <div className="fixed top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 rounded-full blur-3xl animate-pulse pointer-events-none opacity-30" />
      <div className="fixed bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-info/20 via-success/20 to-warning/20 rounded-full blur-3xl animate-pulse pointer-events-none opacity-30" />

      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-secondary p-8 shadow-lg">
        <div className="relative z-10 flex items-center gap-4">
          <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
            <FaChartBar className="text-2xl text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Platform Reports</h1>
            <p className="text-white/70 text-sm">View analytics and export data</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-gradient-to-br from-base-100 to-base-200/50 border border-base-300/50 rounded-2xl shadow-md p-2">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`btn btn-sm flex-1 min-w-[150px] ${
                  activeTab === tab.id ? "btn-primary" : "btn-ghost"
                }`}
              >
                <Icon className="text-sm" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* Organizations Tab */}
        {activeTab === "organizations" && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="stat bg-gradient-to-br from-base-100 to-base-200/50 border border-base-300/50 rounded-2xl shadow-md">
                <div className="stat-title">Total Organizations</div>
                <div className="stat-value text-primary">{reports.organizations?.total || 0}</div>
              </div>
              <div className="stat bg-gradient-to-br from-base-100 to-base-200/50 border border-base-300/50 rounded-2xl shadow-md">
                <div className="stat-title">Active</div>
                <div className="stat-value text-success">{reports.organizations?.active || 0}</div>
              </div>
              <div className="stat bg-gradient-to-br from-base-100 to-base-200/50 border border-base-300/50 rounded-2xl shadow-md">
                <div className="stat-title">Suspended</div>
                <div className="stat-value text-error">{reports.organizations?.suspended || 0}</div>
              </div>
              <div className="stat bg-gradient-to-br from-base-100 to-base-200/50 border border-base-300/50 rounded-2xl shadow-md">
                <div className="stat-title">Inactive</div>
                <div className="stat-value text-ghost">{reports.organizations?.inactive || 0}</div>
              </div>
            </div>

            {/* Organizations by Tier */}
            {reports.organizations?.byTier && (
              <div className="bg-gradient-to-br from-base-100 to-base-200/50 border border-base-300/50 rounded-2xl shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-base-content">Organizations by Tier</h3>
                  <button
                    onClick={() => handleExport("organizations")}
                    className="btn btn-sm btn-outline btn-primary"
                    disabled={exporting === "organizations"}
                  >
                    {exporting === "organizations" ? (
                      <span className="loading loading-spinner loading-xs" />
                    ) : (
                      <FaDownload />
                    )}
                    Export
                  </button>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={reports.organizations.byTier}
                      dataKey="count"
                      nameKey="tier"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label
                    >
                      {reports.organizations.byTier.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </>
        )}

        {/* Revenue Tab */}
        {activeTab === "revenue" && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="stat bg-gradient-to-br from-base-100 to-base-200/50 border border-base-300/50 rounded-2xl shadow-md">
                <div className="stat-title">Total Revenue</div>
                <div className="stat-value text-primary">
                  ${reports.revenue?.total?.toFixed(2) || 0}
                </div>
              </div>
              <div className="stat bg-gradient-to-br from-base-100 to-base-200/50 border border-base-300/50 rounded-2xl shadow-md">
                <div className="stat-title">Monthly Recurring</div>
                <div className="stat-value text-success">
                  ${reports.revenue?.monthly?.toFixed(2) || 0}
                </div>
              </div>
              <div className="stat bg-gradient-to-br from-base-100 to-base-200/50 border border-base-300/50 rounded-2xl shadow-md">
                <div className="stat-title">Yearly Recurring</div>
                <div className="stat-value text-info">
                  ${reports.revenue?.yearly?.toFixed(2) || 0}
                </div>
              </div>
            </div>

            {/* Revenue by Tier */}
            {reports.revenue?.byTier && (
              <div className="bg-gradient-to-br from-base-100 to-base-200/50 border border-base-300/50 rounded-2xl shadow-md p-6">
                <h3 className="text-lg font-bold text-base-content mb-4">Revenue by Tier</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={reports.revenue.byTier}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="tier" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="amount" fill="#3b82f6" name="Revenue ($)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </>
        )}

        {/* Growth Tab */}
        {activeTab === "growth" && (
          <>
            {/* New Organizations Over Time */}
            {reports.growth?.newOrganizations && (
              <div className="bg-gradient-to-br from-base-100 to-base-200/50 border border-base-300/50 rounded-2xl shadow-md p-6">
                <h3 className="text-lg font-bold text-base-content mb-4">
                  New Organizations (Last 30 Days)
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={reports.growth.newOrganizations}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      name="New Organizations"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* User Growth */}
            {reports.growth?.userGrowth && (
              <div className="bg-gradient-to-br from-base-100 to-base-200/50 border border-base-300/50 rounded-2xl shadow-md p-6">
                <h3 className="text-lg font-bold text-base-content mb-4">
                  User Growth (Last 30 Days)
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={reports.growth.userGrowth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#10b981"
                      strokeWidth={2}
                      name="New Users"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </>
        )}

        {/* Usage Tab */}
        {activeTab === "usage" && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="stat bg-gradient-to-br from-base-100 to-base-200/50 border border-base-300/50 rounded-2xl shadow-md">
                <div className="stat-title">Total Users</div>
                <div className="stat-value text-primary">{reports.usage?.totalUsers || 0}</div>
              </div>
              <div className="stat bg-gradient-to-br from-base-100 to-base-200/50 border border-base-300/50 rounded-2xl shadow-md">
                <div className="stat-title">Total Students</div>
                <div className="stat-value text-success">{reports.usage?.totalStudents || 0}</div>
              </div>
              <div className="stat bg-gradient-to-br from-base-100 to-base-200/50 border border-base-300/50 rounded-2xl shadow-md">
                <div className="stat-title">Total Teachers</div>
                <div className="stat-value text-info">{reports.usage?.totalTeachers || 0}</div>
              </div>
              <div className="stat bg-gradient-to-br from-base-100 to-base-200/50 border border-base-300/50 rounded-2xl shadow-md">
                <div className="stat-title">Total Classes</div>
                <div className="stat-value text-accent">{reports.usage?.totalClasses || 0}</div>
              </div>
            </div>

            {/* Users by Role */}
            {reports.usage?.byRole && (
              <div className="bg-gradient-to-br from-base-100 to-base-200/50 border border-base-300/50 rounded-2xl shadow-md p-6">
                <h3 className="text-lg font-bold text-base-content mb-4">Users by Role</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={reports.usage.byRole}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="role" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#8b5cf6" name="Users" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Export Subscriptions */}
            <div className="bg-gradient-to-br from-base-100 to-base-200/50 border border-base-300/50 rounded-2xl shadow-md p-6">
              <h3 className="text-lg font-bold text-base-content mb-4">Export Data</h3>
              <div className="flex gap-3">
                <button
                  onClick={() => handleExport("subscriptions")}
                  className="btn btn-primary"
                  disabled={exporting === "subscriptions"}
                >
                  {exporting === "subscriptions" ? (
                    <span className="loading loading-spinner loading-sm" />
                  ) : (
                    <FaDownload />
                  )}
                  Export Subscriptions
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PlatformReports;
