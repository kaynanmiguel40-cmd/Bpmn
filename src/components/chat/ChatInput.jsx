import { useState, useRef, useCallback, useEffect } from 'react';
import MentionDropdown from './MentionDropdown';
import { getMentionQuery, getMentionStart, filterMembersByQuery } from './chatUtils';
import { shortName } from '../../lib/teamService';

// ==================== FILE PREVIEW STRIP ====================

function PendingFiles({ files, onRemove }) {
  if (files.length === 0) return null;

  return (
    <div className="flex gap-2 px-3 py-2 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 overflow-x-auto">
      {files.map((f) => (
        <div key={f.id} className="relative flex-shrink-0 group">
          {f.type === 'image' ? (
            <img src={f.data} alt={f.label} className="w-14 h-14 object-cover rounded-lg border border-slate-200 dark:border-slate-600" />
          ) : f.type === 'video' ? (
            <div className="w-14 h-14 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
              <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          ) : f.type === 'audio' ? (
            <div className="w-14 h-14 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
          ) : (
            <div className="w-14 h-14 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
              <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          )}
          {/* Remove button */}
          <button
            type="button"
            onClick={() => onRemove(f.id)}
            className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity shadow"
          >
            ×
          </button>
          <p className="text-[9px] text-slate-400 dark:text-slate-500 truncate w-14 text-center mt-0.5">{f.label}</p>
        </div>
      ))}
    </div>
  );
}

// ==================== RECORDING INDICATOR ====================

function RecordingIndicator({ duration, onCancel, onStop }) {
  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-2 px-3 py-2.5 w-full">
      {/* Cancel */}
      <button
        type="button"
        onClick={onCancel}
        className="p-1.5 text-slate-400 hover:text-red-500 transition-colors flex-shrink-0"
        title="Cancelar"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>

      {/* Red dot + timer */}
      <div className="flex items-center gap-2 flex-1">
        <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse flex-shrink-0" />
        <span className="text-sm text-red-500 font-medium tabular-nums">
          {formatTime(duration)}
        </span>
        <div className="flex-1 flex items-center gap-0.5 px-2">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="w-1 bg-red-400/60 rounded-full"
              style={{ height: `${8 + Math.random() * 14}px`, animationDelay: `${i * 50}ms` }}
            />
          ))}
        </div>
      </div>

      {/* Stop & send */}
      <button
        type="button"
        onClick={onStop}
        className="p-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex-shrink-0"
        title="Enviar audio"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
      </button>
    </div>
  );
}

// ==================== MAIN COMPONENT ====================

