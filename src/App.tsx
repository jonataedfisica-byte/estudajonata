/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  LayoutDashboard, 
  BookOpen, 
  Timer as TimerIcon, 
  Sparkles, 
  Settings,
  Menu,
  X
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import Dashboard from "./components/Dashboard";
import Subjects from "./components/Subjects";
import Timer from "./components/Timer";
import AIAssistant from "./components/AIAssistant";

type Tab = "dashboard" | "subjects" | "timer" | "ai";

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") === "dark";
    }
    return false;
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  const navItems = [
    { id: "dashboard", label: "Painel", icon: LayoutDashboard },
    { id: "subjects", label: "Matérias", icon: BookOpen },
    { id: "timer", label: "Cronômetro", icon: TimerIcon },
    { id: "ai", label: "Tutor IA", icon: Sparkles },
  ];

  return (
    <div className={cn(
      "flex flex-col md:flex-row h-screen font-sans overflow-hidden transition-colors duration-300",
      isDarkMode ? "bg-slate-900 text-slate-100" : "bg-[#F8F9FA] text-[#1A1A1A]"
    )}>
      {/* Sidebar - Desktop Only */}
      <aside 
        className={cn(
          "hidden md:flex border-r transition-all duration-300 flex-col z-40",
          isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-[#E5E7EB]",
          isSidebarOpen ? "w-64" : "w-20"
        )}
      >
        <div className="p-6 flex items-center justify-between">
          {isSidebarOpen && (
            <motion.h1 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xl font-bold bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent"
            >
              Estuda Jonata
            </motion.h1>
          )}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={cn(
              "p-2 rounded-lg transition-colors",
              isDarkMode ? "hover:bg-slate-700 text-slate-400" : "hover:bg-gray-100 text-gray-500"
            )}
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as Tab)}
              className={cn(
                "w-full flex items-center p-3 rounded-xl transition-all group relative",
                activeTab === item.id 
                  ? (isDarkMode ? "bg-indigo-900/50 text-indigo-400 shadow-sm" : "bg-indigo-50 text-indigo-600 shadow-sm")
                  : (isDarkMode ? "text-slate-400 hover:bg-slate-700 hover:text-slate-100" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900")
              )}
            >
              <item.icon size={22} className={cn("min-w-[22px]", activeTab === item.id ? "text-indigo-500" : "text-gray-400 group-hover:text-gray-600")} />
              {isSidebarOpen && (
                <motion.span 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="ml-3 font-medium"
                >
                  {item.label}
                </motion.span>
              )}
              {activeTab === item.id && (
                <motion.div 
                  layoutId="active-pill-desktop"
                  className="absolute left-0 w-1 h-6 bg-indigo-500 rounded-r-full"
                />
              )}
            </button>
          ))}
        </nav>

        <div className={cn("p-4 border-t", isDarkMode ? "border-slate-700" : "border-gray-100")}>
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className={cn(
              "w-full flex items-center p-3 rounded-xl transition-colors",
              isDarkMode ? "text-slate-400 hover:bg-slate-700" : "text-gray-500 hover:bg-gray-50"
            )}
          >
            <Settings size={22} />
            {isSidebarOpen && <span className="ml-3 font-medium">Configurações</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className={cn(
        "md:hidden border-b p-4 flex items-center justify-between sticky top-0 z-40 transition-colors duration-300",
        isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-gray-100"
      )}>
        <h1 className="text-lg font-bold bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">
          Estuda Jonata
        </h1>
        <button 
          onClick={() => setIsSettingsOpen(true)}
          className={cn(
            "p-2 transition-colors",
            isDarkMode ? "text-slate-400" : "text-gray-500"
          )}
        >
          <Settings size={20} />
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative pb-24 md:pb-0">
        <div className="max-w-6xl mx-auto p-4 md:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === "dashboard" && <Dashboard />}
              {activeTab === "subjects" && <Subjects />}
              {activeTab === "timer" && <Timer onSessionComplete={() => setActiveTab("dashboard")} />}
              {activeTab === "ai" && <AIAssistant />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className={cn(
        "md:hidden fixed bottom-0 left-0 right-0 border-t px-6 py-3 flex justify-between items-center z-40 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] transition-colors duration-300",
        isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-gray-100"
      )}>
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id as Tab)}
            className={cn(
              "flex flex-col items-center space-y-1 transition-all",
              activeTab === item.id 
                ? (isDarkMode ? "text-indigo-400" : "text-indigo-600") 
                : (isDarkMode ? "text-slate-500" : "text-gray-400")
            )}
          >
            <div className={cn(
              "p-1 rounded-lg transition-all",
              activeTab === item.id 
                ? (isDarkMode ? "bg-indigo-900/30" : "bg-indigo-50") 
                : ""
            )}>
              <item.icon size={22} />
            </div>
            <span className="text-[10px] font-medium uppercase tracking-wider">{item.label}</span>
            {activeTab === item.id && (
              <motion.div 
                layoutId="active-pill-mobile"
                className="w-1 h-1 bg-indigo-500 rounded-full"
              />
            )}
          </button>
        ))}
      </nav>

      {/* Settings Modal */}
      <AnimatePresence>
        {isSettingsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSettingsOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={cn(
                "relative w-full max-w-md p-8 rounded-[32px] shadow-2xl z-50",
                isDarkMode ? "bg-slate-800 text-slate-100" : "bg-white text-slate-900"
              )}
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold">Configurações</h2>
                <button 
                  onClick={() => setIsSettingsOpen(false)}
                  className={cn(
                    "p-2 rounded-full transition-colors",
                    isDarkMode ? "hover:bg-slate-700" : "hover:bg-gray-100"
                  )}
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">Modo Escuro</p>
                    <p className={cn("text-sm", isDarkMode ? "text-slate-400" : "text-slate-500")}>
                      Alterne entre os temas claro e escuro
                    </p>
                  </div>
                  <button 
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    className={cn(
                      "w-14 h-8 rounded-full relative transition-colors duration-300",
                      isDarkMode ? "bg-indigo-600" : "bg-gray-200"
                    )}
                  >
                    <motion.div 
                      animate={{ x: isDarkMode ? 26 : 4 }}
                      className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-md"
                    />
                  </button>
                </div>

                <div className={cn("p-4 rounded-2xl border", isDarkMode ? "bg-slate-900/50 border-slate-700" : "bg-slate-50 border-slate-100")}>
                  <p className="text-xs font-bold uppercase tracking-widest mb-2 opacity-50">Sobre o App</p>
                  <p className="text-sm">Estuda Jonata v1.0.0</p>
                  <p className="text-xs mt-1 opacity-70">Desenvolvido para alta performance nos estudos.</p>
                </div>
              </div>

              <button 
                onClick={() => setIsSettingsOpen(false)}
                className="w-full mt-8 py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20"
              >
                Salvar e Fechar
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

