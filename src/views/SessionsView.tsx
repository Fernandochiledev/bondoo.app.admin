import React, { useState, useEffect } from 'react';
import { Trash2, Eye, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { apiService } from '../services/api';
import './Views.css';

interface Session {
  sessionId: string;
  userId: string;
  createdAt: string;
  player1?: { name: string, gender: string };
  player2?: { name: string, gender: string };
}

export const SessionsView: React.FC = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.get<Session[]>('/bondoo/sessions');
      setSessions(data);
    } catch (err: any) {
      console.error('Error fetching sessions:', error);
      setError(err.message || 'Error al conectar con la API de sesiones');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de eliminar esta sesión?')) {
      try {
        await apiService.delete('/bondoo/sessions', id);
        fetchSessions();
      } catch (error) {
        alert('Error eliminando sesión');
      }
    }
  };

  if (loading) return <div className="loading-state"><Loader2 className="animate-spin" /> Cargando sesiones...</div>;

  if (error) {
    return (
      <div className="view-container">
        <div className="view-header">
          <h1>Sesiones de Juego</h1>
        </div>
        <div className="error-state">
          <AlertCircle size={48} />
          <h3>Error de Conexión</h3>
          <p>{error}</p>
          <button className="btn btn-retry" onClick={fetchSessions}>
            <RefreshCw size={16} /> Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="view-container">
      <div className="view-header">
        <h1>Sesiones de Juego</h1>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID Sesión</th>
              <th>Usuario</th>
              <th>Jugador 1</th>
              <th>Jugador 2</th>
              <th>Fecha</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((session) => (
              <tr key={session.sessionId}>
                <td>{session.sessionId}</td>
                <td>{session.userId}</td>
                <td>{session.player1?.name || 'N/A'} ({session.player1?.gender || '-'})</td>
                <td>{session.player2?.name || 'N/A'} ({session.player2?.gender || '-'})</td>
                <td>{session.createdAt}</td>
                <td>
                  <button className="btn-icon" title="Ver detalles"><Eye size={16} /></button>
                  <button className="btn-icon btn-delete" onClick={() => handleDelete(session.sessionId)}><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
