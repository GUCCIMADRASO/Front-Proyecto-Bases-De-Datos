import { useState, useEffect } from 'react';
import { authService } from '../services/mockApi';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Teams from './components/Teams';
import Players from './components/Players';
import Directors from './components/Directors';
import Matches from './components/Matches';
import Reports from './components/Reports';
import {
  LayoutDashboard,
  Shield,
  Users,
  UserCircle,
  Trophy,
  FileText,
  LogOut,
  Menu,
  X
} from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
  }, []);

  const handleLoginSuccess = (user: any) => {
    setCurrentUser(user);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setCurrentView('dashboard');
  };

  if (!currentUser) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['Administrador', 'Tradicional', 'Esporadico'] },
    { id: 'teams', label: 'Equipos', icon: Shield, roles: ['Administrador', 'Tradicional', 'Esporadico'] },
    { id: 'players', label: 'Jugadores', icon: Users, roles: ['Administrador', 'Tradicional', 'Esporadico'] },
    { id: 'directors', label: 'Directores Técnicos', icon: UserCircle, roles: ['Administrador', 'Tradicional', 'Esporadico'] },
    { id: 'matches', label: 'Partidos', icon: Trophy, roles: ['Administrador', 'Tradicional', 'Esporadico'] },
    { id: 'reports', label: 'Reportes', icon: FileText, roles: ['Administrador', 'Tradicional', 'Esporadico'] }
  ];

  const filteredMenuItems = menuItems.filter(item => item.roles.includes(currentUser.role));

  return (
    <div className="min-h-screen flex" style={{
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)'
    }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 right-1/3 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
      </div>

      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-slate-800/40 backdrop-blur-xl border-r border-slate-700/50 flex flex-col transition-all duration-300 relative z-10`}>
        <div className="p-4 border-b border-slate-700/50 flex items-center justify-between">
          {sidebarOpen && (
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-emerald-500 to-cyan-500 p-2 rounded-lg">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-white">Torneo</h2>
                <p className="text-xs text-slate-400">Gestión</p>
              </div>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 text-slate-400 hover:text-white transition-colors"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        <div className="p-4 border-b border-slate-700/50">
          <div className={`flex items-center gap-3 ${!sidebarOpen && 'justify-center'}`}>
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-2 rounded-lg">
              <UserCircle className="w-6 h-6 text-white" />
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-white truncate">{currentUser.nombre}</p>
                <p className="text-xs text-slate-400">{currentUser.role}</p>
              </div>
            )}
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {filteredMenuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                currentView === item.id
                  ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              } ${!sidebarOpen && 'justify-center'}`}
            >
              <item.icon className="w-5 h-5" />
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-700/50">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all ${!sidebarOpen && 'justify-center'}`}
          >
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span>Cerrar Sesión</span>}
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto relative z-10">
        <div className="p-8">
          {currentView === 'dashboard' && <Dashboard />}
          {currentView === 'teams' && <Teams userRole={currentUser.role} />}
          {currentView === 'players' && <Players userRole={currentUser.role} />}
          {currentView === 'directors' && <Directors userRole={currentUser.role} />}
          {currentView === 'matches' && <Matches userRole={currentUser.role} />}
          {currentView === 'reports' && <Reports userRole={currentUser.role} />}
        </div>
      </main>
    </div>
  );
}