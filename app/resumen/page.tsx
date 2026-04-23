"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, BarChart3, PieChart, MapPin, Loader2, AlertCircle } from "lucide-react";

/* ─── Types ───────────────────────────────────────────────── */
interface Proyecto {
  id: string;
  codigo: string;
  sector: string;
  malla: string;
  distrito: string;
  clasificacion: string;
  extension?: string;
}

/* ─── Helpers con Lógica Robusta ───────────────────────────── */
function calcStats(data: Proyecto[]) {
  const total = data.length;
  // Usamos toUpperCase para evitar errores de conteo por mayúsculas
  const totalMalla = data.filter(p => p.clasificacion?.toUpperCase() === "MALLA").length;
  const totalExt = data.filter(p => 
    p.clasificacion?.toUpperCase() === "EXTENSIÓN" || p.clasificacion?.toUpperCase() === "EXTENSION"
  ).length;

  const distMap: Record<string, number> = {};
  for (const p of data) {
    const d = p.distrito?.trim() || "Sin distrito";
    distMap[d] = (distMap[d] ?? 0) + 1;
  }
  const porDistrito = Object.entries(distMap)
    .map(([distrito, cantidad]) => ({ distrito, cantidad }))
    .sort((a, b) => b.cantidad - a.cantidad || a.distrito.localeCompare(b.distrito));

  return { total, totalMalla, totalExt, distritosUnicos: porDistrito.length, porDistrito };
}

