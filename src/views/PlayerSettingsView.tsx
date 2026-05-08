import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { apiService } from '../services/api';
import './Views.css';

interface PlayerSetting {
  playerSettingId: string;
  icon: string;
  gender: string;
  order: number;
  enName: string;
  esName: string;
  prName: string;
  frName: string;
  enDescription?: string;
  esDescription?: string;
  frDescription?: string;
  prDescription?: string;
}

export const PlayerSettingsView: React.FC = () => {
  const [settings, setSettings] = useState<PlayerSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSetting, setEditingSetting] = useState<PlayerSetting | null>(null);
  const [formData, setFormData] = useState<Partial<PlayerSetting>>({});

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.get<PlayerSetting[]>('/bondoo/player-settings');
      setSettings(data.sort((a, b) => (a.order || 0) - (b.order || 0)));
    } catch (err: any) {
      console.error('Error fetching settings:', err);
      setError(err.message || 'Error al conectar con la API de ajustes de jugador');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (setting?: PlayerSetting) => {
    if (setting) {
      setEditingSetting(setting);
      setFormData(setting);
    } else {
      setEditingSetting(null);
      setFormData({ gender: 'M', order: 0 });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSetting(null);
    setFormData({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSetting) {
        await apiService.patch('/bondoo/player-settings', editingSetting.playerSettingId, formData);
      } else {
        await apiService.post('/bondoo/player-settings', formData);
      }
      fetchSettings();
      handleCloseModal();
    } catch (error) {
      alert('Error guardando ajuste');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de eliminar este ajuste?')) {
      try {
        await apiService.delete('/bondoo/player-settings', id);
        fetchSettings();
      } catch (error) {
        alert('Error eliminando ajuste');
      }
    }
  };

  if (loading) return <div className="loading-state"><Loader2 className="animate-spin" /> Cargando ajustes...</div>;

  if (error) {
    return (
      <div className="view-container">
        <div className="view-header">
          <h1>Ajustes de Jugador</h1>
        </div>
        <div className="error-state">
          <AlertCircle size={48} />
          <h3>Error de Conexión</h3>
          <p>{error}</p>
          <button className="btn btn-retry" onClick={fetchSettings}>
            <RefreshCw size={16} /> Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="view-container">
      <div className="view-header">
        <h1>Ajustes de Jugador</h1>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <Plus size={18} /> Nuevo Ajuste
        </button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Orden</th>
              <th>Icono</th>
              <th>Género</th>
              <th>Español</th>
              <th>Inglés</th>
              <th>Portugués</th>
              <th>Francés</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {settings.map((setting) => (
              <tr key={setting.playerSettingId}>
                <td>{setting.order}</td>
                <td><span className="text-badge">{setting.icon}</span></td>
                <td>
                  <span className={`badge ${setting.gender === 'M' ? 'badge-success' : 'badge-warning'}`}>
                    {setting.gender}
                  </span>
                </td>
                <td>{setting.esName}</td>
                <td>{setting.enName}</td>
                <td>{setting.prName}</td>
                <td>{setting.frName}</td>
                <td>
                  <button className="btn-icon btn-edit" onClick={() => handleOpenModal(setting)}><Edit2 size={16} /></button>
                  <button className="btn-icon btn-delete" onClick={() => handleDelete(setting.playerSettingId)}><Trash2 size={16} /></button>
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
              <h2>{editingSetting ? 'Editar Ajuste' : 'Nuevo Ajuste'}</h2>
              <button className="btn-icon" onClick={handleCloseModal}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Orden</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      value={formData.order ?? ''} 
                      onChange={e => setFormData({...formData, order: Number(e.target.value)})}
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label>Icono</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={formData.icon || ''} 
                      onChange={e => setFormData({...formData, icon: e.target.value})}
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label>Género</label>
                    <select 
                      className="form-control" 
                      value={formData.gender || ''} 
                      onChange={e => setFormData({...formData, gender: e.target.value})}
                      required
                    >
                      <option value="M">M</option>
                      <option value="F">F</option>
                    </select>
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
                  <div className="form-group full-width">
                    <label>Descripción (ES)</label>
                    <textarea 
                      className="form-control" 
                      value={formData.esDescription || ''} 
                      onChange={e => setFormData({...formData, esDescription: e.target.value})}
                      rows={2}
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>Descripción (EN)</label>
                    <textarea 
                      className="form-control" 
                      value={formData.enDescription || ''} 
                      onChange={e => setFormData({...formData, enDescription: e.target.value})}
                      rows={2}
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>Descripción (PR)</label>
                    <textarea 
                      className="form-control" 
                      value={formData.prDescription || ''} 
                      onChange={e => setFormData({...formData, prDescription: e.target.value})}
                      rows={2}
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>Descripción (FR)</label>
                    <textarea 
                      className="form-control" 
                      value={formData.frDescription || ''} 
                      onChange={e => setFormData({...formData, frDescription: e.target.value})}
                      rows={2}
                    />
                  </div>
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
