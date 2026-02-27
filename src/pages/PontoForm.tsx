import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  Timestamp, 
  addDoc 
} from 'firebase/firestore';
import { db } from '../firebase';
import { PontoCaptacao, Empreendimento } from '../types';
import { 
  calculateEndDate, 
  calculatePassedValue, 
  calculateProfitMargin, 
  formatCurrency, 
  formatCNPJ 
} from '../utils/helpers';
import { ArrowLeft, Save, Loader2, Info } from 'lucide-react';
import { motion } from 'motion/react';

export const PontoForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditing);
  const [empreendimentos, setEmpreendimentos] = useState<Empreendimento[]>([]);

  const [formData, setFormData] = useState({
    nomePonto: '',
    cnpj: '',
    endereco: '',
    empreendimentoId: '',
    responsavel: '',
    valorReal: 0,
    valorFechado: 0,
    percentual: 0,
    valorRepassado: 0,
    margemLucro: 0,
    dataInicio: new Date().toISOString().split('T')[0],
    tempoContrato: 12,
    dataTermino: '',
    status: 'ativo' as const,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Empreendimentos
        const empSnap = await getDocs(collection(db, 'empreendimentos'));
        setEmpreendimentos(empSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Empreendimento)));

        if (isEditing) {
          const docSnap = await getDoc(doc(db, 'pontos_captacao', id));
          if (docSnap.exists()) {
            const data = docSnap.data() as PontoCaptacao;
            setFormData({
              ...data,
              dataInicio: data.dataInicio.toDate().toISOString().split('T')[0],
              dataTermino: data.dataTermino.toDate().toISOString().split('T')[0],
            } as any);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchData();
  }, [id, isEditing]);

  // Auto-calculations
  useEffect(() => {
    const passed = calculatePassedValue(formData.valorFechado, formData.percentual);
    const profit = calculateProfitMargin(formData.valorFechado, passed);
    const end = calculateEndDate(new Date(formData.dataInicio), formData.tempoContrato);

    setFormData(prev => ({
      ...prev,
      valorRepassado: passed,
      margemLucro: profit,
      dataTermino: end.toISOString().split('T')[0],
    }));
  }, [formData.valorFechado, formData.percentual, formData.dataInicio, formData.tempoContrato]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        dataInicio: Timestamp.fromDate(new Date(formData.dataInicio)),
        dataTermino: Timestamp.fromDate(new Date(formData.dataTermino)),
        criadoEm: isEditing ? undefined : Timestamp.now(),
      };

      if (isEditing) {
        await updateDoc(doc(db, 'pontos_captacao', id), payload as any);
      } else {
        await addDoc(collection(db, 'pontos_captacao'), { ...payload, criadoEm: Timestamp.now() });
      }

      navigate('/pontos');
    } catch (error) {
      console.error("Error saving point:", error);
      alert('Erro ao salvar ponto.');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin text-indigo-600" /></div>;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{isEditing ? 'Editar Ponto' : 'Novo Ponto'}</h1>
          <p className="text-slate-500">Preencha as informações abaixo</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-6 rounded-2xl bg-white p-8 shadow-sm border border-slate-100">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Informações Básicas */}
          <div className="space-y-4">
            <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-400">
              <Info size={16} /> Informações Básicas
            </h2>
            
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Nome do Ponto</label>
              <input
                type="text"
                required
                value={formData.nomePonto}
                onChange={(e) => setFormData({ ...formData, nomePonto: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-4 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">CNPJ</label>
                <input
                  type="text"
                  required
                  value={formData.cnpj}
                  onChange={(e) => setFormData({ ...formData, cnpj: formatCNPJ(e.target.value) })}
                  className="w-full rounded-lg border border-slate-200 px-4 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  placeholder="00.000.000/0000-00"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Responsável</label>
                <input
                  type="text"
                  required
                  value={formData.responsavel}
                  onChange={(e) => setFormData({ ...formData, responsavel: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-4 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Empreendimento</label>
              <select
                required
                value={formData.empreendimentoId}
                onChange={(e) => setFormData({ ...formData, empreendimentoId: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-4 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              >
                <option value="">Selecione...</option>
                {empreendimentos.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.nome}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Endereço</label>
              <textarea
                required
                value={formData.endereco}
                onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                rows={2}
                className="w-full rounded-lg border border-slate-200 px-4 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              />
            </div>
          </div>

          {/* Financeiro e Contrato */}
          <div className="space-y-4">
            <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-400">
              <Save size={16} /> Financeiro & Contrato
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Valor Real</label>
                <input
                  type="number"
                  required
                  value={formData.valorReal}
                  onChange={(e) => setFormData({ ...formData, valorReal: Number(e.target.value) })}
                  className="w-full rounded-lg border border-slate-200 px-4 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Valor Fechado</label>
                <input
                  type="number"
                  required
                  value={formData.valorFechado}
                  onChange={(e) => setFormData({ ...formData, valorFechado: Number(e.target.value) })}
                  className="w-full rounded-lg border border-slate-200 px-4 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Percentual (%)</label>
                <input
                  type="number"
                  required
                  value={formData.percentual}
                  onChange={(e) => setFormData({ ...formData, percentual: Number(e.target.value) })}
                  className="w-full rounded-lg border border-slate-200 px-4 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                />
              </div>
              <div className="col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-slate-500">Valor Repassado (Auto)</label>
                <div className="rounded-lg bg-slate-50 px-4 py-2 text-slate-900 font-bold">
                  {formatCurrency(formData.valorRepassado)}
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-indigo-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">Margem de Lucro Estimada</p>
              <p className="text-xl font-bold text-indigo-900">{formatCurrency(formData.margemLucro)}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Data Início</label>
                <input
                  type="date"
                  required
                  value={formData.dataInicio}
                  onChange={(e) => setFormData({ ...formData, dataInicio: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-4 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Tempo (Meses)</label>
                <input
                  type="number"
                  required
                  value={formData.tempoContrato}
                  onChange={(e) => setFormData({ ...formData, tempoContrato: Number(e.target.value) })}
                  className="w-full rounded-lg border border-slate-200 px-4 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-500">Data Término (Auto)</label>
                <div className="rounded-lg bg-slate-50 px-4 py-2 text-slate-900">
                  {formData.dataTermino.split('-').reverse().join('/')}
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Status</label>
                <select
                  required
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full rounded-lg border border-slate-200 px-4 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                >
                  <option value="ativo">Ativo</option>
                  <option value="encerrado">Encerrado</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 border-t border-slate-100 pt-6">
          <button
            type="button"
            onClick={() => navigate('/pontos')}
            className="rounded-lg px-6 py-2.5 font-semibold text-slate-600 transition-all hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-8 py-2.5 font-semibold text-white transition-all hover:bg-indigo-700 disabled:opacity-70"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Salvar Ponto'}
          </button>
        </div>
      </form>
    </div>
  );
};
