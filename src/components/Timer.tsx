import { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, CheckCircle2, AlertCircle } from "lucide-react";
import { Subject } from "@/src/types";
import { cn, formatDuration } from "@/src/lib/utils";
import { motion } from "motion/react";

interface TimerProps {
  onSessionComplete: () => void;
}

export default function Timer({ onSessionComplete }: TimerProps) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetch("/api/subjects")
      .then(res => res.json())
      .then(data => {
        setSubjects(data);
        if (data.length > 0) setSelectedSubject(data[0].id);
      });
  }, []);

  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive]);

  async function handleFinish() {
    if (!selectedSubject || seconds < 10) {
      alert("Por favor, selecione uma matéria e estude por pelo menos 10 segundos.");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject_id: selectedSubject,
          duration: seconds,
          date: new Date().toISOString(),
          notes: notes
        })
      });
      if (res.ok) {
        onSessionComplete();
      }
    } catch (error) {
      console.error("Error saving session:", error);
    } finally {
      setIsSaving(false);
    }
  }

  const currentSubject = subjects.find(s => s.id === selectedSubject);

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <header className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-slate-100">Sessão de Foco</h2>
        <p className="text-gray-500 dark:text-slate-400 mt-1">O trabalho profundo começa agora.</p>
      </header>

      <div className="bg-white dark:bg-slate-800 p-8 md:p-12 rounded-[32px] md:rounded-[40px] border border-gray-100 dark:border-slate-700 shadow-xl flex flex-col items-center space-y-8 md:space-y-12 relative overflow-hidden">
        {/* Background Glow */}
        <div 
          className="absolute inset-0 opacity-5 pointer-events-none"
          style={{ 
            background: currentSubject 
              ? `radial-gradient(circle at center, ${currentSubject.color} 0%, transparent 70%)` 
              : 'none' 
          }}
        />

        {/* Subject Selector */}
        <div className="w-full max-w-xs">
          <label className="block text-center text-xs font-medium text-gray-400 mb-2 md:mb-3 uppercase tracking-widest">Estudando</label>
          <select 
            value={selectedSubject || ""}
            onChange={(e) => setSelectedSubject(Number(e.target.value))}
            disabled={isActive}
            className="w-full bg-gray-50 dark:bg-slate-900 border-none rounded-2xl px-4 py-3 text-center font-semibold text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none appearance-none cursor-pointer disabled:opacity-50 text-sm md:text-base"
          >
            {subjects.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        {/* Timer Display */}
        <div className="relative">
          <motion.div 
            animate={{ scale: isActive ? [1, 1.02, 1] : 1 }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="text-6xl sm:text-8xl font-mono font-bold tracking-tighter text-gray-900 dark:text-slate-100"
          >
            {formatDuration(seconds)}
          </motion.div>
          {isActive && (
            <div className="absolute -top-6 left-1/2 -translate-x-1/2">
              <span className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 font-medium text-[10px] md:text-sm bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-full animate-pulse">
                <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-indigo-600 dark:bg-indigo-400 rounded-full" />
                <span>Gravando</span>
              </span>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-4 md:space-x-6">
          <button 
            onClick={() => setSeconds(0)}
            disabled={isActive || seconds === 0}
            className="p-3 md:p-4 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-all disabled:opacity-30"
          >
            <RotateCcw className="w-6 h-6 md:w-7 md:h-7" />
          </button>

          <button 
            onClick={() => setIsActive(!isActive)}
            className={cn(
              "w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center transition-all shadow-lg scale-100 md:scale-110",
              isActive 
                ? "bg-amber-100 text-amber-600 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400" 
                : "bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-105 md:hover:scale-115"
            )}
          >
            {isActive ? <Pause className="w-8 h-8 md:w-10 md:h-10" fill="currentColor" /> : <Play className="w-8 h-8 md:w-10 md:h-10 ml-1 md:ml-2" fill="currentColor" />}
          </button>

          <button 
            onClick={handleFinish}
            disabled={isActive || seconds < 10}
            className="p-3 md:p-4 text-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-full transition-all disabled:opacity-30"
          >
            <CheckCircle2 className="w-6 h-6 md:w-7 md:h-7" />
          </button>
        </div>

        {/* Notes */}
        <div className="w-full">
          <textarea 
            placeholder="No que você trabalhou? (Opcional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-gray-50 dark:bg-slate-900 border-none rounded-2xl p-4 text-gray-700 dark:text-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none resize-none h-24"
          />
        </div>
      </div>

      {/* Tips */}
      <div className="bg-amber-50 dark:bg-amber-900/20 p-6 rounded-3xl border border-amber-100 dark:border-amber-900/30 flex items-start space-x-4">
        <AlertCircle className="text-amber-500 dark:text-amber-400 shrink-0 mt-1" size={20} />
        <div>
          <h4 className="font-semibold text-amber-900 dark:text-amber-300">Dica de Estudo</h4>
          <p className="text-amber-700 dark:text-amber-400 text-sm mt-1">
            Tente a técnica Pomodoro: estude por 25 minutos e depois faça uma pausa de 5 minutos. Isso ajuda a manter o foco total!
          </p>
        </div>
      </div>
    </div>
  );
}
