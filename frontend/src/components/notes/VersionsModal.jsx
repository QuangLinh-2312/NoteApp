import React from "react";
import { History, RotateCcw, X } from "lucide-react";

const VersionsModal = ({
  noteId,
  versions,
  onClose,
  onRestoreVersion,
}) => {
  if (!noteId) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-4xl w-full p-8 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <History size={28} />
            Lich su chinh sua
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X size={24} className="text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        <div className="space-y-4">
          {versions.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              Chua co phien ban nao
            </p>
          ) : (
            versions.map((version) => (
              <div
                key={version._id}
                className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-white">
                      Phien ban {version.versionNumber}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(version.createdAt).toLocaleString("vi-VN")}
                    </p>
                  </div>
                  <button
                    onClick={() => onRestoreVersion(noteId, version._id)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                  >
                    <RotateCcw size={16} />
                    Khoi phuc
                  </button>
                </div>
                <div className="mt-3">
                  <p className="font-semibold mb-2 text-gray-800 dark:text-white">{version.title}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
                    {version.content}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(VersionsModal);
