// src/components/Informes.jsx
import React, { useState } from 'react';
import axios from 'axios';
import './Informes.css';          // estilos aparte

const API = 'http://192.168.0.102:4000/informes';

export default function Informes() {
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [clave, setClave] = useState('');
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const pedirInforme = async () => {
    setError('');
    if (!desde || !hasta) { setError('Elegí ambas fechas'); return; }
    if (clave !== 'verdu123') { setError('Clave incorrecta'); return; }

    setCargando(true);
    try {
      const { data } = await axios.get(API, { params: { desde, hasta, clave } });
      setDatos(data);
    } catch (e) {
      console.error(e);
      setError('No se pudo obtener el informe');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="informe-wrap">
      <h2>📊 Informes de ventas</h2>

      <div className="filtros">
        <input type="date" value={desde} onChange={e => setDesde(e.target.value)} />
        <input type="date" value={hasta} onChange={e => setHasta(e.target.value)} />
        <input type="password" placeholder="clave" value={clave} onChange={e => setClave(e.target.value)} />
        <button onClick={pedirInforme}>Consultar</button>
      </div>

      {cargando && <p className="info">Cargando…</p>}
      {error && <p className="error">{error}</p>}

      {datos && (
        <>
          <div className="tarjetas">
            <article>
              <h4>Total</h4>
              <p>${Number(datos.total).toLocaleString('es-AR')}</p>
            </article>
            <article>
              <h4>Efectivo</h4>
              <p>${Number(datos.efectivo).toLocaleString('es-AR')}</p>
            </article>
            <article>
              <h4>Crédito</h4>
              <p>${Number(datos.credito).toLocaleString('es-AR')}</p>
            </article>
          </div>

          <h3>Por empleado</h3>
          {datos.empleados.length === 0
            ? <p>No hubo ventas en ese rango.</p>
            : (
              <div className="tabla-wrap">
                <table>
                  <thead>
                    <tr><th>Empleado</th><th>Total vendido</th></tr>
                  </thead>
                  <tbody>
                    {datos.empleados.map((e,i)=>(
                      <tr key={i}>
                        <td>{e.nombre}</td>
                        <td>${Number(e.total).toLocaleString('es-AR')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
        </>
      )}
    </div>
  );
}
