import { useState, useEffect } from "react";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import useAuth from "../../hooks/useAuth";
import { useOrganization } from "../../contexts/organization/OrganizationContext";
import { useNotification } from "../../contexts/NotificationContext";
import Loader from "../../components/Loader";
import { FaCog, FaPalette, FaGlobe, FaSave } from "react-icons/fa";

const TIMEZONE_OPTIONS = [
  "Asia/Dhaka",
  "Asia/Kolkata",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Asia/Dubai",
  "Asia/Singapore",
  "Europe/London",
  "Europe/Berlin",
  "Europe/Paris",
  "America/New_York",
  "America/Chicago",
  "America/Los_Angeles",
  "Australia/Sydney",
  "Pacific/Auckland",
  "UTC",
];

const CURRENCY_OPTIONS = [
  { value: "BDT", label: "BDT - Bangladeshi Taka" },
  { value: "USD", label: "USD - US Dollar" },
  { value: "EUR", label: "EUR - Euro" },
  { value: "GBP", label: "GBP - British Pound" },
];

const LANGUAGE_OPTIONS = [
  { value: "en", label: "English" },
  { value: "bn", label: "Bangla" },
];

const DATE_FORMAT_OPTIONS = [
  { value: "DD/MM/YYYY", label: "DD/MM/YYYY" },
  { value: "MM/DD/YYYY", label: "MM/DD/YYYY" },
  { value: "YYYY-MM-DD", label: "YYYY-MM-DD" },
];

