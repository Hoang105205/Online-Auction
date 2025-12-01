import React, { useState, useEffect } from "react";
import { HiSave } from "react-icons/hi";
import { toast } from "react-toastify";
import {
  getSystemConfig,
  updateTimeConfigs,
  updateAutoExtend,
  updateLatestProductTimeConfig,
} from "../../api/systemService";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";

const DEFAULT_SETTINGS = [
  {
    id: "s1",
    title: "Ngưỡng kích hoạt gia hạn",
    fields: [{ key: "m", label: "Phút" }],
    values: { m: 5 },
  },
  {
    id: "s2",
    title: "Thời gian gia hạn",
    fields: [{ key: "m", label: "Phút" }],
    values: { m: 10 },
  },
  {
    id: "s3",
    title: "Thời gian hiển thị mới đăng",
    fields: [{ key: "m", label: "Phút" }],
    values: { m: 3 },
  },
];

function mapSystemToSettings(sys) {
  const v1 = Number(sys?.autoExtendBefore ?? DEFAULT_SETTINGS[0].values.m) || 0;
  const v2 =
    Number(sys?.autoExtendDuration ?? DEFAULT_SETTINGS[1].values.m) || 0;
  const v3 =
    Number(sys?.latestProductTimeConfig ?? DEFAULT_SETTINGS[2].values.m) || 0;

  return [
    { ...DEFAULT_SETTINGS[0], values: { m: v1 } },
    { ...DEFAULT_SETTINGS[1], values: { m: v2 } },
    { ...DEFAULT_SETTINGS[2], values: { m: v3 } },
  ];
}

function mapSystemToEdited(sys) {
  return {
    s1: {
      m: Number(sys?.autoExtendBefore ?? DEFAULT_SETTINGS[0].values.m) || 0,
    },
    s2: {
      m: Number(sys?.autoExtendDuration ?? DEFAULT_SETTINGS[1].values.m) || 0,
    },
    s3: {
      m:
        Number(sys?.latestProductTimeConfig ?? DEFAULT_SETTINGS[2].values.m) ||
        0,
    },
  };
}

export { DEFAULT_SETTINGS, mapSystemToSettings, mapSystemToEdited };

function NumberControl({ value, onChange }) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => onChange(Math.max(0, Number(value) - 1))}
        className="w-6 h-6 flex items-center justify-center bg-red-100 text-red-600 rounded"
      >
        –
      </button>
      <div className="w-12 text-center bg-gray-200 text-gray-900 rounded px-2 py-1 flex items-center justify-center">
        {value}
      </div>
      <button
        type="button"
        onClick={() => onChange(Number(value) + 1)}
        className="w-6 h-6 flex items-center justify-center bg-blue-100 text-blue-600 rounded"
      >
        +
      </button>
    </div>
  );
}

export default function SettingsPage() {
  useAxiosPrivate();
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [edited, setEdited] = useState(
    DEFAULT_SETTINGS.reduce((acc, s) => {
      acc[s.id] = { ...s.values };
      return acc;
    }, {})
  );
  const [loading, setLoading] = useState(false);
  const [loadingById, setLoadingById] = useState({});

  // Load system config and map to our settings (minutes)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const sys = await getSystemConfig();
        if (!mounted) return;
        // Map system keys to settings+edited
        const newSettings = mapSystemToSettings(sys);
        const newEdited = mapSystemToEdited(sys);
        setSettings(newSettings);
        setEdited(newEdited);
      } catch (e) {
        // ignore - keep defaults
        console.error("Failed to load system config", e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  function hasChanges(id) {
    const setting = settings.find((s) => s.id === id);
    if (!setting) return false;
    try {
      return JSON.stringify(edited[id]) !== JSON.stringify(setting.values);
    } catch (e) {
      return false;
    }
  }

  function updateField(settingId, key, val) {
    setEdited((prev) => ({
      ...prev,
      [settingId]: { ...prev[settingId], [key]: val },
    }));
  }

  async function saveSetting(id) {
    const values = edited[id];
    if (!values) return;
    // Build payload for updateTimeConfigs: only include changed keys
    const payload = {};
    if (id === "s1") payload.autoExtendBefore = Number(values.m || 0);
    if (id === "s2") payload.autoExtendDuration = Number(values.m || 0);
    if (id === "s3") payload.latestProductTimeConfig = Number(values.m || 0);

    try {
      // mark this specific setting as loading
      setLoadingById((p) => ({ ...p, [id]: true }));
      if (id === "s1") {
        await updateAutoExtend({ autoExtendBefore: Number(values.m || 0) });
      } else if (id === "s2") {
        await updateAutoExtend({ autoExtendDuration: Number(values.m || 0) });
      } else if (id === "s3") {
        await updateLatestProductTimeConfig(Number(values.m || 0));
      } else {
        // fallback
        await updateTimeConfigs(payload);
      }

      setSettings((prev) =>
        prev.map((s) => (s.id === id ? { ...s, values: { ...values } } : s))
      );
      setEdited((prev) => ({ ...prev, [id]: { ...values } }));

      // quick user feedback
      toast.success("Lưu cài đặt thành công");
    } catch (err) {
      console.error("Save setting failed", err);
      toast.error(
        "Lưu thất bại: " + (err.response?.data?.message || err.message)
      );
    } finally {
      // clear loading for this id
      setLoadingById((p) => ({ ...p, [id]: false }));
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Hệ thống</h2>
        <div />
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-lg ring-1 ring-blue-100/60">
        <div className="divide-y">
          {settings.map((s, idx) => (
            <div
              key={s.id}
              className="py-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
            >
              <div className="w-full md:w-1/3 text-sm text-gray-600">
                <div className="text-xs text-gray-400">
                  {String(idx + 1).padStart(2, "0")}.
                </div>
                <div className="mt-2 font-medium">{s.title}</div>
              </div>

              <div className="flex-1 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                {s.fields.map((f) => (
                  <div key={f.key} className="flex flex-col items-center">
                    <div className="text-xs text-gray-400">{f.label}</div>
                    <NumberControl
                      value={edited[s.id][f.key]}
                      onChange={(v) => updateField(s.id, f.key, v)}
                    />
                  </div>
                ))}
              </div>

              <div className="w-full md:w-40 text-right mt-4 md:mt-0">
                {/** Button enabled only when there are changes compared to saved values */}
                {(() => {
                  const changed = hasChanges(s.id);
                  const thisLoading = !!loadingById[s.id];
                  return (
                    <button
                      type="button"
                      onClick={() => saveSetting(s.id)}
                      disabled={!changed || loading || thisLoading}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
                        changed
                          ? "bg-blue-600 text-white hover:bg-blue-700"
                          : "bg-gray-200 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      <HiSave />
                      <span>
                        {changed
                          ? thisLoading
                            ? "Đang lưu..."
                            : "Lưu"
                          : "Đã lưu"}
                      </span>
                    </button>
                  );
                })()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
