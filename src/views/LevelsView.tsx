import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { apiService } from '../services/api';
import './Views.css';

interface Level {
  nivelId: string;
  orden: number;
  enName: string;
  esName: string;
  prName: string;
  frName: string;
}

export const LevelsView: React.FC = () => {
  const [levels, setLevels] = useState<Level[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLevel, setEditingLevel] = useState<Level | null>(null);
  const [formData, setFormData] = useState<Partial<Level>>({});

  useEffect(() => {
    fetchLevels();
  }, []);

  const fetchLevels = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.get<Level[]>('/bondoo/levels');
      setLevels(data.sort((a, b) => (a.orden || 0) - (b.orden || 0)));
    } catch (err: any) {
      console.error('Error fetching levels:', err);
      setError(err.message || 'Error al conectar con la API de niveles');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (level?: Level) => {
    if (level) {
      setEditingLevel(level);
      setFormData(level);
    } else {
      setEditingLevel(null);
      setFormData({});
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingLevel(null);
    setFormData({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingLevel) {
        await apiService.patch('/bondoo/levels', editingLevel.nivelId, formData);
      } else {
        await apiService.post('/bondoo/levels', formData);
      }
      fetchLevels();
      handleCloseModal();
    } catch (error) {
      alert('Error guardando nivel');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de eliminar este nivel?')) {
      try {
        await apiService.delete('/bondoo/levels', id);
        fetchLevels();
      } catch (error) {
        alert('Error eliminando nivel');
      }
    }
  };

  if (loading) return <div className="loading-state"><Loader2 className="animate-spin" /> Cargando niveles...</div>;

  if (error) {
    return (
      <div className="view-container">
        <div className="view-header">
          <h1>Niveles</h1>
        </div>
        <div className="error-state">
          <AlertCircle size={48} />
          <h3>Error de Conexión</h3>
          <p>{error}</p>
          <button className="btn btn-retry" onClick={fetchLevels}>
            <RefreshCw size={16} /> Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="view-container">
      <div className="view-header">
        <h1>Niveles</h1>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <Plus size={18} /> Nuevo Nivel
        </button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Orden</th>
              <th>Español</th>
              <th>Inglés</th>
              <th>Portugués</th>
              <th>Francés</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {levels.map((level) => (
              <tr key={level.nivelId}>
                <td>{level.orden}</td>
                <td>{level.esName}</td>
                <td>{level.enName}</td>
                <td>{level.prName}</td>
                <td>{level.frName}</td>
                <td>
                  <button className="btn-icon btn-edit" onClick={() => handleOpenModal(level)}><Edit2 size={16} /></button>
                  <button className="btn-icon btn-delete" onClick={() => handleDelete(level.nivelId)}><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingLevel ? 'Editar Nivel' : 'Nuevo Nivel'}</h2>
              <button className="btn-icon" onClick={handleCloseModal}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Orden</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    value={formData.orden || ''} 
                    onChange={e => setFormData({...formData, orden: Number(e.target.value)})}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Nombre (ES)</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={formData.esName || ''} 
                    onChange={e => setFormData({...formData, esName: e.target.value})}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Nombre (EN)</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={formData.enName || ''} 
                    onChange={e => setFormData({...formData, enName: e.target.value})}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Nombre (PR)</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={formData.prName || ''} 
                    onChange={e => setFormData({...formData, prName: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Nombre (FR)</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={formData.frName || ''} 
                    onChange={e => setFormData({...formData, frName: e.target.value})}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn" onClick={handleCloseModal}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
