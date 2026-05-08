import { useState, useEffect, useRef } from 'react';
import { Plus, Edit2, Trash2, X, Loader2, AlertCircle, RefreshCw, Download, Upload } from 'lucide-react';
import * as XLSX from 'xlsx';
import { apiService } from '../services/api';
import './Views.css';

interface BondooObject {
  objectId: string;
  imagen?: string;
  enObject: string;
  esObject: string;
  prObject: string;
  frObject: string;
  enDescription?: string;
  esDescription?: string;
  frDescription?: string;
  prDescription?: string;
}

export const ObjectsView = () => {
  const [objects, setObjects] = useState<BondooObject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingObject, setEditingObject] = useState<BondooObject | null>(null);
  const [formData, setFormData] = useState<Partial<BondooObject>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchObjects();
  }, []);

  const downloadTemplate = () => {
    const template = [
      {
        imagen: 'icono-ejemplo',
        esObject: 'Pelota',
        enObject: 'Ball',
        prObject: 'Bola',
        frObject: 'Balle',
        esDescription: 'Descripción en español',
        enDescription: 'English description',
        frDescription: 'Description en français',
        prDescription: 'Descrição em português'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Plantilla');
    XLSX.writeFile(wb, 'plantilla_objetos.xlsx');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        if (window.confirm(`¿Estás seguro de subir ${data.length} objetos?`)) {
          setLoading(true);
          for (const item of data) {
            await apiService.post('/bondoo/object', item);
          }
          alert('Carga masiva completada con éxito');
          fetchObjects();
        }
      } catch (err) {
        alert('Error al procesar el archivo Excel');
        console.error(err);
      } finally {
        setLoading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsBinaryString(file);
  };

  const fetchObjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.get<BondooObject[]>('/bondoo/object');
      setObjects(data);
    } catch (err: any) {
      console.error('Error fetching objects:', err);
      setError(err.message || 'Error al conectar con la API de objetos');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (obj?: BondooObject) => {
    if (obj) {
      setEditingObject(obj);
      setFormData(obj);
    } else {
      setEditingObject(null);
      setFormData({});
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingObject(null);
    setFormData({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingObject) {
        await apiService.patch('/bondoo/object', editingObject.objectId, formData);
      } else {
        await apiService.post('/bondoo/object', formData);
      }
      fetchObjects();
      handleCloseModal();
    } catch (error) {
      alert('Error guardando objeto');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de eliminar este objeto?')) {
      try {
        await apiService.delete('/bondoo/object', id);
        fetchObjects();
      } catch (error) {
        alert('Error eliminando objeto');
      }
    }
  };

  if (loading) return <div className="loading-state"><Loader2 className="animate-spin" /> Cargando objetos...</div>;

  if (error) {
    return (
      <div className="view-container">
        <div className="view-header">
          <h1>Objetos</h1>
        </div>
        <div className="error-state">
          <AlertCircle size={48} />
          <h3>Error de Conexión</h3>
          <p>{error}</p>
          <button className="btn btn-retry" onClick={fetchObjects}>
            <RefreshCw size={16} /> Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="view-container">
      <div className="view-header">
        <h1>Objetos</h1>
        <div className="view-actions">
          <button className="btn btn-secondary" onClick={downloadTemplate}>
            <Download size={18} /> Plantilla
          </button>
          <button className="btn btn-secondary" onClick={() => fileInputRef.current?.click()}>
            <Upload size={18} /> Carga Masiva
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            style={{ display: 'none' }} 
            accept=".xlsx, .xls" 
            onChange={handleFileUpload} 
          />
          <button className="btn btn-primary" onClick={() => handleOpenModal()}>
            <Plus size={18} /> Nuevo Objeto
          </button>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Imagen</th>
              <th>Español</th>
              <th>Inglés</th>
              <th>Portugués</th>
              <th>Francés</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {objects.map((obj) => (
              <tr key={obj.objectId}>
                <td>
                  {obj.imagen ? (
                    <span className="text-badge">{obj.imagen}</span>
                  ) : (
                    <span className="text-secondary">-</span>
                  )}
                </td>
                <td>{obj.esObject}</td>
                <td>{obj.enObject}</td>
                <td>{obj.prObject}</td>
                <td>{obj.frObject}</td>
                <td>
                  <button className="btn-icon btn-edit" onClick={() => handleOpenModal(obj)}><Edit2 size={16} /></button>
                  <button className="btn-icon btn-delete" onClick={() => handleDelete(obj.objectId)}><Trash2 size={16} /></button>
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
              <h2>{editingObject ? 'Editar Objeto' : 'Nuevo Objeto'}</h2>
              <button className="btn-icon" onClick={handleCloseModal}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>URL de Imagen</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={formData.imagen || ''} 
                    onChange={e => setFormData({...formData, imagen: e.target.value})}
                    placeholder="https://ejemplo.com/imagen.png"
                  />
                </div>
                <div className="form-group">
                  <label>Nombre (ES)</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={formData.esObject || ''} 
                    onChange={e => setFormData({...formData, esObject: e.target.value})}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Nombre (EN)</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={formData.enObject || ''} 
                    onChange={e => setFormData({...formData, enObject: e.target.value})}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Nombre (PR)</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={formData.prObject || ''} 
                    onChange={e => setFormData({...formData, prObject: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Nombre (FR)</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={formData.frObject || ''} 
                    onChange={e => setFormData({...formData, frObject: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Descripción (ES)</label>
                  <textarea 
                    className="form-control" 
                    value={formData.esDescription || ''} 
                    onChange={e => setFormData({...formData, esDescription: e.target.value})}
                    rows={2}
                  />
                </div>
                <div className="form-group">
                  <label>Descripción (EN)</label>
                  <textarea 
                    className="form-control" 
                    value={formData.enDescription || ''} 
                    onChange={e => setFormData({...formData, enDescription: e.target.value})}
                    rows={2}
                  />
                </div>
                <div className="form-group">
                  <label>Descripción (PR)</label>
                  <textarea 
                    className="form-control" 
                    value={formData.prDescription || ''} 
                    onChange={e => setFormData({...formData, prDescription: e.target.value})}
                    rows={2}
                  />
                </div>
                <div className="form-group">
                  <label>Descripción (FR)</label>
                  <textarea 
                    className="form-control" 
                    value={formData.frDescription || ''} 
                    onChange={e => setFormData({...formData, frDescription: e.target.value})}
                    rows={2}
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
