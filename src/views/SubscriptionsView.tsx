import { useState, useEffect } from 'react';
import { Trash2, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { apiService } from '../services/api';
import './Views.css';

interface SubscriptionPay {
  payId: string;
  userId: string;
  country: string;
  provider: string;
  date: string;
  amount: number;
}

export const SubscriptionsView = () => {
  const [payments, setPayments] = useState<SubscriptionPay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.get<SubscriptionPay[]>('/bondoo/suscriptions-pays');
      setPayments(data);
    } catch (err: any) {
      console.error('Error fetching payments:', err);
      setError(err.message || 'Error al conectar con la API de suscripciones');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de eliminar este registro de pago?')) {
      try {
        await apiService.delete('/bondoo/suscriptions-pays', id);
        fetchPayments();
      } catch (error) {
        alert('Error eliminando pago');
      }
    }
  };

  if (loading) return <div className="loading-state"><Loader2 className="animate-spin" /> Cargando pagos...</div>;

  if (error) {
    return (
      <div className="view-container">
        <div className="view-header">
          <h1>Historial de Pagos y Suscripciones</h1>
        </div>
        <div className="error-state">
          <AlertCircle size={48} />
          <h3>Error de Conexión</h3>
          <p>{error}</p>
          <button className="btn btn-retry" onClick={fetchPayments}>
            <RefreshCw size={16} /> Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="view-container">
      <div className="view-header">
        <h1>Historial de Pagos y Suscripciones</h1>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID Pago</th>
              <th>ID Usuario</th>
              <th>País</th>
              <th>Proveedor</th>
              <th>Fecha</th>
              <th>Monto</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((pay) => (
              <tr key={pay.payId}>
                <td>{pay.payId}</td>
                <td>{pay.userId}</td>
                <td>{pay.country}</td>
                <td>{pay.provider}</td>
                <td>{pay.date}</td>
                <td>{pay.amount}</td>
                <td>
                  <button className="btn-icon btn-delete" onClick={() => handleDelete(pay.payId)}><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
