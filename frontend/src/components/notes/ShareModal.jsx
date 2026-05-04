import React, { useState, useEffect, useCallback } from "react";
import { Share2, X, Trash2, Edit2, Shield, User, Users } from "lucide-react";
import { API_URL } from "../../config/env";

const ShareModal = ({
  note,
  shareEmail,
  setShareEmail,
  sharePermission,
  setSharePermission,
  onClose,
  onSubmit,
}) => {
  const [currentShares, setCurrentShares] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchShares = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/shares/note/${note._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentShares(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [note._id]);

  useEffect(() => {
    fetchShares();
  }, [fetchShares]);

  const handleRevoke = async (shareId) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API_URL}/shares/${shareId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      setCurrentShares(prev => prev.filter(s => s._id !== shareId));
    } catch (e) {
      console.error(e);
    }
  };

  const handlePermissionChange = async (shareId, newPermission) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/shares/${shareId}`, {
        method: "PUT",
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ permission: newPermission })
      });
      if (res.ok) {
        setCurrentShares(prev => prev.map(s => 
          s._id === shareId ? { ...s, permission: newPermission } : s
        ));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleShareSubmit = async () => {
    await onSubmit(note, shareEmail, sharePermission);
    // Refresh list after successful share
    setShareEmail("");
    fetchShares();
  };

  if (!note) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-md w-full p-8 max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-6 shrink-0">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <Share2 size={28} />
            Chia sẻ ghi chú
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X size={24} className="text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        <div className="space-y-4 shrink-0">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Email người nhận
            </label>
            <input
              type="email"
              value={shareEmail}
              onChange={(e) => setShareEmail(e.target.value)}
              placeholder="user@example.com"
              className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Quyền truy cập
            </label>
            <select
              value={sharePermission}
              onChange={(e) => setSharePermission(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:border-blue-500 focus:outline-none"
            >
              <option value="read">Chỉ xem</option>
              <option value="write">Xem và chỉnh sửa</option>
            </select>
          </div>

          <button
            onClick={handleShareSubmit}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all"
          >
            Chia sẻ
          </button>
        </div>

        <div className="mt-6 border-t dark:border-gray-700 pt-4 flex-1 overflow-y-auto">
          <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
            <Users size={18} />
            Những người có quyền truy cập
          </h3>
          
          {loading ? (
            <p className="text-sm text-gray-500 text-center py-4">Đang tải...</p>
          ) : currentShares.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
              Chưa chia sẻ với ai
            </p>
          ) : (
            <div className="space-y-3">
              {currentShares.map(share => (
                <div key={share._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full text-blue-600 dark:text-blue-300">
                      <User size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800 dark:text-white">
                        {share.sharedWithId?.email}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <Shield size={12} className="text-gray-500 dark:text-gray-400" />
                        <select
                          value={share.permission}
                          onChange={(e) => handlePermissionChange(share._id, e.target.value)}
                          className="text-xs bg-transparent border-none text-gray-600 dark:text-gray-300 focus:ring-0 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 rounded px-1 -ml-1"
                        >
                          <option value="read">Chỉ xem</option>
                          <option value="write">Xem & Sửa</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRevoke(share._id)}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                    title="Xóa quyền truy cập"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(ShareModal);
