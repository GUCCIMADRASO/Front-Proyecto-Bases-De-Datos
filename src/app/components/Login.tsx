import { useState } from 'react';
import { authService } from '../../services/mockApi';
import { Trophy, User, Lock, LogIn, UserPlus } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (user: any) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    nombre: '',
    role: 'Esporadico'
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isLogin) {
      const result = await authService.login(formData.username, formData.password);
      if (result.success) {
        onLoginSuccess(result.user);
      } else {
        setError(result.message || 'Error al iniciar sesión');
      }
    } else {
      const result = await authService.register(formData);
      if (result.success) {
        setError('');
        setIsLogin(true);
        setFormData({ username: '', password: '', nombre: '', role: 'Esporadico' });
      } else {
        setError(result.message || 'Error al registrar usuario');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)'
    }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 right-1/3 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md">
        <div className="bg-slate-800/40 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8 shadow-2xl">
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-br from-emerald-500 to-cyan-500 p-4 rounded-2xl">
              <Trophy className="w-12 h-12 text-white" />
            </div>
          </div>

          <h1 className="text-3xl text-center text-white mb-2">
            Sistema de Gestión
          </h1>
          <p className="text-slate-400 text-center mb-8">
            Torneo de Fútbol
          </p>

          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 px-4 rounded-lg transition-all ${
                isLogin
                  ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white'
                  : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 px-4 rounded-lg transition-all ${
                !isLogin
                  ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white'
                  : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'
              }`}
            >
              Registrarse
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm text-slate-300 mb-2">Nombre Completo</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-lg pl-10 pr-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Ingrese su nombre"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm text-slate-300 mb-2">Usuario</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg pl-10 pr-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Ingrese su usuario"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-2">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg pl-10 pr-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Ingrese su contraseña"
                  required
                />
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm text-slate-300 mb-2">Rol</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="Esporadico">Esporádico (Solo Lectura)</option>
                  <option value="Tradicional">Tradicional (CRUD sin Bitácora)</option>
                  <option value="Administrador">Administrador (Acceso Total)</option>
                </select>
              </div>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-red-300 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-white py-3 rounded-lg hover:from-emerald-600 hover:to-cyan-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
            >
              {isLogin ? (
                <>
                  <LogIn className="w-5 h-5" />
                  Iniciar Sesión
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  Registrarse
                </>
              )}
            </button>
          </form>

          {isLogin && (
            <div className="mt-6 p-4 bg-slate-700/30 rounded-lg border border-slate-600/50">
              <p className="text-xs text-slate-400 mb-2">Usuarios de prueba:</p>
              <div className="text-xs text-slate-300 space-y-1">
                <p><strong>admin</strong> / admin123 (Administrador)</p>
                <p><strong>tradicional</strong> / tradicional123 (Tradicional)</p>
                <p><strong>esporadico</strong> / esporadico123 (Esporádico)</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
