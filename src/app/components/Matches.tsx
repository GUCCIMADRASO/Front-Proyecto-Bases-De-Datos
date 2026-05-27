import { useState, useEffect } from 'react';
import { matchesService, teamsService } from '../../services/mockApi';
import { Trophy, Plus, Edit, Trash2, Search, X, Calendar } from 'lucide-react';

interface MatchesProps {
  userRole: string;
}

export default function Matches({ userRole }: MatchesProps) {
  const [matches, setMatches] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [filteredMatches, setFilteredMatches] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [formData, setFormData] = useState({
    idGrupo: '',
    idEquipoLocal: '',
    idEquipoVisitante: '',
    idEstadio: '',
    golesLocal: '0',
    golesVisitante: '0',
    fechaPartido: '',
    etapa: 'Fase de Grupos'
  });

  const canEdit = userRole === 'Administrador' || userRole === 'Tradicional';

  useEffect(() => {
    loadMatches();
    loadTeams();
  }, []);

  useEffect(() => {
    const filtered = matches.filter(match => {
      const localTeam = getTeamName(match.idEquipoLocal).toLowerCase();
      const visitorTeam = getTeamName(match.idEquipoVisitante).toLowerCase();
      const search = searchTerm.toLowerCase();
      return localTeam.includes(search) || visitorTeam.includes(search) || match.idEstadio?.toLowerCase().includes(search);
    });
    setFilteredMatches(filtered);
  }, [searchTerm, matches, teams]);

  const loadMatches = () => {
    const data = matchesService.getAll();
    setMatches(data);
    setFilteredMatches(data);
  };

  const loadTeams = () => {
    const data = teamsService.getAll();
    setTeams(data);
  };

  const handleCreate = () => {
    setFormData({
      idGrupo: '',
      idEquipoLocal: '',
      idEquipoVisitante: '',
      idEstadio: '',
      golesLocal: '0',
      golesVisitante: '0',
      fechaPartido: '',
      etapa: 'Fase de Grupos'
    });
    setSelectedMatch(null);
    setShowModal(true);
  };

  const handleEdit = (match: any) => {
    setFormData({
      idGrupo: match.idGrupo || '',
      idEquipoLocal: match.idEquipoLocal?.toString() || '',
      idEquipoVisitante: match.idEquipoVisitante?.toString() || '',
      idEstadio: match.idEstadio || '',
      golesLocal: match.golesLocal?.toString() || '0',
      golesVisitante: match.golesVisitante?.toString() || '0',
      fechaPartido: match.fechaPartido || '',
      etapa: match.etapa || 'Fase de Grupos'
    });
    setSelectedMatch(match);
    setShowModal(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('¿Está seguro de eliminar este partido?')) {
      matchesService.delete(id);
      loadMatches();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.idEquipoLocal === formData.idEquipoVisitante) {
      alert('El equipo local y visitante no pueden ser el mismo');
      return;
    }

    if (selectedMatch) {
      matchesService.update(selectedMatch.id, formData);
    } else {
      matchesService.create(formData);
    }

    setShowModal(false);
    loadMatches();
  };

  const getTeamName = (teamId: number) => {
    const team = teams.find(t => t.id === teamId);
    return team ? team.nombre : 'Desconocido';
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Sin fecha';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-white mb-2">Partidos</h1>
          <p className="text-slate-400">Gestión de partidos del torneo</p>
        </div>

        {canEdit && (
          <button
            onClick={handleCreate}
            className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-4 py-2 rounded-lg hover:from-emerald-600 hover:to-cyan-600 transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20"
          >
            <Plus className="w-5 h-5" />
            Nuevo Partido
          </button>
        )}
      </div>

      <div className="bg-slate-800/40 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar partidos..."
            className="w-full bg-slate-700/50 border border-slate-600 rounded-lg pl-10 pr-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>

        <div className="space-y-4">
          {filteredMatches.map((match) => (
            <div
              key={match.id}
              className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/50 hover:border-emerald-500/50 transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Calendar className="w-4 h-4" />
                  {formatDate(match.fechaPartido)}
                  {match.idEstadio && <span>• {match.idEstadio}</span>}
                  {match.etapa && <span>• {match.etapa}</span>}
                  {match.idGrupo && <span>• Grupo {match.idGrupo}</span>}
                </div>

                {canEdit && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(match)}
                      className="p-1.5 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(match.id)}
                      className="p-1.5 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex-1 text-right">
                  <p className="text-white text-lg">{getTeamName(match.idEquipoLocal)}</p>
                </div>

                <div className="mx-8 flex items-center gap-4">
                  <div className="text-center">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl text-white bg-slate-800 px-4 py-2 rounded-lg">
                        {match.golesLocal}
                      </span>
                      <span className="text-slate-500">-</span>
                      <span className="text-2xl text-white bg-slate-800 px-4 py-2 rounded-lg">
                        {match.golesVisitante}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex-1">
                  <p className="text-white text-lg">{getTeamName(match.idEquipoVisitante)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredMatches.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            No se encontraron partidos
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl border border-slate-700 max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl text-white">
                {selectedMatch ? 'Editar Partido' : 'Nuevo Partido'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-300 mb-2">Equipo Local *</label>
                <select
                  value={formData.idEquipoLocal}
                  onChange={(e) => setFormData({ ...formData, idEquipoLocal: e.target.value })}
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                >
                  <option value="">Seleccione equipo local</option>
                  {teams.map(team => (
                    <option key={team.id} value={team.id}>{team.nombre}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-2">Equipo Visitante *</label>
                <select
                  value={formData.idEquipoVisitante}
                  onChange={(e) => setFormData({ ...formData, idEquipoVisitante: e.target.value })}
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                >
                  <option value="">Seleccione equipo visitante</option>
                  {teams.map(team => (
                    <option key={team.id} value={team.id}>{team.nombre}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-300 mb-2">Goles Local</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.golesLocal}
                    onChange={(e) => setFormData({ ...formData, golesLocal: e.target.value })}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-300 mb-2">Goles Visitante</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.golesVisitante}
                    onChange={(e) => setFormData({ ...formData, golesVisitante: e.target.value })}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-2">Fecha del Partido</label>
                <input
                  type="date"
                  value={formData.fechaPartido}
                  onChange={(e) => setFormData({ ...formData, fechaPartido: e.target.value })}
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-2">Estadio</label>
                <input
                  type="text"
                  value={formData.idEstadio}
                  onChange={(e) => setFormData({ ...formData, idEstadio: e.target.value })}
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Nombre del estadio"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-2">Etapa</label>
                <select
                  value={formData.etapa}
                  onChange={(e) => setFormData({ ...formData, etapa: e.target.value })}
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Fase de Grupos">Fase de Grupos</option>
                  <option value="Octavos de Final">Octavos de Final</option>
                  <option value="Cuartos de Final">Cuartos de Final</option>
                  <option value="Semifinal">Semifinal</option>
                  <option value="Tercer Puesto">Tercer Puesto</option>
                  <option value="Final">Final</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-2">Grupo</label>
                <select
                  value={formData.idGrupo}
                  onChange={(e) => setFormData({ ...formData, idGrupo: e.target.value })}
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Sin Grupo</option>
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

              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-slate-700 text-white px-4 py-2 rounded-lg hover:bg-slate-600 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-4 py-2 rounded-lg hover:from-emerald-600 hover:to-cyan-600 transition-all"
                >
                  {selectedMatch ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
