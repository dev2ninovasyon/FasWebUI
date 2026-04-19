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

type SpeechButtonSize = "small" | "medium" | "large";

const SIZE_MAP: Record<SpeechButtonSize, { button: number; icon: number }> = {
  small:  { button: 24, icon: 14 },
  medium: { button: 32, icon: 18 },
  large:  { button: 40, icon: 22 },
};

const pulseKeyframes = `
@keyframes speechPulse {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(211, 47, 47, 0.7); }
  70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(211, 47, 47, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(211, 47, 47, 0); }
}
`;

interface SpeechToTextAdornmentProps {
  onTranscript: (text: string) => void;
  onInterimTranscript?: (text: string) => void;
  onListeningChange?: (isListening: boolean) => void;
  standalone?: boolean;
  /** İkon ve buton boyutu. Varsayılan: "medium" */
  size?: SpeechButtonSize;
  /** Minimal mod: Durum paneli ve animasyon halkalarını gizler. Sadece ikon görünür. */
  variant?: "default" | "minimal";
  /** Butonun dış çapı (px). Belirtilirse 'size' haritasını ezer. */
  customButtonSize?: number;
  /** İçerideki ikonun boyutu (px). Belirtilirse 'size' haritasını ezer. */
  customIconSize?: number;
  /** Butona tıklandığında odağı geri kazanmak için çağrılacak callback */
  onFocusRestoration?: () => void;
}

const SpeechToTextAdornment: React.FC<SpeechToTextAdornmentProps> = ({
  onTranscript,
  onInterimTranscript,
  onListeningChange,
  standalone,
  size = "medium",
  variant = "default",
  customButtonSize,
  customIconSize,
  onFocusRestoration,
}) => {
  const { button: defaultBtnSize, icon: defaultIconSize } = SIZE_MAP[size];
  const btnSize = customButtonSize || defaultBtnSize;
  const iconSize = customIconSize || defaultIconSize;
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

    rec.addEventListener('result', (event: Event) => {
      const speechEvent = event as SpeechRecognitionEvent;
      hasReceivedResultRef.current = true;
      let interim = '';
      let final = '';
      for (let i = speechEvent.resultIndex; i < speechEvent.results.length; ++i) {
        if (speechEvent.results[i].isFinal) {
          final += speechEvent.results[i][0].transcript;
        } else {
          interim += speechEvent.results[i][0].transcript;
        }
      }
      if (final) {
        setInterimTranscript('');
        if (onInterimTranscriptRef.current) {
          onInterimTranscriptRef.current('');
        }
        onTranscriptRef.current(final);
      } else {
        setInterimTranscript(interim);
        if (onInterimTranscriptRef.current) {
          onInterimTranscriptRef.current(interim);
        }
      }
      
      if (interim) {
        setAudioStatus('LISTENING');
      } else if (!final) {
        setAudioStatus('WAITING');
      }
    });

    rec.addEventListener('error', (rawEvent: Event) => {
      const event = rawEvent as SpeechRecognitionErrorEvent;
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
      <style>{pulseKeyframes}</style>
      <AnimatePresence>
        {isRecording && variant !== "minimal" && (
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
        {/* Kayıt sırasında arka plan yerine sadece halka animasyonu (Minimal modda gizli) */}
        <AnimatePresence>
          {isRecording && variant !== "minimal" && (
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: audioStatus === 'LISTENING' ? 1.8 : 1.4, opacity: 0 }}
              exit={{ scale: 0.6, opacity: 0 }}
              transition={{ repeat: Infinity, duration: 1.2, ease: "easeOut" }}
              style={{
                position: 'absolute',
                inset: -4,
                border: `2px solid ${audioStatus === 'LISTENING' ? errorColor : primaryColor}`,
                borderRadius: '50%',
                zIndex: 0,
                pointerEvents: 'none'
              }}
            />
          )}
        </AnimatePresence>

        <Tooltip title={isRecording ? "Durdurmak için dokunun" : "Sesle Yazmayı Başlat"} arrow>
          <IconButton
            component={motion.button as any}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            size="small"
            tabIndex={-1} // Odaklanmayı engelle (Focus Lock)
            onMouseDown={(e: React.MouseEvent) => {
              e.preventDefault(); // Odak kaybını engeller
              e.stopPropagation(); // Olayın tabloya (Handsontable) gitmesini engeller
              e.nativeEvent.stopImmediatePropagation(); // Tüm üst dinleyicileri durdur
              
              if (onFocusRestoration) {
                onFocusRestoration();
              }
            }}
            onClick={(e: React.MouseEvent) => {
              e.preventDefault();
              e.stopPropagation();
              e.nativeEvent.stopImmediatePropagation();
              toggleRecording();
            }}
            sx={{
              position: 'relative',
              zIndex: 1,
              width: btnSize,
              height: btnSize,
              // Minimal modda pulse animasyonu yok: box-shadow hücre dışına taşmasın
              animation: (isRecording && variant !== "minimal") ? 'speechPulse 1.5s infinite' : 'none',
              bgcolor: isRecording ? 'rgba(211, 47, 47, 0.1)' : 'transparent',
              color: isRecording
                ? (audioStatus === 'LISTENING' ? errorColor : primaryColor)
                : 'text.secondary',
              '&:hover': {
                bgcolor: 'transparent',
                color: isRecording ? errorColor : primaryColor,
              },
              boxShadow: 'none',
              border: 'none',
              minWidth: 0,
              minHeight: 0,
              p: 0,
            }}
          >
            {isRecording ? <MicOff size={iconSize} /> : <Mic size={iconSize} />}
          </IconButton>
        </Tooltip>
      </div>
    </Box>
  );

  if (standalone || variant === "minimal") {
    return content;
  }

  return (
    <InputAdornment position="end">
      {content}
    </InputAdornment>
  );
};

export default SpeechToTextAdornment;
