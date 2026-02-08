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
import "./LessonResources.css";

const LessonResources = () => {
  const [resources, setResources] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const grades = [6, 7, 8, 9, 10, 11, 12];
  const [showModal, setShowModal] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [modalMode, setModalMode] = useState("file"); // 'file' or 'url' - kept for backward compatibility
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [uploadData, setUploadData] = useState({
    resourceName: "",
    resourceType: "PDF",
    file: null,
    fileUrl: "",
    textContent: "",
  });

  // Wizard states
  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [wizardData, setWizardData] = useState({
    grade: null,
    subject: null,
    chapter: null,
    lesson: null,
    resourceName: "",
    description: "",
    resourceType: "PDF",
    file: null,
    fileUrl: "",
  });
  const [wizardChapters, setWizardChapters] = useState([]);
  const [wizardLessons, setWizardLessons] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isWizardClosing, setIsWizardClosing] = useState(false);
  const [isModalClosing, setIsModalClosing] = useState(false);

  useEffect(() => {
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (selectedSubject && selectedGrade) {
      fetchChaptersBySubject(selectedSubject, selectedGrade);
    } else if (selectedSubject) {
      setChapters([]);
      setLessons([]);
      setResources([]);
      setSelectedChapter(null);
      setSelectedLesson(null);
    }
  }, [selectedSubject, selectedGrade]);

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
        setSelectedGrade(grades[0]);
      }
    } catch (error) {
      console.error("Error loading subjects:", error);
      showErrorToast("Không thể tải danh sách môn học");
    } finally {
      setLoading(false);
    }
  };

  const fetchChaptersBySubject = async (subjectId, gradeLevel) => {
    try {
      setLoading(true);
      const data = await adminChapterService.getChaptersBySubject(
        subjectId,
        gradeLevel,
      );
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
    setWizardStep(1);
    setWizardData({
      grade: null,
      subject: null,
      chapter: null,
      lesson: null,
      resourceName: "",
      description: "",
      resourceType: "PDF",
      file: null,
      fileUrl: "",
    });
    setWizardChapters([]);
    setWizardLessons([]);
    setIsWizardClosing(false);
    setShowWizard(true);
  };

  const handleWizardClose = () => {
    setIsWizardClosing(true);
    setTimeout(() => {
      setShowWizard(false);
      setIsWizardClosing(false);
    }, 300);
  };

  // Wizard handlers
  const handleWizardNext = () => {
    if (wizardStep < 3) {
      setWizardStep(wizardStep + 1);
    }
  };

  const handleWizardBack = () => {
    if (wizardStep > 1) {
      setWizardStep(wizardStep - 1);
    }
  };

  const handleWizardGradeSelect = (grade) => {
    setWizardData({
      ...wizardData,
      grade,
      subject: null,
      chapter: null,
      lesson: null,
    });
    setWizardChapters([]);
    setWizardLessons([]);
  };

  const handleWizardSubjectSelect = async (subjectId) => {
    setWizardData({
      ...wizardData,
      subject: subjectId,
      chapter: null,
      lesson: null,
    });
    setWizardLessons([]);

    // Fetch chapters for selected subject and grade
    if (wizardData.grade) {
      try {
        const data = await adminChapterService.getChaptersBySubject(
          subjectId,
          wizardData.grade,
        );
        const chapterList = Array.isArray(data) ? data : data?.data || [];
        setWizardChapters(chapterList);
      } catch (error) {
        console.error("Error loading chapters:", error);
        showErrorToast("Không thể tải danh sách chương");
        setWizardChapters([]);
      }
    }
  };

  const handleWizardChapterSelect = async (chapterId) => {
    setWizardData({ ...wizardData, chapter: chapterId, lesson: null });

    // Fetch lessons for selected chapter
    try {
      const data = await adminLessonService.getLessonsByChapter(chapterId);
      const lessonList = Array.isArray(data) ? data : data?.data || [];
      setWizardLessons(lessonList);
    } catch (error) {
      console.error("Error loading lessons:", error);
      showErrorToast("Không thể tải danh sách bài học");
      setWizardLessons([]);
    }
  };

  const handleWizardDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleWizardDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleWizardDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      setWizardData({ ...wizardData, file });
    }
  };

  const handleWizardSubmit = async () => {
    try {
      setUploading(true);

      if (wizardData.resourceType === "URL") {
        // Create URL resource
        const payload = {
          lessonId: wizardData.lesson,
          resourceName: wizardData.resourceName,
          resourceType: "URL",
          fileUrl: wizardData.fileUrl,
          textContent: null,
        };
        await adminResourceService.createResource(payload);
        showSuccessToast("Tạo tài nguyên URL thành công!");
      } else {
        // Upload file resource
        await adminResourceService.uploadFileResource(
          wizardData.lesson,
          wizardData.resourceType,
          wizardData.file,
          wizardData.resourceName || wizardData.file.name,
        );
        showSuccessToast("Upload tài nguyên thành công!");
      }

      setShowWizard(false);

      // Refresh resources if we're viewing the same lesson
      if (selectedLesson === wizardData.lesson) {
        fetchResourcesByLesson(selectedLesson);
      }
    } catch (error) {
      console.error("Error uploading resource:", error);
      showErrorToast(
        error.response?.data?.message || "Không thể upload tài nguyên",
      );
    } finally {
      setUploading(false);
    }
  };

  const canProceedStep1 = wizardData.grade && wizardData.subject;
  const canProceedStep2 = wizardData.chapter && wizardData.lesson;
  const canSubmit =
    wizardData.resourceName.trim() &&
    (wizardData.resourceType === "URL"
      ? wizardData.fileUrl.trim()
      : wizardData.file);

  const handleModalClose = () => {
    setIsModalClosing(true);
    setTimeout(() => {
      setShowModal(false);
      setIsModalClosing(false);
    }, 300);
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
        <div className="page-header-info">
          <h2>Quản lý Tài nguyên bài học</h2>
          <p>Upload và quản lý tài liệu, file học tập</p>
        </div>
        <div className="btn-group">
          <button
            onClick={handleUploadFile}
            className="btn btn-primary"
            disabled={!selectedLesson}
          >
            <Plus size={20} />
            Thêm tài nguyên
          </button>
        </div>
      </div>

      <div className="stats-container">
        <div className="stat-card-resources">
          <div className="stat-card-header">
            <div className="stat-card-content">
              <div className="stat-label">Tổng tài nguyên</div>
              <div className="stat-value">{resources.length}</div>
            </div>
            <div className="stat-icon-wrapper">
              <FileText size={24} color="white" />
            </div>
          </div>
          <div className="stat-subtitle">
            {lessons.find((l) => l.id === selectedLesson)?.lessonName ||
              "Chưa chọn bài học"}
          </div>
        </div>
      </div>

      <div className="filters-section">
        <div className="filter-grid">
          <div className="search-box">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Tìm kiếm tài nguyên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <select
            value={selectedGrade || ""}
            onChange={(e) => {
              const grade = Number(e.target.value);
              setSelectedGrade(grade);
              setSelectedChapter(null);
              setSelectedLesson(null);
            }}
            className="filter-select"
            disabled={!selectedSubject}
          >
            {!selectedSubject ? (
              <option>Chọn khối</option>
            ) : (
              grades.map((grade) => (
                <option key={grade} value={grade}>
                  Khối {grade}
                </option>
              ))
            )}
          </select>
          <select
            value={selectedSubject || ""}
            onChange={(e) => {
              setSelectedSubject(Number(e.target.value));
              setSelectedChapter(null);
              setSelectedLesson(null);
            }}
            className="filter-select"
          >
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.subjectName}
              </option>
            ))}
          </select>
          <select
            value={selectedChapter || ""}
            onChange={(e) => {
              setSelectedChapter(Number(e.target.value));
              setSelectedLesson(null);
            }}
            className="filter-select"
            disabled={!chapters.length || !selectedGrade}
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
                      className="btn-download-icon"
                      title="Tải xuống"
                    >
                      <Download size={16} />
                      <span>Tải</span>
                    </button>
                  )}
                  {resource.resourceType === "URL" && (
                    <a
                      href={resource.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-link-icon"
                    >
                      <LinkIcon size={16} />
                      <span>Mở</span>
                    </a>
                  )}
                  <button
                    onClick={() => handleDelete(resource)}
                    className="resource-btn-icon btn-delete-icon"
                    title="Xóa"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload/Create Modal */}
      {showModal && (
        <div className={`modal-overlay ${isModalClosing ? "closing" : ""}`}>
          <div
            className={`modal-content glass ${isModalClosing ? "closing" : ""}`}
          >
            <div className="modal-header">
              <h3>
                {modalMode === "file"
                  ? "Upload tài nguyên file"
                  : "Tạo tài nguyên URL/Text"}
              </h3>
              <button onClick={handleModalClose} className="modal-close-btn">
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
                  onClick={handleModalClose}
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

      {/* Upload Wizard Modal */}
      {showWizard && (
        <div className={`modal-overlay ${isWizardClosing ? "closing" : ""}`}>
          <div className={`wizard-modal ${isWizardClosing ? "closing" : ""}`}>
            <div className="wizard-header">
              <h3>Upload Tài nguyên</h3>
              <button onClick={handleWizardClose} className="modal-close-btn">
                <X size={24} />
              </button>
            </div>

            {/* Stepper */}
            <div className="wizard-stepper">
              <div
                className={`wizard-step ${wizardStep >= 1 ? "active" : ""} ${wizardStep > 1 ? "completed" : ""}`}
              >
                <div className="step-number">1</div>
                <div className="step-label">Chọn Khối & Môn</div>
              </div>
              <div className="step-line"></div>
              <div
                className={`wizard-step ${wizardStep >= 2 ? "active" : ""} ${wizardStep > 2 ? "completed" : ""}`}
              >
                <div className="step-number">2</div>
                <div className="step-label">Chọn Chương & Bài</div>
              </div>
              <div className="step-line"></div>
              <div className={`wizard-step ${wizardStep >= 3 ? "active" : ""}`}>
                <div className="step-number">3</div>
                <div className="step-label">Tải lên file</div>
              </div>
            </div>

            <div className="wizard-content">
              {/* Step 1: Select Grade & Subject */}
              {wizardStep === 1 && (
                <div className="wizard-step-content">
                  <h4 className="step-title">Chọn Khối học</h4>
                  <div className="grade-chips">
                    {grades.map((grade) => (
                      <button
                        key={grade}
                        type="button"
                        className={`grade-chip ${wizardData.grade === grade ? "selected" : ""}`}
                        onClick={() => handleWizardGradeSelect(grade)}
                      >
                        Khối {grade}
                      </button>
                    ))}
                  </div>

                  {wizardData.grade && (
                    <>
                      <h4 className="step-title">Chọn Môn học</h4>
                      <div className="subject-list">
                        {subjects.map((subject) => (
                          <button
                            key={subject.id}
                            type="button"
                            className={`subject-card ${wizardData.subject === subject.id ? "selected" : ""}`}
                            onClick={() =>
                              handleWizardSubjectSelect(subject.id)
                            }
                          >
                            <div className="subject-icon">📚</div>
                            <div className="subject-name">
                              {subject.subjectName}
                            </div>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Step 2: Select Chapter & Lesson */}
              {wizardStep === 2 && (
                <div className="wizard-step-content">
                  <h4 className="step-title">Chọn Chương học</h4>
                  <select
                    value={wizardData.chapter || ""}
                    onChange={(e) =>
                      handleWizardChapterSelect(Number(e.target.value))
                    }
                    className="wizard-select"
                  >
                    <option value="">-- Chọn chương học --</option>
                    {wizardChapters.map((chapter) => (
                      <option key={chapter.id} value={chapter.id}>
                        Chương {chapter.chapterNumber}: {chapter.chapterName}
                      </option>
                    ))}
                  </select>

                  {wizardData.chapter && (
                    <>
                      <h4 className="step-title">Chọn Bài học</h4>
                      <select
                        value={wizardData.lesson || ""}
                        onChange={(e) =>
                          setWizardData({
                            ...wizardData,
                            lesson: Number(e.target.value),
                          })
                        }
                        className="wizard-select"
                      >
                        <option value="">-- Chọn bài học --</option>
                        {wizardLessons.map((lesson) => (
                          <option key={lesson.id} value={lesson.id}>
                            Bài {lesson.lessonNumber}: {lesson.lessonName}
                          </option>
                        ))}
                      </select>
                    </>
                  )}
                </div>
              )}

              {/* Step 3: Upload File */}
              {wizardStep === 3 && (
                <div className="wizard-step-content">
                  <h4 className="step-title">Loại tài nguyên</h4>
                  <div className="resource-type-selector">
                    <button
                      type="button"
                      className={`resource-type-btn ${wizardData.resourceType === "PDF" ? "selected" : ""}`}
                      onClick={() =>
                        setWizardData({ ...wizardData, resourceType: "PDF" })
                      }
                    >
                      <File size={20} />
                      PDF
                    </button>
                    <button
                      type="button"
                      className={`resource-type-btn ${wizardData.resourceType === "DOCX" ? "selected" : ""}`}
                      onClick={() =>
                        setWizardData({ ...wizardData, resourceType: "DOCX" })
                      }
                    >
                      <FileText size={20} />
                      DOCX
                    </button>
                    <button
                      type="button"
                      className={`resource-type-btn ${wizardData.resourceType === "VIDEO" ? "selected" : ""}`}
                      onClick={() =>
                        setWizardData({ ...wizardData, resourceType: "VIDEO" })
                      }
                    >
                      <FileVideo size={20} />
                      Video
                    </button>
                    <button
                      type="button"
                      className={`resource-type-btn ${wizardData.resourceType === "IMAGE" ? "selected" : ""}`}
                      onClick={() =>
                        setWizardData({ ...wizardData, resourceType: "IMAGE" })
                      }
                    >
                      <ImageIcon size={20} />
                      Hình ảnh
                    </button>
                    <button
                      type="button"
                      className={`resource-type-btn ${wizardData.resourceType === "URL" ? "selected" : ""}`}
                      onClick={() =>
                        setWizardData({
                          ...wizardData,
                          resourceType: "URL",
                          file: null,
                        })
                      }
                    >
                      <LinkIcon size={20} />
                      URL
                    </button>
                  </div>

                  {wizardData.resourceType === "URL" ? (
                    <>
                      <h4 className="step-title">Nhập đường dẫn URL</h4>
                      <div className="form-group">
                        <label>
                          Nhập đường dẫn URL <span className="required">*</span>
                        </label>
                        <input
                          type="url"
                          value={wizardData.fileUrl}
                          onChange={(e) =>
                            setWizardData({
                              ...wizardData,
                              fileUrl: e.target.value,
                            })
                          }
                          placeholder="https://youtube.com/watch?v=... hoặc https://drive.google.com/..."
                          className="wizard-input"
                          maxLength="500"
                        />
                        <p className="input-hint">
                          Ví dụ: Link Youtube, Google Drive, hoặc trang web khác
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <h4 className="step-title">Tải lên file</h4>
                      <div
                        className={`drag-drop-area ${isDragging ? "dragging" : ""}`}
                        onDragOver={handleWizardDragOver}
                        onDragLeave={handleWizardDragLeave}
                        onDrop={handleWizardDrop}
                      >
                        <div className="drag-drop-icon">
                          <Upload size={48} color="#8b5cf6" />
                        </div>
                        <p className="drag-drop-text">
                          Kéo thả file vào đây hoặc{" "}
                          <label className="file-select-label">
                            chọn file
                            <input
                              type="file"
                              onChange={(e) =>
                                setWizardData({
                                  ...wizardData,
                                  file: e.target.files[0],
                                })
                              }
                              accept={
                                wizardData.resourceType === "PDF"
                                  ? ".pdf"
                                  : wizardData.resourceType === "DOCX"
                                    ? ".docx,.doc"
                                    : wizardData.resourceType === "VIDEO"
                                      ? "video/*"
                                      : "image/*"
                              }
                              style={{ display: "none" }}
                            />
                          </label>
                        </p>
                        {wizardData.file && (
                          <div className="selected-file">
                            <FileText size={20} />
                            <span>{wizardData.file.name}</span>
                            <span className="file-size">
                              ({formatFileSize(wizardData.file.size)})
                            </span>
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  <div className="form-group">
                    <label>
                      Tên hiển thị của tài liệu{" "}
                      <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      value={wizardData.resourceName}
                      onChange={(e) =>
                        setWizardData({
                          ...wizardData,
                          resourceName: e.target.value,
                        })
                      }
                      placeholder="Ví dụ: Bài giảng chương 1 - Giới thiệu"
                      className="wizard-input"
                      maxLength="200"
                    />
                  </div>

                  <div className="form-group">
                    <label>Mô tả ngắn</label>
                    <textarea
                      value={wizardData.description}
                      onChange={(e) =>
                        setWizardData({
                          ...wizardData,
                          description: e.target.value,
                        })
                      }
                      placeholder="Mô tả ngắn gọn về tài liệu này..."
                      className="wizard-textarea"
                      rows="3"
                      maxLength="500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Wizard Navigation */}
            <div className="wizard-footer">
              <button
                type="button"
                onClick={handleWizardClose}
                className="btn btn-glass"
              >
                Hủy
              </button>

              <div className="wizard-footer-actions">
                <button
                  type="button"
                  onClick={handleWizardBack}
                  className="btn btn-glass"
                  disabled={wizardStep === 1}
                >
                  Quay lại
                </button>

                {wizardStep < 3 ? (
                  <button
                    type="button"
                    onClick={handleWizardNext}
                    className="btn btn-primary"
                    disabled={
                      (wizardStep === 1 && !canProceedStep1) ||
                      (wizardStep === 2 && !canProceedStep2)
                    }
                  >
                    Tiếp theo
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleWizardSubmit}
                    className="btn btn-primary"
                    disabled={!canSubmit || uploading}
                  >
                    {uploading ? (
                      <>
                        <Loader2
                          size={18}
                          style={{ animation: "spin 1s linear infinite" }}
                        />
                        Đang tải lên...
                      </>
                    ) : (
                      <>
                        <Upload size={18} />
                        Upload
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LessonResources;
