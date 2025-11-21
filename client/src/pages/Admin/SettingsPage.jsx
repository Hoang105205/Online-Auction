import React, { useState } from "react";
import { HiSave } from "react-icons/hi";

const DEFAULT_SETTINGS = [
  {
    id: "s1",
    title: "Ngưỡng kích hoạt gia hạn",
    fields: [
      { key: "h", label: "Giờ" },
      { key: "m", label: "Phút" },
      { key: "s", label: "Giây" },
    ],
    values: { h: 0, m: 5, s: 0 },
  },
  {
    id: "s2",
    title: "Thời gian gia hạn",
    fields: [
      { key: "h", label: "Giờ" },
      { key: "m", label: "Phút" },
      { key: "s", label: "Giây" },
    ],
    values: { h: 0, m: 10, s: 0 },
  },
  {
    id: "s3",
    title: "Thời gian hiển thị mới đăng",
    fields: [{ key: "m", label: "Phút" }],
    values: { m: 3 },
  },
];

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
      <div className="w-12 text-center bg-slate-900 text-white rounded px-2 py-1 flex items-center justify-center">
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
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [edited, setEdited] = useState(
    DEFAULT_SETTINGS.reduce((acc, s) => {
      acc[s.id] = { ...s.values };
      return acc;
    }, {})
  );
  // removed savedIds: we'll derive "has changes" by comparing edited -> saved values

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

  function saveSetting(id) {
    setSettings((prev) =>
      prev.map((s) => (s.id === id ? { ...s, values: { ...edited[id] } } : s))
    );
    // after saving edited values match the saved values, button will show "Đã lưu" (disabled)
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
                  return (
                    <button
                      type="button"
                      onClick={() => changed && saveSetting(s.id)}
                      disabled={!changed}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
                        changed
                          ? "bg-blue-600 text-white hover:bg-blue-700"
                          : "bg-gray-200 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      <HiSave />
                      <span>{changed ? "Lưu" : "Đã lưu"}</span>
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
