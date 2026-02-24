import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, User, Bot, Loader2 } from "lucide-react";
import { GoogleGenAI } from "@google/genai";
import Markdown from "react-markdown";
import { cn } from "@/src/lib/utils";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Olá! Eu sou o seu tutor de estudos Estuda Jonata. Como posso te ajudar hoje? Posso te ajudar a criar um plano de estudos, explicar tópicos complexos ou dar dicas de produtividade." }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  async function handleSend() {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          { role: "user", parts: [{ text: userMessage }] }
        ],
        config: {
          systemInstruction: "Você é um tutor de estudos prestativo e encorajador para um app chamado Estuda Jonata. Seu objetivo é ajudar os alunos a gerenciar seu tempo, entender as matérias e manter a motivação. Mantenha as respostas concisas, bem formatadas (usando markdown) e práticas. Se perguntado sobre planos de estudo, sugira cronogramas realistas. Responda sempre em português brasileiro."
        }
      });

      const text = response.text || "Desculpe, não consegui processar esse pedido.";
      setMessages(prev => [...prev, { role: "assistant", content: text }]);
    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { role: "assistant", content: "Desculpe, estou com problemas para conectar ao meu cérebro agora. Por favor, tente novamente mais tarde." }]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto h-[70vh] md:h-[calc(100vh-160px)] flex flex-col bg-white dark:bg-slate-800 rounded-[32px] border border-gray-100 dark:border-slate-700 shadow-xl overflow-hidden">
      <header className="p-4 md:p-6 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-white dark:from-indigo-900/20 dark:to-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-600 rounded-xl text-white">
            <Sparkles className="w-4 h-4 md:w-5 md:h-5" />
          </div>
          <div>
            <h2 className="font-bold text-gray-900 dark:text-slate-100 text-sm md:text-base">Tutor de Estudos IA</h2>
            <p className="text-[10px] md:text-xs text-indigo-600 dark:text-indigo-400 font-medium">Online e pronto para ajudar</p>
          </div>
        </div>
      </header>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6 scroll-smooth"
      >
        {messages.map((msg, i) => (
          <div 
            key={i} 
            className={cn(
              "flex items-start space-x-2 md:space-x-3 max-w-[90%] md:max-w-[85%]",
              msg.role === "user" ? "ml-auto flex-row-reverse space-x-reverse" : ""
            )}
          >
            <div className={cn(
              "p-1.5 md:p-2 rounded-lg md:rounded-xl shrink-0",
              msg.role === "user" ? "bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300" : "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
            )}>
              {msg.role === "user" ? <User className="w-4 h-4 md:w-5 md:h-5" /> : <Bot className="w-4 h-4 md:w-5 md:h-5" />}
            </div>
            <div className={cn(
              "p-3 md:p-4 rounded-2xl text-xs md:text-sm leading-relaxed",
              msg.role === "user" 
                ? "bg-indigo-600 text-white rounded-tr-none shadow-md" 
                : "bg-gray-50 dark:bg-slate-900/50 text-gray-800 dark:text-slate-200 rounded-tl-none border border-gray-100 dark:border-slate-700"
            )}>
              <div className="markdown-body prose prose-sm max-w-none dark:prose-invert">
                <Markdown>{msg.content}</Markdown>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-start space-x-2 md:space-x-3">
            <div className="p-1.5 md:p-2 rounded-lg md:rounded-xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
              <Bot className="w-4 h-4 md:w-5 md:h-5" />
            </div>
            <div className="bg-gray-50 dark:bg-slate-900/50 p-3 md:p-4 rounded-2xl rounded-tl-none border border-gray-100 dark:border-slate-700">
              <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
        )}
      </div>

      <footer className="p-4 md:p-6 border-t border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/50">
        <div className="relative">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Pergunte qualquer coisa..."
            className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl pl-4 pr-12 py-3 md:py-4 text-xs md:text-sm text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none shadow-sm transition-all"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-md"
          >
            <Send className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>
      </footer>
    </div>
  );
}
