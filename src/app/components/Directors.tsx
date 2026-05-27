import { useState, useEffect } from 'react';
import { directorsService, teamsService } from '../../services/mockApi';
import { UserCircle, Plus, Edit, Trash2, Search, X } from 'lucide-react';

interface DirectorsProps {
  userRole: string;
}

export default function Directors({ userRole }: DirectorsProps) {
  const [directors, setDirectors] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [filteredDirectors, setFilteredDirectors] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedDirector, setSelectedDirector] = useState<any>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    nacionalidad: '',
    fechaNacimiento: '',
    idEquipo: ''
  });

  const canEdit = userRole === 'Administrador' || userRole === 'Tradicional';

  useEffect(() => {
    loadDirectors();
    loadTeams();
  }, []);

  useEffect(() => {
    const filtered = directors.filter(director =>
      director.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (director.nacionalidad && director.nacionalidad.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredDirectors(filtered);
  }, [searchTerm, directors]);

  const loadDirectors = () => {
    const data = directorsService.getAll();
    setDirectors(data);
    setFilteredDirectors(data);
  };

  const loadTeams = () => {
    const data = teamsService.getAll();
    setTeams(data);
  };

  const handleCreate = () => {
    setFormData({ nombre: '', nacionalidad: '', fechaNacimiento: '', idEquipo: '' });
    setSelectedDirector(null);
    setShowModal(true);
  };

  const handleEdit = (director: any) => {
    setFormData({
      nombre: director.nombre,
      nacionalidad: director.nacionalidad || '',
      fechaNacimiento: director.fechaNacimiento || '',
      idEquipo: director.idEquipo?.toString() || ''
    });
    setSelectedDirector(director);
    setShowModal(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('¿Está seguro de eliminar este Director Técnico?')) {
      directorsService.delete(id);
      loadDirectors();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (selectedDirector) {
        directorsService.update(selectedDirector.id, formData);
      } else {
        directorsService.create(formData);
      }

      setShowModal(false);
      loadDirectors();
    } catch (error: any) {
      alert(error.message);
    }
  };

  const getTeamName = (teamId: number | null) => {
    if (!teamId) return 'Sin equipo';
    const team = teams.find(t => t.id === teamId);
    return team ? team.nombre : 'Sin equipo';
  };

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return null;
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-white mb-2">Directores Técnicos</h1>
          <p className="text-slate-400">Gestión de directores técnicos del torneo</p>
        </div>

        {canEdit && (
          <button
            onClick={handleCreate}
            className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-4 py-2 rounded-lg hover:from-emerald-600 hover:to-cyan-600 transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20"
          >
            <Plus className="w-5 h-5" />
            Nuevo Director Técnico
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
            placeholder="Buscar directores técnicos..."
            className="w-full bg-slate-700/50 border border-slate-600 rounded-lg pl-10 pr-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDirectors.map((director) => (
            <div
              key={director.id}
              className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/50 hover:border-cyan-500/50 transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-cyan-500 to-blue-500 p-2 rounded-lg">
                    <UserCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white">{director.nombre}</h3>
                    {director.nacionalidad && (
                      <p className="text-sm text-slate-400">{director.nacionalidad}</p>
                    )}
                  </div>
                </div>

                {canEdit && (
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEdit(director)}
                      className="p-1.5 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(director.id)}
                      className="p-1.5 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-2 text-sm">
                <p className="text-slate-400">
                  <span className="text-slate-500">Equipo:</span> {getTeamName(director.idEquipo)}
                </p>
                {director.fechaNacimiento && (
                  <p className="text-slate-400">
                    <span className="text-slate-500">Edad:</span> {calculateAge(director.fechaNacimiento)} años
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredDirectors.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            No se encontraron directores técnicos
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl border border-slate-700 max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl text-white">
                {selectedDirector ? 'Editar Director Técnico' : 'Nuevo Director Técnico'}
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
                <label className="block text-sm text-slate-300 mb-2">Nacionalidad</label>
                <input
                  type="text"
                  value={formData.nacionalidad}
                  onChange={(e) => setFormData({ ...formData, nacionalidad: e.target.value })}
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
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
                <p className="text-xs text-slate-400 mt-1">
                  * Un equipo solo puede tener un Director Técnico
                </p>
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
                  {selectedDirector ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
