import React, { useState, useEffect, useCallback } from "react";
import { X, Plus, Folder, Edit2, Trash2, List } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useAppDialog } from "../context/AppDialogContext";
import { API_URL } from "../config/env";

const CustomCategories = ({ onUpdate }) => {
  const { getAuthHeaders } = useAuth();
  const { confirm: appConfirm } = useAppDialog();
  const [categories, setCategories] = useState([]);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showListModal, setShowListModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    icon: "folder",
    color: "#3b82f6",
  });

  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/categories`, {
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Lỗi khi tải categories:", error);
    }
  }, [getAuthHeaders]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingCategory
        ? `${API_URL}/categories/${editingCategory._id}`
        : `${API_URL}/categories`;
      const method = editingCategory ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchCategories();
        setShowFormModal(false);
        setFormData({ name: "", icon: "folder", color: "#3b82f6" });
        setEditingCategory(null);
        if (onUpdate) onUpdate();
      }
    } catch (error) {
      console.error("Lỗi:", error);
    }
  };

  const handleDelete = async (id) => {
    if (
      !(await appConfirm("Danh mục sẽ bị gỡ khỏi ứng dụng. Tiếp tục?", {
        title: "Xóa danh mục",
        confirmLabel: "Xóa",
        danger: true,
      }))
    )
      return;

    try {
      await fetch(`${API_URL}/categories/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      await fetchCategories();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error("Lỗi:", error);
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      icon: category.icon,
      color: category.color,
    });
    setShowFormModal(true);
  };

  return (
    <>
      <button
        onClick={() => {
          setEditingCategory(null);
          setFormData({ name: "", icon: "folder", color: "#3b82f6" });
          setShowFormModal(true);
        }}
        className="shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-xl border border-gray-200/90 dark:border-gray-600 bg-white/90 dark:bg-gray-700/60 text-gray-700 dark:text-gray-200 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm"
      >
        <Plus size={16} />
        <span className="sm:hidden">Thêm DM</span>
        <span className="hidden sm:inline">Thêm danh mục</span>
      </button>

      <button
        onClick={() => setShowListModal(true)}
        className="shrink-0 flex items-center gap-2 px-3.5 py-2 border border-gray-200 dark:border-gray-600 bg-white/90 dark:bg-gray-700/60 text-gray-700 dark:text-gray-200 text-sm rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm"
      >
        <List size={16} />
        <span className="sm:hidden">Quản lý</span>
        <span className="hidden sm:inline">Quản lý danh mục</span>
      </button>

      {/* List Modal */}
      {showListModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 max-w-md w-full border-2 border-gray-100 dark:border-gray-700 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
                Danh sách danh mục
              </h3>
              <button 
                onClick={() => setShowListModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <X size={24} className="text-gray-600 dark:text-gray-300" />
              </button>
            </div>
            
            <div className="space-y-3">
              {categories.length === 0 ? (
                <p className="text-center text-gray-500 dark:text-gray-400 py-4">Chưa có danh mục tùy chỉnh nào.</p>
              ) : (
                categories.map((cat) => (
                  <div
                    key={cat._id}
                    className="flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl"
                  >
                    <Folder size={18} style={{ color: cat.color }} />
                    <span className="flex-1 text-left text-gray-800 dark:text-white font-semibold">{cat.name}</span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEdit(cat)}
                        className="p-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                        title="Chỉnh sửa"
                      >
                        <Edit2 size={16} className="text-blue-600 dark:text-blue-400" />
                      </button>
                      <button
                        onClick={() => handleDelete(cat._id)}
                        className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                        title="Xóa"
                      >
                        <Trash2 size={16} className="text-red-600 dark:text-red-400" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {showFormModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 max-w-md w-full border-2 border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
                {editingCategory ? "Chỉnh sửa" : "Tạo"} danh mục
              </h3>
              <button 
                onClick={() => setShowFormModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <X size={24} className="text-gray-600 dark:text-gray-300" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Tên danh mục
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:border-blue-500 focus:outline-none transition-colors bg-gray-50 dark:bg-gray-800"
                  placeholder="Nhập tên danh mục..."
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Màu sắc
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-20 h-12 rounded-xl cursor-pointer border-2 border-gray-200 dark:border-gray-600"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                    {formData.color}
                  </span>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
                >
                  {editingCategory ? "Cập nhật" : "Tạo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default CustomCategories;
