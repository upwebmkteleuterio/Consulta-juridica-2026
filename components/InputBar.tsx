
import React, { useState, useRef, useEffect } from 'react';
import { transcribeAudio, blobToBase64 } from '../services/gemini';
import { Mic, Square, Loader2, Send } from 'lucide-react';
import { cn } from '../lib/utils';

interface InputBarProps {
  onSend: (text: string) => void;
  placeholder?: string;
  isThinking?: boolean;
}

const InputBar: React.FC<InputBarProps> = ({ onSend, placeholder, isThinking }) => {
  const [text, setText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [time, setTime] = useState(0);
  const [showAudioTooltip, setShowAudioTooltip] = useState(false);
  const [tooltipFadeOut, setTooltipFadeOut] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const timerId = useRef<any>(null);
  const inactivityTimer = useRef<any>(null);
  const visibilityTimer = useRef<any>(null);

  // Efeito para ajustar altura do textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const newHeight = Math.min(textareaRef.current.scrollHeight, 180);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  }, [text]);

  // Efeito para gerenciar o timer de áudio
  useEffect(() => {
    if (isRecording) {
      timerId.current = setInterval(() => setTime(t => t + 1), 1000);
    } else {
      if (timerId.current) clearInterval(timerId.current);
      setTime(0);
    }
    return () => {
      if (timerId.current) clearInterval(timerId.current);
    };
  }, [isRecording]);

  // Lógica do Tooltip de inatividade e desaparecimento automático
  useEffect(() => {
    // Resetar timers e estado se houver qualquer atividade
    setShowAudioTooltip(false);
    setTooltipFadeOut(false);
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    if (visibilityTimer.current) clearTimeout(visibilityTimer.current);

    if (text.trim().length > 0 || isRecording || isTranscribing || isThinking) {
      return;
    }

    // Timer de 7 segundos para APARECER
    inactivityTimer.current = setTimeout(() => {
      setShowAudioTooltip(true);
      
      // Timer de 4 segundos para começar a DESAPARECER
      visibilityTimer.current = setTimeout(() => {
        setTooltipFadeOut(true);
        // Remove totalmente do DOM após o fade de 1s
        setTimeout(() => setShowAudioTooltip(false), 1000);
      }, 4000);
    }, 7000);

    return () => {
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
      if (visibilityTimer.current) clearTimeout(visibilityTimer.current);
    };
  }, [text, isRecording, isTranscribing, isThinking]);

  const handleSend = () => {
    if (text.trim() && !isThinking && !isTranscribing) {
      onSend(text);
      setText('');
      setShowAudioTooltip(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const toggleRecording = async () => {
    setShowAudioTooltip(false);
    if (isRecording) {
      mediaRecorder.current?.stop();
      setIsRecording(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/ogg';
        const recorder = new MediaRecorder(stream, { mimeType });
        mediaRecorder.current = recorder;
        audioChunks.current = [];
        
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) audioChunks.current.push(e.data);
        };

        recorder.onstop = async () => {
          setIsTranscribing(true);
          try {
            const audioBlob = new Blob(audioChunks.current, { type: mimeType });
            const base64 = await blobToBase64(audioBlob);
            const transcription = await transcribeAudio(base64, mimeType);
            if (transcription && transcription.trim()) {
              setText(prev => (prev ? prev + ' ' + transcription.trim() : transcription.trim()));
            }
          } catch (err) {
            console.error("Failed to transcribe", err);
          } finally {
            setIsTranscribing(false);
            stream.getTracks().forEach(track => track.stop());
          }
        };

        recorder.start();
        setIsRecording(true);
      } catch (err) {
        console.error("Microphone access error:", err);
        alert("Não foi possível acessar o microfone.");
      }
    }
  };

  const hasContent = text.trim().length > 0;
  const isActionDisabled = isThinking || isTranscribing;

  return (
    <div className="relative w-full max-w-4xl mx-auto px-4 pb-6 md:pb-10">
      {/* Container Principal Sem overflow-hidden para o tooltip aparecer por fora se necessário */}
      <div className={cn(
        "relative flex flex-col bg-[#1A2333]/95 border backdrop-blur-2xl rounded-2xl transition-all duration-300 shadow-2xl",
        hasContent ? "border-champagne/60" : "border-gray-800/80"
      )}>
        
        {/* Wrapper do Textarea com o efeito de fade e overflow controlado */}
        <div className="relative overflow-hidden rounded-t-2xl input-container-fade">
          <textarea
            ref={textareaRef}
            rows={2}
            value={text}
            disabled={isRecording}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={isRecording ? "Capturando seu áudio..." : (placeholder || "Por favor, descreva em detalhes o problema que você está enfrentando...")}
            className={cn(
              "w-full bg-transparent border-none focus:ring-0 focus:outline-none text-white placeholder-gray-500 resize-none py-4 px-5 max-h-[180px] overflow-y-auto scrollbar-hide text-base leading-relaxed transition-opacity mb-10",
              isRecording && "opacity-50"
            )}
          />
        </div>
        
        {/* Barra de Ações - Z-index elevado para ficar acima do fade */}
        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between py-3 px-4 z-30">
          <div className="flex items-center gap-3">
            {(isRecording || isTranscribing) && (
              <div className="flex items-center gap-3 animate-in fade-in slide-in-from-left-2">
                {isRecording ? (
                  <>
                    <div className="flex items-end gap-0.5 h-4 mb-0.5">
                      {[...Array(8)].map((_, i) => (
                        <div
                          key={i}
                          className="w-0.5 bg-red-500/60 rounded-full animate-pulse"
                          style={{
                            height: `${30 + Math.random() * 70}%`,
                            animationDelay: `${i * 0.05}s`,
                            animationDuration: '0.4s'
                          }}
                        />
                      ))}
                    </div>
                    <span className="font-mono text-xs font-bold text-red-500 min-w-[40px]">
                      {formatTime(time)}
                    </span>
                  </>
                ) : (
                  <span className="text-[10px] font-bold text-champagne uppercase tracking-widest whitespace-nowrap">
                    Enviando áudio...
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 relative">
            {/* Tooltip de Áudio - Posicionado à esquerda com pontinha à direita */}
            {showAudioTooltip && (
              <div className={cn(
                "absolute right-full mr-4 top-1/2 -translate-y-1/2 z-[100] transition-all duration-1000 pointer-events-none",
                tooltipFadeOut ? "opacity-0 translate-x-2" : "opacity-100 translate-x-0"
              )}>
                <div className="bg-[#333] text-white text-[11px] font-medium py-2.5 px-4 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] relative w-[210px] md:w-[240px] leading-snug text-center break-words animate-in fade-in slide-in-from-right-4 duration-500">
                  Se preferir envie seu problema por áudio aqui.
                  
                  {/* Seta lateral para a direita apontando para o botão */}
                  <div className="absolute left-full top-1/2 -translate-y-1/2 border-y-[6px] border-y-transparent border-l-[8px] border-l-[#333]"></div>
                </div>
              </div>
            )}

            <button
              onClick={toggleRecording}
              disabled={isThinking || isTranscribing}
              className={cn(
                "p-3 rounded-xl transition-all relative flex items-center justify-center z-40",
                isRecording ? "text-red-500 bg-red-500/10" : "text-gray-400 hover:text-white hover:bg-gray-800"
              )}
            >
              {isTranscribing ? (
                <Loader2 className="w-5 h-5 animate-spin text-champagne" />
              ) : isRecording ? (
                <Square className="w-5 h-5 fill-red-500 animate-pulse-red" />
              ) : (
                <Mic className="w-5 h-5" />
              )}
            </button>
            
            <button
              disabled={!hasContent || isActionDisabled || isRecording}
              onClick={handleSend}
              className={cn(
                "p-3 rounded-xl transition-all duration-300 flex items-center justify-center relative z-40",
                hasContent && !isActionDisabled && !isRecording
                  ? "bg-champagne text-white shadow-[0_0_15px_rgba(197,160,89,0.4)]" 
                  : "bg-gray-800 text-gray-600"
              )}
            >
              {isThinking ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      <p className="text-center text-[10px] text-gray-600 mt-4 uppercase tracking-[0.25em] font-bold">
        Magalhães & Gomes Advogados • Inteligência Jurídica
      </p>
    </div>
  );
};

export default InputBar;
