import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  Plus,
  Search,
  Trash2,
  Save,
  X,
  StickyNote,
  Star,
  Archive,
  Tag,
  Download,
  Upload,
  Grid,
  List,
  Pin,
  Palette,
  CheckSquare,
  Sun,
  Moon,
  AlertCircle,
  Monitor,
  Menu,
  BarChart3,
  Folder,
  LogOut,
  Bell,
  Trash,
  RotateCcw,
  Sparkles,
  Activity,
  RefreshCw,
  Filter,
  Zap,
  ChevronDown,
  Users,
} from "lucide-react";
import { useAuth } from "./context/AuthContext";
import { useAppDialog } from "./context/AppDialogContext";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import CustomCategories from "./components/CustomCategories";
import { API_URL } from "./config/env";
import { NOTE_COLORS } from "./constants/noteColors";
import {
  readThemePreferenceFromStorage,
  writeThemePreferenceToStorage,
  resolveEffectiveDark,
  applyDarkClassToDocument,
  isValidThemePreference,
  THEME_LIGHT,
  THEME_DARK,
  THEME_AUTO,
} from "./theme";
import NoteCard from "./components/notes/NoteCard";
import StatsModal from "./components/notes/StatsModal";
import ShareModal from "./components/notes/ShareModal";
import VersionsModal from "./components/notes/VersionsModal";
import ActivityLogModal from "./components/notes/ActivityLogModal";
import ViewNoteModal from "./components/notes/ViewNoteModal";

  const NoteModal = React.memo(
    ({ initialNote, onSave, onClose, title, colors, categories, customCategories = [] }) => {
      const { getAuthHeaders } = useAuth();
      const { alert: appAlert } = useAppDialog();
      
      // Combine default and custom categories for select (chỉ lấy default categories, custom đã có trong categories)
      const allCategories = React.useMemo(() => {
        // Chỉ lấy default categories (không bao gồm custom vì custom đã được merge vào categories ở component cha)
        const defaultCats = categories.slice(1).filter((cat) => !cat.isCustom);
        // Thêm custom categories từ prop
        const customCats = customCategories.map((cat) => ({ id: cat._id, name: cat.name }));
        return [...defaultCats, ...customCats];
      }, [categories, customCategories]);
      const [localNote, setLocalNote] = useState(() => ({ ...initialNote }));
      const [localTagInput, setLocalTagInput] = useState("");
      const [localChecklistInput, setLocalChecklistInput] = useState("");
      const [isMarkdownMode, setIsMarkdownMode] = useState(initialNote.isMarkdown || false);
      const [showPreview, setShowPreview] = useState(false);
      const [reminderDate, setReminderDate] = useState(
        initialNote.reminder ? new Date(initialNote.reminder).toISOString().slice(0, 16) : ""
      );

      // Đồng bộ khi initialNote thay đổi (ví dụ khi mở modal edit note mới)
      useEffect(() => {
        setLocalNote({ ...initialNote });
        setLocalTagInput("");
        setLocalChecklistInput("");
        setIsMarkdownMode(initialNote.isMarkdown || false);
        setShowPreview(false);
        setReminderDate(
          initialNote.reminder ? new Date(initialNote.reminder).toISOString().slice(0, 16) : ""
        );
      }, [initialNote]);

      const addTag = useCallback(() => {
        const v = localTagInput.trim();
        if (!v) return;
        setLocalNote((prev) => ({
          ...prev,
          tags: [...(prev.tags || []), v],
        }));
        setLocalTagInput("");
      }, [localTagInput]);

      const removeTag = useCallback((tagToRemove) => {
        setLocalNote((prev) => ({
          ...prev,
          tags: (prev.tags || []).filter((t) => t !== tagToRemove),
        }));
      }, []);

      const addChecklistItem = useCallback(() => {
        const v = localChecklistInput.trim();
        if (!v) return;
        setLocalNote((prev) => ({
          ...prev,
          checklist: [...(prev.checklist || []), { text: v, checked: false }],
        }));
        setLocalChecklistInput("");
      }, [localChecklistInput]);

      const toggleChecklistItem = useCallback((index) => {
        setLocalNote((prev) => {
          const list = [...(prev.checklist || [])];
          list[index] = { ...list[index], checked: !list[index].checked };
          return { ...prev, checklist: list };
        });
      }, []);

      const removeChecklistItem = useCallback((index) => {
        setLocalNote((prev) => {
          const list = (prev.checklist || []).filter((_, i) => i !== index);
          return { ...prev, checklist: list };
        });
      }, []);

      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-4xl w-full p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                {title}
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <X size={24} className="text-gray-600 dark:text-gray-300" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Tiêu đề ghi chú..."
                    value={localNote.title}
                    onChange={(e) =>
                      setLocalNote({ ...localNote, title: e.target.value })
                    }
                    className="flex-1 px-4 py-3 text-xl font-semibold border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      if (!localNote.content.trim()) return;
                      try {
                        const response = await fetch(`${API_URL}/ai/suggest-title`, {
                          method: "POST",
                          headers: getAuthHeaders(),
                          body: JSON.stringify({ content: localNote.content }),
                        });
                        const data = await response.json();
                        if (data.title) {
                          setLocalNote({ ...localNote, title: data.title });
                        }
                      } catch (error) {
                        console.error("Lỗi AI:", error);
                      }
                    }}
                    className="px-4 py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors flex items-center gap-2"
                    title="Gợi ý tiêu đề bằng AI"
                  >
                    <Sparkles size={20} />
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        const response = await fetch(`${API_URL}/ai/suggest-actions`, {
                          method: "POST",
                          headers: getAuthHeaders(),
                          body: JSON.stringify({
                            noteContent: localNote.content,
                            noteTitle: localNote.title,
                            tags: localNote.tags,
                            category: localNote.category,
                          }),
                        });
                        const data = await response.json();
                        if (data.suggestions && data.suggestions.length > 0) {
                          const suggestions = data.suggestions.map((s) => s.message).join("\n");
                          void appAlert(`Gợi ý:\n\n${suggestions}`, {
                            title: "Gợi ý từ AI",
                            variant: "info",
                          });
                        }
                      } catch (error) {
                        console.error("Lỗi AI:", error);
                      }
                    }}
                    className="px-4 py-3 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-colors flex items-center gap-2"
                    title="Gợi ý hành động"
                  >
                    <Zap size={20} />
                  </button>
                </div>

                <div className="mb-2 flex gap-2">
                  <button
                    onClick={() => setIsMarkdownMode(!isMarkdownMode)}
                    className={`px-3 py-1 rounded-lg text-sm font-semibold transition-colors ${
                      isMarkdownMode
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    Markdown
                  </button>
                  {isMarkdownMode && (
                    <button
                      onClick={() => setShowPreview(!showPreview)}
                      className="px-3 py-1 rounded-lg text-sm font-semibold bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                      {showPreview ? "Chỉnh sửa" : "Xem trước"}
                    </button>
                  )}
                </div>

                <div className="relative">
                  {showPreview && isMarkdownMode ? (
                    <div className="w-full px-4 py-3 h-64 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 rounded-xl overflow-y-auto prose dark:prose-invert max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {localNote.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <>
                      <textarea
                        placeholder={isMarkdownMode ? "Viết markdown..." : "Nội dung ghi chú..."}
                        value={localNote.content}
                        onChange={(e) =>
                          setLocalNote({ ...localNote, content: e.target.value })
                        }
                        className="w-full px-4 py-3 h-64 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:border-blue-500 focus:outline-none resize-none transition-colors font-mono"
                      />
                      {localNote.content.trim() && (
                        <div className="absolute bottom-2 right-2 flex gap-2">
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                const response = await fetch(`${API_URL}/ai/summarize`, {
                                  method: "POST",
                                  headers: getAuthHeaders(),
                                  body: JSON.stringify({ content: localNote.content }),
                                });
                                const data = await response.json();
                                if (data.summary) {
                                  void appAlert(`Tóm tắt:\n\n${data.summary}`, {
                                    title: "Tóm tắt nội dung",
                                    variant: "info",
                                  });
                                }
                              } catch (error) {
                                console.error("Lỗi AI:", error);
                              }
                            }}
                            className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm flex items-center gap-1"
                            title="Tóm tắt nội dung"
                          >
                            <Sparkles size={14} />
                            Tóm tắt
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                const response = await fetch(`${API_URL}/ai/generate-checklist`, {
                                  method: "POST",
                                  headers: getAuthHeaders(),
                                  body: JSON.stringify({ content: localNote.content }),
                                });
                                const data = await response.json();
                                if (data.checklist && data.checklist.length > 0) {
                                  setLocalNote({
                                    ...localNote,
                                    checklist: [...(localNote.checklist || []), ...data.checklist],
                                  });
                                }
                              } catch (error) {
                                console.error("Lỗi AI:", error);
                              }
                            }}
                            className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm flex items-center gap-1"
                            title="Tạo checklist từ nội dung"
                          >
                            <Sparkles size={14} />
                            Checklist
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <CheckSquare size={16} />
                    Danh sách công việc:
                  </p>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Thêm công việc..."
                      value={localChecklistInput}
                      onChange={(e) => setLocalChecklistInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.isComposing) return;
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addChecklistItem();
                        }
                      }}
                      className="flex-1 px-3 py-2 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:border-blue-500 focus:outline-none"
                    />
                    <button
                      onClick={addChecklistItem}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold"
                    >
                      Thêm
                    </button>
                  </div>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {localNote.checklist &&
                      localNote.checklist.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700 p-2 rounded-lg"
                        >
                          <input
                            type="checkbox"
                            checked={item.checked}
                            onChange={() => toggleChecklistItem(idx)}
                            className="w-5 h-5"
                          />
                          <span
                            className={`flex-1 ${
                              item.checked
                                ? "line-through text-gray-500"
                                : "text-gray-700 dark:text-gray-300"
                            }`}
                          >
                            {item.text}
                          </span>
                          <button
                            onClick={() => removeChecklistItem(idx)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Danh mục:
                  </p>
                  <select
                    value={localNote.category}
                    onChange={(e) =>
                      setLocalNote({ ...localNote, category: e.target.value })
                    }
                    className="w-full px-3 py-2 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:border-blue-500 focus:outline-none"
                  >
                    {allCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <Tag size={16} />
                    Thẻ (Tags):
                  </p>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Thêm thẻ..."
                      value={localTagInput}
                      onChange={(e) => setLocalTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.isComposing) return;
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addTag();
                        }
                      }}
                      className="flex-1 px-3 py-2 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:border-blue-500 focus:outline-none"
                    />
                    <button
                      onClick={addTag}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold"
                    >
                      +
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {localNote.tags &&
                      localNote.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-full text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2"
                        >
                          #{tag}
                          <button
                            onClick={() => removeTag(tag)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X size={14} />
                          </button>
                        </span>
                      ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                    <Palette size={16} />
                    Chọn màu:
                  </p>
                  <div className="grid grid-cols-5 gap-2">
                    {colors.map((color) => (
                      <button
                        key={color.value}
                        onClick={() =>
                          setLocalNote({ ...localNote, color: color.value })
                        }
                        className={`h-10 rounded-lg shadow-md hover:scale-110 transition-transform ${
                          localNote.color === color.value
                            ? "ring-4 ring-blue-500 ring-offset-2"
                            : ""
                        }`}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    <input
                      type="checkbox"
                      checked={localNote.isPinned}
                      onChange={(e) =>
                        setLocalNote({
                          ...localNote,
                          isPinned: e.target.checked,
                        })
                      }
                      className="w-5 h-5"
                    />
                    <Pin size={18} className="text-blue-500" />
                    <span className="font-semibold text-gray-700 dark:text-gray-300">
                      Ghim ghi chú
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    <input
                      type="checkbox"
                      checked={localNote.isFavorite}
                      onChange={(e) =>
                        setLocalNote({
                          ...localNote,
                          isFavorite: e.target.checked,
                        })
                      }
                      className="w-5 h-5"
                    />
                    <Star size={18} className="text-yellow-500" />
                    <span className="font-semibold text-gray-700 dark:text-gray-300">
                      Yêu thích
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    <input
                      type="checkbox"
                      checked={localNote.isArchived}
                      onChange={(e) =>
                        setLocalNote({
                          ...localNote,
                          isArchived: e.target.checked,
                        })
                      }
                      className="w-5 h-5"
                    />
                    <Archive size={18} className="text-purple-500" />
                    <span className="font-semibold text-gray-700 dark:text-gray-300">
                      Lưu trữ
                    </span>
                  </label>
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <Bell size={16} />
                    Nhắc nhở:
                  </p>
                  <input
                    type="datetime-local"
                    value={reminderDate}
                    onChange={(e) => {
                      setReminderDate(e.target.value);
                      setLocalNote({
                        ...localNote,
                        reminder: e.target.value ? new Date(e.target.value).toISOString() : null,
                      });
                    }}
                    className="w-full px-3 py-2 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                  {reminderDate && (
                    <button
                      onClick={() => {
                        setReminderDate("");
                        setLocalNote({ ...localNote, reminder: null });
                      }}
                      className="mt-2 text-sm text-red-500 hover:text-red-700"
                    >
                      Xóa nhắc nhở
                    </button>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                const noteToSave = {
                  ...localNote,
                  isMarkdown: isMarkdownMode,
                };
                onSave(noteToSave);
              }}
              className="w-full mt-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <Save size={20} />
              Lưu Ghi Chú
            </button>
          </div>
        </div>
      );
    }
  );

const NotesApp = () => {
  const { getAuthHeaders, logout, user } = useAuth();
  const { alert: appAlert, confirm: appConfirm } = useAppDialog();
  const [notes, setNotes] = useState([]);
  const [trashNotes, setTrashNotes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [viewingNote, setViewingNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid");
  const [filterMode, setFilterMode] = useState("all");
  const [sortMode, setSortMode] = useState("date");
  const [themePreference, setThemePreference] = useState(
    readThemePreferenceFromStorage
  );
  const [colorSchemeTick, setColorSchemeTick] = useState(0);
  const [showStats, setShowStats] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 1024);
  const [showTrash, setShowTrash] = useState(false);
  const [showVersions, setShowVersions] = useState(false);
  const [noteVersions, setNoteVersions] = useState([]);
  const [selectedNoteForVersions, setSelectedNoteForVersions] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [noteToShare, setNoteToShare] = useState(null);
  const [shareEmail, setShareEmail] = useState("");
  const [sharePermission, setSharePermission] = useState("read");
  const [customCategories, setCustomCategories] = useState([]);
  const [showActivityLog, setShowActivityLog] = useState(false);
  const [activities, setActivities] = useState([]);
  const [syncStatus, setSyncStatus] = useState({ syncing: false, lastSync: null });
  const [selectedNotes, setSelectedNotes] = useState([]);
  const [showDataMenu, setShowDataMenu] = useState(false);
  const [sharedNotes, setSharedNotes] = useState([]);
  const [showShared, setShowShared] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const dataMenuRef = useRef(null);
  const sidebarRef = useRef(null);

  const showToast = useCallback((msg, type = "success") => {
    setToastMessage({ msg, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 2000);
  }, []);
 
  const colors = NOTE_COLORS;

  const effectiveDark = useMemo(
    () => resolveEffectiveDark(themePreference),
    [themePreference]
  );

  const defaultCategories = useMemo(
    () => [
      { id: "all", name: "Tất cả", icon: <Folder size={18} /> },
      { id: "personal", name: "Cá nhân", icon: <StickyNote size={18} /> },
      { id: "work", name: "Công việc", icon: <BarChart3 size={18} /> },
      { id: "study", name: "Học tập", icon: <CheckSquare size={18} /> },
      { id: "ideas", name: "Ý tưởng", icon: <Star size={18} /> },
    ],
    []
  );

  const categories = useMemo(() => {
    const custom = customCategories.map((cat) => ({
      id: cat._id,
      name: cat.name,
      icon: <Folder size={18} style={{ color: cat.color }} />,
      isCustom: true,
    }));
    return [...defaultCategories, ...custom];
  }, [defaultCategories, customCategories]);




  // Định nghĩa fetchNotes và fetchTrash TRƯỚC khi sử dụng trong useEffect
  const fetchNotes = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/notes`, {
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      setNotes(Array.isArray(data.notes) ? data.notes : []);
      setLoading(false);
    } catch (error) {
      console.error("Lỗi khi tải notes:", error);
      setLoading(false);
    }
  }, [getAuthHeaders]);

  const fetchTrash = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/notes/trash/all`, {
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      setTrashNotes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Lỗi khi tải thùng rác:", error);
    }
  }, [getAuthHeaders]);

  const fetchCustomCategories = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/categories`, {
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      setCustomCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Lỗi khi tải categories:", error);
    }
  }, [getAuthHeaders]);

  const fetchActivities = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/activities?limit=50`, {
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      setActivities(Array.isArray(data.activities) ? data.activities : []);
    } catch (error) {
      console.error("Lỗi khi tải activities:", error);
    }
  }, [getAuthHeaders]);

  const clearAllActivities = useCallback(async (password) => {
    const headers = getAuthHeaders();
    const response = await fetch(`${API_URL}/activities`, {
      method: "DELETE",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Xóa nhật ký thất bại.");
    }
    setActivities([]);
    showToast(data.message || "Đã xóa toàn bộ nhật ký.");
  }, [getAuthHeaders, showToast]);

  const fetchSharedNotes = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/shares/shared-with-me`, {
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      setSharedNotes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Lỗi khi tải ghi chú được chia sẻ:", error);
    }
  }, [getAuthHeaders]);

  // AI suggestions feature disabled for now
 // Sync functionality
  const initializeSync = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/sync/state`, {
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        const syncState = await response.json();
        setSyncStatus({ syncing: false, lastSync: syncState.lastSyncAt });
      }
    } catch (error) {
      console.error("Lỗi sync:", error);
    }
  }, [getAuthHeaders]);

  const performSync = useCallback(async () => {
    if (syncStatus.syncing) return; // Prevent multiple syncs
    
    setSyncStatus((prev) => ({ ...prev, syncing: true }));
    try {
      // Get sync state
      const stateRes = await fetch(`${API_URL}/sync/state`, {
        headers: getAuthHeaders(),
      });
      if (!stateRes.ok) {
        setSyncStatus({ syncing: false, lastSync: null });
        return;
      }
      
      const syncState = await stateRes.json();

      // Get changes from server
      const changesRes = await fetch(
        `${API_URL}/sync/changes?lastSyncVersion=${syncState.lastSyncVersion || 0}`,
        { headers: getAuthHeaders() }
      );
      
      if (changesRes.ok) {
        const changesData = await changesRes.json();

        // Apply changes
        if (changesData.changes && changesData.changes.length > 0) {
          await fetchNotes();
        }

        setSyncStatus({ syncing: false, lastSync: new Date() });
      } else {
        setSyncStatus({ syncing: false, lastSync: null });
      }
    } catch (error) {
      console.error("Lỗi sync:", error);
      setSyncStatus({ syncing: false, lastSync: null });
    }
  }, [getAuthHeaders, fetchNotes, syncStatus.syncing]);

  const setUserTheme = useCallback(
    async (pref) => {
      if (!isValidThemePreference(pref)) return;
      setThemePreference(pref);
      try {
        await fetch(`${API_URL}/settings`, {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify({ theme: pref }),
        });
      } catch (error) {
        console.error("Lỗi khi lưu theme:", error);
      }
    },
    [getAuthHeaders]
  );

  useEffect(() => {
    const init = async () => {
      await fetchNotes();
      await fetchCustomCategories();
      await fetchSharedNotes();
      try {
        const res = await fetch(`${API_URL}/settings`, {
          headers: getAuthHeaders(),
        });
        if (res.ok) {
          const s = await res.json();
          if (isValidThemePreference(s.theme)) {
            setThemePreference(s.theme);
          }
        }
      } catch (error) {
        console.error("Lỗi khi tải settings:", error);
      }
      initializeSync();
    };
    init();
  }, [fetchNotes, fetchCustomCategories, fetchSharedNotes, initializeSync, getAuthHeaders]);

 
  // Auto sync every 30 seconds (only when online)
  useEffect(() => {
    if (!navigator.onLine) return;
    
    const syncInterval = setInterval(() => {
      performSync();
    }, 30000);

    return () => clearInterval(syncInterval);
  }, [performSync]);

  useEffect(() => {
    if (showTrash) {
      fetchTrash();
    }
  }, [showTrash, fetchTrash]);

  useEffect(() => {
    writeThemePreferenceToStorage(themePreference);
    applyDarkClassToDocument(resolveEffectiveDark(themePreference));
  }, [themePreference, colorSchemeTick]);

  useEffect(() => {
    if (themePreference !== THEME_AUTO) return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => setColorSchemeTick((t) => t + 1);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [themePreference]);

  useEffect(() => {
    const onClickOutside = (event) => {
      if (dataMenuRef.current && !dataMenuRef.current.contains(event.target)) {
        setShowDataMenu(false);
      }
      // Đóng sidebar trên mobile khi click ra ngoài
      if (
        window.innerWidth < 1024 &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target)
      ) {
        setSidebarOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  // Tạo note mặc định khi mở modal tạo
  const defaultNewNote = useMemo(
    () => ({
      title: "",
      content: "",
      color: "#FFE4B5",
      tags: [],
      isFavorite: false,
      isArchived: false,
      isPinned: false,
      category: "personal",
      checklist: [],
      isMarkdown: false,
      reminder: null,
    }),
    []
  );

  // API helpers nhận note từ modal
  const createNoteFromModal = useCallback(async (noteToCreate) => {
    if (!noteToCreate.title.trim()) {
      await appAlert("Vui lòng nhập tiêu đề!", {
        title: "Thiếu tiêu đề",
        variant: "warning",
      });
      return;
    }
    try {
      const response = await fetch(`${API_URL}/notes`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(noteToCreate),
      });
      const note = await response.json();
      setNotes((prev) => [note, ...prev]);
      setIsCreating(false);
      // Refresh categories sau khi tạo note
      await fetchCustomCategories();
    } catch (error) {
      console.error("Lỗi khi tạo note:", error);
      await appAlert(
        "Không thể tạo ghi chú. Vui lòng kiểm tra kết nối backend!",
        { title: "Lỗi", variant: "error" }
      );
    }
  }, [getAuthHeaders, fetchCustomCategories, appAlert]);

  const updateNoteFromModal = useCallback(async (noteToUpdate) => {
    if (!noteToUpdate.title.trim()) {
      await appAlert("Vui lòng nhập tiêu đề!", {
        title: "Thiếu tiêu đề",
        variant: "warning",
      });
      return;
    }
    try {
      const { _id, userId, createdAt, updatedAt, __v, ...dataToSend } = noteToUpdate;
      const response = await fetch(`${API_URL}/notes/${noteToUpdate._id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(dataToSend),
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "Failed to update note");
      }
      const updatedNote = await response.json();
      setNotes((prev) =>
        prev.map((n) => (n._id === updatedNote._id ? updatedNote : n))
      );
      setEditingNote(null);
    } catch (error) {
      console.error("Lỗi khi cập nhật note:", error);
      await appAlert("Không thể cập nhật ghi chú!", {
        title: "Lỗi",
        variant: "error",
      });
    }
  }, [getAuthHeaders, appAlert]);

  const deleteNote = useCallback(async (id) => {
    if (
      !(await appConfirm("Bạn có chắc muốn xóa ghi chú này? (có thể khôi phục từ thùng rác)", {
        title: "Xóa ghi chú",
        confirmLabel: "Xóa",
        danger: true,
      }))
    )
      return;

    try {
      await fetch(`${API_URL}/notes/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      setNotes((prev) => prev.filter((n) => n._id !== id));
      if (showTrash) {
        await fetchTrash();
      }
    } catch (error) {
      console.error("Lỗi khi xóa note:", error);
    }
  }, [getAuthHeaders, showTrash, fetchTrash, appConfirm]);

  const removeShare = useCallback(async (shareId) => {
    if (
      !(await appConfirm("Bạn có chắc muốn xóa ghi chú này khỏi danh sách Được chia sẻ?", {
        title: "Xóa ghi chú được chia sẻ",
        confirmLabel: "Xóa",
        danger: true,
      }))
    )
      return;

    try {
      const response = await fetch(`${API_URL}/shares/${shareId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        setSharedNotes((prev) => prev.filter((n) => n.shareId !== shareId));
      }
    } catch (error) {
      console.error("Lỗi khi xóa ghi chú được chia sẻ:", error);
    }
  }, [getAuthHeaders, appConfirm]);

  const restoreNote = useCallback(async (id) => {
    try {
      const response = await fetch(`${API_URL}/notes/${id}/restore`, {
        method: "POST",
        headers: getAuthHeaders(),
      });
      const note = await response.json();
      setTrashNotes((prev) => prev.filter((n) => n._id !== id));
      setNotes((prev) => [note, ...prev]);
    } catch (error) {
      console.error("Lỗi khi khôi phục:", error);
    }
  }, [getAuthHeaders]);

  const deletePermanently = useCallback(async (id) => {
    if (
      !(await appConfirm(
        "Bạn có chắc muốn xóa VĨNH VIỄN? Hành động này không thể hoàn tác!",
        {
          title: "Xóa vĩnh viễn",
          confirmLabel: "Xóa vĩnh viễn",
          danger: true,
        }
      ))
    )
      return;

    try {
      await fetch(`${API_URL}/notes/${id}/permanent`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      setTrashNotes((prev) => prev.filter((n) => n._id !== id));
    } catch (error) {
      console.error("Lỗi khi xóa vĩnh viễn:", error);
    }
  }, [getAuthHeaders, appConfirm]);

  // Smart Filters với logic nâng cao
  const filteredNotes = useMemo(() => {
    let filtered = showShared ? [...sharedNotes] : [...notes];

    // Smart search - tìm kiếm thông minh
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter((note) => {
        // Tìm trong title
        if (note.title?.toLowerCase().includes(searchLower)) return true;
        // Tìm trong content
        if (note.content?.toLowerCase().includes(searchLower)) return true;
        // Tìm trong tags
        if (note.tags?.some((tag) => tag.toLowerCase().includes(searchLower))) return true;
        // Tìm trong checklist
        if (note.checklist?.some((item) => item.text?.toLowerCase().includes(searchLower))) return true;
        return false;
      });
    }

    // Filter theo category (hỗ trợ custom categories)
    if (selectedCategory !== "all") {
      filtered = filtered.filter((n) => {
        // Kiểm tra cả default categories và custom categories
        if (n.category === selectedCategory) return true;
        // Nếu selectedCategory là custom category ID, kiểm tra theo _id
        const customCat = customCategories.find((c) => c._id === selectedCategory);
        if (customCat) {
          // Có thể note.category lưu _id hoặc name của custom category
          return n.category === customCat._id || n.category === customCat.name;
        }
        return false;
      });
    }

    // Filter theo mode
    if (filterMode === "favorites") {
      filtered = filtered.filter((n) => n.isFavorite);
    } else if (filterMode === "archived") {
      filtered = filtered.filter((n) => n.isArchived);
    } else if (filterMode === "active") {
      filtered = filtered.filter((n) => !n.isArchived);
    }

    // Filter theo reminder (notes có reminder sắp tới)
    if (filterMode === "reminders") {
      const now = new Date();
      filtered = filtered.filter((n) => {
        if (!n.reminder) return false;
        const reminderDate = new Date(n.reminder);
        return reminderDate > now && !n.reminderSent;
      });
    }

    // Sort
    if (sortMode === "date") {
      filtered.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
    } else if (sortMode === "title") {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortMode === "color") {
      filtered.sort((a, b) => (a.color || "").localeCompare(b.color || ""));
    } else if (sortMode === "updated") {
      filtered.sort((a, b) => {
        const aUpdated = new Date(a.updatedAt || a.createdAt);
        const bUpdated = new Date(b.updatedAt || b.createdAt);
        return bUpdated - aUpdated;
      });
    }

    return filtered;
  }, [notes, sharedNotes, showShared, searchTerm, selectedCategory, filterMode, sortMode, customCategories]);

  const toggleNoteSelection = useCallback((noteId) => {
    setSelectedNotes(prev => 
      prev.includes(noteId) 
        ? prev.filter(id => id !== noteId)
        : [...prev, noteId]
    );
  }, []);

  const selectAllNotes = useCallback(() => {
    setSelectedNotes(filteredNotes.map(note => note._id));
  }, [filteredNotes]);

  const deselectAllNotes = useCallback(() => {
    setSelectedNotes([]);
  }, []);

  const deleteSelectedNotes = useCallback(async () => {
    if (selectedNotes.length === 0) return;
    
    const confirmMsg = `Bạn có chắc muốn xóa ${selectedNotes.length} ghi chú đã chọn?`;
    if (
      !(await appConfirm(confirmMsg, {
        title: "Xóa nhiều ghi chú",
        confirmLabel: "Xóa",
        danger: true,
      }))
    )
      return;

    try {
      await Promise.all(
        selectedNotes.map(id => 
          fetch(`${API_URL}/notes/${id}`, {
            method: "DELETE",
            headers: getAuthHeaders(),
          })
        )
      );
      
      setNotes(prev => prev.filter(n => !selectedNotes.includes(n._id)));
      setSelectedNotes([]);
      
      if (showTrash) {
        await fetchTrash();
      }
    } catch (error) {
      console.error("Lỗi khi xóa notes:", error);
      await appAlert("Có lỗi xảy ra khi xóa ghi chú!", {
        title: "Lỗi",
        variant: "error",
      });
    }
  }, [selectedNotes, getAuthHeaders, showTrash, fetchTrash, appConfirm, appAlert]);

  const duplicateNote = useCallback(async (note) => {
    const newNote = { ...note };
    delete newNote._id;
    newNote.title = `${note.title} (Copy)`;

    try {
      const response = await fetch(`${API_URL}/notes`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(newNote),
      });
      const created = await response.json();
      setNotes((prev) => [created, ...prev]);
      showToast("Đã sao chép ghi chú thành công!");
    } catch (error) {
      console.error("Lỗi:", error);
      showToast("Lỗi khi sao chép ghi chú", "error");
    }
  }, [getAuthHeaders, showToast]);

  const fetchVersions = useCallback(async (noteId) => {
    try {
      const response = await fetch(`${API_URL}/notes/${noteId}/versions`, {
        headers: getAuthHeaders(),
      });
      const versions = await response.json();
      setNoteVersions(versions);
      setSelectedNoteForVersions(noteId);
      setShowVersions(true);
    } catch (error) {
      console.error("Lỗi khi tải versions:", error);
    }
  }, [getAuthHeaders]);

  const restoreVersion = useCallback(async (noteId, versionId) => {
    try {
      const response = await fetch(`${API_URL}/notes/${noteId}/versions/${versionId}/restore`, {
        method: "POST",
        headers: getAuthHeaders(),
      });
      const restoredNote = await response.json();
      setNotes((prev) =>
        prev.map((n) => (n._id === restoredNote._id ? restoredNote : n))
      );
      setShowVersions(false);
      await appAlert("Đã khôi phục phiên bản cũ.", {
        title: "Thành công",
        variant: "success",
      });
    } catch (error) {
      console.error("Lỗi khi khôi phục version:", error);
    }
  }, [getAuthHeaders, appAlert]);

  const shareNote = useCallback(async (note, email, permission) => {
    try {
      const response = await fetch(`${API_URL}/shares`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ noteId: note._id, email, permission }),
      });
      if (response.ok) {
        await appAlert("Đã chia sẻ ghi chú.", {
          title: "Thành công",
          variant: "success",
        });
        setShowShareModal(false);
        setShareEmail("");
      } else {
        const data = await response.json();
        await appAlert(data.error || "Lỗi khi chia sẻ", {
          title: "Không thể chia sẻ",
          variant: "error",
        });
      }
    } catch (error) {
      console.error("Lỗi khi chia sẻ:", error);
      await appAlert("Lỗi khi chia sẻ ghi chú", {
        title: "Lỗi",
        variant: "error",
      });
    }
  }, [getAuthHeaders, appAlert]);

  const togglePin = useCallback(async (note) => {
    try {
      const updatedNote = { ...note, isPinned: !note.isPinned };
      const { _id, userId, createdAt, updatedAt, __v, ...dataToSend } = updatedNote;
      const response = await fetch(`${API_URL}/notes/${note._id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(dataToSend),
      });
      const data = await response.json();
      setNotes((prev) => prev.map((n) => (n._id === data._id ? data : n)));
    } catch (error) {
      console.error("Lỗi:", error);
    }
  }, [getAuthHeaders]);

  const toggleFavorite = useCallback(async (note) => {
    try {
      const updatedNote = { ...note, isFavorite: !note.isFavorite };
      const { _id, userId, createdAt, updatedAt, __v, ...dataToSend } = updatedNote;
      const response = await fetch(`${API_URL}/notes/${note._id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(dataToSend),
      });
      const data = await response.json();
      setNotes((prev) => prev.map((n) => (n._id === data._id ? data : n)));
    } catch (error) {
      console.error("Lỗi:", error);
    }
  }, [getAuthHeaders]);

  const toggleArchive = useCallback(async (note) => {
    try {
      const updatedNote = { ...note, isArchived: !note.isArchived };
      const { _id, userId, createdAt, updatedAt, __v, ...dataToSend } = updatedNote;
      const response = await fetch(`${API_URL}/notes/${note._id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(dataToSend),
      });
      const data = await response.json();
      setNotes((prev) => prev.map((n) => (n._id === data._id ? data : n)));
      showToast(updatedNote.isArchived ? "Đã lưu trữ ghi chú" : "Đã bỏ lưu trữ ghi chú");
    } catch (error) {
      console.error("Lỗi:", error);
      showToast("Lỗi khi thay đổi trạng thái lưu trữ", "error");
    }
  }, [getAuthHeaders, showToast]);

  const exportNotes = useCallback(() => {
    const dataStr = JSON.stringify(notes, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `notes-backup-${
      new Date().toISOString().split("T")[0]
    }.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [notes]);

  const importNotes = useCallback(
    (event) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const importedNotes = JSON.parse(e.target.result);
          if (!Array.isArray(importedNotes)) {
            await appAlert("File không hợp lệ! Cần là mảng JSON các ghi chú.", {
              title: "Import thất bại",
              variant: "warning",
            });
            return;
          }
          for (const note of importedNotes) {
            const clone = { ...note };
            delete clone._id;
            await fetch(`${API_URL}/notes`, {
              method: "POST",
              headers: getAuthHeaders(),
              body: JSON.stringify(clone),
            });
          }
          await fetchNotes();
          await appAlert("Đã nhập ghi chú thành công.", {
            title: "Thành công",
            variant: "success",
          });
        } catch (error) {
          console.error(error);
          await appAlert("Lỗi khi nhập file!", {
            title: "Lỗi",
            variant: "error",
          });
        }
      };
      reader.readAsText(file);
      // reset input để lần sau vẫn onChange được file giống nhau
      event.target.value = "";
    },
    [fetchNotes, getAuthHeaders, appAlert]
  );

  const openShareModal = useCallback((note) => {
    setNoteToShare(note);
    setShowShareModal(true);
  }, []);


  const getStats = useCallback(() => {
    // Tính stats cho default categories
    const defaultStats = defaultCategories.slice(1).map((cat) => ({
      name: cat.name,
      count: notes.filter((n) => n.category === cat.id).length,
    }));
    
    // Tính stats cho custom categories
    const customStats = customCategories.map((cat) => ({
      name: cat.name,
      count: notes.filter((n) => n.category === cat._id || n.category === cat.name).length,
    }));
    
    return {
      total: notes.length,
      pinned: notes.filter((n) => n.isPinned).length,
      favorites: notes.filter((n) => n.isFavorite).length,
      archived: notes.filter((n) => n.isArchived).length,
      byCategory: [...defaultStats, ...customStats],
    };
  }, [notes, defaultCategories, customCategories]);

  // NEW: cập nhật nhanh checklist item ngay từ NoteCard
  const updateChecklistItem = useCallback(async (note, index, checked) => {
    try {
      const newChecklist = [...(note.checklist || [])];
      if (!newChecklist[index]) return;
      newChecklist[index] = { ...newChecklist[index], checked };

      const updatedNote = { ...note, checklist: newChecklist };
      const { _id, userId, createdAt, updatedAt, __v, ...dataToSend } = updatedNote;
      const res = await fetch(`${API_URL}/notes/${note._id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(dataToSend),
      });
      if (!res.ok) throw new Error("Update checklist failed");
      const data = await res.json();

      // cập nhật state cục bộ để UI phản hồi ngay
      setNotes((prev) => prev.map((n) => (n._id === data._id ? data : n)));
    } catch (e) {
      console.error("Lỗi cập nhật checklist:", e);
    }
  }, [getAuthHeaders]);

  // Optional: trạng thái xem thêm/thu gọn checklist theo từng note
  const [expandedChecklistIds, setExpandedChecklistIds] = useState({});
  const toggleExpandChecklist = useCallback((id) => {
    setExpandedChecklistIds((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);


  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-xl text-gray-600 dark:text-gray-300">
            Đang tải...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${
        effectiveDark
          ? "bg-gray-900"
          : "bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50"
      }`}
    >
      {sidebarOpen && (
        <button
          type="button"
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-[1px] z-20"
          aria-label="Đóng menu"
        />
      )}
      <div className="flex">
        {/* Sidebar */}
        <div
          ref={sidebarRef}
          className={`${
            sidebarOpen ? "w-64 translate-x-0" : "w-64 -translate-x-full"
          } lg:translate-x-0 lg:w-64 transition-transform duration-300 bg-white dark:bg-gray-800 shadow-lg fixed inset-y-0 left-0 z-30 flex flex-col border-r border-gray-200 dark:border-gray-700 overflow-hidden`}
        >
          <div className="p-6 overflow-y-auto flex-1">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <StickyNote size={24} className="text-blue-500" />
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                  Menu
                </h2>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setShowTrash(false); // Tắt thùng rác khi chọn category
                    setShowShared(false);
                    setSelectedCategory(cat.id);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${
                    selectedCategory === cat.id && !showTrash && !showShared
                      ? "bg-blue-500 text-white"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  {cat.icon}
                  <span className="flex-1 text-left">{cat.name}</span>
                  <span className="text-sm opacity-75">
                    {cat.id === "all"
                      ? notes.length
                      : notes.filter((n) => n.category === cat.id || n.category === cat._id).length}
                  </span>
                </button>
              ))}
            </div>



            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
              <button
                onClick={() => {
                  if (!showTrash) {
                    setSelectedCategory("all"); // Reset category khi mở thùng rác
                    setShowShared(false);
                    fetchTrash();
                  }
                  setShowTrash(!showTrash);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${
                  showTrash
                    ? "bg-red-500 text-white"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <Trash size={18} />
                <span>Thùng rác</span>
                {trashNotes.length > 0 && (
                  <span className="ml-auto bg-white bg-opacity-20 px-2 py-1 rounded-full text-xs">
                    {trashNotes.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => {
                  if (!showShared) {
                    setSelectedCategory("all");
                    setShowTrash(false);
                    fetchSharedNotes();
                  }
                  setShowShared(!showShared);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${
                  showShared && !showTrash
                    ? "bg-blue-500 text-white"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <Users size={18} />
                <span>Được chia sẻ</span>
                {sharedNotes.length > 0 && (
                  <span className="ml-auto bg-white bg-opacity-20 px-2 py-1 rounded-full text-xs">
                    {sharedNotes.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setShowStats(true)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
              >
                <BarChart3 size={18} />
                <span>Thống kê</span>
              </button>
              <button
                onClick={() => {
                  setShowActivityLog(true);
                  fetchActivities();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
              >
                <Activity size={18} />
                <span>Nhật ký</span>
              </button>
              <div className="px-4 py-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5 px-0.5">
                  Giao diện
                </p>
                <div
                  role="group"
                  aria-label="Chế độ giao diện: sáng, tối hoặc theo hệ thống"
                  className="grid grid-cols-3 gap-0.5 p-0.5 rounded-2xl bg-gray-100/95 dark:bg-gray-900/55 shadow-inner ring-1 ring-gray-200/90 dark:ring-gray-600/50"
                >
                  <button
                    type="button"
                    onClick={() => setUserTheme(THEME_LIGHT)}
                    aria-pressed={themePreference === THEME_LIGHT}
                    title="Sáng"
                    className={`flex h-9 items-center justify-center rounded-[0.65rem] transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-100 dark:focus-visible:ring-offset-gray-900 ${
                      themePreference === THEME_LIGHT
                        ? "bg-white dark:bg-gray-700 text-amber-500 shadow-sm dark:shadow-none"
                        : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                    }`}
                  >
                    <Sun size={18} strokeWidth={2.25} aria-hidden />
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserTheme(THEME_DARK)}
                    aria-pressed={themePreference === THEME_DARK}
                    title="Tối"
                    className={`flex h-9 items-center justify-center rounded-[0.65rem] transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-100 dark:focus-visible:ring-offset-gray-900 ${
                      themePreference === THEME_DARK
                        ? "bg-white dark:bg-gray-700 text-indigo-400 shadow-sm dark:shadow-none"
                        : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                    }`}
                  >
                    <Moon size={18} strokeWidth={2.25} aria-hidden />
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserTheme(THEME_AUTO)}
                    aria-pressed={themePreference === THEME_AUTO}
                    title="Theo hệ thống"
                    className={`flex h-9 items-center justify-center rounded-[0.65rem] transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-100 dark:focus-visible:ring-offset-gray-900 ${
                      themePreference === THEME_AUTO
                        ? "bg-white dark:bg-gray-700 text-sky-500 shadow-sm dark:shadow-none"
                        : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                    }`}
                  >
                    <Monitor size={18} strokeWidth={2.25} aria-hidden />
                  </button>
                </div>
              </div>
              <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 transition-all"
              >
                <LogOut size={18} />
                <span>Đăng xuất</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div
          className="flex-1 lg:ml-64 transition-all duration-300"
        >
          {/* Header */}
          <div className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-20">
            <div className="max-w-7xl mx-auto px-4 py-6">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3 mb-4">
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <Menu
                      size={24}
                      className="text-gray-700 dark:text-gray-300"
                    />
                  </button>
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
                    <StickyNote size={28} className="text-white" />
                  </div>
                  <div className="min-w-0">
                    <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Ghi Chú Pro
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {showTrash ? `${trashNotes.length} ghi chú trong thùng rác` : showShared ? `${sharedNotes.length} ghi chú được chia sẻ` : `${filteredNotes.length} ghi chú`}
                      {user && ` • Xin chào, ${user.username}`}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setIsCreating(true)}
                    className="shrink-0 flex items-center gap-2.5 px-5 py-2.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 text-white rounded-2xl font-semibold shadow-lg shadow-blue-500/20 hover:from-blue-600 hover:via-indigo-600 hover:to-purple-700 transition-all hover:shadow-xl hover:shadow-blue-500/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-800"
                  >
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 ring-1 ring-white/30">
                      <Plus size={16} />
                    </span>
                    <span className="hidden sm:inline">Thêm ghi chú</span>
                    <span className="sm:hidden">Thêm</span>
                  </button>
                  <CustomCategories onUpdate={fetchCustomCategories} />
                  <div className="relative shrink-0" ref={dataMenuRef}>
                    <button
                      type="button"
                      onClick={() => setShowDataMenu((prev) => !prev)}
                      className="flex items-center gap-2 px-3.5 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-600 bg-white/90 dark:bg-gray-700/60 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-800"
                    >
                      <span className="font-medium">
                        <span className="sm:hidden">Data</span>
                        <span className="hidden sm:inline">Dữ liệu</span>
                      </span>
                      <ChevronDown
                        size={16}
                        className={`transition-transform ${showDataMenu ? "rotate-180" : ""}`}
                      />
                    </button>
                    {showDataMenu && (
                      <div className="absolute right-0 mt-2 w-44 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-xl z-30 p-1">
                        <button
                          type="button"
                          onClick={() => {
                            setShowDataMenu(false);
                            document.getElementById("import-file").click();
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <Upload size={16} />
                          Nhập JSON
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowDataMenu(false);
                            exportNotes();
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <Download size={16} />
                          Xuất JSON
                        </button>
                      </div>
                    )}
                  </div>
                  <input
                    id="import-file"
                    type="file"
                    accept=".json"
                    onChange={importNotes}
                    className="hidden"
                  />
                  <button
                    onClick={performSync}
                    disabled={syncStatus.syncing}
                    className="shrink-0 flex items-center gap-2 px-3.5 py-2 border border-emerald-200/70 dark:border-emerald-800 bg-emerald-500 text-white rounded-xl text-sm font-semibold hover:bg-emerald-600 transition-all shadow-md disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-800"
                    title="Đồng bộ"
                  >
                    <RefreshCw size={16} className={syncStatus.syncing ? "animate-spin" : ""} />
                    <span className="hidden sm:inline">Sync</span>
                  </button>
                </div>
              </div>

              <div className="flex gap-3 mb-4">
                <div className="relative flex-1">
                  <Search
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="text"
                    placeholder="Tìm kiếm ghi chú, thẻ..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                      title="Xóa tìm kiếm"
                    >
                      <X size={20} />
                    </button>
                  )}
                </div>
                
                {/* Bulk delete controls */}
                {!showTrash && filteredNotes.length > 0 && (
                  <div className="flex gap-2">
                    {selectedNotes.length === 0 ? (
                      <button
                        onClick={selectAllNotes}
                        className="px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all flex items-center gap-2 whitespace-nowrap"
                        title="Chọn tất cả"
                      >
                        <CheckSquare size={18} />
                        <span className="hidden sm:inline">Chọn tất cả</span>
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={deselectAllNotes}
                          className="px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all flex items-center gap-2"
                          title="Bỏ chọn"
                        >
                          <X size={18} />
                          <span className="hidden sm:inline">Bỏ chọn</span>
                        </button>
                        <button
                          onClick={deleteSelectedNotes}
                          className="px-4 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-all flex items-center gap-2 shadow-lg hover:shadow-xl"
                          title={`Xóa ${selectedNotes.length} ghi chú`}
                        >
                          <Trash2 size={18} />
                          <span className="hidden sm:inline">Xóa ({selectedNotes.length})</span>
                          <span className="sm:hidden">{selectedNotes.length}</span>
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setFilterMode("all")}
                    className={`px-3 lg:px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1 ${
                      filterMode === "all"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                    }`}
                  >
                    <Filter size={14} />
                    Tất cả
                  </button>
                  <button
                    onClick={() => setFilterMode("active")}
                    className={`px-3 lg:px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                      filterMode === "active"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                    }`}
                  >
                    Đang dùng
                  </button>
                  <button
                    onClick={() => setFilterMode("favorites")}
                    className={`flex items-center gap-1 lg:gap-2 px-3 lg:px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                      filterMode === "favorites"
                        ? "bg-yellow-500 text-white"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                    }`}
                  >
                    <Star size={16} />
                    <span className="hidden sm:inline">Yêu thích</span>
                  </button>
                  <button
                    onClick={() => setFilterMode("archived")}
                    className={`flex items-center gap-1 lg:gap-2 px-3 lg:px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                      filterMode === "archived"
                        ? "bg-purple-500 text-white"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                    }`}
                  >
                    <Archive size={16} />
                    <span className="hidden sm:inline">Lưu trữ</span>
                  </button>
                </div>

                <div className="flex gap-2">
                  <select
                    value={sortMode}
                    onChange={(e) => setSortMode(e.target.value)}
                    className="px-3 py-2 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:border-blue-500 focus:outline-none text-sm font-semibold"
                  >
                    <option value="date">Mới nhất</option>
                    <option value="updated">Cập nhật gần nhất</option>
                    <option value="title">Tên A-Z</option>
                    <option value="color">Theo màu</option>
                  </select>
                  <button
                    onClick={() =>
                      setViewMode(viewMode === "grid" ? "list" : "grid")
                    }
                    className="p-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    {viewMode === "grid" ? (
                      <List
                        size={20}
                        className="text-gray-700 dark:text-gray-300"
                      />
                    ) : (
                      <Grid
                        size={20}
                        className="text-gray-700 dark:text-gray-300"
                      />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Notes Grid/List */}
          <div className="max-w-7xl mx-auto px-4 py-8">
            {showTrash ? (
              trashNotes.length === 0 ? (
                <div className="text-center py-20">
                  <Trash size={64} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                  <p className="text-xl text-gray-500 dark:text-gray-400">Thùng rác trống</p>
                </div>
              ) : (
                <div
                  className={
                    viewMode === "grid"
                      ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                      : "space-y-4"
                  }
                >
                  {trashNotes.map((note) => (
                    <div
                      key={note._id}
                      className="group relative rounded-2xl p-6 shadow-lg bg-gray-100 dark:bg-gray-700"
                    >
                      <h3 className="text-xl font-bold mb-3 text-gray-800 dark:text-white">
                        {note.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                        {note.content}
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => restoreNote(note._id)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                        >
                          <RotateCcw size={16} />
                          Khôi phục
                        </button>
                        <button
                          onClick={() => deletePermanently(note._id)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                        >
                          <Trash2 size={16} />
                          Xóa vĩnh viễn
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : filteredNotes.length === 0 ? (
              <div className="text-center py-20">
                <StickyNote
                  size={64}
                  className="mx-auto text-gray-300 dark:text-gray-600 mb-4"
                />
                <p className="text-xl text-gray-500 dark:text-gray-400">
                  {searchTerm
                    ? "Không tìm thấy ghi chú nào"
                    : "Chưa có ghi chú. Hãy tạo ghi chú đầu tiên!"}
                </p>
              </div>
            ) : (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    : "space-y-4"
                }
              >
                {filteredNotes.map((note) => (
                  <NoteCard
                    key={note._id}
                    note={note}
                    viewMode={viewMode}
                    showTrash={showTrash}
                    selectedNotes={selectedNotes}
                    toggleNoteSelection={toggleNoteSelection}
                    togglePin={togglePin}
                    toggleFavorite={toggleFavorite}
                    toggleArchive={toggleArchive}
                    deleteNote={deleteNote}
                    removeShare={removeShare}
                    duplicateNote={duplicateNote}
                    fetchVersions={fetchVersions}
                    openShareModal={openShareModal}
                    updateChecklistItem={updateChecklistItem}
                    expandedChecklistIds={expandedChecklistIds}
                    toggleExpandChecklist={toggleExpandChecklist}
                    categories={categories}
                    setEditingNote={setEditingNote}
                    setViewingNote={setViewingNote}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {isCreating && (
        <NoteModal
          key="create-modal"
          initialNote={defaultNewNote}
          onSave={createNoteFromModal}
          onClose={() => setIsCreating(false)}
          title="Tạo Ghi Chú Mới"
          colors={colors}
          categories={categories}
          customCategories={customCategories}
        />
      )}

      {editingNote && (
        <NoteModal
          key={editingNote._id}
          initialNote={editingNote}
          onSave={updateNoteFromModal}
          onClose={() => setEditingNote(null)}
          title="Chỉnh Sửa Ghi Chú"
          colors={colors}
          categories={categories}
          customCategories={customCategories}
        />
      )}

      {viewingNote && (
        <ViewNoteModal
          note={viewingNote}
          onClose={() => setViewingNote(null)}
          categories={categories}
        />
      )}

      {showStats && <StatsModal onClose={() => setShowStats(false)} stats={getStats()} />}

      {showShareModal && noteToShare && (
        <ShareModal
          note={noteToShare}
          shareEmail={shareEmail}
          setShareEmail={setShareEmail}
          sharePermission={sharePermission}
          setSharePermission={setSharePermission}
          onClose={() => {
            setShowShareModal(false);
            setNoteToShare(null);
            setShareEmail("");
          }}
          onSubmit={shareNote}
        />
      )}

      {showVersions && selectedNoteForVersions && (
        <VersionsModal
          noteId={selectedNoteForVersions}
          versions={noteVersions}
          onRestoreVersion={restoreVersion}
          onClose={() => {
            setShowVersions(false);
            setSelectedNoteForVersions(null);
            setNoteVersions([]);
          }}
        />
      )}

      {showActivityLog && (
        <ActivityLogModal
          activities={activities}
          onClose={() => setShowActivityLog(false)}
          onClearAll={clearAllActivities}
        />
      )}

      {/* Sync Status Indicator */}
      {syncStatus.syncing && (
        <div className="fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 z-40">
          <RefreshCw size={16} className="animate-spin" />
          <span>Đang đồng bộ...</span>
        </div>
      )}
      {toastMessage && (
        <div className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-xl text-white font-medium z-50 transition-all transform flex items-center gap-2 ${toastMessage.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}>
          {toastMessage.type === 'success' ? <CheckSquare size={18} /> : <AlertCircle size={18} />}
          {toastMessage.msg}
        </div>
      )}
    </div>
  );
};

export default NotesApp;
