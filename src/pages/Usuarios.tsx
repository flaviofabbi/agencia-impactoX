import React, { useEffect, useState } from 'react';
import { collection, query, getDocs, doc, updateDoc, orderBy, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { UserProfile, UserLevel } from '../types';
import { Users, UserPlus, Shield, CheckCircle2, XCircle, Loader2, Mail } from 'lucide-react';
import { motion } from 'motion/react';

export const Usuarios: React.FC = () => {
  const [usuarios, setUsuarios] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newUser, setNewUser] = useState({ nome: '', email: '', nivel: 'operador' as UserLevel, uid: '' });

  const fetchUsuarios = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'usuarios'), orderBy('criadoEm', 'desc'));
      const querySnapshot = await getDocs(q);
      setUsuarios(querySnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile)));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const toggleStatus = async (user: UserProfile) => {
    try {
      await updateDoc(doc(db, 'usuarios', user.uid), {
        ativo: !user.ativo
      });
      fetchUsuarios();
    } catch (error) {
      alert('Erro ao atualizar status.');
    }
  };

  const changeLevel = async (uid: string, nivel: UserLevel) => {
    try {
      await updateDoc(doc(db, 'usuarios', uid), { nivel });
      fetchUsuarios();
    } catch (error) {
      alert('Erro ao atualizar nível.');
    }
  };

  // Note: In a real app, creating a user in Auth requires Admin SDK or a Cloud Function.
  // Here we simulate the Firestore part. The user would still need to sign up or be created via Auth.
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.uid) {
      alert('Para este demo, informe o UID do usuário já existente no Firebase Auth.');
      return;
    }
    try {
      await setDoc(doc(db, 'usuarios', newUser.uid), {
        nome: newUser.nome,
        email: newUser.email,
        nivel: newUser.nivel,
        ativo: true,
        criadoEm: Timestamp.now()
      });
      setShowModal(false);
      fetchUsuarios();
    } catch (error) {
      alert('Erro ao criar usuário.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gerenciamento de Usuários</h1>
          <p className="text-slate-500">Controle níveis de acesso e permissões</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 font-semibold text-white transition-all hover:bg-indigo-700"
        >
          <UserPlus size={20} />
          Novo Usuário
        </button>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin text-indigo-600" /></div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {usuarios.map((u) => (
            <motion.div
              key={u.uid}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100"
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-600 font-bold text-lg">
                  {u.nome.charAt(0).toUpperCase()}
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                  u.nivel === 'admin' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'
                }`}>
                  {u.nivel}
                </span>
              </div>
              
              <h3 className="text-lg font-bold text-slate-900">{u.nome}</h3>
              <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                <Mail size={14} />
                {u.email}
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-slate-50 pt-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-400">Status:</span>
                  <button 
                    onClick={() => toggleStatus(u)}
                    className={`flex items-center gap-1 text-xs font-bold ${u.ativo ? 'text-emerald-600' : 'text-red-600'}`}
                  >
                    {u.ativo ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                    {u.ativo ? 'Ativo' : 'Inativo'}
                  </button>
                </div>
                
                <select 
                  value={u.nivel}
                  onChange={(e) => changeLevel(u.uid, e.target.value as UserLevel)}
                  className="rounded-lg border border-slate-100 bg-slate-50 px-2 py-1 text-xs font-bold text-slate-600 outline-none"
                >
                  <option value="operador">Operador</option>
                  <option value="admin">Admin</option>
                </select>
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
            <h2 className="mb-6 text-xl font-bold text-slate-900">Novo Usuário</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Nome Completo</label>
                <input
                  type="text"
                  required
                  value={newUser.nome}
                  onChange={(e) => setNewUser({ ...newUser, nome: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-4 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">E-mail</label>
                <input
                  type="email"
                  required
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-4 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">UID do Firebase Auth</label>
                <input
                  type="text"
                  required
                  value={newUser.uid}
                  onChange={(e) => setNewUser({ ...newUser, uid: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-4 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  placeholder="ID do usuário no Authentication"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Nível de Acesso</label>
                <select
                  value={newUser.nivel}
                  onChange={(e) => setNewUser({ ...newUser, nivel: e.target.value as UserLevel })}
                  className="w-full rounded-lg border border-slate-200 px-4 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                >
                  <option value="operador">Operador</option>
                  <option value="admin">Admin</option>
                </select>
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
                  Criar Usuário
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
