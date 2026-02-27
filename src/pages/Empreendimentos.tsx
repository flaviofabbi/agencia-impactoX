import React, { useEffect, useState } from 'react';
import { collection, query, getDocs, addDoc, Timestamp, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { Empreendimento } from '../types';
import { Plus, Building2, User, FileText, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

export const Empreendimentos: React.FC = () => {
  const [empreendimentos, setEmpreendimentos] = useState<Empreendimento[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newEmp, setNewEmp] = useState({ nome: '', responsavel: '', observacoes: '' });

  const fetchEmpreendimentos = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'empreendimentos'), orderBy('criadoEm', 'desc'));
      const querySnapshot = await getDocs(q);
      setEmpreendimentos(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Empreendimento)));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmpreendimentos();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'empreendimentos'), {
        ...newEmp,
        criadoEm: Timestamp.now()
      });
      setShowModal(false);
      setNewEmp({ nome: '', responsavel: '', observacoes: '' });
      fetchEmpreendimentos();
    } catch (error) {
      alert('Erro ao criar empreendimento.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Empreendimentos</h1>
          <p className="text-slate-500">Gerencie seus parceiros e projetos</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 font-semibold text-white transition-all hover:bg-indigo-700"
        >
          <Plus size={20} />
          Novo Empreendimento
        </button>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin text-indigo-600" /></div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {empreendimentos.map((emp) => (
            <motion.div
              key={emp.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <Building2 size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">{emp.nome}</h3>
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <User size={16} className="text-slate-400" />
                  <span>{emp.responsavel}</span>
                </div>
                {emp.observacoes && (
                  <div className="flex items-start gap-2 text-sm text-slate-600">
                    <FileText size={16} className="mt-0.5 text-slate-400" />
                    <p className="line-clamp-2">{emp.observacoes}</p>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
          >
            <h2 className="mb-6 text-xl font-bold text-slate-900">Novo Empreendimento</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Nome</label>
                <input
                  type="text"
                  required
                  value={newEmp.nome}
                  onChange={(e) => setNewEmp({ ...newEmp, nome: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-4 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Responsável</label>
                <input
                  type="text"
                  required
                  value={newEmp.responsavel}
                  onChange={(e) => setNewEmp({ ...newEmp, responsavel: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-4 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Observações</label>
                <textarea
                  value={newEmp.observacoes}
                  onChange={(e) => setNewEmp({ ...newEmp, observacoes: e.target.value })}
                  rows={3}
                  className="w-full rounded-lg border border-slate-200 px-4 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-lg px-4 py-2 font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-indigo-600 px-6 py-2 font-semibold text-white hover:bg-indigo-700"
                >
                  Salvar
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
