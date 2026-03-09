import { useState } from 'react';
import { AttachmentPreview } from './AttachmentPreview';

function getFileType(url) {
  if (!url) return 'other';
  const ext = url.split('.').pop().toLowerCase().split('?')[0];
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(ext)) return 'image';
  if (['pdf'].includes(ext)) return 'pdf';
  if (['mp4', 'webm', 'mov'].includes(ext)) return 'video';
  return 'other';
}

function getFileName(url) {
  if (!url) return 'arquivo';
  try {
    return decodeURIComponent(url.split('/').pop().split('?')[0]);
  } catch {
    return url.split('/').pop() || 'arquivo';
  }
}

const TYPE_COLORS = {
  image: 'bg-blue-50 dark:bg-blue-900/20 text-blue-500',
  pdf: 'bg-red-50 dark:bg-red-900/20 text-red-500',
  video: 'bg-purple-50 dark:bg-purple-900/20 text-purple-500',
  other: 'bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-400',
};

const TYPE_ICONS = {
  image: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
  pdf: 'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z',
  video: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z',
  other: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
};

export function AttachmentThumbnail({ url, onRemove, className = '' }) {
  const [showPreview, setShowPreview] = useState(false);
  const fileType = getFileType(url);
  const fileName = getFileName(url);
  const colors = TYPE_COLORS[fileType];
  const iconPath = TYPE_ICONS[fileType];

  return (
    <>
      <div className={`group relative flex items-center gap-2 p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors cursor-pointer ${className}`}
        onClick={() => setShowPreview(true)}
      >
        {/* Icon/Thumbnail */}
        {fileType === 'image' ? (
          <img src={url} alt={fileName} className="w-10 h-10 rounded object-cover shrink-0" />
        ) : (
          <div className={`w-10 h-10 rounded flex items-center justify-center shrink-0 ${colors}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={iconPath} />
            </svg>
          </div>
        )}

        {/* Name */}
        <span className="text-xs text-slate-600 dark:text-slate-300 truncate flex-1">{fileName}</span>

        {/* Remove */}
        {onRemove && (
          <button
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 transition-all"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {showPreview && (
        <AttachmentPreview url={url} name={fileName} onClose={() => setShowPreview(false)} />
      )}
    </>
  );
}

export default AttachmentThumbnail;
