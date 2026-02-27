import React, { useState } from 'react';
import { signInWithEmailAndPassword, sendPasswordResetEmail, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Mail, Lock, Loader2, AlertCircle, ShieldCheck } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/');
    } catch (err: any) {
      if (err.code === 'auth/invalid-credential') {
        setError('E-mail ou senha incorretos. Verifique se o usuário foi criado no novo projeto do Firebase.');
      } else if (err.code === 'auth/user-disabled') {
        setError('Este usuário foi desativado.');
      } else {
        setError('Ocorreu um erro ao tentar entrar. Tente novamente.');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInitializeAdmin = async () => {
    setInitLoading(true);
    setError('');
    setMessage('');
    try {
      // Create user in Auth
      const userCredential = await createUserWithEmailAndPassword(auth, 'flaviofabbi@gmail.com', '231323');
      const user = userCredential.user;

      // Create profile in Firestore
      await setDoc(doc(db, 'usuarios', user.uid), {
        nome: 'Flavio Fabbi',
        email: 'flaviofabbi@gmail.com',
        nivel: 'admin',
        ativo: true,
        criadoEm: Timestamp.now()
      });

      setMessage('Usuário Administrador criado com sucesso! Agora você pode entrar.');
      setEmail('flaviofabbi@gmail.com');
      setPassword('231323');
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError('Este usuário já existe no sistema.');
      } else {
        setError('Erro ao inicializar administrador: ' + err.message);
      }
    } finally {
      setInitLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Informe seu e-mail para recuperar a senha.');
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('E-mail de recuperação enviado com sucesso!');
    } catch (err: any) {
      setError('Erro ao enviar e-mail de recuperação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl"
      >
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200">
            <Lock size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Bem-vindo de volta</h1>
          <p className="text-slate-500">Acesse sua conta para gerenciar os pontos</p>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {message && (
          <div className="mb-6 flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-600">
            <AlertCircle size={18} />
            {message}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">E-mail</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-4 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                placeholder="seu@email.com"
              />
            </div>
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="block text-sm font-medium text-slate-700">Senha</label>
              <button 
                type="button"
                onClick={handleForgotPassword}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
              >
                Esqueceu a senha?
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-4 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 py-3 font-semibold text-white transition-all hover:bg-indigo-700 disabled:opacity-70"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Entrar'}
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-400">Primeiro Acesso?</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleInitializeAdmin}
            disabled={initLoading}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-indigo-100 bg-indigo-50 py-3 text-sm font-bold text-indigo-600 transition-all hover:bg-indigo-100 disabled:opacity-70"
          >
            {initLoading ? <Loader2 className="animate-spin" size={18} /> : (
              <>
                <ShieldCheck size={18} />
                Criar Acesso Administrador
              </>
            )}
          </button>
        </form>

        <div className="mt-8 border-t border-slate-100 pt-6 text-center">
          <p className="mb-2 text-[10px] font-medium text-slate-400 uppercase tracking-widest">Dica de Acesso</p>
          <p className="text-xs text-slate-500">
            Se este é o seu primeiro acesso no novo projeto, certifique-se de criar o usuário no console do Firebase.
          </p>
          <p className="mt-4 text-xs text-slate-400">
            &copy; 2026 Gestão de Captação. Todos os direitos reservados.
          </p>
        </div>
      </motion.div>
    </div>
  );
};
