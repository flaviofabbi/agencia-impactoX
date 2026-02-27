import React, { useEffect, useState } from 'react';
import { collection, query, getDocs, deleteDoc, doc, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { PontoCaptacao } from '../types';
import { formatCurrency, formatDate } from '../utils/helpers';
import { Plus, Search, MapPin, Calendar, MoreVertical, Edit2, Trash2, Building2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';

export const PontosList: React.FC = () => {
  const [pontos, setPontos] = useState<PontoCaptacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchPontos = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'pontos_captacao'), orderBy('criadoEm', 'desc'));
      const querySnapshot = await getDocs(q);
      setPontos(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PontoCaptacao)));
    } catch (error) {
      console.error("Error fetching points:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPontos();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este ponto?')) {
      try {
        await deleteDoc(doc(db, 'pontos_captacao', id));
        setPontos(pontos.filter(p => p.id !== id));
      } catch (error) {
        alert('Erro ao excluir ponto.');
      }
    }
  };

  const filteredPontos = pontos.filter(p => 
    p.nomePonto.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.cnpj.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Pontos de Captação</h1>
          <p className="text-slate-500">Gerencie todos os locais de captação</p>
        </div>
        <Link 
          to="/pontos/novo"
          className="flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 font-semibold text-white transition-all hover:bg-indigo-700"
        >
          <Plus size={20} />
          Novo Ponto
        </Link>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input
          type="text"
          placeholder="Buscar por nome ou CNPJ..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
        />
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence>
            {filteredPontos.map((p) => (
              <motion.div
                key={p.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="group relative flex flex-col rounded-2xl bg-white p-6 shadow-sm border border-slate-100 transition-all hover:shadow-md"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <MapPin size={24} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase ${
                      p.status === 'ativo' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {p.status}
                    </span>
                    <div className="relative group/menu">
                      <button className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                        <MoreVertical size={20} />
                      </button>
                      <div className="absolute right-0 top-full z-10 hidden w-40 rounded-xl border border-slate-100 bg-white p-1 shadow-xl group-hover/menu:block">
                        <Link to={`/pontos/editar/${p.id}`} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
                          <Edit2 size={16} /> Editar
                        </Link>
                        <button 
                          onClick={() => handleDelete(p.id)}
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <Trash2 size={16} /> Excluir
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-900">{p.nomePonto}</h3>
                  <p className="text-xs font-medium text-slate-400">{p.cnpj}</p>
                  
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Building2 size={16} className="text-slate-400" />
                      <span className="truncate">Resp: {p.responsavel}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Calendar size={16} className="text-slate-400" />
                      <span>Termina em: {formatDate(p.dataTermino)}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4 border-t border-slate-50 pt-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Faturado</p>
                    <p className="text-sm font-bold text-slate-900">{formatCurrency(p.valorFechado)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Lucro</p>
                    <p className="text-sm font-bold text-emerald-600">{formatCurrency(p.margemLucro)}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {!loading && filteredPontos.length === 0 && (
        <div className="flex h-64 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 text-slate-500">
          <MapPin size={48} className="mb-2 opacity-20" />
          <p>Nenhum ponto encontrado.</p>
        </div>
      )}
    </div>
  );
};
