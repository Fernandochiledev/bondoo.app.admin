import { useState, useEffect, useRef } from 'react';
import { Plus, Edit2, X, Loader2, AlertCircle, RefreshCw, Download, Upload, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import * as XLSX from 'xlsx';
import { apiService } from '../services/api';
import './Views.css';

interface Challenge {
  challengeId: string;
  levelId: string;
  packId: string;
  herPracticeId: string;
  himPracticeId: string;
  objectId: string;
  isQuestion: boolean;
  duration: number;
  enText: string;
  esText: string;
  prText: string;
  frText: string;
  genero?: string;
  level?: {
    nivelId: string;
    esName?: string;
    name?: string;
  };
  pack?: {
    packId: string;
    esName?: string;
  };
  herPractice?: {
    playerSettingId: string;
    esName?: string;
  };
  himPractice?: {
    playerSettingId: string;
    esName?: string;
  };
  object?: {
    objectId: string;
    esObject?: string;
    imagen?: string;
  };
}

export const ChallengesView = () => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [filteredChallenges, setFilteredChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filtros por columna
  const [columnFilters, setColumnFilters] = useState({
    esText: '',
    isQuestion: 'all',
    level: '',
    pack: '',
    genero: '',
    practice: '',
    object: '',
    duration: ''
  });
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState<Challenge | null>(null);
  const [formData, setFormData] = useState<Partial<Challenge>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchChallenges();
  }, []);

  useEffect(() => {
    const filtered = challenges.filter(c => {
      const search = searchTerm.toLowerCase();
      
      // Filtro global
      const matchesGlobal = (
        (c.esText || '').toLowerCase().includes(search) ||
        (c.enText || '').toLowerCase().includes(search) ||
        (c.levelId || '').toLowerCase().includes(search) ||
        (c.objectId || '').toLowerCase().includes(search) ||
        (c.level?.esName || '').toLowerCase().includes(search) ||
        (c.level?.name || '').toLowerCase().includes(search) ||
        (c.object?.esObject || '').toLowerCase().includes(search)
      );

      // Filtros por columna
      const matchesText = (c.esText || '').toLowerCase().includes(columnFilters.esText.toLowerCase());
      const matchesIsQuestion = columnFilters.isQuestion === 'all' || 
        (columnFilters.isQuestion === 'yes' && c.isQuestion) || 
        (columnFilters.isQuestion === 'no' && !c.isQuestion);
      const matchesLevel = (c.level?.esName || c.level?.name || c.levelId || '').toLowerCase().includes(columnFilters.level.toLowerCase());
      const matchesPack = (c.pack?.esName || c.packId || '').toLowerCase().includes(columnFilters.pack.toLowerCase());
      const matchesPractice = (c.herPractice?.esName || c.herPracticeId || '').toLowerCase().includes(columnFilters.practice.toLowerCase()) || 
                             (c.himPractice?.esName || c.himPracticeId || '').toLowerCase().includes(columnFilters.practice.toLowerCase());
      const matchesObject = (c.object?.esObject || c.objectId || '').toLowerCase().includes(columnFilters.object.toLowerCase());
      const matchesDuration = columnFilters.duration === '' || (c.duration || 0).toString().includes(columnFilters.duration);
      const matchesGenero = columnFilters.genero === '' || (c.genero || '').toLowerCase().includes(columnFilters.genero.toLowerCase());

      return matchesGlobal && matchesText && matchesIsQuestion && matchesLevel && matchesPack && matchesPractice && matchesObject && matchesDuration && matchesGenero;
    });
    setFilteredChallenges(filtered);
    setCurrentPage(1);
  }, [searchTerm, challenges, columnFilters]);

  const fetchChallenges = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.get<Challenge[]>('/bondoo/challenges-complete');
      setChallenges(data);
    } catch (err: any) {
      console.error('Error fetching challenges:', err);
      setError(err.message || 'Error al conectar con la API de desafíos');
    } finally {
      setLoading(false);
    }
  };

  // Lógica de paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredChallenges.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredChallenges.length / itemsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const downloadTemplate = () => {
    const template = [
      {
        levelId: 'nivel_1',
        packId: 'pack_1',
        herPracticeId: 'practice_1',
        himPracticeId: 'practice_2',
        objectId: 'objeto_1',
        isQuestion: false,
        duration: 30,
        esText: 'Lanza la pelota',
        enText: 'Throw the ball',
        prText: 'Jogue a bola',
        frText: 'Lancez la balle',
        genero: 'el'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Plantilla');
    XLSX.writeFile(wb, 'plantilla_desafios.xlsx');
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

        if (window.confirm(`¿Estás seguro de subir ${data.length} desafíos?`)) {
          setLoading(true);
          for (const item of data) {
            await apiService.post('/bondoo/challenges', item);
          }
          alert('Carga masiva completada con éxito');
          fetchChallenges();
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

  const handleOpenModal = (challenge?: Challenge) => {
    if (challenge) {
      setEditingChallenge(challenge);
      setFormData(challenge);
    } else {
      setEditingChallenge(null);
      setFormData({ isQuestion: false, duration: 30 });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingChallenge(null);
    setFormData({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingChallenge) {
        await apiService.patch('/bondoo/challenges', editingChallenge.challengeId, formData);
      } else {
        await apiService.post('/bondoo/challenges', formData);
      }
      fetchChallenges();
      handleCloseModal();
    } catch (error) {
      alert('Error guardando desafío');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de eliminar este desafío?')) {
      try {
        await apiService.delete('/bondoo/challenges', id);
        fetchChallenges();
      } catch (error) {
        alert('Error eliminando desafío');
      }
    }
  };

  if (loading) return <div className="loading-state"><Loader2 className="animate-spin" /> Cargando desafíos...</div>;

  if (error) {
    return (
      <div className="view-container">
        <div className="view-header">
          <h1>Desafíos</h1>
        </div>
        <div className="error-state">
          <AlertCircle size={48} />
          <h3>Error de Conexión</h3>
          <p>{error}</p>
          <button className="btn btn-retry" onClick={fetchChallenges}>
            <RefreshCw size={16} /> Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="view-container">
      <div className="view-header">
        <h1>Desafíos</h1>
        <div className="view-actions">
          <div className="search-box">
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Buscar desafío, nivel u objeto..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
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
            <Plus size={18} /> Nuevo Desafío
          </button>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Texto (ES)</th>
              <th>¿Es Pregunta?</th>
              <th>Nivel</th>
              <th>Pack</th>
              <th>Género</th>
              <th>Prácticas (Ella/Él)</th>
              <th>Objeto</th>
              <th>Duración</th>
              <th>Acciones</th>
            </tr>
            <tr className="filter-row">
              <td>
                <input 
                  type="text" 
                  placeholder="Filtrar texto..." 
                  value={columnFilters.esText}
                  onChange={e => setColumnFilters({...columnFilters, esText: e.target.value})}
                  className="filter-input"
                />
              </td>
              <td>
                <select 
                  value={columnFilters.isQuestion}
                  onChange={e => setColumnFilters({...columnFilters, isQuestion: e.target.value})}
                  className="filter-input"
                >
                  <option value="all">Todos</option>
                  <option value="yes">Sí</option>
                  <option value="no">No</option>
                </select>
              </td>
              <td>
                <input 
                  type="text" 
                  placeholder="Nivel..." 
                  value={columnFilters.level}
                  onChange={e => setColumnFilters({...columnFilters, level: e.target.value})}
                  className="filter-input"
                />
              </td>
              <td>
                <input 
                  type="text" 
                  placeholder="Pack..." 
                  value={columnFilters.pack}
                  onChange={e => setColumnFilters({...columnFilters, pack: e.target.value})}
                  className="filter-input"
                />
              </td>
              <td>
                <select 
                  value={columnFilters.genero}
                  onChange={e => setColumnFilters({...columnFilters, genero: e.target.value})}
                  className="filter-input"
                >
                  <option value="">Todos</option>
                  <option value="el">Él</option>
                  <option value="ella">Ella</option>
                </select>
              </td>
              <td>
                <input 
                  type="text" 
                  placeholder="Filtrar prácticas..." 
                  value={columnFilters.practice}
                  onChange={e => setColumnFilters({...columnFilters, practice: e.target.value})}
                  className="filter-input"
                />
              </td>
              <td>
                <input 
                  type="text" 
                  placeholder="Objeto..." 
                  value={columnFilters.object}
                  onChange={e => setColumnFilters({...columnFilters, object: e.target.value})}
                  className="filter-input"
                />
              </td>
              <td>
                <input 
                  type="text" 
                  placeholder="Segundos..." 
                  value={columnFilters.duration}
                  onChange={e => setColumnFilters({...columnFilters, duration: e.target.value})}
                  className="filter-input"
                />
              </td>
              <td></td>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((c) => (
              <tr key={c.challengeId}>
                <td>{c.esText}</td>
                <td>
                  <span className={`badge ${c.isQuestion ? 'badge-warning' : 'badge-success'}`}>
                    {c.isQuestion ? 'Sí' : 'No'}
                  </span>
                </td>
                <td>{c.level?.esName || c.level?.name || 'N/A'}</td>
                <td>{c.pack?.esName || 'N/A'}</td>
                <td>
                  <span className={`badge ${c.genero === 'ella' ? 'badge-primary' : 'badge-secondary'}`} style={{ textTransform: 'capitalize' }}>
                    {c.genero || '-'}
                  </span>
                </td>
                <td>
                  <div className="table-cell-info">
                    {!c.herPractice?.esName && !c.himPractice?.esName ? (
                      <span className="info-main">-</span>
                    ) : (
                      <>
                        {c.herPractice?.esName && (
                          <span className="info-main">
                            Ella: {c.herPractice.esName}
                          </span>
                        )}
                        {c.himPractice?.esName && (
                          <span className="info-main">
                            Él: {c.himPractice.esName}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </td>
                <td>
                  <div className="table-cell-info">
                    <span className="info-main">{c.object?.esObject || 'N/A'}</span>
                  </div>
                </td>
                <td>{c.duration}s</td>
                <td>
                  <button className="btn-icon btn-edit" onClick={() => handleOpenModal(c)}><Edit2 size={16} /></button>
                  <button className="btn-icon btn-delete" onClick={() => handleDelete(c.challengeId)}><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {/* Paginación */}
        {totalPages > 1 && (
          <div className="pagination">
            <button 
              className="btn btn-icon" 
              onClick={() => paginate(currentPage - 1)} 
              disabled={currentPage === 1}
            >
              <ChevronLeft size={20} />
            </button>
            <span className="page-info">
              Página {currentPage} de {totalPages} ({filteredChallenges.length} resultados)
            </span>
            <button 
              className="btn btn-icon" 
              onClick={() => paginate(currentPage + 1)} 
              disabled={currentPage === totalPages}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingChallenge ? 'Editar Desafío' : 'Nuevo Desafío'}</h2>
              <button className="btn-icon" onClick={handleCloseModal}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label>Texto (ES)</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={formData.esText || ''} 
                      onChange={e => setFormData({...formData, esText: e.target.value})}
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label className="checkbox-label" style={{ marginTop: '2rem' }}>
                      <input 
                        type="checkbox" 
                        checked={formData.isQuestion || false} 
                        onChange={e => setFormData({...formData, isQuestion: e.target.checked})}
                      />
                      ¿Es una pregunta?
                    </label>
                  </div>
                  <div className="form-group">
                    <label>Duración (segundos)</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      value={formData.duration ?? ''} 
                      onChange={e => setFormData({...formData, duration: e.target.value === '' ? undefined : Number(e.target.value)})}
                    />
                  </div>
                  <div className="form-group">
                    <label>ID Nivel</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={formData.levelId || ''} 
                      onChange={e => setFormData({...formData, levelId: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>ID Pack</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={formData.packId || ''} 
                      onChange={e => setFormData({...formData, packId: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Género</label>
                    <select 
                      className="form-control" 
                      value={formData.genero || ''} 
                      onChange={e => setFormData({...formData, genero: e.target.value})}
                    >
                      <option value="">Seleccionar...</option>
                      <option value="el">Él</option>
                      <option value="ella">Ella</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>ID Práctica (Ella)</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={formData.herPracticeId || ''} 
                      onChange={e => setFormData({...formData, herPracticeId: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>ID Práctica (Él)</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={formData.himPracticeId || ''} 
                      onChange={e => setFormData({...formData, himPracticeId: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>ID Objeto</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={formData.objectId || ''} 
                      onChange={e => setFormData({...formData, objectId: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Texto (EN)</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={formData.enText || ''} 
                      onChange={e => setFormData({...formData, enText: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Texto (PR)</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={formData.prText || ''} 
                      onChange={e => setFormData({...formData, prText: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Texto (FR)</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={formData.frText || ''} 
                      onChange={e => setFormData({...formData, frText: e.target.value})}
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
