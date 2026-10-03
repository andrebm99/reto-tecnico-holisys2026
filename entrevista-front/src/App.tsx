import { useState } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3000';

interface Cliente {
  id: number;
  nombre: string;
  dni: string;
  puntos: number;
  nivelActual: string;
  siguienteNivel: string | null;
  puntosFaltantes: number;
}

export default function App() {
  const [dni, setDni] = useState('');
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    dni: '',
    tipo: 'sumar',
    puntos: '',
    motivo: '',
  });
  const [mensajeTx, setMensajeTx] = useState('');

  const buscarClientes = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await axios.get<Cliente[]>(`${API_URL}/clients`, {
        params: dni ? { dni } : {},
      });
      setClientes(response.data);
    } catch {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const manejarTransaccion = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensajeTx('');
    try {
      const res = await axios.post(`${API_URL}/clients/puntos`, {
        ...formData,
        puntos: Number(formData.puntos),
      });
      setMensajeTx(`${res.data.message} - Total: ${res.data.puntosActuales}`);
      setFormData({ dni: '', tipo: 'sumar', puntos: '', motivo: '' });
      const response = await axios.get<Cliente[]>(`${API_URL}/clients`);
      setClientes(response.data);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setMensajeTx(err.response?.data?.message || 'Error en la transacción');
      } else {
        setMensajeTx('Error');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <header>
          <h1 className="text-2xl font-bold text-gray-900">Sistema de Puntos</h1>
        </header>

        <section className="bg-white p-6 rounded shadow-sm border border-gray-200">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Consulta de Clientes</h2>
          
          <form onSubmit={buscarClientes} className="flex gap-4 mb-6">
            <input
              type="text"
              placeholder="DNI"
              value={dni}
              onChange={(e) => setDni(e.target.value)}
              maxLength={8}
              className="border border-gray-300 p-2 rounded w-48 focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              {loading ? '...' : 'Buscar'}
            </button>
          </form>

          {error && <p className="text-red-600 mb-4">{error}</p>}

          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-sm text-gray-600">
                <th className="pb-2 font-medium">Nombre</th>
                <th className="pb-2 font-medium">DNI</th>
                <th className="pb-2 font-medium">Puntos</th>
                <th className="pb-2 font-medium">Nivel</th>
                <th className="pb-2 font-medium">Siguiente Nivel</th>
                <th className="pb-2 font-medium">Faltan</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {clientes.length > 0 ? (
                clientes.map((c) => (
                  <tr key={c.id} className="border-b border-gray-100">
                    <td className="py-3 text-gray-900">{c.nombre}</td>
                    <td className="py-3 text-gray-600">{c.dni}</td>
                    <td className="py-3 font-semibold text-gray-900">{c.puntos}</td>
                    <td className="py-3">
                      <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                        {c.nivelActual}
                      </span>
                    </td>
                    <td className="py-3 text-gray-600">{c.siguienteNivel || '-'}</td>
                    <td className="py-3 text-gray-600">{c.puntosFaltantes}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-4 text-center text-gray-500">
                    No hay resultados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        <section className="bg-white p-6 rounded shadow-sm border border-gray-200">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Ajuste de Puntos</h2>
          
          <form onSubmit={manejarTransaccion} className="flex flex-wrap gap-4">
            <input
              type="text"
              placeholder="DNI"
              value={formData.dni}
              onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
              maxLength={8}
              required
              className="border border-gray-300 p-2 rounded w-32 focus:outline-none focus:border-blue-500"
            />
            
            <select
              value={formData.tipo}
              onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
              className="border border-gray-300 p-2 rounded w-32 focus:outline-none focus:border-blue-500"
            >
              <option value="sumar">Sumar</option>
              <option value="restar">Restar</option>
            </select>

            <input
              type="number"
              placeholder="Puntos"
              value={formData.puntos}
              onChange={(e) => setFormData({ ...formData, puntos: e.target.value })}
              min="1"
              required
              className="border border-gray-300 p-2 rounded w-32 focus:outline-none focus:border-blue-500"
            />

            <input
              type="text"
              placeholder="Motivo"
              value={formData.motivo}
              onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
              required
              className="border border-gray-300 p-2 rounded flex-1 focus:outline-none focus:border-blue-500"
            />

            <button
              type="submit"
              className="bg-gray-800 text-white px-6 py-2 rounded hover:bg-gray-900"
            >
              Guardar
            </button>
          </form>

          {mensajeTx && (
            <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded text-sm text-gray-700">
              {mensajeTx}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}