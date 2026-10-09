import React from 'react';
import {
  FileText,
  FileSpreadsheet,
  FileImage,
  File,
  FileCode,
} from 'lucide-react';

const FileTypeIcon = ({ mimeType, filename, className = 'w-5 h-5' }) => {
  const ext = (filename || '').split('.').pop().toLowerCase();

  if (mimeType?.includes('pdf') || ext === 'pdf') {
    return (
      <div className="p-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
        <FileText className={className} />
      </div>
    );
  }

  if (
    mimeType?.startsWith('image/') ||
    ['jpg', 'jpeg', 'png', 'webp', 'svg'].includes(ext)
  ) {
    return (
      <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        <FileImage className={className} />
      </div>
    );
  }

  if (
    mimeType?.includes('word') ||
    mimeType?.includes('officedocument') ||
    ['doc', 'docx'].includes(ext)
  ) {
    return (
      <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
        <FileText className={className} />
      </div>
    );
  }

  return (
    <div className="p-2 rounded-lg bg-zinc-800 text-zinc-400 border border-zinc-700/40">
      <File className={className} />
    </div>
  );
};

export default FileTypeIcon;
