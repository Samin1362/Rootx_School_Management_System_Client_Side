import { useState, useEffect } from "react";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import { useNotification } from "../../contexts/NotificationContext";
import Loader from "../../components/Loader";
import {
  FaCog,
  FaSave,
  FaUndo,
} from "react-icons/fa";

const PlatformSettings = () => {
  const axiosSecure = useAxiosSecure();
  const { success, error: showError } = useNotification();

  const [settings, setSettings] = useState({});
  const [originalSettings, setOriginalSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await axiosSecure.get("/super-admin/settings");
      if (res.data.success) {
        setSettings(res.data.data);
        setOriginalSettings(res.data.data);
      }
    } catch (error) {
      showError(error.response?.data?.message || "Failed to fetch settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await axiosSecure.patch("/super-admin/settings", settings);
      if (res.data.success) {
        success(res.data.message || "Settings updated successfully");
        setOriginalSettings(settings);
      }
    } catch (error) {
      showError(error.response?.data?.message || "Failed to update settings");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setSettings(originalSettings);
  };

  const updateSetting = (category, key, value) => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value,
      },
    }));
  };

  const hasChanges = JSON.stringify(settings) !== JSON.stringify(originalSettings);

  if (loading) return <Loader />;

  // Group settings by category
  const categories = Object.keys(settings);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Background blobs */}
      <div className="fixed top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 rounded-full blur-3xl animate-pulse pointer-events-none opacity-30" />
      <div className="fixed bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-info/20 via-success/20 to-warning/20 rounded-full blur-3xl animate-pulse pointer-events-none opacity-30" />

      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-secondary p-8 shadow-lg">
        <div className="relative z-10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
              <FaCog className="text-2xl text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Platform Settings</h1>
              <p className="text-white/70 text-sm">Configure global platform settings</p>
            </div>
          </div>
          <div className="flex gap-2">
            {hasChanges && (
              <button
                onClick={handleReset}
                className="btn btn-sm bg-white/20 hover:bg-white/30 text-white border-none"
              >
                <FaUndo /> Reset
              </button>
            )}
            <button
              onClick={handleSave}
              className="btn btn-sm bg-white hover:bg-white/90 text-primary border-none"
              disabled={!hasChanges || saving}
            >
              {saving ? (
                <span className="loading loading-spinner loading-xs" />
              ) : (
                <>
                  <FaSave /> Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Settings Sections */}
      {categories.length === 0 ? (
        <div className="bg-gradient-to-br from-base-100 to-base-200/50 border border-base-300/50 rounded-2xl shadow-md p-8 text-center">
          <p className="text-base-content/60">No settings configured yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {categories.map((category) => (
            <div
              key={category}
              className="bg-gradient-to-br from-base-100 to-base-200/50 border border-base-300/50 rounded-2xl shadow-md p-6"
            >
              <h2 className="text-xl font-bold text-base-content mb-4 capitalize">
                {category.replace(/_/g, " ")}
              </h2>
              <div className="space-y-4">
                {Object.entries(settings[category] || {}).map(([key, value]) => (
                  <div key={key} className="form-control">
                    <label className="label">
                      <span className="label-text font-medium capitalize">
                        {key.replace(/_/g, " ")}
                      </span>
                    </label>
                    {typeof value === "boolean" ? (
                      <label className="label cursor-pointer justify-start gap-3">
                        <input
                          type="checkbox"
                          className="toggle toggle-primary"
                          checked={value}
                          onChange={(e) =>
                            updateSetting(category, key, e.target.checked)
                          }
                        />
                        <span className="label-text text-base-content/60">
                          {value ? "Enabled" : "Disabled"}
                        </span>
                      </label>
                    ) : typeof value === "number" ? (
                      <input
                        type="number"
                        className="input input-bordered w-full"
                        value={value}
                        onChange={(e) =>
                          updateSetting(category, key, parseFloat(e.target.value) || 0)
                        }
                      />
                    ) : (
                      <input
                        type="text"
                        className="input input-bordered w-full"
                        value={value}
                        onChange={(e) =>
                          updateSetting(category, key, e.target.value)
                        }
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sticky Save Button for Mobile */}
      {hasChanges && (
        <div className="fixed bottom-6 right-6 md:hidden z-50">
          <button
            onClick={handleSave}
            className="btn btn-primary btn-circle btn-lg shadow-lg"
            disabled={saving}
          >
            {saving ? (
              <span className="loading loading-spinner loading-sm" />
            ) : (
              <FaSave className="text-xl" />
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default PlatformSettings;
