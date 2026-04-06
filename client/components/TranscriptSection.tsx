import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check, Download, FileText, FileType, X } from 'lucide-react';
import { useState } from 'react';

interface TranscriptSectionProps {
  originalTranscript: string;
  translatedTranscript: string;
  selectedLanguage: string;
}

interface DownloadModalState {
  open: boolean;
  format: 'pdf' | 'docx' | null;
  filename: string;
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

async function downloadTranscript(text: string, format: 'pdf' | 'docx', filename: string) {
  const res = await fetch('http://localhost:8000/api/download-transcript', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, format, filename }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.detail || 'Download failed');
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.${format}`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function DownloadPopover({
  isOpen,
  onClose,
  onDownload,
}: {
  isOpen: boolean;
  onClose: () => void;
  onDownload: (format: 'pdf' | 'docx', filename: string) => void;
}) {
  const [step, setStep] = useState<'format' | 'filename'>('format');
  const [selectedFormat, setSelectedFormat] = useState<'pdf' | 'docx' | null>(null);
  const [filename, setFilename] = useState('transcript');
  const [isDownloading, setIsDownloading] = useState(false);

  const handleFormatSelect = (fmt: 'pdf' | 'docx') => {
    setSelectedFormat(fmt);
    setStep('filename');
  };

  const handleDownload = async () => {
    if (!selectedFormat) return;
    setIsDownloading(true);
    try {
      await new Promise<void>((resolve) => {
        onDownload(selectedFormat, filename);
        resolve();
      });
    } finally {
      setIsDownloading(false);
      handleReset();
    }
  };

  const handleReset = () => {
    setStep('format');
    setSelectedFormat(null);
    setFilename('transcript');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -8, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="absolute bottom-full left-0 right-0 mb-2 bg-slate-900/95 backdrop-blur-md border border-purple-500/30 rounded-xl p-4 shadow-[0_0_30px_rgba(168,85,247,0.15)] z-50"
        >
          {/* Close button */}
          <button
            onClick={handleReset}
            className="absolute top-2 right-2 p-1 text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>

          {step === 'format' && (
            <div>
              <p className="text-sm text-slate-300 mb-3 font-medium">Choose format</p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleFormatSelect('pdf')}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-red-500/15 border border-red-500/30 text-red-300 hover:bg-red-500/25 hover:border-red-500/50 transition-all text-sm font-medium"
                >
                  <FileText className="w-4 h-4" />
                  PDF
                </button>
                <button
                  onClick={() => handleFormatSelect('docx')}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-300 hover:bg-blue-500/25 hover:border-blue-500/50 transition-all text-sm font-medium"
                >
                  <FileType className="w-4 h-4" />
                  Word
                </button>
              </div>
            </div>
          )}

          {step === 'filename' && (
            <div>
              <p className="text-sm text-slate-300 mb-3 font-medium">
                File name
                <span className="ml-2 text-xs text-slate-500">
                  (.{selectedFormat})
                </span>
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={filename}
                  onChange={(e) => setFilename(e.target.value)}
                  placeholder="Enter file name"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleDownload();
                  }}
                  className="flex-1 bg-slate-800/60 border border-purple-500/20 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 transition"
                />
                <button
                  onClick={handleDownload}
                  disabled={!filename.trim() || isDownloading}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-medium hover:shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isDownloading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  Save
                </button>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function TranscriptSection({
  originalTranscript,
  translatedTranscript,
  selectedLanguage,
}: TranscriptSectionProps) {
  const [copiedOriginal, setCopiedOriginal] = useState(false);
  const [copiedTranslated, setCopiedTranslated] = useState(false);
  const [showDownloadOriginal, setShowDownloadOriginal] = useState(false);
  const [showDownloadTranslated, setShowDownloadTranslated] = useState(false);

  const handleCopyOriginal = () => {
    navigator.clipboard.writeText(originalTranscript);
    setCopiedOriginal(true);
    setTimeout(() => setCopiedOriginal(false), 2000);
  };

  const handleCopyTranslated = () => {
    navigator.clipboard.writeText(translatedTranscript);
    setCopiedTranslated(true);
    setTimeout(() => setCopiedTranslated(false), 2000);
  };

  const handleDownloadOriginal = async (format: 'pdf' | 'docx', filename: string) => {
    try {
      await downloadTranscript(originalTranscript, format, filename);
    } catch (err: any) {
      console.error('Download failed:', err);
      alert('Download failed: ' + err.message);
    }
  };

  const handleDownloadTranslated = async (format: 'pdf' | 'docx', filename: string) => {
    try {
      await downloadTranscript(translatedTranscript, format, filename);
    } catch (err: any) {
      console.error('Download failed:', err);
      alert('Download failed: ' + err.message);
    }
  };

  return (
    <motion.section
      className="px-4 py-20 max-w-7xl mx-auto"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: false, margin: '-100px' }}
    >
      <motion.h2
        className="text-4xl font-bold mb-12 text-center glow-text"
        variants={itemVariants}
        initial="hidden"
        whileInView="visible"
        transition={{ duration: 0.6 }}
        viewport={{ once: false }}
      >
        Transcripts
      </motion.h2>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Original Transcript Card */}
        <motion.div
          className="glow-card-hover p-6 flex flex-col h-full"
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          transition={{ duration: 0.6 }}
          viewport={{ once: false }}
          whileHover={{ scale: 1.02 }}
        >
          <div className="mb-4">
            <h3 className="text-xl font-semibold mb-2">Original Language Transcript</h3>
            <p className="text-sm text-slate-400">
              Shows the transcript generated from Whisper speech recognition.
            </p>
          </div>

          <div className="flex-1 flex flex-col gap-3">
            <textarea
              value={originalTranscript}
              readOnly
              placeholder="Transcript will appear here after processing..."
              className="flex-1 bg-slate-800/50 border border-purple-500/20 rounded-lg p-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 transition resize-none"
              style={{ minHeight: '200px' }}
            />

            <div className="flex gap-2">
              <button
                onClick={handleCopyOriginal}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] py-2 rounded-lg font-semibold text-sm text-white transition-all flex items-center justify-center gap-2"
              >
                {copiedOriginal ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy Transcript
                  </>
                )}
              </button>

              <div className="relative flex-1">
                <DownloadPopover
                  isOpen={showDownloadOriginal}
                  onClose={() => setShowDownloadOriginal(false)}
                  onDownload={handleDownloadOriginal}
                />
                <button
                  onClick={() => setShowDownloadOriginal(!showDownloadOriginal)}
                  className="w-full bg-slate-800/50 hover:bg-slate-700/50 py-2 rounded-lg font-semibold text-sm text-white transition-all flex items-center justify-center gap-2 border border-purple-500/20 hover:border-purple-500/50"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Translated Transcript Card */}
        <motion.div
          className="glow-card-hover p-6 flex flex-col h-full"
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          transition={{ duration: 0.6, delay: 0.1 }}
          viewport={{ once: false }}
          whileHover={{ scale: 1.02 }}
        >
          <div className="mb-4">
            <h3 className="text-xl font-semibold mb-2">Translated Transcript</h3>
            <p className="text-sm text-slate-400">
              Shows the translated text in {selectedLanguage}.
            </p>
          </div>

          <div className="flex-1 flex flex-col gap-3">
            <textarea
              value={translatedTranscript}
              readOnly
              placeholder={`Translation to ${selectedLanguage} will appear here after processing...`}
              className="flex-1 bg-slate-800/50 border border-purple-500/20 rounded-lg p-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 transition resize-none"
              style={{ minHeight: '200px' }}
            />

            <div className="flex gap-2">
              <button
                onClick={handleCopyTranslated}
                className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] py-2 rounded-lg font-semibold text-sm text-white transition-all flex items-center justify-center gap-2"
              >
                {copiedTranslated ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy Transcript
                  </>
                )}
              </button>

              <div className="relative flex-1">
                <DownloadPopover
                  isOpen={showDownloadTranslated}
                  onClose={() => setShowDownloadTranslated(false)}
                  onDownload={handleDownloadTranslated}
                />
                <button
                  onClick={() => setShowDownloadTranslated(!showDownloadTranslated)}
                  className="w-full bg-slate-800/50 hover:bg-slate-700/50 py-2 rounded-lg font-semibold text-sm text-white transition-all flex items-center justify-center gap-2 border border-blue-500/20 hover:border-blue-500/50"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}
