import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, where, Timestamp, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { PontoCaptacao, Empreendimento } from '../types';
import { formatCurrency, formatDate } from '../utils/helpers';
import { FileText, Download, Filter, Loader2, Table as TableIcon } from 'lucide-react';
import { motion } from 'motion/react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

export const Relatorios: React.FC = () => {
  const [pontos, setPontos] = useState<PontoCaptacao[]>([]);
  const [empreendimentos, setEmpreendimentos] = useState<Empreendimento[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [filters, setFilters] = useState({
    periodoInicio: '',
    periodoFim: '',
    empreendimentoId: '',
    status: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pSnap, eSnap] = await Promise.all([
          getDocs(query(collection(db, 'pontos_captacao'), orderBy('criadoEm', 'desc'))),
          getDocs(collection(db, 'empreendimentos'))
        ]);
        
        setPontos(pSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as PontoCaptacao)));
        setEmpreendimentos(eSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Empreendimento)));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredData = pontos.filter(p => {
    const matchEmp = !filters.empreendimentoId || p.empreendimentoId === filters.empreendimentoId;
    const matchStatus = !filters.status || p.status === filters.status;
    
    let matchPeriod = true;
    if (filters.periodoInicio) {
      matchPeriod = matchPeriod && p.dataInicio.toDate() >= new Date(filters.periodoInicio);
    }
    if (filters.periodoFim) {
      matchPeriod = matchPeriod && p.dataInicio.toDate() <= new Date(filters.periodoFim);
    }
    
    return matchEmp && matchStatus && matchPeriod;
  });

  const totals = filteredData.reduce((acc, curr) => ({
    faturado: acc.faturado + curr.valorFechado,
    repassado: acc.repassado + curr.valorRepassado,
    lucro: acc.lucro + curr.margemLucro,
  }), { faturado: 0, repassado: 0, lucro: 0 });

  const exportPDF = () => {
    const doc = new jsPDF() as any;
    doc.text('Relatório de Pontos de Captação', 14, 15);
    doc.setFontSize(10);
    doc.text(`Gerado em: ${new Date().toLocaleString()}`, 14, 22);

    const tableData = filteredData.map(p => [
      p.nomePonto,
      p.cnpj,
      formatDate(p.dataInicio),
      formatCurrency(p.valorFechado),
      formatCurrency(p.valorRepassado),
      formatCurrency(p.margemLucro),
      p.status
    ]);

    doc.autoTable({
      startY: 30,
      head: [['Ponto', 'CNPJ', 'Início', 'Faturado', 'Repassado', 'Lucro', 'Status']],
      body: tableData,
      foot: [['Totais', '', '', formatCurrency(totals.faturado), formatCurrency(totals.repassado), formatCurrency(totals.lucro), '']],
      theme: 'grid',
      headStyles: { fillColor: [99, 102, 241] }
    });

    doc.save(`relatorio_${new Date().getTime()}.pdf`);
  };

  const exportExcel = () => {
    const data = filteredData.map(p => ({
      'Ponto': p.nomePonto,
      'CNPJ': p.cnpj,
      'Responsável': p.responsavel,
      'Início': formatDate(p.dataInicio),
      'Término': formatDate(p.dataTermino),
      'Valor Fechado': p.valorFechado,
      'Valor Repassado': p.valorRepassado,
      'Margem Lucro': p.margemLucro,
      'Status': p.status
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Relatório');
    XLSX.writeFile(wb, `relatorio_${new Date().getTime()}.xlsx`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Relatórios</h1>
          <p className="text-slate-500">Análise detalhada e exportação de dados</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={exportExcel}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <TableIcon size={18} /> Excel
          </button>
          <button 
            onClick={exportPDF}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            <Download size={18} /> PDF
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
        <div className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-900">
          <Filter size={18} /> Filtros
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500 uppercase">Início Período</label>
            <input 
              type="date" 
              value={filters.periodoInicio}
              onChange={(e) => setFilters({ ...filters, periodoInicio: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500 uppercase">Fim Período</label>
            <input 
              type="date" 
              value={filters.periodoFim}
              onChange={(e) => setFilters({ ...filters, periodoFim: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500 uppercase">Empreendimento</label>
            <select 
              value={filters.empreendimentoId}
              onChange={(e) => setFilters({ ...filters, empreendimentoId: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-500"
            >
              <option value="">Todos</option>
              {empreendimentos.map(e => <option key={e.id} value={e.id}>{e.nome}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500 uppercase">Status</label>
            <select 
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-500"
            >
              <option value="">Todos</option>
              <option value="ativo">Ativo</option>
              <option value="encerrado">Encerrado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Totais */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl bg-white p-4 shadow-sm border border-slate-100">
          <p className="text-xs font-bold text-slate-400 uppercase">Total Faturado</p>
          <p className="text-lg font-bold text-slate-900">{formatCurrency(totals.faturado)}</p>
        </div>
        <div className="rounded-xl bg-white p-4 shadow-sm border border-slate-100">
          <p className="text-xs font-bold text-slate-400 uppercase">Total Repassado</p>
          <p className="text-lg font-bold text-slate-900">{formatCurrency(totals.repassado)}</p>
        </div>
        <div className="rounded-xl bg-indigo-600 p-4 shadow-lg shadow-indigo-100 text-white">
          <p className="text-xs font-bold opacity-80 uppercase">Lucro Total</p>
          <p className="text-lg font-bold">{formatCurrency(totals.lucro)}</p>
        </div>
      </div>

      {/* Tabela */}
      <div className="overflow-x-auto rounded-2xl bg-white shadow-sm border border-slate-100">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold">
            <tr>
              <th className="px-6 py-4">Ponto</th>
              <th className="px-6 py-4">CNPJ</th>
              <th className="px-6 py-4">Início</th>
              <th className="px-6 py-4">Faturado</th>
              <th className="px-6 py-4">Repassado</th>
              <th className="px-6 py-4">Lucro</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredData.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-900">{p.nomePonto}</td>
                <td className="px-6 py-4 text-slate-500">{p.cnpj}</td>
                <td className="px-6 py-4 text-slate-500">{formatDate(p.dataInicio)}</td>
                <td className="px-6 py-4 font-bold text-slate-900">{formatCurrency(p.valorFechado)}</td>
                <td className="px-6 py-4 text-slate-500">{formatCurrency(p.valorRepassado)}</td>
                <td className="px-6 py-4 font-bold text-emerald-600">{formatCurrency(p.margemLucro)}</td>
                <td className="px-6 py-4">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                    p.status === 'ativo' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {p.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredData.length === 0 && !loading && (
          <div className="p-12 text-center text-slate-400">
            Nenhum dado encontrado para os filtros selecionados.
          </div>
        )}
      </div>
    </div>
  );
};
