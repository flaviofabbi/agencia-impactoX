import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { PontosList } from './pages/PontosList';
import { PontoForm } from './pages/PontoForm';
import { Empreendimentos } from './pages/Empreendimentos';
import { Relatorios } from './pages/Relatorios';
import { Usuarios } from './pages/Usuarios';
import { isFirebaseConfigured } from './firebase';
import { AlertTriangle } from 'lucide-react';

const MissingConfig = () => (
  <div className="flex min-h-screen flex-col items-center justify-center bg-slate-900 p-6 text-center text-white">
    <div className="mb-6 rounded-full bg-amber-500/20 p-6 text-amber-500">
      <AlertTriangle size={64} />
    </div>
    <h1 className="mb-2 text-3xl font-bold">Configuração Necessária</h1>
    <p className="mb-8 max-w-md text-slate-400">
      As chaves do Firebase não foram encontradas. Você precisa configurar as variáveis de ambiente no painel de <strong>Secrets</strong> do AI Studio.
    </p>
    <div className="w-full max-w-sm space-y-2 rounded-xl bg-slate-800 p-6 text-left font-mono text-xs text-slate-300">
      <p>VITE_FIREBASE_API_KEY=...</p>
      <p>VITE_FIREBASE_PROJECT_ID=...</p>
      <p>VITE_FIREBASE_AUTH_DOMAIN=...</p>
      <p>...</p>
    </div>
  </div>
);

export default function App() {
  if (!isFirebaseConfigured) {
    return <MissingConfig />;
  }

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <Layout><Dashboard /></Layout>
            </ProtectedRoute>
          } />

          <Route path="/pontos" element={
            <ProtectedRoute>
              <Layout><PontosList /></Layout>
            </ProtectedRoute>
          } />

          <Route path="/pontos/novo" element={
            <ProtectedRoute>
              <Layout><PontoForm /></Layout>
            </ProtectedRoute>
          } />

          <Route path="/pontos/editar/:id" element={
            <ProtectedRoute>
              <Layout><PontoForm /></Layout>
            </ProtectedRoute>
          } />

          <Route path="/empreendimentos" element={
            <ProtectedRoute>
              <Layout><Empreendimentos /></Layout>
            </ProtectedRoute>
          } />

          <Route path="/relatorios" element={
            <ProtectedRoute>
              <Layout><Relatorios /></Layout>
            </ProtectedRoute>
          } />

          <Route path="/usuarios" element={
            <ProtectedRoute adminOnly>
              <Layout><Usuarios /></Layout>
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
