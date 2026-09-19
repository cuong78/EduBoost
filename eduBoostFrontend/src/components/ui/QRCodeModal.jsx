import React, { useState } from "react";
import { X, Download, Copy, Check, QrCode } from "lucide-react";
import { showSuccessToast, showErrorToast } from "../../utils/show-toast";

export default function QRCodeModal({ isOpen, onClose, schoolClass }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !schoolClass) return null;

  const classId = schoolClass.classId;
  const className = schoolClass.className || "Lớp học";
  const apiBase = import.meta.env.VITE_API_URL || "http://localhost:8080/api";
  const qrImageUrl = `${apiBase}/classes/${classId}/qr-code`;

  const origin = window.location.origin;
  const enrollUrl = `${origin}/enroll?classId=${classId}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(enrollUrl);
    setCopied(true);
    showSuccessToast("Đã sao chép đường dẫn ghi danh!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQR = async () => {
    try {
      const response = await fetch(qrImageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `QRCode_Lop_${className.replace(/\s+/g, "_")}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      showSuccessToast("Đã tải xuống mã QR!");
    } catch (err) {
      showErrorToast("Không thể tải xuống mã QR");
    }
  };

  return (
    <div
      className="qr-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="qr-modal-card">
        {/* Header */}
        <div className="qr-modal-header">
          <div className="qr-modal-title">
            <QrCode size={22} className="qr-icon" />
            <span>Mã QR Tham Gia Lớp Học</span>
          </div>
          <button onClick={onClose} className="qr-modal-close" title="Đóng">
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="qr-modal-body">
          <div className="qr-class-info">
            <h3 className="qr-class-name">{className}</h3>
            {schoolClass.schoolYear && (
              <span className="qr-school-year">Năm học: {schoolClass.schoolYear}</span>
            )}
          </div>

          {/* QR Container */}
          <div className="qr-image-wrapper">
            <img
              src={qrImageUrl}
              alt={`Mã QR ${className}`}
              className="qr-image"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://via.placeholder.com/220?text=Loi+Anh+QR";
              }}
            />
          </div>

          <p className="qr-instruction">
            Học sinh dùng thiết bị di động quét mã QR để đăng ký trực tiếp vào lớp học này.
          </p>

          {/* Copy Link Section */}
          <div className="qr-link-box">
            <input
              type="text"
              readOnly
              value={enrollUrl}
              className="qr-link-input"
            />
            <button
              type="button"
              onClick={handleCopyLink}
              className={`qr-btn-copy ${copied ? "copied" : ""}`}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              <span>{copied ? "Đã chép" : "Sao chép"}</span>
            </button>
          </div>

          {/* Download QR Action Button */}
          <button
            type="button"
            onClick={handleDownloadQR}
            className="qr-btn-download"
          >
            <Download size={18} />
            <span>Tải Mã QR Về Máy (PNG)</span>
          </button>
        </div>
      </div>

      <style>{`
        .qr-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(15, 23, 42, 0.65);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 99999;
          padding: 1rem;
          animation: qrModalFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .qr-modal-card {
          background: #ffffff;
          width: 100%;
          max-width: 440px;
          border-radius: 24px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.2);
          overflow: hidden;
          animation: qrModalScaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .qr-modal-header {
          background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%);
          padding: 1.25rem 1.5rem;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .qr-modal-title {
          display: flex;
          align-items: center;
          gap: 0.625rem;
          font-weight: 700;
          font-size: 1.125rem;
          letter-spacing: -0.01em;
        }

        .qr-icon {
          color: #93c5fd;
        }

        .qr-modal-close {
          background: rgba(255, 255, 255, 0.15);
          border: none;
          color: #ffffff;
          width: 32px;
          height: 32px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .qr-modal-close:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .qr-modal-body {
          padding: 1.75rem 1.5rem;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .qr-class-info {
          margin-bottom: 1.25rem;
        }

        .qr-class-name {
          font-size: 1.35rem;
          font-weight: 800;
          color: #1e293b;
          margin: 0;
        }

        .qr-school-year {
          display: inline-block;
          font-size: 0.8125rem;
          color: #64748b;
          margin-top: 0.25rem;
          font-weight: 500;
        }

        .qr-image-wrapper {
          background: #ffffff;
          padding: 0.875rem;
          border-radius: 20px;
          border: 2px dashed #cbd5e1;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
          margin-bottom: 1rem;
        }

        .qr-image {
          width: 210px;
          height: 210px;
          object-fit: contain;
          display: block;
          border-radius: 12px;
        }

        .qr-instruction {
          font-size: 0.8125rem;
          color: #64748b;
          margin: 0 0 1.25rem 0;
          line-height: 1.5;
        }

        .qr-link-box {
          display: flex;
          gap: 0.5rem;
          width: 100%;
          margin-bottom: 1rem;
        }

        .qr-link-input {
          flex: 1;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 0.625rem 0.875rem;
          font-size: 0.775rem;
          color: #334155;
          font-family: monospace;
          outline: none;
        }

        .qr-btn-copy {
          background: #eff6ff;
          color: #2563eb;
          border: 1px solid #bfdbfe;
          border-radius: 12px;
          padding: 0.625rem 1rem;
          font-size: 0.8125rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.375rem;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s ease;
        }

        .qr-btn-copy:hover {
          background: #dbeafe;
        }

        .qr-btn-copy.copied {
          background: #f0fdf4;
          color: #16a34a;
          border-color: #bbf7d0;
        }

        .qr-btn-download {
          width: 100%;
          background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%);
          color: #ffffff;
          border: none;
          border-radius: 14px;
          padding: 0.875rem 1.25rem;
          font-size: 0.9375rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          cursor: pointer;
          box-shadow: 0 10px 20px -5px rgba(37, 99, 235, 0.4);
          transition: all 0.2s ease;
        }

        .qr-btn-download:hover {
          transform: translateY(-1px);
          box-shadow: 0 14px 24px -5px rgba(37, 99, 235, 0.5);
        }

        .qr-btn-download:active {
          transform: translateY(0);
        }

        @keyframes qrModalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes qrModalScaleUp {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
