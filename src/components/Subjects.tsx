import { useState, useEffect } from "react";
import { Plus, Trash2, Book, Code, Languages, Calculator, FlaskConical, Music, Palette } from "lucide-react";
import { Subject } from "@/src/types";
import { cn } from "@/src/lib/utils";
import { motion, AnimatePresence } from "motion/react";

const ICONS = [
  { name: "Book", icon: Book },
  { name: "Code", icon: Code },
  { name: "Languages", icon: Languages },
  { name: "Calculator", icon: Calculator },
  { name: "Flask", icon: FlaskConical },
  { name: "Music", icon: Music },
  { name: "Palette", icon: Palette },
];

const COLORS = [
  "#4f46e5", "#7c3aed", "#2563eb", "#0891b2", "#059669", "#d97706", "#dc2626", "#db2777"
];

export default function Subjects() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [selectedIcon, setSelectedIcon] = useState("Book");

  useEffect(() => {
    fetchSubjects();
  }, []);

  async function fetchSubjects() {
    const res = await fetch("/api/subjects");
    const data = await res.json();
    setSubjects(data);
  }

  async function handleAdd() {
    if (!newName.trim()) return;
    const res = await fetch("/api/subjects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName, color: selectedColor, icon: selectedIcon })
    });
    if (res.ok) {
      setNewName("");
      setIsAdding(false);
      fetchSubjects();
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Tem certeza que deseja excluir esta matéria? Todas as sessões associadas serão perdidas.")) return;
    await fetch(`/api/subjects/${id}`, { method: "DELETE" });
    fetchSubjects();
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-slate-100">Matérias</h2>
          <p className="text-sm md:text-base text-gray-500 dark:text-slate-400 mt-1">Gerencie o que você está estudando.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center justify-center space-x-2 bg-indigo-600 text-white px-4 py-3 rounded-xl hover:bg-indigo-700 transition-colors shadow-sm w-full sm:w-auto"
        >
          <Plus size={20} />
          <span>Adicionar Matéria</span>
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {subjects.map((subject) => {
            const IconComp = ICONS.find(i => i.name === subject.icon)?.icon || Book;
            return (
              <motion.div
                key={subject.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm group relative overflow-hidden"
              >
                <div 
                  className="absolute top-0 left-0 w-full h-1" 
                  style={{ backgroundColor: subject.color }}
                />
                <div className="flex items-start justify-between">
                  <div className={cn("p-3 rounded-xl mb-4")} style={{ backgroundColor: `${subject.color}15`, color: subject.color }}>
                    <IconComp size={24} />
                  </div>
                  <button 
                    onClick={() => handleDelete(subject.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-slate-100">{subject.name}</h3>
                <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">0 horas estudadas esta semana</p>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Add Modal */}
      {isAdding && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-800 rounded-3xl p-8 w-full max-w-md shadow-2xl"
          >
            <h3 className="text-2xl font-bold mb-6 dark:text-slate-100">Nova Matéria</h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Nome</label>
                <input 
                  type="text" 
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="ex: Matemática"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Cor</label>
                <div className="flex flex-wrap gap-3">
                  {COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={cn(
                        "w-8 h-8 rounded-full transition-all",
                        selectedColor === color ? "ring-2 ring-offset-2 ring-gray-400 scale-110" : "hover:scale-105"
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Ícone</label>
                <div className="flex flex-wrap gap-3">
                  {ICONS.map((item) => (
                    <button
                      key={item.name}
                      onClick={() => setSelectedIcon(item.name)}
                      className={cn(
                        "p-3 rounded-xl border transition-all",
                        selectedIcon === item.name 
                          ? "bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400" 
                          : "border-gray-100 dark:border-slate-700 text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700"
                      )}
                    >
                      <item.icon size={20} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex space-x-4 pt-4">
                <button 
                  onClick={() => setIsAdding(false)}
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 font-medium text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleAdd}
                  className="flex-1 px-4 py-3 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors shadow-sm"
                >
                  Criar
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
