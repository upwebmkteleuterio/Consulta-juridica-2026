
import { Mic, Square } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "../../lib/utils";

interface AIVoiceInputProps {
  isRecording: boolean;
  onToggle: () => void;
  visualizerBars?: number;
  className?: string;
}

export function AIVoiceInput({
  isRecording,
  onToggle,
  visualizerBars = 32,
  className
}: AIVoiceInputProps) {
  const [time, setTime] = useState(0);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    let intervalId: any;

    if (isRecording) {
      intervalId = setInterval(() => {
        setTime((t) => t + 1);
      }, 1000);
    } else {
      setTime(0);
    }

    return () => clearInterval(intervalId);
  }, [isRecording]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className={cn("w-full flex flex-col items-center gap-4 animate-in fade-in slide-in-from-bottom-2", className)}>
      <div className="flex flex-col items-center gap-2">
        <button
          className={cn(
            "group w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500 shadow-xl",
            isRecording
              ? "bg-red-500/20 border border-red-500/50"
              : "bg-champagne hover:scale-105 active:scale-95"
          )}
          type="button"
          onClick={onToggle}
        >
          {isRecording ? (
            <Square className="w-5 h-5 text-red-500 fill-red-500" />
          ) : (
            <Mic className="w-6 h-6 text-white" />
          )}
        </button>

        <span
          className={cn(
            "font-mono text-xs font-bold transition-opacity duration-300 tracking-widest",
            isRecording
              ? "text-red-400"
              : "text-gray-500"
          )}
        >
          {formatTime(time)}
        </span>
      </div>

      <div className="h-6 w-full max-w-[240px] flex items-center justify-center gap-1">
        {[...Array(visualizerBars)].map((_, i) => (
          <div
            key={i}
            className={cn(
              "w-1 rounded-full transition-all duration-300",
              isRecording
                ? "bg-champagne/60 animate-pulse"
                : "bg-gray-800 h-1"
            )}
            style={
              isRecording && isClient
                ? {
                    height: `${20 + Math.random() * 80}%`,
                    animationDelay: `${i * 0.05}s`,
                    animationDuration: `${0.4 + Math.random() * 0.4}s`
                  }
                : undefined
            }
          />
        ))}
      </div>

      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">
        {isRecording ? "Capturando seu depoimento..." : "Toque no ícone para falar"}
      </p>
    </div>
  );
}
