import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Upload,
  Music,
  Mic2,
  MessageSquare,
  Globe,
  Zap,
  Play,
  Pause,
  Download,
  Volume2,
  ChevronDown,
} from 'lucide-react';
import TranscriptSection from '@/components/TranscriptSection';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

const pipelineSteps = [
  { icon: '📤', label: 'Upload', color: 'from-purple-500 to-pink-500' },
  { icon: '🎵', label: 'Audio Extract', color: 'from-pink-500 to-red-500' },
  { icon: '🎙️', label: 'Vocal Separation', color: 'from-red-500 to-orange-500' },
  { icon: '🗣️', label: 'Speech Recognition', color: 'from-orange-500 to-yellow-500' },
  { icon: '🌍', label: 'Translation', color: 'from-yellow-500 to-green-500' },
  { icon: '🔊', label: 'TTS Generation', color: 'from-green-500 to-blue-500' },
  { icon: '👤', label: 'Voice Cloning', color: 'from-blue-500 to-indigo-500' },
  { icon: '👄', label: 'Lip Sync', color: 'from-indigo-500 to-purple-500' },
];

const languages = [
  'Tamil',
  'Hindi',
  'Telugu',
  'Malayalam',
  'Kannada',
  'Chinese',
  'Arabic',
  'French',
  'Russian',
];

