import React from "react";
import { X, Pin, Star, Archive, Clock, Tag, Folder } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const ViewNoteModal = ({ note, onClose, categories }) => {
  if (!note) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-3xl w-full p-8 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white pr-8">
            {note.title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X size={24} className="text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        <div className="flex flex-wrap gap-4 mb-6 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <Folder size={16} />
            <span className="font-medium">
              {categories.find((c) => c.id === note.category || c._id === note.category)?.name || "Cá nhân"}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Clock size={16} />
            <span>
              {note.createdAt ? new Date(note.createdAt).toLocaleString("vi-VN") : ""}
            </span>
          </div>
          <div className="flex gap-2">
            {note.isPinned && <Pin size={16} className="text-blue-500" />}
            {note.isFavorite && <Star size={16} className="text-yellow-500 fill-yellow-500" />}
            {note.isArchived && <Archive size={16} className="text-orange-500" />}
          </div>
        </div>

        {note.tags && note.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {note.tags.map((tag, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1"
              >
                <Tag size={12} />
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 mb-6">
          {note.isMarkdown ? (
            <div className="prose dark:prose-invert max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {note.content}
              </ReactMarkdown>
            </div>
          ) : (
            <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
              {note.content}
            </p>
          )}
        </div>

        {note.checklist && note.checklist.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Danh sách công việc:</h3>
            <div className="space-y-2">
              {note.checklist.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  <input
                    type="checkbox"
                    checked={item.checked}
                    readOnly
                    className="w-5 h-5 pointer-events-none"
                  />
                  <span
                    className={`flex-1 ${
                      item.checked ? "line-through text-gray-500" : "text-gray-800 dark:text-gray-200"
                    }`}
                  >
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewNoteModal;
