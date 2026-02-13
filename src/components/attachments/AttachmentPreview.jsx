import { useState } from 'react';

function getFileType(url) {
  if (!url) return 'other';
  const ext = url.split('.').pop().toLowerCase().split('?')[0];
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(ext)) return 'image';
  if (['pdf'].includes(ext)) return 'pdf';
  if (['mp4', 'webm', 'mov'].includes(ext)) return 'video';
  return 'other';
}

const FILE_ICONS = {
  pdf: { path: 'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z', color: 'text-red-500' },
  video: { path: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z', color: 'text-purple-500' },
  other: { path: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', color: 'text-slate-500' },
};

export function AttachmentPreview({ url, name, onClose }) {
  const fileType = getFileType(url);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100]" onClick={onClose}>
      <div className="relative max-w-[90vw] max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 w-8 h-8 bg-white dark:bg-slate-800 rounded-full shadow-lg flex items-center justify-center text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 z-10"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Content */}
        {fileType === 'image' ? (
          <img
            src={url}
            alt={name || 'Preview'}
            className="max-w-full max-h-[85vh] object-contain rounded-lg"
          />
        ) : fileType === 'pdf' ? (
          <iframe
            src={url}
            title={name || 'PDF'}
            className="w-[80vw] h-[85vh] bg-white rounded-lg"
          />
        ) : fileType === 'video' ? (
          <video src={url} controls className="max-w-full max-h-[85vh] rounded-lg">
            Seu navegador nao suporta video.
          </video>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-xl p-8 text-center">
            <svg className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={FILE_ICONS.other.path} />
            </svg>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">{name || 'Arquivo'}</p>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
            >
              Abrir arquivo
            </a>
          </div>
        )}

        {/* File name */}
        {name && (fileType === 'image' || fileType === 'video') && (
          <div className="text-center mt-3">
            <span className="text-sm text-white/80 bg-black/40 px-3 py-1 rounded-full">{name}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default AttachmentPreview;
