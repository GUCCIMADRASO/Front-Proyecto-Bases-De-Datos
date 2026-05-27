import { useEffect, useState } from 'react';
import { teamsService, playersService, matchesService } from '../../services/mockApi';
import { Users, Shield, TrendingUp, Calendar } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalTeams: 0,
    totalPlayers: 0,
    totalMarketValue: 0,
    matchesPlayed: 0
  });
  const [positionData, setPositionData] = useState<any[]>([]);

  useEffect(() => {
    const teams = teamsService.getAll();
    const players = playersService.getAll();
    const matches = matchesService.getAll();

    const totalMarketValue = teams.reduce((sum, team) => sum + team.valorTotalEquipo, 0);

    setStats({
      totalTeams: teams.length,
      totalPlayers: players.length,
      totalMarketValue,
      matchesPlayed: matches.length
    });

    const positions = [
      { id: 'portero', name: 'Portero', color: '#10b981' },
      { id: 'defensa', name: 'Defensa', color: '#06b6d4' },
      { id: 'centrocampista', name: 'Centrocampista', color: '#8b5cf6' },
      { id: 'delantero', name: 'Delantero', color: '#ec4899' }
    ];

    const posData = positions.map(pos => ({
      id: pos.id,
      name: pos.name,
      color: pos.color,
      value: players.filter((p: any) => p.posicion === pos.name).length
    })).filter(item => item.value > 0);

    setPositionData(posData);
  }, []);

  const statCards = [
    {
      title: 'Total Equipos',
      value: stats.totalTeams,
      icon: Shield,
      gradient: 'from-emerald-500 to-teal-500',
      bgGradient: 'from-emerald-500/20 to-teal-500/20'
    },
    {
      title: 'Total Jugadores',
      value: stats.totalPlayers,
      icon: Users,
      gradient: 'from-cyan-500 to-blue-500',
      bgGradient: 'from-cyan-500/20 to-blue-500/20'
    },
    {
      title: 'Valor Total del Mercado',
      value: `$${(stats.totalMarketValue / 1000000).toFixed(1)}M`,
      icon: TrendingUp,
      gradient: 'from-purple-500 to-pink-500',
      bgGradient: 'from-purple-500/20 to-pink-500/20'
    },
    {
      title: 'Partidos Jugados',
      value: stats.matchesPlayed,
      icon: Calendar,
      gradient: 'from-pink-500 to-rose-500',
      bgGradient: 'from-pink-500/20 to-rose-500/20'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl text-white mb-2">Dashboard</h1>
        <p className="text-slate-400">Estadísticas generales del torneo</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => (
          <div
            key={card.title}
            className="relative bg-slate-800/40 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6 overflow-hidden group hover:border-slate-600/50 transition-all"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${card.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity`}></div>

            <div className="relative">
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${card.gradient} flex items-center justify-center mb-4`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>

              <p className="text-slate-400 text-sm mb-1">{card.title}</p>
              <p className="text-3xl text-white">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-slate-800/40 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6">
        <h2 className="text-xl text-white mb-6">Distribución de Jugadores por Posición</h2>

        {positionData.length > 0 ? (
          <div className="space-y-4">
            {(() => {
              const total = positionData.reduce((sum, item) => sum + item.value, 0);
              return positionData.map((item) => {
                const percentage = ((item.value / total) * 100).toFixed(1);
                return (
                  <div key={item.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: item.color }}
                        ></div>
                        <span className="text-white">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-slate-400 text-sm">{item.value} jugadores</span>
                        <span className="text-white">{percentage}%</span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-700/50 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: item.color
                        }}
                      ></div>
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        ) : (
          <div className="h-[200px] flex items-center justify-center text-slate-400">
            No hay jugadores registrados para mostrar la distribución
          </div>
        )}
      </div>
    </div>
  );
}
