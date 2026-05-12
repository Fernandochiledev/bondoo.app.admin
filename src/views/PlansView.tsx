import { useState, useEffect, useRef } from 'react';
import { Plus, Edit2, Trash2, X, Loader2, AlertCircle, RefreshCw, Download, Upload } from 'lucide-react';
import * as XLSX from 'xlsx';
import { apiService } from '../services/api';
import './Views.css';

interface CountryPlan {
  countryId: string;
  countryName: string;
  currency: string;
  basicPlanCost: number;
  premiumPlanCost: number;
  allInclusivePlanCost: number;
  countryFlag?: string;
  countryProvider?: string;
  enDescription?: string;
  esDescription?: string;
  frDescription?: string;
  prDescription?: string;
}

export const PlansView = () => {
  const [plans, setPlans] = useState<CountryPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<CountryPlan | null>(null);
  const [formData, setFormData] = useState<Partial<CountryPlan>>({});
  const [editingCell, setEditingCell] = useState<{ id: string, field: keyof CountryPlan } | null>(null);
  const [editValue, setEditValue] = useState<string | number>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const downloadTemplate = () => {
    const template = [
      {
        countryName: 'Ejemplo País',
        countryFlag: '🇲🇽',
        countryProvider: 'Stripe',
        currency: 'MXN',
        basicPlanCost: 0,
        premiumPlanCost: 99,
        allInclusivePlanCost: 199,
        esDescription: 'Descripción en español',
        enDescription: 'English description',
        frDescription: 'Description en français',
        prDescription: 'Descrição em português'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Plantilla');
    XLSX.writeFile(wb, 'plantilla_planes.xlsx');
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

        if (window.confirm(`¿Estás seguro de subir ${data.length} registros?`)) {
          setLoading(true);
          for (const item of data) {
            await apiService.post('/bondoo/countries', item);
          }
          alert('Carga masiva completada con éxito');
          fetchPlans();
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

  const fetchPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.get<CountryPlan[]>('/bondoo/countries');
      setPlans(data);
    } catch (err: any) {
      console.error('Error fetching plans:', err);
      setError(err.message || 'Error al conectar con la API de planes');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (plan?: CountryPlan) => {
    if (plan) {
      setEditingPlan(plan);
      setFormData(plan);
    } else {
      setEditingPlan(null);
      setFormData({});
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPlan(null);
    setFormData({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPlan) {
        await apiService.patch('/bondoo/countries', editingPlan.countryId, formData);
      } else {
        await apiService.post('/bondoo/countries', formData);
      }
      fetchPlans();
      handleCloseModal();
    } catch (error) {
      alert('Error guardando plan');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de eliminar este plan de país?')) {
      try {
        await apiService.delete('/bondoo/countries', id);
        fetchPlans();
      } catch (error) {
        alert('Error eliminando plan');
      }
    }
  };

  const handleCellEdit = (plan: CountryPlan, field: keyof CountryPlan) => {
    setEditingCell({ id: plan.countryId, field });
    setEditValue(plan[field] as string | number);
  };

  const handleCellUpdate = async () => {
    if (!editingCell) return;

    const { id, field } = editingCell;
    const originalPlan = plans.find(p => p.countryId === id);
    if (!originalPlan) return;

    if (originalPlan[field] === editValue) {
      setEditingCell(null);
      return;
    }

    try {
      await apiService.patch('/bondoo/countries', id, { [field]: editValue });
      setPlans(plans.map(p => p.countryId === id ? { ...p, [field]: editValue } : p));
    } catch (error) {
      alert('Error actualizando campo');
    } finally {
      setEditingCell(null);
    }
  };

  if (loading) return <div className="loading-state"><Loader2 className="animate-spin" /> Cargando planes...</div>;

  if (error) {
    return (
      <div className="view-container">
        <div className="view-header">
          <h1>Planes por País</h1>
        </div>
        <div className="error-state">
          <AlertCircle size={48} />
          <h3>Error de Conexión</h3>
          <p>{error}</p>
          <button className="btn btn-retry" onClick={fetchPlans}>
            <RefreshCw size={16} /> Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="view-container">
      <div className="view-header">
        <h1>Planes por País</h1>
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
            <Plus size={18} /> Nuevo Plan
          </button>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>País</th>
              <th>Bandera</th>
              <th>Proveedor</th>
              <th>Moneda</th>
              <th>Básico</th>
              <th>Premium</th>
              <th>All Inclusive</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {plans.map((plan) => {
              const renderCell = (field: keyof CountryPlan, type: 'text' | 'number' = 'text') => {
                const isEditing = editingCell?.id === plan.countryId && editingCell?.field === field;
                
                if (isEditing) {
                  return (
                    <input
                      autoFocus
                      type={type}
                      className="inline-edit-input"
                      value={editValue}
                      onChange={(e) => setEditValue(type === 'number' ? Number(e.target.value) : e.target.value)}
                      onBlur={handleCellUpdate}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleCellUpdate();
                        if (e.key === 'Escape') setEditingCell(null);
                      }}
                    />
                  );
                }

                return (
                  <div 
                    className="editable-cell" 
                    onClick={() => handleCellEdit(plan, field)}
                  >
                    {plan[field] || '-'}
                  </div>
                );
              };

              return (
                <tr key={plan.countryId}>
                  <td>{renderCell('countryName')}</td>
                  <td>{renderCell('countryFlag')}</td>
                  <td>{renderCell('countryProvider')}</td>
                  <td>{renderCell('currency')}</td>
                  <td>{renderCell('basicPlanCost', 'number')}</td>
                  <td>{renderCell('premiumPlanCost', 'number')}</td>
                  <td>{renderCell('allInclusivePlanCost', 'number')}</td>
                  <td>
                    <button className="btn-icon btn-edit" onClick={() => handleOpenModal(plan)}><Edit2 size={16} /></button>
                    <button className="btn-icon btn-delete" onClick={() => handleDelete(plan.countryId)}><Trash2 size={16} /></button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingPlan ? 'Editar Plan' : 'Nuevo Plan'}</h2>
              <button className="btn-icon" onClick={handleCloseModal}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Nombre del País</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={formData.countryName || ''} 
                    onChange={e => setFormData({...formData, countryName: e.target.value})}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Bandera (Emoji o URL)</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={formData.countryFlag || ''} 
                    onChange={e => setFormData({...formData, countryFlag: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Proveedor (Stripe, PayPal, etc.)</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={formData.countryProvider || ''} 
                    onChange={e => setFormData({...formData, countryProvider: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Moneda</label>
                  <input 
                    type="text" 
                    className="input-field form-control" 
                    value={formData.currency || ''} 
                    onChange={e => setFormData({...formData, currency: e.target.value})}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Costo Plan Básico</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    value={formData.basicPlanCost ?? ''} 
                    onChange={e => setFormData({...formData, basicPlanCost: e.target.value === '' ? undefined : Number(e.target.value)})}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Costo Plan Premium</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    value={formData.premiumPlanCost ?? ''} 
                    onChange={e => setFormData({...formData, premiumPlanCost: e.target.value === '' ? undefined : Number(e.target.value)})}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Costo Plan All Inclusive</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    value={formData.allInclusivePlanCost ?? ''} 
                    onChange={e => setFormData({...formData, allInclusivePlanCost: e.target.value === '' ? undefined : Number(e.target.value)})}
                    required 
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
