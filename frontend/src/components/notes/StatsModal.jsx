import React from "react";
import { Archive, BarChart3, Pin, Star, StickyNote, X } from "lucide-react";

const StatsModal = ({ onClose, stats }) => {
  if (!stats) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-2xl w-full p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <BarChart3 size={28} />
            Thong Ke
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X size={24} className="text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-4 text-white">
            <StickyNote size={32} className="mb-2" />
            <p className="text-3xl font-bold">{stats.total}</p>
            <p className="text-sm opacity-90">Tong so</p>
          </div>
          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl p-4 text-white">
            <Star size={32} className="mb-2" />
            <p className="text-3xl font-bold">{stats.favorites}</p>
            <p className="text-sm opacity-90">Yeu thich</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-4 text-white">
            <Archive size={32} className="mb-2" />
            <p className="text-3xl font-bold">{stats.archived}</p>
            <p className="text-sm opacity-90">Luu tru</p>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-4 text-white">
            <Pin size={32} className="mb-2" />
            <p className="text-3xl font-bold">{stats.pinned}</p>
            <p className="text-sm opacity-90">Da ghim</p>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
            Theo Danh Muc
          </h3>
          {stats.byCategory.map((category, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-700 rounded-xl"
            >
              <span className="font-semibold text-gray-700 dark:text-gray-300">
                {category.name}
              </span>
              <span className="px-3 py-1 bg-blue-500 text-white rounded-full text-sm font-bold">
                {category.count}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default React.memo(StatsModal);