export default function Index() {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [uploadedAudio, setUploadedAudio] = useState<File | null>(null);
  const [uploadedVideo, setUploadedVideo] = useState<File | null>(null);
  const [selectedVoiceMode, setSelectedVoiceMode] = useState<'zero-shot' | 'clone'>('zero-shot');
  const [selectedLanguage, setSelectedLanguage] = useState('Tamil');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [hasOutput, setHasOutput] = useState(false);
  const [originalTranscript, setOriginalTranscript] = useState('');
  const [translatedTranscript, setTranslatedTranscript] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const playerRef = useRef<HTMLAudioElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const audioDropzoneRef = useRef<HTMLDivElement>(null);
  const videoDropzoneRef = useRef<HTMLDivElement>(null);


  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add('border-purple-500', 'bg-purple-500/10');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('border-purple-500', 'bg-purple-500/10');
  };

  const handleAudioDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-purple-500', 'bg-purple-500/10');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      setUploadedAudio(files[0]);
    }
  };

  const handleVideoDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-purple-500', 'bg-purple-500/10');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      setUploadedVideo(files[0]);
    }
  };

  const handleGenerateClick = async () => {
    setIsProcessing(true);
    setActiveStep(0);
    setOriginalTranscript('');
    setTranslatedTranscript('');

    try {
      // Build FormData for the backend
      const formData = new FormData();
      formData.append('target_language', selectedLanguage);
      formData.append('mode', selectedVoiceMode);

      if (youtubeUrl) {
        formData.append('url', youtubeUrl);
      } else if (uploadedAudio) {
        formData.append('file', uploadedAudio);
      } else if (uploadedVideo) {
        formData.append('file', uploadedVideo);
      }

      // Animate pipeline steps while the request is in-flight
      const stepAnimation = (async () => {
        for (let i = 0; i < pipelineSteps.length; i++) {
          await new Promise((resolve) => setTimeout(resolve, 500));
          setActiveStep(i + 1);
        }
      })();

      const response = await fetch('http://localhost:8000/api/generate', {
        method: 'POST',
        body: formData,
      });

      // Wait for animation to finish
      await stepAnimation;

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || `Server error: ${response.status}`);
      }

      const data = await response.json();

      setOriginalTranscript(data.original_text || '');
      setTranslatedTranscript(data.translated_text || '');
      if (data.audio_url) {
        setAudioUrl(data.audio_url + '?t=' + Date.now());
        setIsPlaying(false);
      }
      setHasOutput(true);
    } catch (error: any) {
      console.error('Generation failed:', error);
      setOriginalTranscript(`Error: ${error.message}`);
      setHasOutput(true);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-50 overflow-x-hidden dark">
      {/* Animated background gradient */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-950/20 via-slate-950 to-blue-950/20" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full filter blur-3xl animate-blob" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full filter blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-500/10 rounded-full filter blur-3xl animate-blob animation-delay-4000" />
      </div>

      <div className="relative z-10">
        {/* Hero Section */}
        <motion.section
          className="min-h-screen flex items-center justify-center px-4 py-20"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <div className="text-center max-w-4xl mx-auto">
            <motion.div variants={itemVariants}>
              <h1 className="text-5xl md:text-7xl font-bold mb-6 glow-text">
                Multilingual Voice Cloning AI
              </h1>
            </motion.div>


            <motion.div
              variants={itemVariants}
              className="flex justify-center gap-4 flex-wrap"
            >
              <div className="text-sm text-purple-400 bg-purple-500/10 px-4 py-2 rounded-lg border border-purple-500/30">
                ✨ Real-time Processing
              </div>
              <div className="text-sm text-blue-400 bg-blue-500/10 px-4 py-2 rounded-lg border border-blue-500/30">
                🎯 High Fidelity
              </div>
              <div className="text-sm text-pink-400 bg-pink-500/10 px-4 py-2 rounded-lg border border-pink-500/30">
                🚀 Lightning Fast
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="mt-16">
              <div className="inline-block relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-lg blur opacity-30 group-hover:opacity-100 transition duration-1000"></div>
                <button
                  onClick={() => document.getElementById('input-section')?.scrollIntoView({ behavior: 'smooth' })}
                  className="relative px-8 py-4 bg-slate-950 rounded-lg font-semibold text-white flex items-center gap-2 hover:gap-3 transition-all"
                >
                  Get Started <Zap className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* Input Section */}
        <motion.section
          id="input-section"
          className="px-4 py-20 max-w-6xl mx-auto"
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
            Choose Your Input
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-6">
            {/* YouTube URL Input */}
            <motion.div
              className="glow-card p-6"
              variants={itemVariants}
              initial="hidden"
              whileInView="visible"
              transition={{ duration: 0.6 }}
              viewport={{ once: false }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-semibold">YouTube URL</h3>
              </div>
              <input
                type="text"
                placeholder="https://youtube.com/watch?v=..."
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                className="w-full bg-slate-800/50 border border-purple-500/20 rounded px-3 py-2 text-sm focus:outline-none focus:border-purple-500/50 transition"
              />
            </motion.div>

            {/* Audio Upload */}
            <motion.div
              ref={audioDropzoneRef}
              className="glow-card p-6 border-2 border-dashed border-purple-500/30 cursor-pointer transition-all"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleAudioDrop}
              variants={itemVariants}
              initial="hidden"
              whileInView="visible"
              transition={{ duration: 0.6 }}
              viewport={{ once: false }}
              whileHover={{ scale: 1.02 }}
            >
              <div
                onClick={() => audioInputRef.current?.click()}
                className="flex flex-col items-center justify-center gap-2 cursor-pointer"
              >
                <Music className="w-8 h-8 text-purple-400" />
                <h3 className="text-lg font-semibold">Audio File</h3>
                <p className="text-sm text-slate-400">Drag or click to upload</p>
                {uploadedAudio && (
                  <p className="text-xs text-purple-300 mt-2">✓ {uploadedAudio.name}</p>
                )}
              </div>
              <input
                ref={audioInputRef}
                type="file"
                accept="audio/*"
                onChange={(e) => e.target.files && setUploadedAudio(e.target.files[0])}
                className="hidden"
              />
            </motion.div>

            {/* Video Upload */}
            <motion.div
              ref={videoDropzoneRef}
              className="glow-card p-6 border-2 border-dashed border-purple-500/30 cursor-pointer transition-all"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleVideoDrop}
              variants={itemVariants}
              initial="hidden"
              whileInView="visible"
              transition={{ duration: 0.6 }}
              viewport={{ once: false }}
              whileHover={{ scale: 1.02 }}
            >
              <div
                onClick={() => videoInputRef.current?.click()}
                className="flex flex-col items-center justify-center gap-2 cursor-pointer"
              >
                <Upload className="w-8 h-8 text-purple-400" />
                <h3 className="text-lg font-semibold">Video File</h3>
                <p className="text-sm text-slate-400">Drag or click to upload</p>
                {uploadedVideo && (
                  <p className="text-xs text-purple-300 mt-2">✓ {uploadedVideo.name}</p>
                )}
              </div>
              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                onChange={(e) => e.target.files && setUploadedVideo(e.target.files[0])}
                className="hidden"
              />
            </motion.div>
          </div>
        </motion.section>

        {/* Voice Mode Selector */}
        <motion.section
          className="px-4 py-20 max-w-6xl mx-auto"
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
            Select Voice Mode
          </motion.h2>

          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {[
              {
                id: 'zero-shot',
                title: 'Zero-Shot Voice',
                description: 'Clone any voice without training',
              },
              {
                id: 'clone',
                title: 'Clone My Voice',
                description: 'Use your own voice profile',
              },
            ].map((mode) => (
              <motion.button
                key={mode.id}
                onClick={() => setSelectedVoiceMode(mode.id as 'zero-shot' | 'clone')}
                className={`glow-card-hover p-6 text-left transition-all ${
                  selectedVoiceMode === mode.id
                    ? 'border-purple-400 shadow-[0_0_30px_rgba(168,85,247,0.4)]'
                    : 'border-purple-500/20'
                }`}
                variants={itemVariants}
                initial="hidden"
                whileInView="visible"
                transition={{ duration: 0.6 }}
                viewport={{ once: false }}
                whileHover={{ scale: 1.05 }}
              >
                <Mic2 className={`w-6 h-6 mb-2 ${selectedVoiceMode === mode.id ? 'text-purple-400' : 'text-slate-400'}`} />
                <h3 className="font-semibold text-lg">{mode.title}</h3>
                <p className="text-sm text-slate-400 mt-1">{mode.description}</p>
              </motion.button>
            ))}
          </div>
        </motion.section>

        {/* Language Selector */}
        <motion.section
          className="px-4 py-20 max-w-6xl mx-auto"
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
            Select Target Language
          </motion.h2>

          <div className="max-w-sm mx-auto relative z-50">
            <motion.div
              className="glow-card !overflow-visible p-2 relative"
              variants={itemVariants}
              initial="hidden"
              whileInView="visible"
              transition={{ duration: 0.6 }}
              viewport={{ once: false }}
            >
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="w-full flex items-center justify-between px-4 py-3 rounded hover:bg-slate-800/50 transition"
              >
                <span>{selectedLanguage}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showDropdown && (
                <motion.div
                  className="absolute top-full left-2 right-2 mt-1 bg-slate-900/95 border border-purple-500/30 rounded-lg overflow-y-auto max-h-60 z-50"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {languages.map((lang) => (
                    <button
                      key={lang}
                      onClick={() => {
                        setSelectedLanguage(lang);
                        setShowDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2 hover:bg-purple-500/20 transition ${
                        selectedLanguage === lang ? 'bg-purple-500/30 text-purple-300' : ''
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </motion.div>
              )}
            </motion.div>
          </div>
        </motion.section>

        {/* Generate Button */}
        <motion.section
          className="px-4 py-20 max-w-6xl mx-auto text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: false, margin: '-100px' }}
        >
          <motion.button
            onClick={handleGenerateClick}
            disabled={isProcessing}
            className="relative px-12 py-4 font-bold text-lg bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-lg text-white hover:shadow-[0_0_40px_rgba(168,85,247,0.5)] transition-all disabled:opacity-50"
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            transition={{ duration: 0.6 }}
            viewport={{ once: false }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isProcessing ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Generate Voice
              </span>
            )}
          </motion.button>
        </motion.section>

        {/* AI Pipeline Visualization */}
        {isProcessing && (
          <motion.section
            className="px-4 py-20 max-w-7xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold mb-12 text-center glow-text">Processing Pipeline</h2>

            <div className="overflow-x-auto pb-4">
              <div className="flex gap-4 min-w-max px-4">
                {pipelineSteps.map((step, idx) => (
                  <motion.div
                    key={idx}
                    className="flex-shrink-0"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <div
                      className={`w-40 glow-card p-4 text-center cursor-pointer transition-all ${
                        idx < activeStep
                          ? `border-green-500/50 shadow-[0_0_20px_rgba(34,197,94,0.3)]`
                          : idx === activeStep
                            ? `border-yellow-500/50 shadow-[0_0_20px_rgba(234,179,8,0.3)] animate-pulse`
                            : 'border-purple-500/20'
                      }`}
                    >
                      <div className="text-3xl mb-2">{step.icon}</div>
                      <p className="text-sm font-semibold">{step.label}</p>
                      {idx < activeStep && (
                        <div className="text-xs text-green-400 mt-2">✓ Complete</div>
                      )}
                      {idx === activeStep && (
                        <div className="text-xs text-yellow-400 mt-2">⏳ Processing</div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.section>
        )}

        {/* Output Section */}
        {hasOutput && (
          <motion.section
            className="px-4 py-20 max-w-6xl mx-auto"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold mb-12 text-center glow-text">Your Generated Voice</h2>

            <div className="glow-card-hover p-8 max-w-2xl mx-auto">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Volume2 className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{selectedLanguage} Voice</h3>
                  <p className="text-sm text-slate-400">{selectedVoiceMode === 'zero-shot' ? 'Zero-Shot' : 'Cloned'} Mode</p>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 h-12 bg-slate-800/50 rounded-lg flex items-center px-4 gap-2">
                  <div className="flex gap-1">
                    {[...Array(20)].map((_, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-gradient-to-t from-purple-500 to-pink-500 rounded-sm opacity-70"
                        style={{
                          height: `${Math.random() * 30 + 10}px`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {audioUrl && (
                <audio
                  ref={playerRef}
                  src={audioUrl}
                  preload="auto"
                  onEnded={() => setIsPlaying(false)}
                  onError={(e) => console.error('Audio error:', e)}
                />
              )}

              <div className="flex gap-3">
                <button
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all"
                  onClick={async () => {
                    const audio = playerRef.current;
                    if (!audio) return;
                    if (isPlaying) {
                      audio.pause();
                      setIsPlaying(false);
                    } else {
                      try {
                        audio.currentTime = 0;
                        await audio.play();
                        setIsPlaying(true);
                      } catch (err) {
                        console.error('Playback failed:', err);
                      }
                    }
                  }}
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  {isPlaying ? 'Pause' : 'Play'}
                </button>
                <a
                  href={audioUrl}
                  download="generated_voice.wav"
                  className="flex-1 bg-slate-800/50 hover:bg-slate-700/50 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 border border-purple-500/20 hover:border-purple-500/50 transition-all"
                >
                  <Download className="w-5 h-5" />
                  Download
                </a>
              </div>
            </div>
          </motion.section>
        )}

        {/* Transcript Section */}
        {hasOutput && (
          <TranscriptSection
            originalTranscript={originalTranscript}
            translatedTranscript={translatedTranscript}
            selectedLanguage={selectedLanguage}
          />
        )}

        {/* Footer spacing */}
        <div className="h-20" />
      </div>
    </div>
  );
}
