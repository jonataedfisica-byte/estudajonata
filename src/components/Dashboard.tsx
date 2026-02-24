import { useState, useEffect } from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from "recharts";
import { Clock, BookOpen, TrendingUp, Calendar } from "lucide-react";
import { formatDuration } from "@/src/lib/utils";
import { Session, Stat } from "@/src/types";
import { format, parseISO } from "date-fns";

export default function Dashboard() {
  const [stats, setStats] = useState<Stat[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, sessionsRes] = await Promise.all([
          fetch("/api/stats"),
          fetch("/api/sessions")
        ]);
        const statsData = await statsRes.json();
        const sessionsData = await sessionsRes.json();
        setStats(statsData);
        setSessions(sessionsData);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const totalSeconds = stats.reduce((acc, curr) => acc + curr.total_duration, 0);
  const totalHours = (totalSeconds / 3600).toFixed(1);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-slate-100">Bem-vindo de volta!</h2>
        <p className="text-gray-500 dark:text-slate-400 mt-1">Aqui está como estão seus estudos.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Tempo Total" 
          value={`${totalHours}h`} 
          icon={Clock} 
          color="bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400" 
        />
        <StatCard 
          title="Matérias" 
          value={stats.length.toString()} 
          icon={BookOpen} 
          color="bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400" 
        />
        <StatCard 
          title="Sessões" 
          value={sessions.length.toString()} 
          icon={Calendar} 
          color="bg-violet-50 text-violet-600 dark:bg-violet-900/20 dark:text-violet-400" 
        />
        <StatCard 
          title="Sequência" 
          value="5 dias" 
          icon={TrendingUp} 
          color="bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-4 md:p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm">
          <h3 className="text-lg font-semibold mb-6 dark:text-slate-100">Distribuição de Estudo</h3>
          <div className="h-64 md:h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" className="dark:opacity-10" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                <Tooltip 
                  cursor={{ fill: '#F9FAFB', opacity: 0.1 }}
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                    backgroundColor: '#1E293B',
                    color: '#F8FAFC'
                  }}
                  itemStyle={{ color: '#F8FAFC' }}
                  formatter={(value: number) => [formatDuration(value), "Tempo"]}
                />
                <Bar dataKey="total_duration" radius={[4, 4, 0, 0]}>
                  {stats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Sessions */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col">
          <h3 className="text-lg font-semibold mb-6 dark:text-slate-100">Sessões Recentes</h3>
          <div className="space-y-4 flex-1 overflow-y-auto max-h-[320px] pr-2">
            {sessions.length === 0 ? (
              <p className="text-gray-500 dark:text-slate-400 text-center py-8">Nenhuma sessão ainda. Comece a estudar!</p>
            ) : (
              sessions.slice(0, 5).map((session) => (
                <div key={session.id} className="flex items-center justify-between group">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-2 h-8 rounded-full" 
                      style={{ backgroundColor: session.subject_color }}
                    />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-slate-100">{session.subject_name}</p>
                      <p className="text-xs text-gray-500 dark:text-slate-400">{format(parseISO(session.date), "d 'de' MMM, yyyy")}</p>
                    </div>
                  </div>
                  <span className="text-sm font-mono text-gray-600 dark:text-slate-300 bg-gray-50 dark:bg-slate-700 px-2 py-1 rounded">
                    {formatDuration(session.duration)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }: { title: string, value: string, icon: any, color: string }) {
  return (
    <div className="bg-white dark:bg-slate-800 p-4 md:p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm flex items-center space-x-4">
      <div className={cn("p-2 md:p-3 rounded-xl", color)}>
        <Icon className="w-5 h-5 md:w-6 md:h-6" />
      </div>
      <div>
        <p className="text-xs md:text-sm text-gray-500 dark:text-slate-400 font-medium">{title}</p>
        <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-slate-100">{value}</p>
      </div>
    </div>
  );
}

import { cn } from "@/src/lib/utils";
