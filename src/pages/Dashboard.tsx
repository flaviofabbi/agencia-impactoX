import React, { useEffect, useState } from 'react';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { PontoCaptacao } from '../types';
import { formatCurrency } from '../utils/helpers';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  MapPin, 
  AlertTriangle,
  DollarSign,
  PieChart,
  FileText,
  Building2,
  Loader2 as LoaderIcon
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { addDays, isBefore } from 'date-fns';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalFaturado: 0,
    totalRepassado: 0,
    lucroTotal: 0,
    pontosAtivos: 0,
    vencendo30Dias: 0,
  });
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const q = query(collection(db, 'pontos_captacao'));
        const querySnapshot = await getDocs(q);
        const points = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PontoCaptacao));

        let faturado = 0;
        let repassado = 0;
        let ativos = 0;
        let vencendo = 0;
        const now = new Date();
        const next30Days = addDays(now, 30);

        const enterpriseTotals: Record<string, number> = {};

        points.forEach(p => {
          if (p.status === 'ativo') {
            ativos++;
            faturado += p.valorFechado;
            repassado += p.valorRepassado;

            const dataTermino = p.dataTermino.toDate();
            if (isBefore(dataTermino, next30Days) && isBefore(now, dataTermino)) {
              vencendo++;
            }
          }
        });

        setStats({
          totalFaturado: faturado,
          totalRepassado: repassado,
          lucroTotal: faturado - repassado,
          pontosAtivos: ativos,
          vencendo30Dias: vencendo,
        });

        // Mock chart data based on points for visualization
        const chart = points.slice(0, 5).map(p => ({
          name: p.nomePonto.substring(0, 10),
          faturado: p.valorFechado,
          lucro: p.margemLucro
        }));
        setChartData(chart);

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin text-indigo-600" /></div>;
  }

  const cards = [
    { 
      label: 'Total Faturado', 
      value: formatCurrency(stats.totalFaturado), 
      icon: DollarSign, 
      color: 'bg-emerald-500',
      trend: '+12.5%',
      trendUp: true
    },
    { 
      label: 'Total Repassado', 
      value: formatCurrency(stats.totalRepassado), 
      icon: ArrowUpRight, 
      color: 'bg-amber-500',
      trend: '+8.2%',
      trendUp: true
    },
    { 
      label: 'Lucro Total', 
      value: formatCurrency(stats.lucroTotal), 
      icon: TrendingUp, 
      color: 'bg-indigo-500',
      trend: '+15.4%',
      trendUp: true
    },
    { 
      label: 'Pontos Ativos', 
      value: stats.pontosAtivos.toString(), 
      icon: MapPin, 
      color: 'bg-blue-500',
      trend: 'Estável',
      trendUp: null
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500">Visão geral do desempenho da agência</p>
      </div>

      {stats.vencendo30Dias > 0 && (
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800"
        >
          <AlertTriangle className="shrink-0" size={24} />
          <div>
            <p className="font-semibold">Atenção!</p>
            <p className="text-sm">Você tem {stats.vencendo30Dias} contrato(s) vencendo nos próximos 30 dias.</p>
          </div>
        </motion.div>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card, idx) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100"
          >
            <div className="flex items-start justify-between">
              <div className={cn("rounded-xl p-3 text-white shadow-lg", card.color)}>
                <card.icon size={24} />
              </div>
              {card.trendUp !== null && (
                <span className={cn(
                  "flex items-center gap-1 text-xs font-bold",
                  card.trendUp ? "text-emerald-600" : "text-red-600"
                )}>
                  {card.trendUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  {card.trend}
                </span>
              )}
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-slate-500">{card.label}</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{card.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Desempenho por Ponto</h2>
            <PieChart size={20} className="text-slate-400" />
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  cursor={{ fill: '#f8fafc' }}
                />
                <Bar dataKey="faturado" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
                <Bar dataKey="lucro" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
          <h2 className="mb-6 text-lg font-bold text-slate-900">Ações Rápidas</h2>
          <div className="space-y-3">
            <button className="flex w-full items-center gap-3 rounded-xl border border-slate-100 p-4 text-left transition-all hover:bg-slate-50">
              <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
                <MapPin size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Novo Ponto</p>
                <p className="text-xs text-slate-500">Cadastrar novo local</p>
              </div>
            </button>
            <button className="flex w-full items-center gap-3 rounded-xl border border-slate-100 p-4 text-left transition-all hover:bg-slate-50">
              <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
                <FileText size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Gerar Relatório</p>
                <p className="text-xs text-slate-500">Exportar dados mensais</p>
              </div>
            </button>
            <button className="flex w-full items-center gap-3 rounded-xl border border-slate-100 p-4 text-left transition-all hover:bg-slate-50">
              <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                <Building2 size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Empreendimentos</p>
                <p className="text-xs text-slate-500">Gerenciar parceiros</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Loader2 = ({ className }: { className?: string }) => (
  <svg className={cn("animate-spin", className)} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
);
