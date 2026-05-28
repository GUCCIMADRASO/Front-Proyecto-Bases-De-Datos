const STORAGE_KEYS = {
  currentUser: 'torneo_current_user'
};

export const BASE_URL = 'http://localhost:8080/api';

// Cache local en memoria sincronizado con el backend
let cachedTeams: any[] = [];
let cachedPlayers: any[] = [];
let cachedDirectors: any[] = [];
let cachedMatches: any[] = [];
let cachedBitacora: any[] = [];

// Función para resincronizar toda la memoria local desde el servidor SQL Server
export const syncWithBackend = async () => {
  try {
    const [tRes, pRes, dRes, mRes, bRes] = await Promise.all([
      fetch(`${BASE_URL}/teams`).catch(() => null),
      fetch(`${BASE_URL}/players`).catch(() => null),
      fetch(`${BASE_URL}/directors`).catch(() => null),
      fetch(`${BASE_URL}/matches`).catch(() => null),
      fetch(`${BASE_URL}/bitacora`).catch(() => null)
    ]);

    if (tRes && tRes.ok) cachedTeams = await tRes.json();
    if (pRes && pRes.ok) cachedPlayers = await pRes.json();
    if (dRes && dRes.ok) cachedDirectors = await dRes.json();
    if (mRes && mRes.ok) cachedMatches = await mRes.json();
    if (bRes && bRes.ok) cachedBitacora = await bRes.json();
    
    console.log("[Cache] Sincronización con base de datos real exitosa.");
  } catch (e) {
    console.error("[Cache] Error al sincronizar con backend:", e);
  }
};

// Iniciar primera sincronización en segundo plano al importar
syncWithBackend();

export const authService = {
  login: async (username: string, password: string) => {
    try {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem(STORAGE_KEYS.currentUser, JSON.stringify(data.user));
        // Sincronizar cache al loguearse para tener datos frescos
        syncWithBackend();
        return { success: true, user: data.user };
      }
      return { success: false, message: data.message || 'Credenciales inválidas' };
    } catch (e) {
      console.error(e);
      return { success: false, message: 'No se pudo conectar con el servidor backend' };
    }
  },

  register: async (userData: any) => {
    try {
      const res = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: userData.username,
          password: userData.password,
          role: userData.role
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message || 'Error al registrar usuario' };
    } catch (e) {
      return { success: false, message: 'No se pudo conectar con el servidor backend' };
    }
  },

  logout: () => {
    fetch(`${BASE_URL}/auth/logout`, { method: 'POST' }).catch(() => {});
    localStorage.removeItem(STORAGE_KEYS.currentUser);
  },

  getCurrentUser: () => {
    const user = localStorage.getItem(STORAGE_KEYS.currentUser);
    return user ? JSON.parse(user) : null;
  }
};

export const teamsService = {
  getAll: () => {
    return cachedTeams;
  },

  getById: (id: number) => {
    return cachedTeams.find((t: any) => t.id === parseInt(id.toString()));
  },

  create: (team: any) => {
    const tempId = Date.now();
    const newTeam = {
      id: tempId,
      ...team,
      valorTotalEquipo: 0
    };
    cachedTeams.push(newTeam);

    fetch(`${BASE_URL}/teams`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(team)
    })
      .then(res => res.json())
      .then(() => syncWithBackend())
      .catch(e => console.error("Error al registrar equipo en backend:", e));

    return newTeam;
  },

  update: (id: number, team: any) => {
    const index = cachedTeams.findIndex((t: any) => t.id === parseInt(id.toString()));
    if (index !== -1) {
      cachedTeams[index] = { ...cachedTeams[index], ...team };
    }

    fetch(`${BASE_URL}/teams/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(team)
    })
      .then(() => syncWithBackend())
      .catch(e => console.error("Error al actualizar equipo en backend:", e));

    return cachedTeams[index];
  },

  delete: (id: number) => {
    cachedTeams = cachedTeams.filter((t: any) => t.id !== parseInt(id.toString()));

    fetch(`${BASE_URL}/teams/${id}`, {
      method: 'DELETE'
    })
      .then(() => syncWithBackend())
      .catch(e => console.error("Error al eliminar equipo en backend:", e));
  }
};

export const playersService = {
  getAll: () => {
    return cachedPlayers;
  },

  getById: (id: number) => {
    return cachedPlayers.find((p: any) => p.id === parseInt(id.toString()));
  },

  getByTeam: (teamId: number) => {
    return cachedPlayers.filter((p: any) => p.idEquipo === parseInt(teamId.toString()));
  },

  create: (player: any) => {
    const tempId = Date.now();
    const newPlayer = {
      id: tempId,
      ...player,
      peso: parseFloat(player.peso),
      estatura: parseFloat(player.estatura),
      valorMercado: parseFloat(player.valorMercado),
      idEquipo: parseInt(player.idEquipo.toString())
    };
    cachedPlayers.push(newPlayer);

    fetch(`${BASE_URL}/players`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(player)
    })
      .then(res => {
        if (!res.ok) {
          throw new Error('Error al registrar jugador en el servidor');
        }
        return res.json();
      })
      .then(() => syncWithBackend())
      .catch(e => console.error("Error al guardar jugador en backend:", e));

    return newPlayer;
  },

  update: (id: number, player: any) => {
    const index = cachedPlayers.findIndex((p: any) => p.id === parseInt(id.toString()));
    if (index !== -1) {
      cachedPlayers[index] = {
        ...cachedPlayers[index],
        ...player,
        peso: parseFloat(player.peso),
        estatura: parseFloat(player.estatura),
        valorMercado: parseFloat(player.valorMercado),
        idEquipo: parseInt(player.idEquipo.toString())
      };
    }

    fetch(`${BASE_URL}/players/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(player)
    })
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(() => syncWithBackend())
      .catch(e => console.error("Error al actualizar jugador en backend:", e));

    return cachedPlayers[index];
  },

  delete: (id: number) => {
    cachedPlayers = cachedPlayers.filter((p: any) => p.id !== parseInt(id.toString()));

    fetch(`${BASE_URL}/players/${id}`, {
      method: 'DELETE'
    })
      .then(() => syncWithBackend())
      .catch(e => console.error("Error al eliminar jugador en backend:", e));
  }
};

