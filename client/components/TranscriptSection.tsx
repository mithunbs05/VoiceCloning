import { motion } from 'framer-motion';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface TranscriptSectionProps {
  originalTranscript: string;
  translatedTranscript: string;
  selectedLanguage: string;
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

export default function TranscriptSection({
  originalTranscript,
  translatedTranscript,
  selectedLanguage,
}: TranscriptSectionProps) {
  const [copiedOriginal, setCopiedOriginal] = useState(false);
  const [copiedTranslated, setCopiedTranslated] = useState(false);

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

            <button
              onClick={handleCopyOriginal}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] py-2 rounded-lg font-semibold text-sm text-white transition-all flex items-center justify-center gap-2"
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

            <button
              onClick={handleCopyTranslated}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] py-2 rounded-lg font-semibold text-sm text-white transition-all flex items-center justify-center gap-2"
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
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}