export default function ResumenPage() {
  const router = useRouter();
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from("proyectos")
        .select("id, codigo, sector, malla, distrito, clasificacion, extension");
      if (error) setFetchError(true);
      else setProyectos(data ?? []);
      setLoading(false);
    };
    load();
  }, []);

  const stats = useMemo(() => calcStats(proyectos), [proyectos]);
  const pctMalla = stats.total ? Math.round((stats.totalMalla / stats.total) * 100) : 0;
  const pctExt = stats.total ? Math.round((stats.totalExt / stats.total) * 100) : 0;
  const maxDist = stats.porDistrito[0]?.cantidad ?? 1;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=DM+Sans:wght@400;500;700&display=swap');

        :root {
          --alfaco-azul: #283c91;
          --alfaco-plomo: #5a5a5a;
          --alfaco-celeste: #0aa0e1;
          --bg-light: #f4f7fa;
        }

        body { margin: 0; background: var(--bg-light); font-family: 'DM Sans', sans-serif; color: var(--alfaco-plomo); }
        
        .header {
          position: sticky; top: 0; z-index: 30;
          background: white; border-bottom: 1px solid #e2e8f0;
          padding: 14px 20px; display: flex; align-items: center; justify-content: space-between;
          box-shadow: 0 4px 12px rgba(0,0,0,0.03);
        }

        .logo-nav { height: 28px; width: auto; }

        .btn-back {
          display: flex; align-items: center; gap: 8px;
          padding: 8px 14px; border-radius: 12px;
          background: #f8fafc; border: 1px solid #e2e8f0;
          color: var(--alfaco-azul); font-family: 'Sora';
          font-size: 13px; font-weight: 700; cursor: pointer; transition: 0.2s;
        }
        .btn-back:hover { background: white; border-color: var(--alfaco-celeste); }

        .content { max-width: 600px; margin: 0 auto; padding: 25px 20px; }

        .page-title h1 { font-family: 'Sora'; font-size: 24px; font-weight: 800; color: var(--alfaco-azul); margin: 0; }
        .page-title p { font-size: 14px; opacity: 0.7; margin-top: 4px; margin-bottom: 25px; }

        .kpi-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
        
        .card { 
          background: white; border-radius: 24px; padding: 22px; 
          border: 1px solid rgba(226, 232, 240, 0.8);
          box-shadow: 0 8px 20px rgba(40,60,145,0.04);
        }

        .kpi-label { font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--alfaco-azul); opacity: 0.6; margin-bottom: 6px; }
        .kpi-value { font-family: 'Sora'; font-size: 32px; font-weight: 800; color: var(--alfaco-azul); line-height: 1; }
        
        .chart-card { margin-bottom: 20px; }
        .chart-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; }
        .chart-title { font-family: 'Sora'; font-size: 14px; font-weight: 700; color: var(--alfaco-azul); display: flex; align-items: center; gap: 8px; }
        .chart-pill { padding: 4px 10px; border-radius: 20px; background: rgba(10,160,225,0.1); color: var(--alfaco-celeste); font-family: 'Sora'; font-size: 11px; font-weight: 700; }

        .bar-row { margin-bottom: 15px; }
        .bar-info { display: flex; justify-content: space-between; font-size: 13px; font-weight: 700; margin-bottom: 6px; }
        .bar-track { height: 8px; background: #f1f5f9; border-radius: 10px; overflow: hidden; }
        .bar-fill { height: 100%; border-radius: 10px; transition: width 1s ease-out; }

        .district-row {
          display: flex; align-items: center; gap: 12px; padding: 12px 0;
          border-bottom: 1px solid #f1f5f9;
        }
        .district-row:last-child { border-bottom: none; }
        .rank { width: 24px; font-family: 'Sora'; font-size: 12px; font-weight: 800; color: var(--alfaco-celeste); text-align: center; }
        .dist-name { flex: 1; font-size: 14px; font-weight: 500; color: var(--alfaco-plomo); }
        .dist-count { font-family: 'Sora'; font-size: 14px; font-weight: 700; color: var(--alfaco-azul); }

        .error-msg { background: #fef2f2; color: #dc2626; padding: 16px; border-radius: 16px; border: 1px solid #fee2e2; display: flex; gap: 10px; align-items: center; font-size: 14px; }
      `}</style>

      <header className="header">
        <img src="/logo-horizontal.png" alt="AlfaCo" className="logo-nav" />
        <button className="btn-back" onClick={() => router.push("/dashboard")}>
          <ArrowLeft size={16} /> Dashboard
        </button>
      </header>

      <div className="content">
        <div className="page-title">
          <h1>Resumen Ejecutivo</h1>
          <p>Análisis de cobertura y clasificación</p>
        </div>

        {fetchError && (
          <div className="error-msg">
            <AlertCircle size={20} /> Error al conectar con la base de datos.
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Loader2 className="animate-spin text-[#283c91]" size={40} />
          </div>
        ) : (
          <>
            <div className="kpi-grid">
              <div className="card">
                <div className="kpi-label">Proyectos Totales</div>
                <div className="kpi-value">{stats.total}</div>
              </div>
              <div className="card">
                <div className="kpi-label">Alcance Distrital</div>
                <div className="kpi-value">{stats.distritosUnicos}</div>
              </div>
            </div>

            <div className="card chart-card">
              <div className="chart-head">
                <div className="chart-title"><PieChart size={18} /> Composición por Tipo</div>
              </div>
              
              <div className="bar-row">
                <div className="bar-info">
                  {/* 👇 AQUÍ EL CAMBIO 1: Formato con dos puntos */}
                  <span>Mallas: {stats.totalMalla}</span>
                  <span>{pctMalla}%</span>
                </div>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: `${pctMalla}%`, background: 'var(--alfaco-azul)' }} />
                </div>
              </div>

              <div className="bar-row">
                <div className="bar-info">
                  {/* 👇 AQUÍ EL CAMBIO 1: Formato con dos puntos */}
                  <span>Extensiones: {stats.totalExt}</span>
                  <span>{pctExt}%</span>
                </div>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: `${pctExt}%`, background: 'var(--alfaco-celeste)' }} />
                </div>
              </div>
            </div>

            <div className="card">
              {/* 👇 AQUÍ EL CAMBIO 2: Recuperada la Cápsula a la derecha */}
              <div className="chart-head">
                <div className="chart-title"><MapPin size={18} /> Ranking por Distrito</div>
                <div className="chart-pill">{stats.distritosUnicos} distritos</div>
              </div>
              {stats.porDistrito.map((d, i) => (
                <div key={d.distrito} className="district-row">
                  <div className="rank">{i + 1}</div>
                  <div className="dist-name">{d.distrito}</div>
                  {/* 👇 AQUÍ EL CAMBIO 3: Palabra completa 'proyecto(s)' */}
                  <div className="dist-count">
                    {d.cantidad} {d.cantidad === 1 ? 'proyecto' : 'proyectos'}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}