const MONTH_OPTIONS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const OrganizationSettings = () => {
  const axiosSecure = useAxiosSecure();
  const { organizationId } = useAuth();
  const { organization, refreshOrganization, loading } = useOrganization();
  const { success, error: showError } = useNotification();

  const [saving, setSaving] = useState(false);

  const [general, setGeneral] = useState({
    name: "",
    phone: "",
    address: "",
  });

  const [preferences, setPreferences] = useState({
    timezone: "Asia/Dhaka",
    currency: "BDT",
    language: "en",
    dateFormat: "DD/MM/YYYY",
    academicYearStart: "January",
  });

  const [branding, setBranding] = useState({
    primaryColor: "#6366f1",
    secondaryColor: "#10b981",
  });

  // Populate form when organization data loads
  useEffect(() => {
    if (organization) {
      setGeneral({
        name: organization.name || "",
        phone: organization.phone || "",
        address: organization.address || "",
      });
      setPreferences({
        timezone: organization.settings?.timezone || "Asia/Dhaka",
        currency: organization.settings?.currency || "BDT",
        language: organization.settings?.language || "en",
        dateFormat: organization.settings?.dateFormat || "DD/MM/YYYY",
        academicYearStart: organization.settings?.academicYearStart || "January",
      });
      setBranding({
        primaryColor: organization.branding?.primaryColor || "#6366f1",
        secondaryColor: organization.branding?.secondaryColor || "#10b981",
      });
    }
  }, [organization]);

  const handleSave = async () => {
    if (!general.name.trim()) {
      showError("Organization name is required");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: general.name,
        phone: general.phone,
        address: general.address,
        settings: { ...preferences },
        branding: { ...branding },
      };

      const res = await axiosSecure.patch(
        `/organizations/${organizationId}`,
        payload
      );

      if (res.data.success) {
        success("Organization settings updated successfully");
        await refreshOrganization();
      }
    } catch (err) {
      showError(err.response?.data?.message || "Failed to update settings");
    } finally {
      setSaving(false);
    }
  };

  const formatLimit = (value) => {
    if (value === -1 || value === undefined || value === null) return "Unlimited";
    return value.toLocaleString();
  };

  const formatStorage = (mb) => {
    if (!mb && mb !== 0) return "N/A";
    if (mb >= 1024) return `${(mb / 1024).toFixed(1)} GB`;
    return `${mb} MB`;
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-base-content">Organization Settings</h1>
        <p className="text-base-content/60 text-sm mt-1">
          Manage your organization&apos;s general information, preferences, and branding.
        </p>
      </div>

      {/* General Information */}
      <div className="card bg-base-100 border border-base-300/50 shadow-sm">
        <div className="card-body">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <FaCog className="text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-base-content">General Information</h2>
              <p className="text-xs text-base-content/50">Basic details about your organization</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Organization Name *</span>
              </label>
              <input
                type="text"
                className="input input-bordered input-sm w-full"
                placeholder="Your school name"
                value={general.name}
                onChange={(e) => setGeneral({ ...general, name: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Phone Number</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered input-sm w-full"
                  placeholder="+880..."
                  value={general.phone}
                  onChange={(e) => setGeneral({ ...general, phone: e.target.value })}
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Email</span>
                </label>
                <input
                  type="email"
                  className="input input-bordered input-sm w-full bg-base-200/50"
                  value={organization?.email || ""}
                  disabled
                />
                <label className="label">
                  <span className="label-text-alt text-base-content/50">Email cannot be changed</span>
                </label>
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Address</span>
              </label>
              <textarea
                className="textarea textarea-bordered textarea-sm w-full"
                placeholder="Full address of your organization"
                rows={3}
                value={general.address}
                onChange={(e) => setGeneral({ ...general, address: e.target.value })}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="card bg-base-100 border border-base-300/50 shadow-sm">
        <div className="card-body">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
              <FaGlobe className="text-info" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-base-content">Preferences</h2>
              <p className="text-xs text-base-content/50">Regional and academic preferences</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Timezone</span>
              </label>
              <select
                className="select select-bordered select-sm w-full"
                value={preferences.timezone}
                onChange={(e) =>
                  setPreferences({ ...preferences, timezone: e.target.value })
                }
              >
                {TIMEZONE_OPTIONS.map((tz) => (
                  <option key={tz} value={tz}>
                    {tz}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Currency</span>
              </label>
              <select
                className="select select-bordered select-sm w-full"
                value={preferences.currency}
                onChange={(e) =>
                  setPreferences({ ...preferences, currency: e.target.value })
                }
              >
                {CURRENCY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Language</span>
              </label>
              <select
                className="select select-bordered select-sm w-full"
                value={preferences.language}
                onChange={(e) =>
                  setPreferences({ ...preferences, language: e.target.value })
                }
              >
                {LANGUAGE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Date Format</span>
              </label>
              <select
                className="select select-bordered select-sm w-full"
                value={preferences.dateFormat}
                onChange={(e) =>
                  setPreferences({ ...preferences, dateFormat: e.target.value })
                }
              >
                {DATE_FORMAT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-control md:col-span-2">
              <label className="label">
                <span className="label-text">Academic Year Starts</span>
              </label>
              <select
                className="select select-bordered select-sm w-full"
                value={preferences.academicYearStart}
                onChange={(e) =>
                  setPreferences({ ...preferences, academicYearStart: e.target.value })
                }
              >
                {MONTH_OPTIONS.map((month) => (
                  <option key={month} value={month}>
                    {month}
                  </option>
                ))}
              </select>
              <label className="label">
                <span className="label-text-alt text-base-content/50">
                  The month when your academic year begins
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Branding */}
      <div className="card bg-base-100 border border-base-300/50 shadow-sm">
        <div className="card-body">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
              <FaPalette className="text-secondary" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-base-content">Branding</h2>
              <p className="text-xs text-base-content/50">Customize your organization&apos;s look and feel</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Primary Color</span>
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  className="w-10 h-10 rounded-lg border border-base-300/50 cursor-pointer"
                  value={branding.primaryColor}
                  onChange={(e) =>
                    setBranding({ ...branding, primaryColor: e.target.value })
                  }
                />
                <input
                  type="text"
                  className="input input-bordered input-sm flex-1"
                  value={branding.primaryColor}
                  onChange={(e) =>
                    setBranding({ ...branding, primaryColor: e.target.value })
                  }
                  placeholder="#6366f1"
                />
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Secondary Color</span>
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  className="w-10 h-10 rounded-lg border border-base-300/50 cursor-pointer"
                  value={branding.secondaryColor}
                  onChange={(e) =>
                    setBranding({ ...branding, secondaryColor: e.target.value })
                  }
                />
                <input
                  type="text"
                  className="input input-bordered input-sm flex-1"
                  value={branding.secondaryColor}
                  onChange={(e) =>
                    setBranding({ ...branding, secondaryColor: e.target.value })
                  }
                  placeholder="#10b981"
                />
              </div>
            </div>
          </div>

          {/* Branding Preview */}
          <div className="mt-4 p-4 rounded-lg border border-base-300/50 bg-base-200/30">
            <p className="text-xs text-base-content/50 mb-3">Preview</p>
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-lg shadow-sm"
                style={{ backgroundColor: branding.primaryColor }}
              />
              <div
                className="w-12 h-12 rounded-lg shadow-sm"
                style={{ backgroundColor: branding.secondaryColor }}
              />
              <div className="ml-2">
                <p className="text-sm font-semibold text-base-content">
                  {general.name || "Organization Name"}
                </p>
                <p className="text-xs text-base-content/50">Brand colors</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Usage & Limits */}
      <div className="card bg-base-100 border border-base-300/50 shadow-sm">
        <div className="card-body">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
              <FaCog className="text-warning" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-base-content">Usage &amp; Limits</h2>
              <p className="text-xs text-base-content/50">Current resource usage against your plan limits</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Students */}
            <div className="p-4 rounded-lg border border-base-300/50 bg-base-200/30">
              <p className="text-xs text-base-content/50 mb-1">Students</p>
              <p className="text-xl font-bold text-base-content">
                {organization?.usage?.currentStudents ?? 0}
              </p>
              <p className="text-xs text-base-content/40 mt-1">
                of {formatLimit(organization?.limits?.maxStudents)}
              </p>
              {organization?.limits?.maxStudents > 0 && (
                <progress
                  className="progress progress-primary w-full mt-2"
                  value={organization?.usage?.currentStudents ?? 0}
                  max={organization?.limits?.maxStudents}
                />
              )}
            </div>

            {/* Classes */}
            <div className="p-4 rounded-lg border border-base-300/50 bg-base-200/30">
              <p className="text-xs text-base-content/50 mb-1">Classes</p>
              <p className="text-xl font-bold text-base-content">
                {organization?.usage?.currentClasses ?? 0}
              </p>
              <p className="text-xs text-base-content/40 mt-1">
                of {formatLimit(organization?.limits?.maxClasses)}
              </p>
              {organization?.limits?.maxClasses > 0 && (
                <progress
                  className="progress progress-info w-full mt-2"
                  value={organization?.usage?.currentClasses ?? 0}
                  max={organization?.limits?.maxClasses}
                />
              )}
            </div>

            {/* Teachers */}
            <div className="p-4 rounded-lg border border-base-300/50 bg-base-200/30">
              <p className="text-xs text-base-content/50 mb-1">Teachers</p>
              <p className="text-xl font-bold text-base-content">
                {organization?.usage?.currentTeachers ?? 0}
              </p>
              <p className="text-xs text-base-content/40 mt-1">
                of {formatLimit(organization?.limits?.maxTeachers)}
              </p>
              {organization?.limits?.maxTeachers > 0 && (
                <progress
                  className="progress progress-secondary w-full mt-2"
                  value={organization?.usage?.currentTeachers ?? 0}
                  max={organization?.limits?.maxTeachers}
                />
              )}
            </div>

            {/* Storage */}
            <div className="p-4 rounded-lg border border-base-300/50 bg-base-200/30">
              <p className="text-xs text-base-content/50 mb-1">Storage</p>
              <p className="text-xl font-bold text-base-content">
                {formatStorage(organization?.usage?.storageUsed)}
              </p>
              <p className="text-xs text-base-content/40 mt-1">
                of {formatStorage(organization?.limits?.maxStorage)}
              </p>
              {organization?.limits?.maxStorage > 0 && (
                <progress
                  className="progress progress-warning w-full mt-2"
                  value={organization?.usage?.storageUsed ?? 0}
                  max={organization?.limits?.maxStorage}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-2 pb-6">
        <button
          onClick={handleSave}
          className="btn btn-primary btn-sm gap-2"
          disabled={saving}
        >
          {saving && <span className="loading loading-spinner loading-xs" />}
          <FaSave />
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default OrganizationSettings;
