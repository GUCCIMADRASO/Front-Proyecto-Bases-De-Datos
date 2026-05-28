import { useState, useEffect } from 'react';
import { playersService, directorsService, matchesService, teamsService, bitacoraService, BASE_URL } from '../../services/mockApi';
import { FileText, Download, History, Filter, Loader2 } from 'lucide-react';

interface ReportsProps {
  userRole: string;
}

export default function Reports({ userRole }: ReportsProps) {
  const [activeTab, setActiveTab] = useState('players');
  const [players, setPlayers] = useState<any[]>([]);
  const [directors, setDirectors] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [bitacora, setBitacora] = useState<any[]>([]);
  const [downloading, setDownloading] = useState(false);
  const [filters, setFilters] = useState({
    posicion: '',
    valorMin: '',
    valorMax: '',
    nacionalidad: '',
    grupo: '',
    equipo: ''
  });

  const isAdmin = userRole === 'Administrador';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setPlayers(playersService.getAll());
    setDirectors(directorsService.getAll());
    setMatches(matchesService.getAll());
    setTeams(teamsService.getAll());
    if (isAdmin) {
      setBitacora(bitacoraService.getAll());
    }
  };

  const getTeamName = (teamId: number) => {
    const team = teams.find(t => t.id === teamId);
    return team ? team.nombre : 'Desconocido';
  };

  const getFilteredPlayers = () => {
    return players.filter(player => {
      if (filters.posicion && player.posicion !== filters.posicion) return false;
      if (filters.valorMin && player.valorMercado < parseFloat(filters.valorMin) * 1000000) return false;
      if (filters.valorMax && player.valorMercado > parseFloat(filters.valorMax) * 1000000) return false;
      if (filters.equipo && player.idEquipo !== parseInt(filters.equipo)) return false;
      return true;
    });
  };

  const getFilteredDirectors = () => {
    return directors.filter(director => {
      if (filters.nacionalidad && director.nacionalidad !== filters.nacionalidad) return false;
      if (filters.equipo && director.idEquipo !== parseInt(filters.equipo)) return false;
      return true;
    });
  };

  const getFilteredMatches = () => {
    return matches.filter(match => {
      if (filters.grupo && match.idGrupo !== filters.grupo) return false;
      if (filters.equipo) {
        const equipoId = parseInt(filters.equipo);
        if (match.idEquipoLocal !== equipoId && match.idEquipoVisitante !== equipoId) return false;
      }
      return true;
    });
  };

  const handleDownloadPDF = async () => {
    setDownloading(true);

    try {
      const params = new URLSearchParams();
      if (activeTab === 'players') {
        if (filters.posicion) params.append('posicion', filters.posicion);
        if (filters.valorMin) params.append('valorMin', filters.valorMin);
        if (filters.valorMax) params.append('valorMax', filters.valorMax);
        if (filters.equipo) params.append('equipo', filters.equipo);
      } else if (activeTab === 'directors') {
        if (filters.nacionalidad) params.append('nacionalidad', filters.nacionalidad);
        if (filters.equipo) params.append('equipo', filters.equipo);
      } else if (activeTab === 'matches') {
        if (filters.grupo) params.append('grupo', filters.grupo);
        if (filters.equipo) params.append('equipo', filters.equipo);
      }

      const res = await fetch(`${BASE_URL}/reports/${activeTab}/download?${params.toString()}`);
      if (!res.ok) throw new Error('Error al descargar el PDF');
      
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte_${activeTab}_${new Date().toISOString().split('T')[0]}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert('Hubo un error al generar el PDF del reporte.');
    } finally {
      setDownloading(false);
    }
  };

  const formatDateTime = (isoString: string | null) => {
    if (!isoString) return 'Activo';
    const date = new Date(isoString);
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const uniqueNationalities = [...new Set(directors.map(d => d.nacionalidad).filter(Boolean))];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-white mb-2">Reportes y Bitácora</h1>
          <p className="text-slate-400">Generación de reportes y auditoría del sistema</p>
        </div>
      </div>

      <div className="bg-slate-800/40 backdrop-blur-xl rounded-xl border border-slate-700/50">
        <div className="flex border-b border-slate-700">
          <button
            onClick={() => setActiveTab('players')}
            className={`flex-1 px-6 py-4 transition-all ${
              activeTab === 'players'
                ? 'bg-emerald-500/10 text-emerald-400 border-b-2 border-emerald-500'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Jugadores
          </button>
          <button
            onClick={() => setActiveTab('directors')}
            className={`flex-1 px-6 py-4 transition-all ${
              activeTab === 'directors'
                ? 'bg-cyan-500/10 text-cyan-400 border-b-2 border-cyan-500'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Directores Técnicos
          </button>
          <button
            onClick={() => setActiveTab('matches')}
            className={`flex-1 px-6 py-4 transition-all ${
              activeTab === 'matches'
                ? 'bg-purple-500/10 text-purple-400 border-b-2 border-purple-500'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Partidos
          </button>
          {isAdmin && (
            <button
              onClick={() => setActiveTab('bitacora')}
              className={`flex-1 px-6 py-4 transition-all ${
                activeTab === 'bitacora'
                  ? 'bg-pink-500/10 text-pink-400 border-b-2 border-pink-500'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <History className="w-4 h-4" />
                Bitácora
              </div>
            </button>
          )}
        </div>

        <div className="p-6">
          {activeTab !== 'bitacora' && (
            <div className="mb-6 space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="w-5 h-5 text-slate-400" />
                <h3 className="text-white">Filtros de Reporte</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {activeTab === 'players' && (
                  <>
                    <div>
                      <label className="block text-sm text-slate-300 mb-2">Posición</label>
                      <select
                        value={filters.posicion}
                        onChange={(e) => setFilters({ ...filters, posicion: e.target.value })}
                        className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="">Todas</option>
                        <option value="Portero">Portero</option>
                        <option value="Defensa">Defensa</option>
                        <option value="Centrocampista">Centrocampista</option>
                        <option value="Delantero">Delantero</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm text-slate-300 mb-2">Valor Mín (M)</label>
                      <input
                        type="number"
                        value={filters.valorMin}
                        onChange={(e) => setFilters({ ...filters, valorMin: e.target.value })}
                        className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-slate-300 mb-2">Valor Máx (M)</label>
                      <input
                        type="number"
                        value={filters.valorMax}
                        onChange={(e) => setFilters({ ...filters, valorMax: e.target.value })}
                        className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="200"
                      />
                    </div>
                  </>
                )}

                {activeTab === 'directors' && (
                  <div>
                    <label className="block text-sm text-slate-300 mb-2">Nacionalidad</label>
                    <select
                      value={filters.nacionalidad}
                      onChange={(e) => setFilters({ ...filters, nacionalidad: e.target.value })}
                      className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">Todas</option>
                      {uniqueNationalities.map(nat => (
                        <option key={nat} value={nat}>{nat}</option>
                      ))}
                    </select>
                  </div>
                )}

                {activeTab === 'matches' && (
                  <div>
                    <label className="block text-sm text-slate-300 mb-2">Grupo</label>
                    <select
                      value={filters.grupo}
                      onChange={(e) => setFilters({ ...filters, grupo: e.target.value })}
                      className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">Todos</option>
                      <option value="A">Grupo A</option>
                      <option value="B">Grupo B</option>
                      <option value="C">Grupo C</option>
                      <option value="D">Grupo D</option>
                      <option value="E">Grupo E</option>
                      <option value="F">Grupo F</option>
                      <option value="G">Grupo G</option>
                      <option value="H">Grupo H</option>
                    </select>
                  </div>
                )}

                {(activeTab === 'players' || activeTab === 'directors' || activeTab === 'matches') && (
                  <div>
                    <label className="block text-sm text-slate-300 mb-2">Equipo</label>
                    <select
                      value={filters.equipo}
                      onChange={(e) => setFilters({ ...filters, equipo: e.target.value })}
                      className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">Todos</option>
                      {teams.map(team => (
                        <option key={team.id} value={team.id}>{team.nombre}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <button
                onClick={handleDownloadPDF}
                disabled={downloading}
                className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-4 py-2 rounded-lg hover:from-emerald-600 hover:to-cyan-600 transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {downloading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generando Reporte...
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    Descargar Reporte PDF
                  </>
                )}
              </button>
            </div>
          )}

          {activeTab === 'players' && (
            <div>
              <h3 className="text-white mb-4">Jugadores ({getFilteredPlayers().length})</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-3 px-4 text-slate-400">Nombre</th>
                      <th className="text-left py-3 px-4 text-slate-400">Posición</th>
                      <th className="text-left py-3 px-4 text-slate-400">Equipo</th>
                      <th className="text-left py-3 px-4 text-slate-400">Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getFilteredPlayers().map((player) => (
                      <tr key={player.id} className="border-b border-slate-700/50">
                        <td className="py-3 px-4 text-white">{player.nombre}</td>
                        <td className="py-3 px-4 text-slate-300">{player.posicion}</td>
                        <td className="py-3 px-4 text-slate-300">{getTeamName(player.idEquipo)}</td>
                        <td className="py-3 px-4 text-emerald-400">${(player.valorMercado / 1000000).toFixed(1)}M</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'directors' && (
            <div>
              <h3 className="text-white mb-4">Directores Técnicos ({getFilteredDirectors().length})</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-3 px-4 text-slate-400">Nombre</th>
                      <th className="text-left py-3 px-4 text-slate-400">Nacionalidad</th>
                      <th className="text-left py-3 px-4 text-slate-400">Equipo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getFilteredDirectors().map((director) => (
                      <tr key={director.id} className="border-b border-slate-700/50">
                        <td className="py-3 px-4 text-white">{director.nombre}</td>
                        <td className="py-3 px-4 text-slate-300">{director.nacionalidad || 'N/A'}</td>
                        <td className="py-3 px-4 text-slate-300">{getTeamName(director.idEquipo)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'matches' && (
            <div>
              <h3 className="text-white mb-4">Partidos ({getFilteredMatches().length})</h3>
              <div className="space-y-3">
                {getFilteredMatches().map((match) => (
                  <div key={match.id} className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/50">
                    <div className="flex items-center justify-between">
                      <span className="text-white">{getTeamName(match.idEquipoLocal)}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-xl text-white">{match.golesLocal}</span>
                        <span className="text-slate-500">-</span>
                        <span className="text-xl text-white">{match.golesVisitante}</span>
                      </div>
                      <span className="text-white">{getTeamName(match.idEquipoVisitante)}</span>
                    </div>
                    <div className="text-sm text-slate-400 mt-2">
                      {match.etapa} • {match.fechaPartido}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'bitacora' && isAdmin && (
            <div>
              <h3 className="text-white mb-4">Bitácora de Conexiones ({bitacora.length})</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-3 px-4 text-slate-400">Usuario</th>
                      <th className="text-left py-3 px-4 text-slate-400">Fecha Ingreso</th>
                      <th className="text-left py-3 px-4 text-slate-400">Fecha Salida</th>
                      <th className="text-left py-3 px-4 text-slate-400">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bitacora.slice().reverse().map((entry) => (
                      <tr key={entry.id} className="border-b border-slate-700/50">
                        <td className="py-3 px-4 text-white">{entry.nombreUsuario}</td>
                        <td className="py-3 px-4 text-slate-300">{formatDateTime(entry.fechaIngreso)}</td>
                        <td className="py-3 px-4 text-slate-300">{formatDateTime(entry.fechaSalida)}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs ${
                            entry.fechaSalida
                              ? 'bg-slate-600/50 text-slate-300'
                              : 'bg-emerald-500/20 text-emerald-400'
                          }`}>
                            {entry.fechaSalida ? 'Cerrado' : 'Activo'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