export default function ChatInput({ text, setText, onSend, isPending, teamMembers, avatarMap }) {
  const [pendingFiles, setPendingFiles] = useState([]);
  const [mentionQuery, setMentionQuery] = useState(null);
  const [mentionIndex, setMentionIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  const filteredMembers = mentionQuery !== null ? filterMembersByQuery(teamMembers, mentionQuery) : [];

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  // ==================== MENTION HANDLING ====================

  const updateMentionState = useCallback((value, cursorPos) => {
    const query = getMentionQuery(value, cursorPos);
    setMentionQuery(query);
    if (query !== null) setMentionIndex(0);
  }, []);

  const handleSelectMention = useCallback((member) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const cursorPos = textarea.selectionStart;
    const mentionStart = getMentionStart(text, cursorPos);
    if (mentionStart === -1) return;

    const name = shortName(member.name);
    const before = text.slice(0, mentionStart);
    const after = text.slice(cursorPos);
    const newText = `${before}@${name} ${after}`;
    setText(newText);
    setMentionQuery(null);

    const newPos = mentionStart + name.length + 2;
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(newPos, newPos);
    });
  }, [text, setText]);

  // ==================== FILE HANDLING ====================

  const handleFileSelect = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      alert('Arquivo muito grande! Maximo: 3MB.');
      return;
    }
    if (pendingFiles.length >= 5) {
      alert('Maximo 5 arquivos por mensagem.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      const newFile = {
        id: `att_${Date.now()}`,
        type: isImage ? 'image' : isVideo ? 'video' : 'document',
        data: ev.target.result,
        label: file.name,
        mimeType: file.type,
      };
      setPendingFiles(prev => [...prev, newFile]);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }, [pendingFiles.length]);

  const removeFile = useCallback((id) => {
    setPendingFiles(prev => prev.filter(f => f.id !== id));
  }, []);

  // ==================== AUDIO RECORDING ====================

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
          ? 'audio/webm;codecs=opus'
          : 'audio/webm',
      });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        stream.getTracks().forEach(t => t.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordDuration(0);
      timerRef.current = setInterval(() => {
        setRecordDuration(prev => prev + 1);
      }, 1000);
    } catch {
      alert('Nao foi possivel acessar o microfone. Verifique as permissoes.');
    }
  }, []);

  const stopAndSend = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state === 'inactive') return;

    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }

    recorder.onstop = () => {
      recorder.stream.getTracks().forEach(t => t.stop());

      const blob = new Blob(chunksRef.current, { type: recorder.mimeType });
      if (blob.size > 3 * 1024 * 1024) {
        alert('Audio muito longo! Maximo: 3MB.');
        setIsRecording(false);
        return;
      }

      const reader = new FileReader();
      reader.onload = (ev) => {
        const duration = recordDuration;
        const audioFile = {
          id: `att_${Date.now()}`,
          type: 'audio',
          data: ev.target.result,
          label: `audio_${duration}s.webm`,
          mimeType: recorder.mimeType,
          duration,
        };
        onSend('', [audioFile]);
        setIsRecording(false);
        setRecordDuration(0);
      };
      reader.readAsDataURL(blob);
    };

    recorder.stop();
  }, [onSend, recordDuration]);

  const cancelRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      recorder.stream.getTracks().forEach(t => t.stop());
      recorder.stop();
    }
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    chunksRef.current = [];
    setIsRecording(false);
    setRecordDuration(0);
  }, []);

  // ==================== KEYBOARD HANDLING ====================

  const handleKeyDown = (e) => {
    if (mentionQuery !== null && filteredMembers.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setMentionIndex(prev => (prev + 1) % filteredMembers.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setMentionIndex(prev => (prev - 1 + filteredMembers.length) % filteredMembers.length);
        return;
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        handleSelectMention(filteredMembers[mentionIndex]);
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        setMentionQuery(null);
        return;
      }
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setText(value);
    updateMentionState(value, e.target.selectionStart);
  };

  const handleClick = () => {
    if (textareaRef.current) {
      updateMentionState(text, textareaRef.current.selectionStart);
    }
  };

  // ==================== SEND ====================

  const handleSend = () => {
    const trimmed = text.trim();
    if ((!trimmed && pendingFiles.length === 0) || isPending) return;
    onSend(trimmed, pendingFiles);
    setPendingFiles([]);
    setMentionQuery(null);
  };

  const canSend = (text.trim() || pendingFiles.length > 0) && !isPending;
  const showMic = !text.trim() && pendingFiles.length === 0;

  // ==================== RECORDING UI ====================

  if (isRecording) {
    return (
      <div className="border border-red-300 dark:border-red-500/50 rounded-lg bg-white dark:bg-slate-800 overflow-hidden">
        <RecordingIndicator
          duration={recordDuration}
          onCancel={cancelRecording}
          onStop={stopAndSend}
        />
      </div>
    );
  }

  return (
    <div className="border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 overflow-hidden">
      {/* Pending files preview */}
      <PendingFiles files={pendingFiles} onRemove={removeFile} />

      {/* Input row */}
      <div className="flex items-end gap-1 p-1.5 relative">
        {/* Mention dropdown */}
        {mentionQuery !== null && filteredMembers.length > 0 && (
          <MentionDropdown
            members={filteredMembers}
            activeIndex={mentionIndex}
            onSelect={handleSelectMention}
            onClose={() => setMentionQuery(null)}
            avatarMap={avatarMap}
          />
        )}

        {/* Attach button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors flex-shrink-0"
          title="Anexar arquivo"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*,.pdf,.doc,.docx,.xlsx,.xls"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onClick={handleClick}
          placeholder="Mensagem... (@ para mencionar)"
          rows={1}
          className="flex-1 px-2 py-1.5 bg-transparent dark:text-slate-200 text-sm resize-none focus:outline-none max-h-24 overflow-y-auto"
          style={{ minHeight: '36px' }}
        />

        {/* Mic or Send button */}
        {showMic ? (
          <button
            type="button"
            onClick={startRecording}
            className="p-1.5 text-slate-400 hover:text-blue-500 transition-colors flex-shrink-0"
            title="Gravar audio"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSend}
            disabled={!canSend}
            className="p-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
