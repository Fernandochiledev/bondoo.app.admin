import { useState, useEffect } from 'react';
import { Plus, Edit2, X, Loader2, AlertCircle, RefreshCw, ShieldAlert } from 'lucide-react';
import { apiService } from '../services/api';
import './Views.css';

interface User {
  userId: string;
  email: string;
  name: string;
  password?: string;
  planProvider?: string;
  planName?: string;
  statusPlan?: string;
  country?: string;
  languaje?: string;
  dueMonthDay?: number;
  price?: number;
  createdAt?: string;
}

export const UsersView = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<Partial<User>>({});
  
  // Estado para el modal de cambio de contraseña (propia)
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({ oldPassword: '', newPassword: '' });
  
  // Estado para el modal de reset de contraseña (admin a usuario)
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetData, setResetData] = useState({ targetUserId: '', newPassword: '', userName: '' });
  
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.get<User[]>('/bondoo/users');
      setUsers(data);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError(err.message || 'Error desconocido al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData(user);
    } else {
      setEditingUser(null);
      setFormData({});
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    setFormData({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await apiService.patch('/bondoo/users', editingUser.userId, formData);
      } else {
        await apiService.post('/bondoo/users', formData);
      }
      fetchUsers();
      handleCloseModal();
    } catch (error) {
      alert('Error guardando usuario');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setPasswordLoading(true);
      await apiService.post('/bondoo/change-password', passwordData);
      alert('Contraseña actualizada correctamente');
      setIsPasswordModalOpen(false);
      setPasswordData({ oldPassword: '', newPassword: '' });
    } catch (error: any) {
      alert(error.message || 'Error al actualizar la contraseña');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setPasswordLoading(true);
      await apiService.post('/bondoo/admin/reset-password', {
        targetUserId: resetData.targetUserId,
        newPassword: resetData.newPassword
      });
      alert(`Contraseña de ${resetData.userName} reseteada correctamente`);
      setIsResetModalOpen(false);
      setResetData({ targetUserId: '', newPassword: '', userName: '' });
    } catch (error: any) {
      alert(error.message || 'Error al resetear la contraseña');
    } finally {
      setPasswordLoading(false);
    }
  };

  const openResetModal = (user: User) => {
    setResetData({
      targetUserId: user.userId,
      userName: user.name,
      newPassword: ''
    });
    setIsResetModalOpen(true);
  };

  if (loading) return <div className="loading-state"><Loader2 className="animate-spin" /> Cargando usuarios...</div>;

  if (error) {
    return (
      <div className="view-container">
        <div className="view-header">
          <h1>Usuarios</h1>
        </div>
        <div className="error-state">
          <AlertCircle size={48} />
          <h3>Error de Conexión</h3>
          <p>{error}</p>
          <button className="btn btn-retry" onClick={fetchUsers}>
            <RefreshCw size={16} /> Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="view-container">
      <div className="view-header">
        <h1>Usuarios</h1>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <Plus size={18} /> Nuevo Usuario
        </button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Plan / Proveedor</th>
              <th>Estado</th>
              <th>País / Idioma</th>
              <th>Día / Precio</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.userId}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>
                  <div className="table-cell-info">
                    <span className="info-main">{user.planName || 'N/A'}</span>
                    <span className="info-sub">{user.planProvider || '-'}</span>
                  </div>
                </td>
                <td>
                  <span className={`badge ${user.statusPlan?.toLowerCase() === 'activo' ? 'badge-success' : 'badge-danger'}`}>
                    {user.statusPlan || 'N/A'}
                  </span>
                </td>
                <td>
                  <div className="table-cell-info">
                    <span className="info-main">{user.country || '-'}</span>
                    <span className="info-sub">{user.languaje || '-'}</span>
                  </div>
                </td>
                <td>
                  <div className="table-cell-info">
                    <span className="info-main">Día: {user.dueMonthDay || '-'}</span>
                    <span className="info-sub">Precio: {user.price || '0'}</span>
                  </div>
                </td>
                <td>
                  <button className="btn-icon btn-edit" title="Resetear Contraseña (Admin)" onClick={() => openResetModal(user)}>
                    <ShieldAlert size={16} />
                  </button>
                  <button className="btn-icon btn-edit" title="Editar Usuario" onClick={() => handleOpenModal(user)}>
                    <Edit2 size={16} />
                  </button>
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
              <h2>{editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}</h2>
              <button className="btn-icon" onClick={handleCloseModal}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Nombre</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={formData.name || ''} 
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input 
                      type="email" 
                      className="form-control" 
                      value={formData.email || ''} 
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      required 
                    />
                  </div>
                  {!editingUser && (
                    <div className="form-group full-width">
                      <label>Contraseña Inicial</label>
                      <input 
                        type="password" 
                        className="form-control" 
                        value={formData.password || ''} 
                        onChange={e => setFormData({...formData, password: e.target.value})}
                        required 
                        placeholder="Asigna una contraseña al nuevo usuario"
                      />
                    </div>
                  )}
                  <div className="form-group">
                    <label>Proveedor del Plan</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={formData.planProvider || ''} 
                      onChange={e => setFormData({...formData, planProvider: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Nombre del Plan</label>
                    <select 
                      className="form-control" 
                      value={formData.planName || ''} 
                      onChange={e => setFormData({...formData, planName: e.target.value})}
                    >
                      <option value="">Seleccionar Plan</option>
                      <option value="Basic">Basic</option>
                      <option value="Premium">Premium</option>
                      <option value="All Inclusive">All Inclusive</option>
                    </select>
                  </div>
                <div className="form-group">
                  <label>Estado del Plan</label>
                  <select 
                    className="form-control" 
                    value={formData.statusPlan || ''} 
                    onChange={e => setFormData({...formData, statusPlan: e.target.value})}
                  >
                    <option value="">Seleccionar Estado</option>
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                  </select>
                </div>
                  <div className="form-group">
                    <label>País</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={formData.country || ''} 
                      onChange={e => setFormData({...formData, country: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Idioma</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={formData.languaje || ''} 
                      onChange={e => setFormData({...formData, languaje: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Día de Vencimiento Mensual</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      value={formData.dueMonthDay ?? ''} 
                      onChange={e => setFormData({...formData, dueMonthDay: e.target.value === '' ? undefined : Number(e.target.value)})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Precio</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      value={formData.price ?? ''} 
                      onChange={e => setFormData({...formData, price: e.target.value === '' ? undefined : Number(e.target.value)})}
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

      {isPasswordModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Cambiar Contraseña</h2>
              <button className="btn-icon" onClick={() => setIsPasswordModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleChangePassword}>
              <div className="modal-body">
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                  Esta acción cambiará la contraseña de tu cuenta de administrador actual.
                </p>
                <div className="form-group">
                  <label>Contraseña Actual</label>
                  <input 
                    type="password" 
                    className="form-control" 
                    value={passwordData.oldPassword} 
                    onChange={e => setPasswordData({...passwordData, oldPassword: e.target.value})}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Nueva Contraseña</label>
                  <input 
                    type="password" 
                    className="form-control" 
                    value={passwordData.newPassword} 
                    onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})}
                    required 
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn" onClick={() => setIsPasswordModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={passwordLoading}>
                  {passwordLoading ? 'Actualizando...' : 'Actualizar Contraseña'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isResetModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Resetear Contraseña de Usuario</h2>
              <button className="btn-icon" onClick={() => setIsResetModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleResetPassword}>
              <div className="modal-body">
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                  Estás reseteando la contraseña de: <strong>{resetData.userName}</strong> (ID: {resetData.targetUserId})
                </p>
                <div className="form-group">
                  <label>Nueva Contraseña para el Usuario</label>
                  <input 
                    type="password" 
                    className="form-control" 
                    value={resetData.newPassword} 
                    onChange={e => setResetData({...resetData, newPassword: e.target.value})}
                    required 
                    placeholder="Escribe la nueva contraseña"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn" onClick={() => setIsResetModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={passwordLoading}>
                  {passwordLoading ? 'Reseteando...' : 'Confirmar Reset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
