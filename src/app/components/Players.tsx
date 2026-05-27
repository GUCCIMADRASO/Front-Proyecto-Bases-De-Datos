import { useState, useEffect } from 'react';
import { playersService, teamsService } from '../../services/mockApi';
import { Users, Plus, Edit, Trash2, Search, X, Filter } from 'lucide-react';

interface PlayersProps {
  userRole: string;
}

export default function Players({ userRole }: PlayersProps) {
  const [players, setPlayers] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [filteredPlayers, setFilteredPlayers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    equipo: '',
    posicion: '',
    valorMin: '',
    valorMax: '',
    edadMin: '',
    edadMax: ''
  });
  const [formData, setFormData] = useState({
    nombre: '',
    posicion: 'Delantero',
    fechaNacimiento: '',
    peso: '',
    estatura: '',
    valorMercado: '',
    idEquipo: ''
  });

  const canEdit = userRole === 'Administrador' || userRole === 'Tradicional';
  const positions = ['Portero', 'Defensa', 'Centrocampista', 'Delantero'];

  useEffect(() => {
    loadPlayers();
    loadTeams();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, filters, players]);

  const loadPlayers = () => {
    const data = playersService.getAll();
    setPlayers(data);
    setFilteredPlayers(data);
  };

  const loadTeams = () => {
    const data = teamsService.getAll();
    setTeams(data);
  };

  const calculateAge = (birthDate: string) => {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const applyFilters = () => {
    let filtered = players.filter(player => {
      const matchesSearch = player.nombre.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesTeam = !filters.equipo || player.idEquipo === parseInt(filters.equipo);
      const matchesPosition = !filters.posicion || player.posicion === filters.posicion;

      const matchesValorMin = !filters.valorMin || player.valorMercado >= parseFloat(filters.valorMin);
      const matchesValorMax = !filters.valorMax || player.valorMercado <= parseFloat(filters.valorMax);

      let matchesEdad = true;
      if (player.fechaNacimiento) {
        const age = calculateAge(player.fechaNacimiento);
        matchesEdad = (!filters.edadMin || age >= parseInt(filters.edadMin)) &&
                      (!filters.edadMax || age <= parseInt(filters.edadMax));
      }

      return matchesSearch && matchesTeam && matchesPosition && matchesValorMin && matchesValorMax && matchesEdad;
    });

    setFilteredPlayers(filtered);
  };

  const handleCreate = () => {
    setFormData({
      nombre: '',
      posicion: 'Delantero',
      fechaNacimiento: '',
      peso: '',
      estatura: '',
      valorMercado: '',
      idEquipo: ''
    });
    setSelectedPlayer(null);
    setShowModal(true);
  };

  const handleEdit = (player: any) => {
    setFormData({
      nombre: player.nombre,
      posicion: player.posicion,
      fechaNacimiento: player.fechaNacimiento || '',
      peso: player.peso?.toString() || '',
      estatura: player.estatura?.toString() || '',
      valorMercado: player.valorMercado?.toString() || '',
      idEquipo: player.idEquipo?.toString() || ''
    });
    setSelectedPlayer(player);
    setShowModal(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('¿Está seguro de eliminar este jugador?')) {
      playersService.delete(id);
      loadPlayers();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (selectedPlayer) {
        playersService.update(selectedPlayer.id, formData);
      } else {
        playersService.create(formData);
      }

      setShowModal(false);
      loadPlayers();
    } catch (error: any) {
      alert(error.message);
    }
  };

  const getTeamName = (teamId: number) => {
    const team = teams.find(t => t.id === teamId);
    return team ? team.nombre : 'Sin equipo';
  };

  const clearFilters = () => {
    setFilters({
      equipo: '',
      posicion: '',
      valorMin: '',
      valorMax: '',
      edadMin: '',
      edadMax: ''
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-white mb-2">Jugadores</h1>
          <p className="text-slate-400">Gestión de jugadores del torneo</p>
        </div>

        {canEdit && (
          <button
            onClick={handleCreate}
            className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-4 py-2 rounded-lg hover:from-emerald-600 hover:to-cyan-600 transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20"
          >
            <Plus className="w-5 h-5" />
            Nuevo Jugador
          </button>
        )}
      </div>

      <div className="bg-slate-800/40 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6">
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar jugadores..."
              className="w-full bg-slate-700/50 border border-slate-600 rounded-lg pl-10 pr-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-3 rounded-lg border transition-all flex items-center gap-2 ${
              showFilters
                ? 'bg-emerald-500 border-emerald-500 text-white'
                : 'bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Filter className="w-5 h-5" />
            Filtros
          </button>
        </div>

        {showFilters && (
          <div className="bg-slate-700/30 rounded-lg p-4 mb-6 border border-slate-600/50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

              <div>
                <label className="block text-sm text-slate-300 mb-2">Posición</label>
                <select
                  value={filters.posicion}
                  onChange={(e) => setFilters({ ...filters, posicion: e.target.value })}
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Todas</option>
                  {positions.map(pos => (
                    <option key={pos} value={pos}>{pos}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-sm text-slate-300 mb-2">Valor Mín (M)</label>
                  <input
                    type="number"
                    value={filters.valorMin}
                    onChange={(e) => setFilters({ ...filters, valorMin: e.target.value })}
                    placeholder="0"
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm text-slate-300 mb-2">Valor Máx (M)</label>
                  <input
                    type="number"
                    value={filters.valorMax}
                    onChange={(e) => setFilters({ ...filters, valorMax: e.target.value })}
                    placeholder="200"
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-sm text-slate-300 mb-2">Edad Mín</label>
                  <input
                    type="number"
                    value={filters.edadMin}
                    onChange={(e) => setFilters({ ...filters, edadMin: e.target.value })}
                    placeholder="18"
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm text-slate-300 mb-2">Edad Máx</label>
                  <input
                    type="number"
                    value={filters.edadMax}
                    onChange={(e) => setFilters({ ...filters, edadMax: e.target.value })}
                    placeholder="40"
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="md:col-span-2 flex items-end">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-500 transition-colors"
                >
                  Limpiar Filtros
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-3 px-4 text-slate-400">Nombre</th>
                <th className="text-left py-3 px-4 text-slate-400">Posición</th>
                <th className="text-left py-3 px-4 text-slate-400">Equipo</th>
                <th className="text-left py-3 px-4 text-slate-400">Edad</th>
                <th className="text-left py-3 px-4 text-slate-400">Valor</th>
                {canEdit && <th className="text-right py-3 px-4 text-slate-400">Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {filteredPlayers.map((player) => (
                <tr key={player.id} className="border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors">
                  <td className="py-3 px-4 text-white">{player.nombre}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs ${
                      player.posicion === 'Portero' ? 'bg-yellow-500/20 text-yellow-300' :
                      player.posicion === 'Defensa' ? 'bg-blue-500/20 text-blue-300' :
                      player.posicion === 'Centrocampista' ? 'bg-green-500/20 text-green-300' :
                      'bg-red-500/20 text-red-300'
                    }`}>
                      {player.posicion}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-300">{getTeamName(player.idEquipo)}</td>
                  <td className="py-3 px-4 text-slate-300">
                    {player.fechaNacimiento ? `${calculateAge(player.fechaNacimiento)} años` : 'N/A'}
                  </td>
                  <td className="py-3 px-4 text-emerald-400">
                    ${(player.valorMercado / 1000000).toFixed(1)}M
                  </td>
                  {canEdit && (
                    <td className="py-3 px-4">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => handleEdit(player)}
                          className="p-1.5 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(player.id)}
                          className="p-1.5 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>

          {filteredPlayers.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              No se encontraron jugadores
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl border border-slate-700 max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl text-white">
                {selectedPlayer ? 'Editar Jugador' : 'Nuevo Jugador'}
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
                <label className="block text-sm text-slate-300 mb-2">Posición *</label>
                <select
                  value={formData.posicion}
                  onChange={(e) => setFormData({ ...formData, posicion: e.target.value })}
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                >
                  {positions.map(pos => (
                    <option key={pos} value={pos}>{pos}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-2">Equipo</label>
                <select
                  value={formData.idEquipo}
                  onChange={(e) => setFormData({ ...formData, idEquipo: e.target.value })}
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Sin equipo</option>
                  {teams.map(team => (
                    <option key={team.id} value={team.id}>{team.nombre}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-2">Fecha de Nacimiento</label>
                <input
                  type="date"
                  value={formData.fechaNacimiento}
                  onChange={(e) => setFormData({ ...formData, fechaNacimiento: e.target.value })}
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-300 mb-2">Peso (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="200"
                    value={formData.peso}
                    onChange={(e) => setFormData({ ...formData, peso: e.target.value })}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-300 mb-2">Estatura (m)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="2.5"
                    value={formData.estatura}
                    onChange={(e) => setFormData({ ...formData, estatura: e.target.value })}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-2">Valor de Mercado ($)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.valorMercado}
                  onChange={(e) => setFormData({ ...formData, valorMercado: e.target.value })}
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
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
                  {selectedPlayer ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
