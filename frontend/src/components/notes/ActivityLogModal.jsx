import React, { useState } from "react";
import { Activity, X, Trash2, AlertTriangle, Eye, EyeOff, Loader } from "lucide-react";

const actionLabels = {
  note_created: "Đã tạo ghi chú",
  note_updated: "Đã cập nhật ghi chú",
  note_deleted: "Đã xóa ghi chú",
  note_deleted_permanently: "Đã xóa vĩnh viễn ghi chú",
  note_restored: "Đã khôi phục ghi chú",
  note_shared: "Đã chia sẻ ghi chú",
  category_created: "Đã tạo danh mục",
  settings_updated: "Đã cập nhật cài đặt",
  version_restored: "Đã khôi phục phiên bản",
};

const ActivityLogModal = ({ activities, onClose, onClearAll }) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleClearAll = async () => {
    if (!password.trim()) {
      setError("Vui lòng nhập mật khẩu.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await onClearAll(password);
      setShowConfirm(false);
      setPassword("");
    } catch (err) {
      setError(err.message || "Xóa thất bại.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelConfirm = () => {
    setShowConfirm(false);
    setPassword("");
    setError("");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-4xl w-full p-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <Activity size={28} />
            Nhật ký hoạt động
          </h2>
          <div className="flex items-center gap-2">
            {!showConfirm && activities.length > 0 && (
              <button
                onClick={() => setShowConfirm(true)}
                title="Xóa toàn bộ nhật ký"
                className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-xl font-semibold transition-colors text-sm"
              >
                <Trash2 size={16} />
                Xóa tất cả
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <X size={24} className="text-gray-600 dark:text-gray-300" />
            </button>
          </div>
        </div>

        {/* Confirm delete panel */}
        {showConfirm && (
          <div className="mb-6 p-5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-2xl">
            <div className="flex items-start gap-3 mb-4">
              <AlertTriangle size={22} className="text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-red-700 dark:text-red-400 text-sm">
                  Xác nhận xóa toàn bộ nhật ký
                </p>
                <p className="text-red-600 dark:text-red-400 text-sm mt-1">
                  Hành động này sẽ xóa vĩnh viễn <strong>tất cả {activities.length} bản ghi</strong>. Nhập mật khẩu của bạn để tiếp tục.
                </p>
              </div>
            </div>

            <div className="flex gap-3 items-start">
              {/* Password input */}
              <div className="flex-1">
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(""); }}
                    onKeyDown={(e) => e.key === "Enter" && handleClearAll()}
                    placeholder="Nhập mật khẩu..."
                    autoFocus
                    className={`w-full px-4 py-2.5 pr-10 border-2 rounded-xl text-sm focus:outline-none transition-colors dark:bg-gray-700 dark:text-white
                      ${error
                        ? "border-red-400 dark:border-red-500 focus:border-red-500"
                        : "border-red-200 dark:border-red-700 focus:border-red-400"
                      }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {error && (
                  <p className="mt-1.5 text-xs text-red-600 dark:text-red-400 font-medium">{error}</p>
                )}
              </div>

              {/* Action buttons */}
              <button
                onClick={handleClearAll}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-xl font-semibold text-sm transition-colors whitespace-nowrap"
              >
                {loading ? <Loader size={16} className="animate-spin" /> : <Trash2 size={16} />}
                {loading ? "Đang xóa..." : "Xác nhận xóa"}
              </button>
              <button
                onClick={handleCancelConfirm}
                disabled={loading}
                className="px-4 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-semibold text-sm transition-colors whitespace-nowrap"
              >
                Hủy
              </button>
            </div>
          </div>
        )}

        {/* Activity list */}
        <div className="space-y-2">
          {activities.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-12">
              Chưa có hoạt động nào
            </p>
          ) : (
            activities.map((activity) => (
              <div
                key={activity._id}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800 dark:text-white">
                      {actionLabels[activity.action] || activity.action}
                    </p>
                    {(activity.details?.title || activity.details?.name) && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {activity.details.title || activity.details.name}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                      {new Date(activity.createdAt).toLocaleString("vi-VN")}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(ActivityLogModal);