export const directorsService = {
  getAll: () => {
    return cachedDirectors;
  },

  getById: (id: number) => {
    return cachedDirectors.find((d: any) => d.id === parseInt(id.toString()));
  },

  getByTeam: (teamId: number) => {
    return cachedDirectors.find((d: any) => d.idEquipo === parseInt(teamId.toString())) || null;
  },

  create: (director: any) => {
    const tempId = Date.now();
    const newDirector = {
      id: tempId,
      ...director,
      idEquipo: director.idEquipo ? parseInt(director.idEquipo.toString()) : null
    };
    cachedDirectors.push(newDirector);

    fetch(`${BASE_URL}/directors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(director)
    })
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(() => syncWithBackend())
      .catch(e => console.error("Error al crear DT en backend:", e));

    return newDirector;
  },

  update: (id: number, director: any) => {
    const index = cachedDirectors.findIndex((d: any) => d.id === parseInt(id.toString()));
    if (index !== -1) {
      cachedDirectors[index] = {
        ...cachedDirectors[index],
        ...director,
        idEquipo: director.idEquipo ? parseInt(director.idEquipo.toString()) : null
      };
    }

    fetch(`${BASE_URL}/directors/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(director)
    })
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(() => syncWithBackend())
      .catch(e => console.error("Error al actualizar DT en backend:", e));

    return cachedDirectors[index];
  },

  delete: (id: number) => {
    cachedDirectors = cachedDirectors.filter((d: any) => d.id !== parseInt(id.toString()));

    fetch(`${BASE_URL}/directors/${id}`, {
      method: 'DELETE'
    })
      .then(() => syncWithBackend())
      .catch(e => console.error("Error al eliminar DT en backend:", e));
  }
};

export const matchesService = {
  getAll: () => {
    return cachedMatches;
  },

  getById: (id: number) => {
    return cachedMatches.find((m: any) => m.id === parseInt(id.toString()));
  },

  create: (match: any) => {
    const tempId = Date.now();
    const newMatch = {
      id: tempId,
      ...match,
      golesLocal: parseInt(match.golesLocal) || 0,
      golesVisitante: parseInt(match.golesVisitante) || 0,
      idEquipoLocal: parseInt(match.idEquipoLocal),
      idEquipoVisitante: parseInt(match.idEquipoVisitante)
    };
    cachedMatches.push(newMatch);

    fetch(`${BASE_URL}/matches`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(match)
    })
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(() => syncWithBackend())
      .catch(e => console.error("Error al registrar partido en backend:", e));

    return newMatch;
  },

  update: (id: number, match: any) => {
    const index = cachedMatches.findIndex((m: any) => m.id === parseInt(id.toString()));
    if (index !== -1) {
      cachedMatches[index] = {
        ...cachedMatches[index],
        ...match,
        golesLocal: parseInt(match.golesLocal) || 0,
        golesVisitante: parseInt(match.golesVisitante) || 0
      };
    }

    fetch(`${BASE_URL}/matches/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(match)
    })
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(() => syncWithBackend())
      .catch(e => console.error("Error al actualizar partido en backend:", e));

    return cachedMatches[index];
  },

  delete: (id: number) => {
    cachedMatches = cachedMatches.filter((m: any) => m.id !== parseInt(id.toString()));

    fetch(`${BASE_URL}/matches/${id}`, {
      method: 'DELETE'
    })
      .then(() => syncWithBackend())
      .catch(e => console.error("Error al eliminar partido en backend:", e));
  }
};

export const bitacoraService = {
  getAll: () => {
    return cachedBitacora;
  }
};
