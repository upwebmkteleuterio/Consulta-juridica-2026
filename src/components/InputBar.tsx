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
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const timerId = useRef<any>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const newHeight = Math.min(textareaRef.current.scrollHeight, 180);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  }, [text]);

  const handleSend = () => {
    if (text.trim() && !isThinking && !isTranscribing) {
      onSend(text);
      setText('');
    }
  };

  const toggleRecording = async () => {
    if (isRecording) {
      mediaRecorder.current?.stop();
      setIsRecording(false);
      if (timerId.current) clearInterval(timerId.current);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        mediaRecorder.current = recorder;
        audioChunks.current = [];
        recorder.ondataavailable = (e) => audioChunks.current.push(e.data);
        recorder.onstop = async () => {
          setIsTranscribing(true);
          const audioBlob = new Blob(audioChunks.current);
          const base64 = await blobToBase64(audioBlob);
          const transcription = await transcribeAudio(base64);
          if (transcription) setText(prev => prev + ' ' + transcription);
          setIsTranscribing(false);
          stream.getTracks().forEach(t => t.stop());
        };
        recorder.start();
        setIsRecording(true);
        setTime(0);
        timerId.current = setInterval(() => setTime(t => t + 1), 1000);
      } catch (err) { alert("Acesso ao microfone negado."); }
    }
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto px-4 pb-6">
      <div className={cn(
        "relative flex flex-col bg-[#1A2333]/95 border rounded-2xl transition-all shadow-2xl",
        text.trim() ? "border-champagne/60" : "border-gray-800/80"
      )}>
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent border-none focus:ring-0 text-white p-4 max-h-[180px] mb-10"
        />
        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between p-3">
          <button onClick={toggleRecording} className={cn("p-2 rounded-xl", isRecording ? "text-red-500 bg-red-500/10" : "text-gray-400")}>
            {isTranscribing ? <Loader2 className="animate-spin" /> : <Mic />}
          </button>
          <button onClick={handleSend} disabled={!text.trim() || isThinking} className="p-2 bg-champagne text-white rounded-xl">
            {isThinking ? <Loader2 className="animate-spin" /> : <Send />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InputBar;