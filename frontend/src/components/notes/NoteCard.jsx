import React from "react";
import {
  Archive,
  Bell,
  Clock,
  Copy,
  Edit2,
  History,
  Pin,
  Share2,
  Star,
  Trash2,
  Eye,
  Check,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const NoteCard = ({
  note,
  viewMode,
  showTrash,
  selectedNotes,
  toggleNoteSelection,
  togglePin,
  toggleFavorite,
  toggleArchive,
  deleteNote,
  removeShare,
  duplicateNote,
  fetchVersions,
  openShareModal,
  updateChecklistItem,
  expandedChecklistIds,
  toggleExpandChecklist,
  categories,
  setEditingNote,
  setViewingNote,
}) => {
  const isExpanded = !!expandedChecklistIds[note._id];
  const itemsToShow =
    isExpanded || !note.checklist || note.checklist.length <= 3
      ? note.checklist || []
      : note.checklist.slice(0, 3);

  const isOwner = !note.sharedBy;
  const canWrite = isOwner || note.sharePermission === "write";

  return (
    <div
      className={`group relative rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 ${
        viewMode === "grid" ? "transform hover:-translate-y-1" : ""
      } ${
        selectedNotes.includes(note._id)
          ? "ring-4 ring-blue-500"
          : note.isPinned
          ? "ring-2 ring-gray-400 dark:ring-gray-500"
          : ""
      }`}
      style={{ backgroundColor: note.color }}
    >
      {/* Dark mode overlay so text is readable on light note colors */}
      <div className="absolute inset-0 rounded-2xl note-card-overlay pointer-events-none" />
      
      {/* Content wrapper - sits above overlay */}
      <div className="relative p-6">
        {note.isPinned && (
          <div className="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full p-2 shadow-lg z-10">
            <Pin size={14} />
          </div>
        )}

        {!showTrash && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleNoteSelection(note._id);
            }}
            className={`absolute -top-3 -left-3 z-20 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 shadow-md border-2
              ${
                selectedNotes.includes(note._id)
                  ? "bg-blue-500 border-blue-500 opacity-100 scale-100 text-white"
                  : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-500 opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 text-gray-400 dark:text-gray-300 hover:text-blue-500 hover:border-blue-500"
              }
            `}
            title={selectedNotes.includes(note._id) ? "Bỏ chọn" : "Chọn ghi chú"}
          >
            <Check size={18} strokeWidth={selectedNotes.includes(note._id) ? 3 : 2} />
          </button>
        )}

        <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          {canWrite && (
            <>
              <button
                onClick={() => togglePin(note)}
                className="p-2 bg-white dark:bg-gray-700 bg-opacity-80 dark:bg-opacity-80 rounded-full shadow-md hover:bg-opacity-100 dark:hover:bg-opacity-100 transition-all"
                title="Ghim ghi chú"
              >
                <Pin
                  size={14}
                  className={note.isPinned ? "text-blue-600" : "text-gray-400 dark:text-gray-300"}
                />
              </button>
              <button
                onClick={() => toggleFavorite(note)}
                className="p-2 bg-white dark:bg-gray-700 bg-opacity-80 dark:bg-opacity-80 rounded-full shadow-md hover:bg-opacity-100 dark:hover:bg-opacity-100 transition-all"
                title="Yêu thích"
              >
                <Star
                  size={14}
                  className={
                    note.isFavorite
                      ? "text-yellow-500 fill-yellow-500"
                      : "text-gray-400 dark:text-gray-300"
                  }
                />
              </button>
            </>
          )}
        </div>

        <h3 className="text-xl font-bold mb-3 pr-20 text-gray-800 dark:text-white">{note.title}</h3>

        {note.checklist && note.checklist.length > 0 && (
          <div className="mb-3 space-y-2">
            {itemsToShow.map((item, idx) => (
              <label key={idx} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={item.checked}
                  disabled={!canWrite}
                  onChange={(e) =>
                    updateChecklistItem(note, idx, e.target.checked)
                  }
                  className="w-4 h-4 disabled:opacity-50"
                />
                <span
                  className={`text-sm ${
                    item.checked ? "line-through text-gray-500 dark:text-gray-400" : "text-gray-700 dark:text-gray-200"
                  }`}
                >
                  {item.text}
                </span>
              </label>
            ))}
            {note.checklist.length > 3 && (
              <button
                className="text-xs text-blue-700 dark:text-blue-300 underline"
                onClick={() => toggleExpandChecklist(note._id)}
              >
                {isExpanded
                  ? "Thu gọn"
                  : `Xem thêm +${note.checklist.length - 3} mục`}
              </button>
            )}
          </div>
        )}

        <div className="mb-3 line-clamp-3">
          {note.isMarkdown ? (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {note.content}
              </ReactMarkdown>
            </div>
          ) : (
            <p className="text-gray-700 dark:text-gray-200 whitespace-pre-wrap">{note.content}</p>
          )}
        </div>

        {note.reminder && (
          <div className="mb-3 flex items-center gap-2 text-xs text-orange-700 dark:text-orange-300 bg-orange-100 dark:bg-orange-900 bg-opacity-60 dark:bg-opacity-40 px-2 py-1 rounded-full">
            <Bell size={12} />
            Nhắc: {new Date(note.reminder).toLocaleString("vi-VN")}
          </div>
        )}

        {note.tags && note.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {note.tags.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                className="px-2 py-1 bg-white dark:bg-gray-700 bg-opacity-60 dark:bg-opacity-60 rounded-full text-xs font-semibold text-gray-700 dark:text-gray-200"
              >
                #{tag}
              </span>
            ))}
            {note.tags.length > 3 && (
              <span className="px-2 py-1 bg-white dark:bg-gray-700 bg-opacity-60 dark:bg-opacity-60 rounded-full text-xs font-semibold text-gray-700 dark:text-gray-200">
                +{note.tags.length - 3}
              </span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-300 mb-3">
          <div className="flex items-center gap-1">
            <Clock size={12} />
            {note.createdAt
              ? new Date(note.createdAt).toLocaleDateString("vi-VN", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })
              : ""}
          </div>
          <span className="px-2 py-1 bg-white dark:bg-gray-700 bg-opacity-60 dark:bg-opacity-60 rounded-full text-xs font-semibold text-gray-700 dark:text-gray-200">
            {categories.find((category) => category.id === note.category)?.name ||
              "Cá nhân"}
          </span>
        </div>

        <div className="flex flex-wrap gap-2 opacity-0 group-hover:opacity-100 transition-opacity mt-4 justify-end">
          <button
            onClick={() => setViewingNote(note)}
            className="flex items-center justify-center p-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
            title="Xem chi tiết"
          >
            <Eye size={14} />
          </button>
          {canWrite && (
            <button
              onClick={() => setEditingNote(note)}
              className="flex items-center justify-center p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              title="Sửa"
            >
              <Edit2 size={14} />
            </button>
          )}
          <button
            onClick={() => duplicateNote(note)}
            className="flex items-center justify-center p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            title="Sao chép"
          >
            <Copy size={14} />
          </button>
          
          {isOwner && (
            <>
              <button
                onClick={() => openShareModal(note)}
                className="flex items-center justify-center p-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                title="Chia sẻ"
              >
                <Share2 size={14} />
              </button>
              <button
                onClick={() => fetchVersions(note._id)}
                className="flex items-center justify-center p-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
                title="Lịch sử"
              >
                <History size={14} />
              </button>
              <button
                onClick={() => toggleArchive(note)}
                className="flex items-center justify-center p-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                title={note.isArchived ? "Bỏ lưu trữ" : "Lưu trữ"}
              >
                <Archive size={14} />
              </button>
              <button
                onClick={() => deleteNote(note._id)}
                className="flex items-center justify-center p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                title="Xóa"
              >
                <Trash2 size={14} />
              </button>
            </>
          )}

          {!isOwner && (
            <button
              onClick={() => removeShare(note.shareId)}
              className="flex items-center justify-center p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              title="Xóa khỏi danh sách Được chia sẻ"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(NoteCard);
