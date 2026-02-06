import { useState, useEffect } from "react";
import {
  Search,
  Trash2,
  Plus,
  FileText,
  Loader2,
  ChevronRight,
  X,
  AlertCircle,
  Download,
  File,
  FileVideo,
  Image as ImageIcon,
  Link as LinkIcon,
  Upload,
} from "lucide-react";
import { adminLessonService } from "../../services/adminLessonService";
import { adminChapterService } from "../../services/adminChapterService";
import { adminSubjectService } from "../../services/adminSubjectService";
import { adminResourceService } from "../../services/adminResourceService";
import { showSuccessToast, showErrorToast } from "../../utils/show-toast";

const LessonResources = () => {
  const [resources, setResources] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("file"); // 'file' or 'url'
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [uploadData, setUploadData] = useState({
    resourceName: "",
    resourceType: "PDF",
    file: null,
    fileUrl: "",
    textContent: "",
  });

  useEffect(() => {
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (selectedSubject) {
      fetchChaptersBySubject(selectedSubject);
    }
  }, [selectedSubject]);

  useEffect(() => {
    if (selectedChapter) {
      fetchLessonsByChapter(selectedChapter);
    }
  }, [selectedChapter]);

  useEffect(() => {
    if (selectedLesson) {
      fetchResourcesByLesson(selectedLesson);
    }
  }, [selectedLesson]);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const data = await adminSubjectService.getAllSubjects();
      const subjectList = Array.isArray(data) ? data : data?.data || [];
      setSubjects(subjectList);
      if (subjectList.length > 0) {
        setSelectedSubject(subjectList[0].id);
      }
    } catch (error) {
      console.error("Error loading subjects:", error);
      showErrorToast("Không thể tải danh sách môn học");
    } finally {
      setLoading(false);
    }
  };

  const fetchChaptersBySubject = async (subjectId) => {
    try {
      setLoading(true);
      const data = await adminChapterService.getChaptersBySubject(subjectId);
      const chapterList = Array.isArray(data) ? data : data?.data || [];
      setChapters(chapterList);
      if (chapterList.length > 0) {
        setSelectedChapter(chapterList[0].id);
      } else {
        setSelectedChapter(null);
        setLessons([]);
      }
    } catch (error) {
      console.error("Error loading chapters:", error);
      showErrorToast("Không thể tải danh sách chương");
      setChapters([]);
      setLessons([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchLessonsByChapter = async (chapterId) => {
    try {
      setLoading(true);
      const data = await adminLessonService.getLessonsByChapter(chapterId);
      const lessonList = Array.isArray(data) ? data : data?.data || [];
      setLessons(lessonList);
      if (lessonList.length > 0) {
        setSelectedLesson(lessonList[0].id);
      } else {
        setSelectedLesson(null);
        setResources([]);
      }
    } catch (error) {
      console.error("Error loading lessons:", error);
      showErrorToast("Không thể tải danh sách bài học");
      setLessons([]);
      setResources([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchResourcesByLesson = async (lessonId) => {
    try {
      setLoading(true);
      const data = await adminResourceService.getResourcesByLesson(lessonId);
      const resourceList = Array.isArray(data) ? data : data?.data || [];
      setResources(resourceList);
    } catch (error) {
      console.error("Error loading resources:", error);
      showErrorToast("Không thể tải danh sách tài nguyên");
      setResources([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredResources = resources.filter((resource) =>
    resource.resourceName?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleUploadFile = () => {
    setModalMode("file");
    setUploadData({
      resourceName: "",
      resourceType: "PDF",
      file: null,
      fileUrl: "",
      textContent: "",
    });
    setShowModal(true);
  };

  const handleCreateUrl = () => {
    setModalMode("url");
    setUploadData({
      resourceName: "",
      resourceType: "URL",
      file: null,
      fileUrl: "",
      textContent: "",
    });
    setShowModal(true);
  };

  const handleDelete = (resource) => {
    setDeleteTarget(resource);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await adminResourceService.deleteResource(deleteTarget.id);
      showSuccessToast("Xóa tài nguyên thành công");
      setShowDeleteModal(false);
      setDeleteTarget(null);
      fetchResourcesByLesson(selectedLesson);
    } catch (error) {
      console.error("Error deleting resource:", error);
      showErrorToast(
        error.response?.data?.message || "Không thể xóa tài nguyên",
      );
    }
  };

  const handleDownload = async (resource) => {
    try {
      const response = await adminResourceService.downloadResource(resource.id);

      // Get MIME type from response or resource
      const mimeType =
        response.headers["content-type"] ||
        resource.mimeType ||
        "application/octet-stream";

      // Try to get filename from Content-Disposition header
      let filename = resource.resourceName || "download";
      const contentDisposition = response.headers["content-disposition"];
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(
          /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/,
        );
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, "");
        }
      }

      // If filename doesn't have extension, add it based on MIME type or resource type
      if (!filename.includes(".")) {
        const extensionMap = {
          PDF: ".pdf",
          DOCX: ".docx",
          VIDEO: ".mp4",
          IMAGE: ".png",
          "application/pdf": ".pdf",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
            ".docx",
          "video/mp4": ".mp4",
          "image/png": ".png",
          "image/jpeg": ".jpg",
        };
        const extension =
          extensionMap[resource.resourceType] || extensionMap[mimeType] || "";
        filename += extension;
      }

      // Create blob with correct MIME type
      const blob = new Blob([response.data], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading resource:", error);
      showErrorToast("Không thể tải xuống tài nguyên");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    try {
      if (modalMode === "file") {
        if (!uploadData.file) {
          showErrorToast("Vui lòng chọn file");
          return;
        }
        await adminResourceService.uploadFileResource(
          selectedLesson,
          uploadData.resourceType,
          uploadData.file,
          uploadData.resourceName,
        );
        showSuccessToast("Upload file thành công");
      } else {
        // URL or TEXT
        const payload = {
          lessonId: selectedLesson,
          resourceName: uploadData.resourceName,
          resourceType: uploadData.resourceType,
          fileUrl:
            uploadData.resourceType === "URL" ? uploadData.fileUrl : null,
          textContent:
            uploadData.resourceType === "TEXT" ? uploadData.textContent : null,
        };
        await adminResourceService.createResource(payload);
        showSuccessToast("Tạo tài nguyên thành công");
      }
      setShowModal(false);
      fetchResourcesByLesson(selectedLesson);
    } catch (error) {
      console.error("Error submitting resource:", error);
      showErrorToast(error.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setUploading(false);
    }
  };

  const getResourceIcon = (type) => {
    switch (type) {
      case "PDF":
        return <File size={24} color="#ef4444" />;
      case "DOCX":
        return <FileText size={24} color="#3b82f6" />;
      case "VIDEO":
        return <FileVideo size={24} color="#8b5cf6" />;
      case "IMAGE":
        return <ImageIcon size={24} color="#10b981" />;
      case "URL":
        return <LinkIcon size={24} color="#f59e0b" />;
      case "TEXT":
        return <FileText size={24} color="#6b7280" />;
      default:
        return <FileText size={24} />;
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "N/A";
    const mb = bytes / (1024 * 1024);
    return mb >= 1 ? `${mb.toFixed(2)} MB` : `${(bytes / 1024).toFixed(2)} KB`;
  };

  if (loading && subjects.length === 0) {
    return (
      <div className="empty-state glass">
        <Loader2 size={40} style={{ animation: "spin 1s linear infinite" }} />
        <p>Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="lesson-resources-page">
      <nav className="breadcrumb">
        <span>Admin</span>
        <ChevronRight size={16} />
        <span>Tài nguyên bài học</span>
      </nav>

      <div className="page-header">
        <div>
          <h2>Quản lý Tài nguyên</h2>
          <p>Upload và quản lý tài liệu, file học tập</p>
        </div>
        <div className="btn-group">
          <button
            onClick={handleUploadFile}
            className="btn btn-primary"
            disabled={!selectedLesson}
          >
            <Upload size={20} />
            Upload File
          </button>
          <button
            onClick={handleCreateUrl}
            className="btn btn-glass"
            disabled={!selectedLesson}
          >
            <Plus size={20} />
            Thêm URL/Text
          </button>
        </div>
      </div>

      <div className="stats-grid single-stat">
        <div className="stat-card glass">
          <div className="stat-header">
            <div>
              <p className="stat-label">Tổng tài nguyên</p>
              <h3 className="stat-value">{resources.length}</h3>
            </div>
            <div className="stat-icon-wrapper bg-indigo">
              <FileText size={24} color="white" />
            </div>
          </div>
          <div className="stat-trend">
            <span className="trend-label">
              {lessons.find((l) => l.id === selectedLesson)?.lessonName ||
                "Chưa chọn bài học"}
            </span>
          </div>
        </div>
      </div>

      <div className="filters-section glass">
        <div className="filter-row-4">
          <div className="search-box">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Tìm kiếm tài nguyên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <select
            value={selectedSubject || ""}
            onChange={(e) => setSelectedSubject(Number(e.target.value))}
            className="filter-select"
          >
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.subjectCode}
              </option>
            ))}
          </select>
          <select
            value={selectedChapter || ""}
            onChange={(e) => setSelectedChapter(Number(e.target.value))}
            className="filter-select"
            disabled={!chapters.length}
          >
            {chapters.length === 0 ? (
              <option>Không có chương</option>
            ) : (
              chapters.map((chapter) => (
                <option key={chapter.id} value={chapter.id}>
                  Chương {chapter.chapterNumber}: {chapter.chapterName}
                </option>
              ))
            )}
          </select>
          <select
            value={selectedLesson || ""}
            onChange={(e) => setSelectedLesson(Number(e.target.value))}
            className="filter-select"
            disabled={!lessons.length}
          >
            {lessons.length === 0 ? (
              <option>Không có bài học</option>
            ) : (
              lessons.map((lesson) => (
                <option key={lesson.id} value={lesson.id}>
                  Bài {lesson.lessonNumber}: {lesson.lessonName}
                </option>
              ))
            )}
          </select>
        </div>
      </div>

      {filteredResources.length === 0 ? (
        <div className="empty-state glass">
          <FileText size={48} />
          <p>Chưa có tài nguyên nào</p>
          {selectedLesson && (
            <div className="empty-actions">
              <button onClick={handleUploadFile} className="btn btn-primary">
                <Upload size={20} />
                Upload file đầu tiên
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="resources-grid">
          {filteredResources.map((resource) => (
            <div key={resource.id} className="resource-card">
              <div
                className={`resource-header-bg resource-${resource.resourceType.toLowerCase()}`}
              >
                <div className="resource-icon-large">
                  {getResourceIcon(resource.resourceType)}
                </div>
                <span className="resource-type-label">
                  {resource.resourceType}
                </span>
              </div>

              <div className="resource-body">
                <h3 className="resource-title">
                  {resource.resourceName || "Untitled"}
                </h3>

                <div className="resource-info">
                  {resource.fileSize && (
                    <div className="info-item">
                      <span className="info-icon">📦</span>
                      <span>{formatFileSize(resource.fileSize)}</span>
                    </div>
                  )}
                  {resource.mimeType && (
                    <div className="info-item">
                      <span className="info-icon">📄</span>
                      <span className="mime-type">
                        {resource.mimeType.split("/")[1]?.toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="resource-footer">
                  {["PDF", "DOCX", "VIDEO", "IMAGE"].includes(
                    resource.resourceType,
                  ) && (
                    <button
                      onClick={() => handleDownload(resource)}
                      className="resource-btn btn-download"
                      title="Tải xuống"
                    >
                      <Download size={18} />
                      <span>Tải xuống</span>
                    </button>
                  )}
                  {resource.resourceType === "URL" && (
                    <a
                      href={resource.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="resource-btn btn-link"
                    >
                      <LinkIcon size={18} />
                      <span>Mở link</span>
                    </a>
                  )}
                  <button
                    onClick={() => handleDelete(resource)}
                    className="resource-btn-icon btn-delete"
                    title="Xóa"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload/Create Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content glass">
            <div className="modal-header">
              <h3>
                {modalMode === "file"
                  ? "Upload tài nguyên file"
                  : "Tạo tài nguyên URL/Text"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="modal-close-btn"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Tên tài nguyên</label>
                <input
                  type="text"
                  value={uploadData.resourceName}
                  onChange={(e) =>
                    setUploadData({
                      ...uploadData,
                      resourceName: e.target.value,
                    })
                  }
                  placeholder="Ví dụ: Bài giảng chương 1"
                  maxLength="200"
                />
              </div>

              {modalMode === "file" ? (
                <>
                  <div className="form-group">
                    <label>
                      Loại file <span className="required">*</span>
                    </label>
                    <select
                      value={uploadData.resourceType}
                      onChange={(e) =>
                        setUploadData({
                          ...uploadData,
                          resourceType: e.target.value,
                        })
                      }
                      required
                    >
                      <option value="PDF">PDF</option>
                      <option value="DOCX">Word Document (DOCX)</option>
                      <option value="VIDEO">Video</option>
                      <option value="IMAGE">Hình ảnh</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>
                      Chọn file <span className="required">*</span>
                    </label>
                    <input
                      type="file"
                      onChange={(e) =>
                        setUploadData({
                          ...uploadData,
                          file: e.target.files[0],
                        })
                      }
                      accept={
                        uploadData.resourceType === "PDF"
                          ? ".pdf"
                          : uploadData.resourceType === "DOCX"
                            ? ".docx,.doc"
                            : uploadData.resourceType === "VIDEO"
                              ? "video/*"
                              : "image/*"
                      }
                      required
                    />
                    {uploadData.file && (
                      <p className="file-info">
                        File: {uploadData.file.name} (
                        {formatFileSize(uploadData.file.size)})
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="form-group">
                    <label>
                      Loại tài nguyên <span className="required">*</span>
                    </label>
                    <select
                      value={uploadData.resourceType}
                      onChange={(e) =>
                        setUploadData({
                          ...uploadData,
                          resourceType: e.target.value,
                        })
                      }
                      required
                    >
                      <option value="URL">URL</option>
                      <option value="TEXT">Text Content</option>
                    </select>
                  </div>

                  {uploadData.resourceType === "URL" ? (
                    <div className="form-group">
                      <label>
                        URL <span className="required">*</span>
                      </label>
                      <input
                        type="url"
                        value={uploadData.fileUrl}
                        onChange={(e) =>
                          setUploadData({
                            ...uploadData,
                            fileUrl: e.target.value,
                          })
                        }
                        placeholder="https://example.com/resource"
                        maxLength="500"
                        required
                      />
                    </div>
                  ) : (
                    <div className="form-group">
                      <label>
                        Nội dung text <span className="required">*</span>
                      </label>
                      <textarea
                        value={uploadData.textContent}
                        onChange={(e) =>
                          setUploadData({
                            ...uploadData,
                            textContent: e.target.value,
                          })
                        }
                        placeholder="Nhập nội dung..."
                        rows="6"
                        required
                      />
                    </div>
                  )}
                </>
              )}

              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-glass"
                  disabled={uploading}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={uploading}
                >
                  {uploading ? (
                    <>
                      <Loader2
                        size={16}
                        style={{ animation: "spin 1s linear infinite" }}
                      />
                      Đang xử lý...
                    </>
                  ) : (
                    <>{modalMode === "file" ? "Upload" : "Tạo mới"}</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deleteTarget && (
        <div className="modal-overlay">
          <div className="modal-content glass modal-small">
            <div className="modal-header modal-header-danger">
              <div className="modal-header-icon">
                <AlertCircle size={24} />
              </div>
              <h3>Xác nhận xóa</h3>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="modal-close-btn"
              >
                <X size={24} />
              </button>
            </div>
            <div className="modal-body">
              <p>
                Bạn có chắc chắn muốn xóa tài nguyên{" "}
                <strong>{deleteTarget.resourceName || "này"}</strong>?
              </p>
              <p className="warning-text">Hành động này không thể hoàn tác!</p>
            </div>
            <div className="modal-actions">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="btn btn-glass"
              >
                Hủy
              </button>
              <button onClick={confirmDelete} className="btn btn-danger">
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .lesson-resources-page {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem;
        }
        .breadcrumb {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
          color: var(--color-text-secondary);
          font-size: 0.875rem;
        }
        .breadcrumb span:last-child {
          color: var(--color-text-primary);
          font-weight: 600;
        }
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }
        .page-header h2 {
          font-size: 2rem;
          font-weight: 800;
          margin-bottom: 0.25rem;
        }
        .page-header p {
          color: var(--color-text-secondary);
        }
        .btn-group {
          display: flex;
          gap: 0.75rem;
        }
        .stats-grid.single-stat {
          max-width: 400px;
          margin-bottom: 2rem;
        }
        .stat-card {
          padding: 1.5rem;
          border-radius: 16px;
        }
        .stat-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }
        .stat-label {
          font-size: 0.875rem;
          color: var(--color-text-secondary);
          font-weight: 600;
          margin-bottom: 0.5rem;
        }
        .stat-value {
          font-size: 2rem;
          font-weight: 800;
          color: var(--color-text-primary);
        }
        .stat-icon-wrapper {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .bg-indigo {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
        }
        .stat-trend {
          margin-top: 0.5rem;
        }
        .trend-label {
          font-size: 0.875rem;
          color: var(--color-text-secondary);
        }
        .filters-section {
          padding: 1.5rem;
          border-radius: 16px;
          margin-bottom: 1.5rem;
        }
        .filter-row-4 {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 1rem;
        }
        .search-box {
          position: relative;
        }
        .search-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--color-text-secondary);
          pointer-events: none;
        }
        .search-input {
          width: 100%;
          padding: 0.875rem 1rem 0.875rem 3rem;
          border: 1px solid rgba(0, 0, 0, 0.1);
          border-radius: 12px;
          font-family: var(--font-main);
          background: white;
          transition: all 0.2s;
        }
        .search-input:focus {
          outline: none;
          border-color: var(--color-accent-1);
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }
        .filter-select {
          padding: 0.875rem 1rem;
          border: 1px solid rgba(0, 0, 0, 0.1);
          border-radius: 12px;
          font-family: var(--font-main);
          background: white;
          cursor: pointer;
          transition: all 0.2s;
        }
        .filter-select:focus {
          outline: none;
          border-color: var(--color-accent-1);
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }
        .filter-select:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
          border-radius: 16px;
        }
        .empty-state svg {
          color: var(--color-text-secondary);
          margin-bottom: 1rem;
        }
        .empty-state p {
          color: var(--color-text-secondary);
          margin-bottom: 1.5rem;
        }
        .empty-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
        }
        .empty-state svg {
          color: var(--color-text-secondary);
          margin-bottom: 1rem;
        }
        .empty-state p {
          color: var(--color-text-secondary);
          margin-bottom: 1.5rem;
        }
        .resources-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
          margin-top: 2rem;
        }
        .resource-card {
          background: white;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border: 1px solid rgba(0, 0, 0, 0.05);
        }
        .resource-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
        }
        .resource-header-bg {
          height: 140px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          position: relative;
          overflow: hidden;
        }
        .resource-header-bg::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: inherit;
          opacity: 0.1;
        }
        .resource-pdf {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
        }
        .resource-docx {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
        }
        .resource-video {
          background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
        }
        .resource-image {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        }
        .resource-url {
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
        }
        .resource-text {
          background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
        }
        .resource-icon-large {
          width: 64px;
          height: 64px;
          background: rgba(255, 255, 255, 0.95);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          position: relative;
          z-index: 1;
        }
        .resource-icon-large svg {
          width: 32px;
          height: 32px;
        }
        .resource-type-label {
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: white;
          background: rgba(0, 0, 0, 0.2);
          padding: 0.35rem 1rem;
          border-radius: 20px;
          position: relative;
          z-index: 1;
        }
        .resource-body {
          padding: 1.5rem;
        }
        .resource-title {
          font-size: 1.125rem;
          font-weight: 700;
          color: var(--color-text-primary);
          margin: 0 0 1rem 0;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          min-height: 2.8rem;
        }
        .resource-info {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 1.25rem;
          padding-bottom: 1.25rem;
          border-bottom: 1px solid rgba(0, 0, 0, 0.06);
        }
        .info-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: var(--color-text-secondary);
        }
        .info-icon {
          font-size: 1rem;
        }
        .mime-type {
          font-family: 'Courier New', monospace;
          font-weight: 600;
        }
        .resource-footer {
          display: flex;
          gap: 0.75rem;
          align-items: center;
        }
        .resource-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          border: none;
          border-radius: 12px;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          text-decoration: none;
        }
        .btn-download {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
        }
        .btn-download:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
        }
        .btn-link {
          background: linear-gradient(135deg, #f59e0b, #d97706);
          color: white;
        }
        .btn-link:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
        }
        .resource-btn-icon {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s;
          flex-shrink: 0;
        }
        .btn-delete {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
        }
        .btn-delete:hover {
          background: #ef4444;
          color: white;
          transform: scale(1.05);
        }
        .lessons-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.5rem;
        }
        .lesson-card {
          padding: 1.5rem;
          border-radius: 16px;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .lesson-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
        }
        .lesson-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }
        .lesson-number-badge {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
          padding: 0.375rem 0.875rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 700;
        }
        .lesson-actions {
          display: flex;
          gap: 0.5rem;
        }
        .btn-icon {
          padding: 0.5rem;
          border: none;
          background: rgba(0, 0, 0, 0.05);
          border-radius: 8px;
          cursor: pointer;
          color: var(--color-text-primary);
          transition: all 0.2s;
        }
        .btn-icon:hover {
          background: rgba(99, 102, 241, 0.1);
          color: var(--color-accent-1);
        }
        .btn-icon.btn-danger:hover {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
        }
        .lesson-name {
          font-size: 1.125rem;
          font-weight: 700;
          margin-bottom: 0.75rem;
          color: var(--color-text-primary);
        }
        .lesson-description {
          font-size: 0.875rem;
          color: var(--color-text-secondary);
          line-height: 1.5;
          margin-bottom: 1rem;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .lesson-footer {
          padding-top: 1rem;
          border-top: 1px solid rgba(0, 0, 0, 0.05);
        }
        .lesson-stat {
          font-size: 0.875rem;
          color: var(--color-text-secondary);
        }
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }
        .modal-content {
          width: 100%;
          max-width: 600px;
          max-height: 90vh;
          overflow-y: auto;
          border-radius: 16px;
          background: white;
        }
        .modal-content.modal-small {
          max-width: 400px;
        }
        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.5rem;
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
          border-radius: 16px 16px 0 0;
        }
        .modal-header h3 {
          font-size: 1.25rem;
          font-weight: 700;
          margin: 0;
        }
        .modal-header-danger {
          background: linear-gradient(135deg, #ef4444, #dc2626);
        }
        .modal-header-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 1rem;
        }
        .modal-close-btn {
          padding: 0.5rem;
          border: none;
          background: rgba(255, 255, 255, 0.2);
          color: white;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.2s;
        }
        .modal-close-btn:hover {
          background: rgba(255, 255, 255, 0.3);
        }
        .modal-form {
          padding: 1.5rem;
        }
        .modal-body {
          padding: 1.5rem;
        }
        .modal-body p {
          margin-bottom: 0.5rem;
          line-height: 1.6;
        }
        .warning-text {
          color: #ef4444;
          font-size: 0.875rem;
          font-weight: 600;
        }
        .form-group {
          margin-bottom: 1.25rem;
        }
        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 600;
          color: var(--color-text-primary);
        }
        .required {
          color: #ef4444;
        }
        .form-group input,
        .form-group textarea,
        .form-group select {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 1px solid rgba(0, 0, 0, 0.1);
          border-radius: 12px;
          font-family: var(--font-main);
          transition: all 0.2s;
        }
        .form-group input:focus,
        .form-group textarea:focus,
        .form-group select:focus {
          outline: none;
          border-color: var(--color-accent-1);
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }
        .form-group textarea {
          resize: vertical;
        }
        .form-actions,
        .modal-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          padding: 1rem 1.5rem;
          border-top: 1px solid rgba(0, 0, 0, 0.05);
        }
        @media (max-width: 768px) {
          .filter-row-4 {
            grid-template-columns: 1fr;
          }
          .resources-grid,
          .lessons-grid {
            grid-template-columns: 1fr;
          }
          .btn-group {
            flex-direction: column;
          }
        }
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default LessonResources;
