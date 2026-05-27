import { useState, useEffect } from 'react';
import { teamsService, playersService, directorsService } from '../../services/mockApi';
import { Shield, Plus, Edit, Trash2, Search, X, Users as UsersIcon, User } from 'lucide-react';

interface TeamsProps {
  userRole: string;
}

export default function Teams({ userRole }: TeamsProps) {
  const [teams, setTeams] = useState<any[]>([]);
  const [filteredTeams, setFilteredTeams] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    pais: '',
    confederacion: '',
    grupo: ''
  });

  const canEdit = userRole === 'Administrador' || userRole === 'Tradicional';

  useEffect(() => {
    loadTeams();
  }, []);

  useEffect(() => {
    const filtered = teams.filter(team =>
      team.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.pais.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredTeams(filtered);
  }, [searchTerm, teams]);

  const loadTeams = () => {
    const data = teamsService.getAll();
    setTeams(data);
    setFilteredTeams(data);
  };

  const handleCreate = () => {
    setFormData({ nombre: '', pais: '', confederacion: '', grupo: '' });
    setSelectedTeam(null);
    setShowModal(true);
  };

  const handleEdit = (team: any) => {
    setFormData({
      nombre: team.nombre,
      pais: team.pais,
      confederacion: team.confederacion || '',
      grupo: team.grupo || ''
    });
    setSelectedTeam(team);
    setShowModal(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('¿Está seguro de eliminar este equipo? Se eliminarán también sus jugadores y DT.')) {
      teamsService.delete(id);
      loadTeams();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nombre || !formData.pais) {
      alert('Nombre y País son obligatorios');
      return;
    }

    if (selectedTeam) {
      teamsService.update(selectedTeam.id, formData);
    } else {
      teamsService.create(formData);
    }

    setShowModal(false);
    loadTeams();
  };

  const handleViewDetail = (team: any) => {
    setSelectedTeam(team);
    setShowDetailModal(true);
  };

  const getTeamPlayers = () => {
    if (!selectedTeam) return [];
    return playersService.getByTeam(selectedTeam.id);
  };

  const getTeamDirector = () => {
    if (!selectedTeam) return null;
    return directorsService.getByTeam(selectedTeam.id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-white mb-2">Equipos</h1>
          <p className="text-slate-400">Gestión de equipos del torneo</p>
        </div>

        {canEdit && (
          <button
            onClick={handleCreate}
            className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-4 py-2 rounded-lg hover:from-emerald-600 hover:to-cyan-600 transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20"
          >
            <Plus className="w-5 h-5" />
            Nuevo Equipo
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
            placeholder="Buscar equipos..."
            className="w-full bg-slate-700/50 border border-slate-600 rounded-lg pl-10 pr-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTeams.map((team) => (
            <div
              key={team.id}
              className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/50 hover:border-emerald-500/50 transition-all group cursor-pointer"
              onClick={() => handleViewDetail(team)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-emerald-500 to-cyan-500 p-2 rounded-lg">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white">{team.nombre}</h3>
                    <p className="text-sm text-slate-400">{team.pais}</p>
                  </div>
                </div>

                {canEdit && (
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleEdit(team); }}
                      className="p-1.5 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(team.id); }}
                      className="p-1.5 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-2 text-sm">
                {team.confederacion && (
                  <p className="text-slate-400">
                    <span className="text-slate-500">Confederación:</span> {team.confederacion}
                  </p>
                )}
                {team.grupo && (
                  <p className="text-slate-400">
                    <span className="text-slate-500">Grupo:</span> {team.grupo}
                  </p>
                )}
                <p className="text-emerald-400">
                  Valor: ${(team.valorTotalEquipo / 1000000).toFixed(1)}M
                </p>
              </div>
            </div>
          ))}
        </div>

        {filteredTeams.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            No se encontraron equipos
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl border border-slate-700 max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl text-white">
                {selectedTeam ? 'Editar Equipo' : 'Nuevo Equipo'}
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
                <label className="block text-sm text-slate-300 mb-2">Nombre *</label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-2">País *</label>
                <input
                  type="text"
                  value={formData.pais}
                  onChange={(e) => setFormData({ ...formData, pais: e.target.value })}
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-2">Confederación</label>
                <select
                  value={formData.confederacion}
                  onChange={(e) => setFormData({ ...formData, confederacion: e.target.value })}
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Seleccione...</option>
                  <option value="UEFA">UEFA</option>
                  <option value="CONMEBOL">CONMEBOL</option>
                  <option value="CONCACAF">CONCACAF</option>
                  <option value="AFC">AFC</option>
                  <option value="CAF">CAF</option>
                  <option value="OFC">OFC</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-2">Grupo</label>
                <select
                  value={formData.grupo}
                  onChange={(e) => setFormData({ ...formData, grupo: e.target.value })}
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
                  {selectedTeam ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDetailModal && selectedTeam && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl border border-slate-700 max-w-2xl w-full p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl text-white">{selectedTeam.nombre}</h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-500 mb-1">País</p>
                  <p className="text-white">{selectedTeam.pais}</p>
                </div>
                <div>
                  <p className="text-slate-500 mb-1">Confederación</p>
                  <p className="text-white">{selectedTeam.confederacion || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-slate-500 mb-1">Grupo</p>
                  <p className="text-white">{selectedTeam.grupo || 'Sin asignar'}</p>
                </div>
                <div>
                  <p className="text-slate-500 mb-1">Valor Total</p>
                  <p className="text-emerald-400">${(selectedTeam.valorTotalEquipo / 1000000).toFixed(1)}M</p>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <User className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-lg text-white">Director Técnico</h3>
                </div>
                {(() => {
                  const director = getTeamDirector();
                  return director ? (
                    <div className="bg-slate-700/30 rounded-lg p-3 border border-slate-600/50">
                      <p className="text-white">{director.nombre}</p>
                      <p className="text-sm text-slate-400">{director.nacionalidad}</p>
                    </div>
                  ) : (
                    <p className="text-slate-400 text-sm">Sin director técnico asignado</p>
                  );
                })()}
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <UsersIcon className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-lg text-white">Jugadores ({getTeamPlayers().length})</h3>
                </div>
                {getTeamPlayers().length > 0 ? (
                  <div className="space-y-2">
                    {getTeamPlayers().map((player: any) => (
                      <div key={player.id} className="bg-slate-700/30 rounded-lg p-3 border border-slate-600/50 flex justify-between items-center">
                        <div>
                          <p className="text-white">{player.nombre}</p>
                          <p className="text-sm text-slate-400">{player.posicion}</p>
                        </div>
                        <p className="text-sm text-emerald-400">${(player.valorMercado / 1000000).toFixed(1)}M</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 text-sm">No hay jugadores registrados</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
