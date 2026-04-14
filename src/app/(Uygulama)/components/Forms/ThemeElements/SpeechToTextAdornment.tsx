import React, { useEffect, useState, useRef } from 'react';
import { IconButton, InputAdornment, Tooltip, Box, Typography, useTheme } from '@mui/material';
import { Mic, MicOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { enqueueSnackbar } from 'notistack';

// Web Speech API tipleri
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}
interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: { new (): SpeechRecognition };
    webkitSpeechRecognition: { new (): SpeechRecognition };
  }
}

interface SpeechToTextAdornmentProps {
  onTranscript: (text: string) => void;
  onInterimTranscript?: (text: string) => void;
  onListeningChange?: (isListening: boolean) => void;
  standalone?: boolean;
}

const SpeechToTextAdornment: React.FC<SpeechToTextAdornmentProps> = ({ 
  onTranscript, 
  onInterimTranscript,
  onListeningChange,
  standalone 
}) => {
  const theme = useTheme();
  const [isRecording, setIsRecording] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [audioStatus, setAudioStatus] = useState<'IDLE' | 'WAITING' | 'LISTENING'>('IDLE');
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef<any>(null);
  const isStoppingRef = useRef(false);
  const hasReceivedResultRef = useRef(false);

  const primaryColor = theme.palette.primary.main;
  const errorColor = theme.palette.error.main;
  
  const onTranscriptRef = useRef(onTranscript);
  useEffect(() => { onTranscriptRef.current = onTranscript; }, [onTranscript]);

  const onInterimTranscriptRef = useRef(onInterimTranscript);
  useEffect(() => { onInterimTranscriptRef.current = onInterimTranscript; }, [onInterimTranscript]);

  const stopRecognition = (silent = false) => {
    isStoppingRef.current = true;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onend = null;
        recognitionRef.current.abort();
      } catch (e) {}
      recognitionRef.current = null;
    }
    setIsRecording(false);
    setAudioStatus('IDLE');
    setInterimTranscript('');
  };

  const startRecognition = async () => {
    const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionClass) {
      setIsSupported(false);
      return;
    }

    try {
      console.log('🎤 Mikrofon izni isteniyor...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('✅ Mikrofon erişimi sağlandı');
      await new Promise<void>(resolve => {
        stream.getTracks().forEach(track => track.stop());
        setTimeout(resolve, 200);
      });
      console.log('🎤 Cihaz serbest bırakıldı, SpeechRecognition başlatılıyor...');
    } catch (err: any) {
      console.error('❌ Mikrofon erişim hatası:', err.name, err.message);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        enqueueSnackbar('Mikrofon izni reddedildi. Adres çubuğundaki kilit simgesinden izin verin.', { variant: 'error', autoHideDuration: 6000 });
      } else if (err.name === 'NotFoundError') {
        enqueueSnackbar('Mikrofon bulunamadı.', { variant: 'error' });
      } else {
        enqueueSnackbar(`Mikrofon hatası: ${err.message}`, { variant: 'error' });
      }
      return;
    }

    isStoppingRef.current = false;
    hasReceivedResultRef.current = false;

    const rec = new SpeechRecognitionClass();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'tr-TR';
    rec.maxAlternatives = 1;

    rec.addEventListener('start', () => {
      console.log('✅ Recognition started successfully');
      setIsRecording(true);
      setAudioStatus('WAITING');
    });

    rec.addEventListener('result', (event: SpeechRecognitionEvent) => {
      hasReceivedResultRef.current = true;
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      if (final) {
        onTranscriptRef.current(final);
      }
      setInterimTranscript(interim);
      if (onInterimTranscriptRef.current) {
        onInterimTranscriptRef.current(interim);
      }
      
      if (interim) {
        setAudioStatus('LISTENING');
      } else if (!final) {
        setAudioStatus('WAITING');
      }
    });

    rec.addEventListener('error', (event: SpeechRecognitionErrorEvent) => {
      if (event.error === 'aborted' || event.error === 'no-speech') {
        isStoppingRef.current = true;
        return;
      }
      console.error('❌ Recognition error:', event.error);
      if (event.error === 'not-allowed') {
        enqueueSnackbar('Mikrofon izni reddedildi.', { variant: 'error' });
      } else if (event.error === 'audio-capture') {
        enqueueSnackbar('Mikrofon kullanılamıyor.', { variant: 'error' });
      } else if (event.error === 'service-not-allowed') {
        enqueueSnackbar('Google ses tanıma servisine erişilemiyor.', { variant: 'error' });
      } else {
        enqueueSnackbar(`Hata: ${event.error}`, { variant: 'error' });
      }
      isStoppingRef.current = true;
    });

    rec.addEventListener('end', () => {
      console.log('Recognition ended. Got results:', hasReceivedResultRef.current, 'Is stopping:', isStoppingRef.current);
      if (!isStoppingRef.current && !hasReceivedResultRef.current) {
        console.error('❌ Motor hemen kapandı, ses alınamadı.');
        enqueueSnackbar('Ses algılanamadı. Mikrofon izni verilmemiş veya başka bir uygulama mikrofonu kullanıyor olabilir.', { variant: 'warning' });
      }
      stopRecognition(true);
    });

    recognitionRef.current = rec;
    try {
      console.log('▶️ rec.start() çağrılıyor...');
      rec.start();
    } catch (err) {
      console.error('Start error:', err);
      enqueueSnackbar('Kayıt başlatılamadı.', { variant: 'error' });
      stopRecognition(true);
    }
  };

  useEffect(() => {
    if (!(window.SpeechRecognition || window.webkitSpeechRecognition)) {
      setIsSupported(false);
    }
    return () => { stopRecognition(); };
  }, []);

  useEffect(() => {
    if (onListeningChange) onListeningChange(isRecording);
  }, [isRecording, onListeningChange]);

  const toggleRecording = () => {
    if (isRecording) {
      stopRecognition();
    } else {
      startRecognition();
    }
  };

  if (!isSupported) return null;

  const content = (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, position: 'relative' }}>
      <AnimatePresence>
        {isRecording && (
          <Box
            sx={{
              position: 'absolute',
              right: '100%',
              mr: 2,
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              zIndex: 10
            }}
          >
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              style={{
                backgroundColor: theme.palette.background.paper,
                borderRadius: '16px',
                padding: '10px 20px',
                border: `1px solid ${theme.palette.divider}`,
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                boxShadow: theme.shadows[4],
                backdropFilter: 'blur(10px)',
                minWidth: '220px'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%' }}>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: audioStatus === 'LISTENING' ? errorColor : primaryColor, 
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5
                  }}
                >
                  {audioStatus === 'LISTENING' ? 'DİNLİYOR' : 'BEKLİYOR'}
                  <motion.span
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                  >
                    ...
                  </motion.span>
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '3px', height: 20 }}>
                  {[0, 1, 2, 3, 4].map((i) => (
                    <motion.div
                      key={i}
                      animate={audioStatus === 'LISTENING'
                        ? { height: ['4px', '16px', '6px', '14px', '4px'] }
                        : { height: ['4px', '7px', '4px'] }
                      }
                      transition={{
                        repeat: Infinity,
                        duration: audioStatus === 'LISTENING' ? 0.6 : 1.2,
                        delay: i * 0.1,
                        ease: 'easeInOut'
                      }}
                      style={{
                        width: '3px',
                        backgroundColor: audioStatus === 'LISTENING' ? errorColor : primaryColor,
                        borderRadius: '2px',
                        opacity: audioStatus === 'LISTENING' ? 0.9 : 0.4,
                      }}
                    />
                  ))}
                </Box>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: theme.palette.text.secondary, 
                    fontStyle: 'italic',
                    fontSize: '0.9rem',
                    flexGrow: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {interimTranscript ? "Konuşma algılandı..." : "Ses bekleniyor..."}
                </Typography>
              </Box>
            </motion.div>
          </Box>
        )}
      </AnimatePresence>

      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <AnimatePresence>
          {isRecording && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: audioStatus === 'LISTENING' ? 1.4 : 1.2, opacity: 0.2 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeOut" }}
              style={{
                position: 'absolute',
                inset: -10,
                backgroundColor: audioStatus === 'LISTENING' ? errorColor : primaryColor,
                borderRadius: '50%',
                zIndex: 0,
                pointerEvents: 'none'
              }}
            />
          )}
        </AnimatePresence>
        
        <Tooltip title={isRecording ? "Durdurmak için dokunun" : "Sesle Yazmayı Başlat"} arrow>
          <IconButton
            component={motion.button}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            size="small"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleRecording();
            }}
            sx={{
              position: 'relative',
              zIndex: 1,
              width: 44,
              height: 44,
              bgcolor: isRecording ? errorColor : primaryColor,
              color: theme.palette.common.white,
              boxShadow: theme.shadows[4],
              '&:hover': {
                bgcolor: isRecording ? theme.palette.error.dark : theme.palette.primary.dark,
              }
            }}
          >
            {isRecording ? <MicOff size={22} /> : <Mic size={22} />}
          </IconButton>
        </Tooltip>
      </div>
    </Box>
  );

  if (standalone) {
    return content;
  }

  return (
    <InputAdornment position="end">
      {content}
    </InputAdornment>
  );
};

export default SpeechToTextAdornment;
