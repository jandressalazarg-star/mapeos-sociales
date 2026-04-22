"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

/* ─── Types ───────────────────────────────────────────────── */
interface Proyecto {
  id: string;
  codigo: string;
  sector: string;
  malla: string;
  distrito: string;
  clasificacion: "Malla" | "Extensión";
  extension?: string;
}

/* ─── Helpers ─────────────────────────────────────────────── */
function calcStats(data: Proyecto[]) {
  const total      = data.length;
  const totalMalla = data.filter(p => p.clasificacion === "Malla").length;
  const totalExt   = data.filter(p => p.clasificacion === "Extensión").length;

  const distMap: Record<string, number> = {};
  for (const p of data) {
    const d = p.distrito?.trim() || "Sin distrito";
    distMap[d] = (distMap[d] ?? 0) + 1;
  }
  const porDistrito = Object.entries(distMap)
    .map(([distrito, cantidad]) => ({ distrito, cantidad }))
    .sort((a, b) => b.cantidad - a.cantidad || a.distrito.localeCompare(b.distrito));

  const distritosUnicos = porDistrito.length;

  return { total, totalMalla, totalExt, distritosUnicos, porDistrito };
}

/* ═══════════════════════════════════════════════════════════
   COMPONENT
═══════════════════════════════════════════════════════════ */
export default function ResumenPage() {
  const router = useRouter();
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [loading,   setLoading]   = useState(true);
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
  const pctExt   = stats.total ? Math.round((stats.totalExt   / stats.total) * 100) : 0;
  const maxDist  = stats.porDistrito[0]?.cantidad ?? 1;

  /* ════════════════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════════════════ */
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --blue-950: #001e3c;
          --blue-900: #00264d;
          --blue-800: #003366;
          --blue-700: #0a4080;
          --blue-600: #1a5299;
          --blue-500: #2563eb;
          --blue-400: #3b82f6;
          --blue-300: #93c5fd;
          --white:    #ffffff;
          --amber:    #fbbf24;
          --amber-d:  #f59e0b;
          --green:    #34d399;
          --purple:   #a78bfa;
          --font-display: 'Sora', sans-serif;
          --font-body:    'DM Sans', sans-serif;
        }

        html, body { font-family: var(--font-body); background: var(--blue-950); }

        /* ── Page ── */
        .page {
          min-height: 100dvh;
          display: flex; flex-direction: column;
          align-items: center;
          padding: 0 0 56px;
          position: relative; overflow-x: hidden;
        }
        .page::before {
          content: ''; position: fixed; inset: 0;
          background:
            radial-gradient(ellipse 75% 50% at 12% -8%,  rgba(26,82,153,.5)  0%, transparent 56%),
            radial-gradient(ellipse 55% 40% at 94% 108%, rgba(0,51,102,.6)   0%, transparent 52%),
            radial-gradient(ellipse 40% 36% at 56% 56%,  rgba(0,30,60,.55)   0%, transparent 60%);
          pointer-events: none; z-index: 0;
        }
        .page::after {
          content: ''; position: fixed; inset: 0;
          background-image:
            linear-gradient(rgba(59,130,246,.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59,130,246,.03) 1px, transparent 1px);
          background-size: 40px 40px;
          pointer-events: none; z-index: 0;
        }

        /* ── Header ── */
        .header {
          position: sticky; top: 0; z-index: 20; width: 100%;
          background: rgba(0,30,60,.75);
          backdrop-filter: blur(20px) saturate(1.4);
          -webkit-backdrop-filter: blur(20px) saturate(1.4);
          border-bottom: 1px solid rgba(255,255,255,.06);
          padding: 14px 18px;
          display: flex; align-items: center; justify-content: space-between;
        }
        .brand { display: flex; align-items: center; gap: 9px; }
        .brand-icon {
          width: 34px; height: 34px; border-radius: 10px;
          background: linear-gradient(135deg, var(--blue-700), var(--blue-400));
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 3px 12px rgba(37,99,235,.5);
        }
        .brand-icon svg { width: 16px; height: 16px; color: #fff; }
        .brand-col { display: flex; flex-direction: column; gap: 1px; }
        .brand-name {
          font-family: var(--font-display); font-size: 15px; font-weight: 700;
          color: var(--white); letter-spacing: -.3px; line-height: 1;
        }
        .brand-sub { font-size: 10.5px; color: var(--blue-300); opacity: .65; }

        .btn-back {
          display: flex; align-items: center; gap: 6px;
          padding: 7px 13px; border-radius: 10px;
          background: rgba(255,255,255,.06);
          border: 1px solid rgba(255,255,255,.09);
          color: rgba(255,255,255,.7); font-family: var(--font-display);
          font-size: 12.5px; font-weight: 600; cursor: pointer;
          transition: background .15s, color .15s;
        }
        .btn-back:hover { background: rgba(255,255,255,.11); color: var(--white); }
        .btn-back svg { width: 13px; height: 13px; }

        /* ── Content wrapper ── */
        .content {
          position: relative; z-index: 1;
          width: 100%; max-width: 560px;
          padding: 24px 16px 0;
          display: flex; flex-direction: column; gap: 20px;
        }

        /* ── Page title ── */
        .page-title {
          animation: fadeUp .4s .05s cubic-bezier(.22,1,.36,1) both;
        }
        .page-title h1 {
          font-family: var(--font-display); font-size: clamp(20px,5.5vw,26px);
          font-weight: 800; color: var(--white); letter-spacing: -.5px;
          line-height: 1.15; margin-bottom: 5px;
        }
        .page-title p { font-size: 13px; color: var(--blue-300); opacity: .7; }

        /* ── Glass card base ── */
        .glass {
          background: rgba(255,255,255,.042);
          backdrop-filter: blur(24px) saturate(1.4);
          -webkit-backdrop-filter: blur(24px) saturate(1.4);
          border: 1px solid rgba(255,255,255,.08);
          border-radius: 20px;
          box-shadow:
            0 0 0 1px rgba(37,99,235,.08),
            0 10px 28px rgba(0,0,0,.3),
            inset 0 1px 0 rgba(255,255,255,.055);
        }

        /* ── KPI grid ── */
        .kpi-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
          animation: fadeUp .4s .08s cubic-bezier(.22,1,.36,1) both;
        }
        .kpi-card {
          padding: 18px 16px;
          border-radius: 18px; position: relative; overflow: hidden;
        }
        .kpi-card.wide { grid-column: 1 / -1; }
        .kpi-glow {
          position: absolute; width: 90px; height: 90px; border-radius: 50%;
          top: -24px; right: -20px; opacity: .12; pointer-events: none;
          filter: blur(22px);
        }
        .kpi-icon-wrap {
          width: 34px; height: 34px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 14px;
        }
        .kpi-icon-wrap svg { width: 16px; height: 16px; }
        .kpi-label {
          font-size: 11px; font-weight: 500; letter-spacing: .5px;
          text-transform: uppercase; opacity: .6; margin-bottom: 4px;
        }
        .kpi-value {
          font-family: var(--font-display); font-size: 36px; font-weight: 800;
          line-height: 1; letter-spacing: -1.5px; color: var(--white);
        }
        .kpi-sub { font-size: 12px; margin-top: 5px; opacity: .55; }

        /* Type breakdown card */
        .type-card {
          grid-column: 1 / -1; padding: 20px;
        }
        .type-label {
          font-size: 11px; font-weight: 600; letter-spacing: .6px;
          text-transform: uppercase; color: var(--blue-300); opacity: .7;
          margin-bottom: 16px;
        }
        .type-rows { display: flex; flex-direction: column; gap: 12px; }
        .type-row { display: flex; flex-direction: column; gap: 6px; }
        .type-row-head {
          display: flex; align-items: center; justify-content: space-between;
        }
        .type-name {
          display: flex; align-items: center; gap: 7px;
          font-family: var(--font-display); font-size: 13.5px; font-weight: 600;
          color: var(--white);
        }
        .type-dot { width: 8px; height: 8px; border-radius: 50%; }
        .type-count { font-family: var(--font-display); font-size: 13.5px; font-weight: 700; }
        .type-pct { font-size: 11.5px; opacity: .5; margin-left: 4px; }
        .bar-track {
          height: 6px; border-radius: 99px;
          background: rgba(255,255,255,.07); overflow: hidden;
        }
        .bar-fill {
          height: 100%; border-radius: 99px;
          transition: width .8s cubic-bezier(.22,1,.36,1);
        }

        /* ── District table ── */
        .district-section {
          animation: fadeUp .4s .16s cubic-bezier(.22,1,.36,1) both;
        }
        .district-card { padding: 20px; }
        .section-head {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 16px;
        }
        .section-title {
          font-family: var(--font-display); font-size: 14px; font-weight: 700;
          color: var(--white); letter-spacing: -.2px;
        }
        .section-pill {
          padding: 3px 10px; border-radius: 20px;
          background: rgba(37,99,235,.18); border: 1px solid rgba(59,130,246,.2);
          font-size: 11px; font-weight: 600; color: var(--blue-300);
          font-family: var(--font-display);
        }

        .district-list { display: flex; flex-direction: column; gap: 0; }
        .district-row {
          display: flex; align-items: center; gap: 12px;
          padding: 10px 0;
          border-bottom: 1px solid rgba(255,255,255,.05);
          animation: fadeUp .35s cubic-bezier(.22,1,.36,1) both;
        }
        .district-row:last-child { border-bottom: none; padding-bottom: 0; }
        .district-rank {
          width: 22px; flex-shrink: 0;
          font-family: var(--font-display); font-size: 11px; font-weight: 700;
          color: rgba(255,255,255,.25); text-align: center;
        }
        .district-rank.top { color: var(--amber); }
        .district-name {
          flex: 1; font-size: 13.5px; font-weight: 500; color: rgba(255,255,255,.82);
          min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .district-bar-wrap { flex: 1; max-width: 80px; }
        .district-bar-track {
          height: 5px; border-radius: 99px;
          background: rgba(255,255,255,.07); overflow: hidden;
        }
        .district-bar-fill {
          height: 100%; border-radius: 99px;
          background: linear-gradient(90deg, var(--blue-600), var(--blue-400));
          transition: width .7s cubic-bezier(.22,1,.36,1);
        }
        .district-count {
          width: 28px; flex-shrink: 0;
          font-family: var(--font-display); font-size: 13px; font-weight: 700;
          color: var(--white); text-align: right;
        }
        .district-badge {
          padding: 2px 8px; border-radius: 20px; flex-shrink: 0;
          font-size: 10.5px; font-weight: 600;
          background: rgba(59,130,246,.14); color: var(--blue-300);
          border: 1px solid rgba(59,130,246,.18);
          font-family: var(--font-display);
        }

        /* ── Skeleton ── */
        .sk {
          border-radius: 6px;
          background: linear-gradient(90deg,
            rgba(255,255,255,.04) 25%, rgba(255,255,255,.09) 50%, rgba(255,255,255,.04) 75%);
          background-size: 400px 100%;
          animation: shimmer 1.4s infinite linear;
        }

        /* ── Error banner ── */
        .error-banner {
          display: flex; align-items: center; gap: 9px;
          padding: 14px 16px; border-radius: 14px;
          background: rgba(239,68,68,.09); border: 1px solid rgba(239,68,68,.2);
          color: #fca5a5; font-size: 13px;
        }
        .error-banner svg { width: 16px; height: 16px; flex-shrink: 0; }

        /* ── Animations ── */
        @keyframes fadeUp  { from { opacity:0; transform: translateY(12px); } to { opacity:1; transform: none; } }
        @keyframes shimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }

        @media (min-width: 480px) { .content { padding: 28px 20px 0; } }
      `}</style>

      <div className="page">

        {/* ── Header ── */}
        <div className="header">
          <div className="brand">
            <div className="brand-icon">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
            </div>
            <div className="brand-col">
              <span className="brand-name">AlfaCo</span>
              <span className="brand-sub">Resumen Ejecutivo</span>
            </div>
          </div>
          <button className="btn-back" onClick={() => router.push("/dashboard")}>
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Dashboard
          </button>
        </div>

        <div className="content">

          {/* ── Page title ── */}
          <div className="page-title">
            <h1>Resumen de Proyectos</h1>
            <p>Indicadores clave de gestión social en campo</p>
          </div>

          {/* ── Error ── */}
          {fetchError && (
            <div className="error-banner">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
              No se pudieron cargar los datos. Revisa tu conexión.
            </div>
          )}

          {/* ── KPI grid ── */}
          {loading ? <SkeletonKPIs /> : !fetchError && (
            <div className="kpi-grid">

              {/* Total proyectos */}
              <div className="glass kpi-card">
                <div className="kpi-glow" style={{ background:"var(--blue-400)" }} />
                <div className="kpi-icon-wrap"
                  style={{ background:"rgba(59,130,246,.15)", color:"var(--blue-300)" }}>
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
                  </svg>
                </div>
                <div className="kpi-label" style={{ color:"var(--blue-300)" }}>Total proyectos</div>
                <div className="kpi-value">{stats.total}</div>
                <div className="kpi-sub" style={{ color:"var(--blue-300)" }}>registros activos</div>
              </div>

              {/* Distritos únicos */}
              <div className="glass kpi-card">
                <div className="kpi-glow" style={{ background:"var(--purple)" }} />
                <div className="kpi-icon-wrap"
                  style={{ background:"rgba(167,139,250,.15)", color:"var(--purple)" }}>
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                </div>
                <div className="kpi-label" style={{ color:"var(--purple)" }}>Alcance</div>
                <div className="kpi-value">{stats.distritosUnicos}</div>
                <div className="kpi-sub" style={{ color:"var(--purple)" }}>distritos intervenidos</div>
              </div>

              {/* Type breakdown */}
              <div className="glass kpi-card type-card">
                <div className="type-label">Distribución por tipo</div>
                <div className="type-rows">

                  {/* Malla */}
                  <div className="type-row">
                    <div className="type-row-head">
                      <div className="type-name">
                        <span className="type-dot" style={{ background:"var(--blue-400)" }} />
                        Malla
                      </div>
                      <div>
                        <span className="type-count" style={{ color:"var(--blue-300)" }}>
                          {stats.totalMalla}
                        </span>
                        <span className="type-pct">{pctMalla}%</span>
                      </div>
                    </div>
                    <div className="bar-track">
                      <div className="bar-fill"
                        style={{ width:`${pctMalla}%`, background:"linear-gradient(90deg,var(--blue-600),var(--blue-400))" }} />
                    </div>
                  </div>

                  {/* Extensión */}
                  <div className="type-row">
                    <div className="type-row-head">
                      <div className="type-name">
                        <span className="type-dot" style={{ background:"var(--amber)" }} />
                        Extensión
                      </div>
                      <div>
                        <span className="type-count" style={{ color:"var(--amber)" }}>
                          {stats.totalExt}
                        </span>
                        <span className="type-pct">{pctExt}%</span>
                      </div>
                    </div>
                    <div className="bar-track">
                      <div className="bar-fill"
                        style={{ width:`${pctExt}%`, background:"linear-gradient(90deg,var(--amber-d),var(--amber))" }} />
                    </div>
                  </div>

                </div>
              </div>
            </div>
          )}

          {/* ── District distribution ── */}
          {!loading && !fetchError && (
            <div className="district-section">
              <div className="glass district-card">
                <div className="section-head">
                  <span className="section-title">Distribución por Distrito</span>
                  <span className="section-pill">{stats.distritosUnicos} distritos</span>
                </div>

                {stats.porDistrito.length === 0 ? (
                  <p style={{ fontSize:13, color:"rgba(148,163,184,.45)", textAlign:"center", padding:"20px 0" }}>
                    No hay datos para mostrar.
                  </p>
                ) : (
                  <div className="district-list">
                    {stats.porDistrito.map(({ distrito, cantidad }, i) => (
                      <div key={distrito} className="district-row"
                        style={{ animationDelay:`${i * 0.04}s` }}>
                        <span className={`district-rank ${i < 3 ? "top" : ""}`}>
                          {i < 3
                            ? ["🥇","🥈","🥉"][i]
                            : `${i + 1}`}
                        </span>
                        <span className="district-name">{distrito}</span>
                        <div className="district-bar-wrap">
                          <div className="district-bar-track">
                            <div className="district-bar-fill"
                              style={{ width:`${Math.round((cantidad / maxDist) * 100)}%` }} />
                          </div>
                        </div>
                        <span className="district-count">{cantidad}</span>
                        <span className="district-badge">
                          {cantidad === 1 ? "proyecto" : "proyectos"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Skeleton districts ── */}
          {loading && (
            <div className="glass district-card" style={{ borderRadius:20, padding:20 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:20 }}>
                <div className="sk" style={{ width:160, height:18 }} />
                <div className="sk" style={{ width:70, height:22, borderRadius:20 }} />
              </div>
              {[...Array(5)].map((_,i) => (
                <div key={i} style={{ display:"flex", gap:12, alignItems:"center", padding:"10px 0",
                  borderBottom: i < 4 ? "1px solid rgba(255,255,255,.05)" : "none" }}>
                  <div className="sk" style={{ width:22, height:14 }} />
                  <div className="sk" style={{ flex:1, height:14 }} />
                  <div className="sk" style={{ width:60, height:5, borderRadius:99 }} />
                  <div className="sk" style={{ width:20, height:16 }} />
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </>
  );
}

/* ─── Skeleton KPIs ─────────────────────────────────────── */
function SkeletonKPIs() {
  return (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12,
      animation:"fadeUp .4s .08s cubic-bezier(.22,1,.36,1) both" }}>
      {[...Array(3)].map((_, i) => (
        <div key={i}
          style={{
            gridColumn: i === 2 ? "1 / -1" : undefined,
            background:"rgba(255,255,255,.03)",
            border:"1px solid rgba(255,255,255,.05)",
            borderRadius:18, padding:18,
          }}>
          <div style={{ width:34, height:34, borderRadius:10, marginBottom:14,
            background:"rgba(255,255,255,.06)", backgroundImage:"linear-gradient(90deg,rgba(255,255,255,.04) 25%,rgba(255,255,255,.09) 50%,rgba(255,255,255,.04) 75%)",
            backgroundSize:"400px 100%", animation:"shimmer 1.4s infinite linear" }} />
          <div style={{ width:80, height:10, borderRadius:5, marginBottom:8,
            background:"rgba(255,255,255,.06)", backgroundImage:"linear-gradient(90deg,rgba(255,255,255,.04) 25%,rgba(255,255,255,.09) 50%,rgba(255,255,255,.04) 75%)",
            backgroundSize:"400px 100%", animation:"shimmer 1.4s infinite linear" }} />
          <div style={{ width:60, height:36, borderRadius:8,
            background:"rgba(255,255,255,.06)", backgroundImage:"linear-gradient(90deg,rgba(255,255,255,.04) 25%,rgba(255,255,255,.09) 50%,rgba(255,255,255,.04) 75%)",
            backgroundSize:"400px 100%", animation:"shimmer 1.4s infinite linear" }} />
        </div>
      ))}
    </div>
  );
}