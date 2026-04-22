"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

/* ─── Data ───────────────────────────────────────────────── */
const DISTRITOS = [
  "Ancón","Ate","Barranco","Bellavista","Breña","Callao","Carabayllo",
  "Carmen de la Legua","Chaclacayo","Chorrillos","Cieneguilla","Comas",
  "El Agustino","Independencia","Jesús María","La Molina","La Perla",
  "La Punta","La Victoria","Lima","Lince","Los Olivos","Lurigancho-Chosica",
  "Lurín","Magdalena del Mar","Mi Perú","Miraflores","Pachacámac","Pucusana",
  "Pueblo Libre","Puente Piedra","Punta Hermosa","Punta Negra","Rímac",
  "San Bartolo","San Borja","San Isidro","San Juan de Lurigancho",
  "San Juan de Miraflores","San Luis","San Martín de Porres","San Miguel",
  "Santa Anita","Santa María del Mar","Santa Rosa","Santiago de Surco",
  "Surquillo","Ventanilla","Villa El Salvador","Villa María del Triunfo",
];

const ADD_OTHER = "+ Agregar otro distrito";

type Clasificacion = "Malla" | "Extensión";
type Status = "idle" | "saving" | "success" | "error";

/* ═══════════════════════════════════════════════════════════
   COMPONENT
═══════════════════════════════════════════════════════════ */
export default function NuevoProyectoPage() {
  const router = useRouter();

  /* ── Form state ── */
  const [codigo,       setCodigo]       = useState("");
  const [sector,       setSector]       = useState("");
  const [malla,        setMalla]        = useState("");
  const [distrito,     setDistrito]     = useState("");
  const [distritoCustom, setDistritoCustom] = useState("");
  const [clasificacion, setClasificacion] = useState<Clasificacion>("Malla");
  const [extension,    setExtension]    = useState("");

  /* ── Combobox ── */
  const [comboQuery,   setComboQuery]   = useState("");
  const [comboOpen,    setComboOpen]    = useState(false);
  const comboRef = useRef<HTMLDivElement>(null);

  /* ── Status ── */
  const [status,    setStatus]    = useState<Status>("idle");
  const [errorMsg,  setErrorMsg]  = useState("");

  const isAddOther = distrito === ADD_OTHER;

  /* Close combobox on outside click */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (comboRef.current && !comboRef.current.contains(e.target as Node))
        setComboOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ── Filtered districts ── */
  const filtered = [
    ...DISTRITOS.filter(d => d.toLowerCase().includes(comboQuery.toLowerCase())),
    ADD_OTHER,
  ];

  /* ── Validation ── */
  const validate = () => {
    if (!codigo.trim())                         return "El código de proyecto es obligatorio.";
    if (!/^\d{6}$/.test(sector))                return "El sector debe tener exactamente 6 dígitos.";
    if (!/^\d{3}$/.test(malla))                 return "La malla debe tener exactamente 3 dígitos.";
    if (!distrito)                              return "Selecciona un distrito.";
    if (isAddOther && !distritoCustom.trim())   return "Escribe el nombre del nuevo distrito.";
    if (clasificacion === "Extensión" && !extension.trim())
      return "El nombre de la extensión es obligatorio.";
    return null;
  };

  /* ── Submit ── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) { setErrorMsg(err); return; }
    setErrorMsg("");
    setStatus("saving");

    const distritoFinal = isAddOther ? distritoCustom.trim() : distrito;

    const payload: Record<string, string> = {
      codigo:        codigo.trim(),
      sector,
      malla,
      distrito:      distritoFinal,
      clasificacion,
    };
    if (clasificacion === "Extensión") payload.extension = extension.trim();

    const { error } = await supabase.from("proyectos").insert(payload);

    if (error) {
      setErrorMsg("No se pudo guardar el proyecto. Intenta de nuevo.");
      setStatus("error");
    } else {
      setStatus("success");
      setTimeout(() => router.push("/dashboard"), 1800);
    }
  };

  /* ── Sector: only digits, max 6 ── */
  const handleSector = (v: string) => {
    if (/^\d{0,6}$/.test(v)) setSector(v);
  };
  const handleMalla = (v: string) => {
    if (/^\d{0,3}$/.test(v)) setMalla(v);
  };

  /* ════════════════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════════════════ */
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=DM+Sans:wght@300;400;500&display=swap');

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
          --white: #ffffff;
          --success: #34d399;
          --error:   #ef4444;
          --font-display: 'Sora', sans-serif;
          --font-body:    'DM Sans', sans-serif;
        }

        html, body { font-family: var(--font-body); background: var(--blue-950); }

        /* ── Page ── */
        .page {
          min-height: 100dvh;
          display: flex; flex-direction: column;
          align-items: center;
          padding: 24px 18px 56px;
          position: relative; overflow-x: hidden;
        }
        .page::before {
          content: ''; position: fixed; inset: 0;
          background:
            radial-gradient(ellipse 75% 55% at 10% -5%,  rgba(26,82,153,.5)  0%, transparent 58%),
            radial-gradient(ellipse 55% 45% at 92% 108%, rgba(0,51,102,.65)  0%, transparent 55%),
            radial-gradient(ellipse 45% 40% at 55% 55%,  rgba(0,38,77,.5)    0%, transparent 60%);
          pointer-events: none; z-index: 0;
        }
        .page::after {
          content: ''; position: fixed; inset: 0;
          background-image:
            linear-gradient(rgba(59,130,246,.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59,130,246,.035) 1px, transparent 1px);
          background-size: 40px 40px;
          pointer-events: none; z-index: 0;
        }

        /* ── Topbar ── */
        .topbar {
          position: relative; z-index: 2;
          width: 100%; max-width: 480px;
          display: flex; align-items: center; gap: 10px;
          margin-bottom: 22px;
          animation: fadeUp .4s .05s cubic-bezier(.22,1,.36,1) both;
        }
        .back-btn {
          width: 34px; height: 34px; border-radius: 9px;
          background: rgba(255,255,255,.06);
          border: 1px solid rgba(255,255,255,.08);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: var(--blue-300); flex-shrink: 0;
          transition: background .2s;
        }
        .back-btn:hover { background: rgba(255,255,255,.11); }
        .back-btn svg { width: 15px; height: 15px; }
        .brand { display: flex; align-items: center; gap: 9px; }
        .brand-icon {
          width: 32px; height: 32px; border-radius: 9px;
          background: linear-gradient(135deg, var(--blue-700), var(--blue-400));
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 3px 10px rgba(37,99,235,.5);
        }
        .brand-icon svg { width: 15px; height: 15px; color: #fff; }
        .brand-name {
          font-family: var(--font-display); font-size: 15px; font-weight: 600;
          color: var(--white); letter-spacing: -.3px;
        }

        /* ── Card ── */
        .card {
          position: relative; z-index: 1;
          width: 100%; max-width: 480px;
          background: rgba(255,255,255,.038);
          backdrop-filter: blur(28px) saturate(1.5);
          -webkit-backdrop-filter: blur(28px) saturate(1.5);
          border: 1px solid rgba(255,255,255,.08);
          border-radius: 24px;
          padding: 32px 26px 36px;
          box-shadow:
            0 0 0 1px rgba(37,99,235,.10),
            0 28px 60px rgba(0,0,0,.5),
            inset 0 1px 0 rgba(255,255,255,.06);
          animation: cardIn .5s cubic-bezier(.22,1,.36,1) both;
        }

        @keyframes cardIn  { from { opacity:0; transform: translateY(22px) scale(.97); } to { opacity:1; transform: none; } }
        @keyframes fadeUp  { from { opacity:0; transform: translateY(12px); } to { opacity:1; transform: none; } }
        @keyframes fadeIn  { from { opacity:0; } to { opacity:1; } }
        @keyframes scaleIn { from { opacity:0; transform: scale(.88); } to { opacity:1; transform: scale(1); } }
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes slideDown { from { opacity:0; transform: translateY(-8px); } to { opacity:1; transform: none; } }

        /* ── Card header ── */
        .card-header { margin-bottom: 28px; animation: fadeUp .4s .1s cubic-bezier(.22,1,.36,1) both; }
        .card-header h1 {
          font-family: var(--font-display); font-size: clamp(18px,5vw,22px);
          font-weight: 700; color: var(--white); letter-spacing: -.4px;
          line-height: 1.2; margin-bottom: 5px;
        }
        .card-header p { font-size: 13px; color: var(--blue-300); opacity: .75; }

        /* ── Section divider ── */
        .section-label {
          font-size: 10.5px; font-weight: 600; letter-spacing: .9px;
          text-transform: uppercase; color: var(--blue-400); opacity: .7;
          margin: 22px 0 14px;
        }
        .section-label:first-of-type { margin-top: 0; }

        /* ── Fields ── */
        .fields { display: flex; flex-direction: column; gap: 14px; }
        .row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

        .field { display: flex; flex-direction: column; gap: 5px; }
        label {
          font-size: 11px; font-weight: 500; color: var(--blue-300);
          opacity: .8; letter-spacing: .55px; text-transform: uppercase;
        }

        /* Input wrap */
        .input-wrap { position: relative; }
        .input-wrap svg.ico {
          position: absolute; left: 13px; top: 50%; transform: translateY(-50%);
          width: 15px; height: 15px; color: var(--blue-400); opacity: .5;
          pointer-events: none; transition: opacity .2s;
        }
        .input-wrap:focus-within svg.ico { opacity: 1; }

        input, .combo-trigger {
          width: 100%; height: 48px;
          padding: 0 14px 0 40px;
          background: rgba(255,255,255,.055);
          border: 1px solid rgba(255,255,255,.09);
          border-radius: 12px;
          color: var(--white); font-family: var(--font-body); font-size: 14.5px;
          outline: none;
          transition: border-color .2s, background .2s, box-shadow .2s;
          -webkit-appearance: none;
        }
        input::placeholder { color: rgba(148,163,184,.4); font-size: 13.5px; }
        input:focus, .combo-trigger:focus {
          border-color: rgba(59,130,246,.6);
          background: rgba(255,255,255,.075);
          box-shadow: 0 0 0 3px rgba(37,99,235,.18);
        }
        input:-webkit-autofill,
        input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0 100px rgba(0,38,77,.95) inset;
          -webkit-text-fill-color: var(--white);
          transition: background-color 9999s ease-in-out 0s;
        }

        /* ── Combobox ── */
        .combo-wrap { position: relative; }
        .combo-trigger {
          display: flex; align-items: center; justify-content: space-between;
          cursor: pointer; text-align: left; padding-right: 36px;
          background: rgba(255,255,255,.055);
          border: 1px solid rgba(255,255,255,.09);
        }
        .combo-trigger.has-value { color: var(--white); }
        .combo-trigger.placeholder-text { color: rgba(148,163,184,.4); font-size: 13.5px; }
        .combo-chevron {
          position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
          width: 14px; height: 14px; color: var(--blue-300); opacity: .5;
          pointer-events: none; transition: transform .2s;
        }
        .combo-chevron.open { transform: translateY(-50%) rotate(180deg); }

        .combo-dropdown {
          position: absolute; top: calc(100% + 6px); left: 0; right: 0;
          background: rgba(10,30,60,.97);
          backdrop-filter: blur(24px);
          border: 1px solid rgba(59,130,246,.2);
          border-radius: 14px;
          overflow: hidden; z-index: 50;
          box-shadow: 0 16px 40px rgba(0,0,0,.5);
          animation: slideDown .2s cubic-bezier(.22,1,.36,1) both;
        }
        .combo-search-wrap { padding: 10px 10px 6px; position: relative; }
        .combo-search-wrap svg {
          position: absolute; left: 20px; top: 50%; transform: translateY(-50%);
          width: 13px; height: 13px; color: var(--blue-300); opacity: .5;
          pointer-events: none;
        }
        .combo-search {
          width: 100%; height: 36px;
          padding: 0 10px 0 34px;
          background: rgba(255,255,255,.07);
          border: 1px solid rgba(255,255,255,.1);
          border-radius: 8px;
          color: var(--white); font-size: 13px;
          outline: none;
        }
        .combo-search:focus { border-color: rgba(59,130,246,.5); }
        .combo-list {
          max-height: 210px; overflow-y: auto;
          padding: 4px 6px 8px;
          scrollbar-width: thin;
          scrollbar-color: rgba(59,130,246,.3) transparent;
        }
        .combo-item {
          padding: 9px 12px; border-radius: 8px; cursor: pointer;
          font-size: 13.5px; color: rgba(255,255,255,.8);
          transition: background .15s, color .15s;
        }
        .combo-item:hover { background: rgba(59,130,246,.15); color: var(--white); }
        .combo-item.selected { background: rgba(37,99,235,.2); color: var(--blue-300); font-weight: 500; }
        .combo-item.add-other {
          color: var(--blue-400); font-weight: 500;
          border-top: 1px solid rgba(255,255,255,.06); margin-top: 4px; padding-top: 11px;
        }
        .combo-item.add-other:hover { background: rgba(37,99,235,.12); }
        .combo-empty { padding: 14px 12px; font-size: 13px; color: rgba(148,163,184,.5); text-align: center; }

        /* ── Clasificación switch ── */
        .clasif-wrap {
          display: grid; grid-template-columns: 1fr 1fr;
          background: rgba(255,255,255,.045);
          border: 1px solid rgba(255,255,255,.09);
          border-radius: 12px; padding: 4px; gap: 4px;
        }
        .clasif-option {
          height: 42px; border-radius: 9px; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 7px;
          font-family: var(--font-display); font-size: 13.5px; font-weight: 600;
          color: rgba(255,255,255,.45);
          transition: background .2s, color .2s, box-shadow .2s;
          border: none; background: transparent;
          position: relative;
        }
        .clasif-option svg { width: 15px; height: 15px; }
        .clasif-option.active {
          background: linear-gradient(135deg, var(--blue-700), var(--blue-500));
          color: var(--white);
          box-shadow: 0 3px 12px rgba(37,99,235,.45);
        }

        /* ── Conditional field animation ── */
        .conditional-field {
          overflow: hidden;
          animation: slideDown .3s cubic-bezier(.22,1,.36,1) both;
        }

        /* ── Error / Success banners ── */
        .error-banner {
          display: flex; align-items: center; gap: 8px;
          padding: 11px 13px;
          background: rgba(239,68,68,.1);
          border: 1px solid rgba(239,68,68,.25);
          border-radius: 10px; color: #fca5a5; font-size: 13px;
          animation: fadeIn .25s ease both;
        }
        .error-banner svg { width: 14px; height: 14px; flex-shrink: 0; color: var(--error); }

        .success-banner {
          display: flex; align-items: center; gap: 10px;
          padding: 14px 16px;
          background: rgba(52,211,153,.1);
          border: 1px solid rgba(52,211,153,.25);
          border-radius: 12px; color: #6ee7b7; font-size: 14px;
          animation: scaleIn .3s cubic-bezier(.22,1,.36,1) both;
        }
        .success-banner svg { width: 20px; height: 20px; flex-shrink: 0; color: var(--success); }

        /* ── Submit button ── */
        .btn-submit {
          width: 100%; height: 52px; margin-top: 24px;
          background: linear-gradient(135deg, var(--blue-700) 0%, var(--blue-500) 100%);
          color: var(--white); border: none; border-radius: 13px;
          font-family: var(--font-display); font-size: 15px; font-weight: 700;
          cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 9px;
          position: relative; overflow: hidden;
          box-shadow: 0 4px 20px rgba(37,99,235,.45), 0 1px 4px rgba(0,0,0,.3);
          transition: transform .15s, box-shadow .15s;
          letter-spacing: .1px;
        }
        .btn-submit::after {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,.13), transparent);
          pointer-events: none;
        }
        .btn-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(37,99,235,.6);
        }
        .btn-submit:active:not(:disabled) { transform: none; }
        .btn-submit:disabled { opacity: .55; cursor: not-allowed; transform: none !important; }

        .spinner {
          width: 18px; height: 18px;
          border: 2.5px solid rgba(255,255,255,.3);
          border-top-color: #fff; border-radius: 50%;
          animation: spin .65s linear infinite;
        }

        @media (min-width: 480px) { .card { padding: 40px 36px 44px; } }
      `}</style>

      <div className="page">

        {/* ── Topbar ── */}
        <div className="topbar">
          <button className="back-btn" onClick={() => router.back()} aria-label="Volver">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <div className="brand">
            <div className="brand-icon">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
            </div>
            <span className="brand-name">AlfaCo</span>
          </div>
        </div>

        {/* ── Card ── */}
        <div className="card">

          {/* Header */}
          <div className="card-header">
            <h1>Registrar Nuevo Proyecto</h1>
            <p>Completa los datos para registrar el proyecto</p>
          </div>

          {/* ── Success state ── */}
          {status === "success" ? (
            <div className="success-banner">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <div style={{ fontFamily:"var(--font-display)", fontWeight:700, marginBottom:2 }}>
                  ¡Proyecto guardado!
                </div>
                <div style={{ fontSize:12.5, opacity:.75 }}>Redirigiendo al dashboard…</div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>

              {/* ── Identificación ── */}
              <div className="section-label">Identificación</div>
              <div className="fields">

                {/* Código */}
                <div className="field">
                  <label htmlFor="codigo">Código de Proyecto</label>
                  <div className="input-wrap">
                    <input
                      id="codigo" type="text"
                      placeholder="Ej. PPE0-21-2381"
                      value={codigo}
                      onChange={e => setCodigo(e.target.value)}
                      autoComplete="off"
                    />
                    <svg className="ico" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round"
                        d="M5.25 8.25h15m-16.5 7.5h15m-1.8-13.5l-3.9 19.5m-2.1-19.5l-3.9 19.5" />
                    </svg>
                  </div>
                </div>

                {/* Sector + Malla */}
                <div className="row-2">
                  <div className="field">
                    <label htmlFor="sector">Sector <span style={{ opacity:.5 }}>(6 dígitos)</span></label>
                    <div className="input-wrap">
                      <input
                        id="sector" type="text" inputMode="numeric"
                        placeholder="000200"
                        value={sector}
                        onChange={e => handleSector(e.target.value)}
                        maxLength={6} autoComplete="off"
                      />
                      <svg className="ico" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round"
                          d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                      </svg>
                    </div>
                  </div>
                  <div className="field">
                    <label htmlFor="malla">Malla <span style={{ opacity:.5 }}>(3 dígitos)</span></label>
                    <div className="input-wrap">
                      <input
                        id="malla" type="text" inputMode="numeric"
                        placeholder="015"
                        value={malla}
                        onChange={e => handleMalla(e.target.value)}
                        maxLength={3} autoComplete="off"
                      />
                      <svg className="ico" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round"
                          d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Ubicación ── */}
              <div className="section-label" style={{ marginTop:24 }}>Ubicación</div>
              <div className="fields">

                {/* Distrito combobox */}
                <div className="field">
                  <label>Distrito</label>
                  <div className="combo-wrap" ref={comboRef}>
                    <button
                      type="button"
                      className={`combo-trigger ${distrito && distrito !== ADD_OTHER ? "has-value" : "placeholder-text"}`}
                      onClick={() => setComboOpen(o => !o)}
                    >
                      <span style={{ display:"flex", alignItems:"center", gap:10 }}>
                        <svg style={{ width:15,height:15,flexShrink:0, color:"var(--blue-400)", opacity:.55 }}
                          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                          <path strokeLinecap="round" strokeLinejoin="round"
                            d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round"
                            d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                        </svg>
                        {distrito && distrito !== ADD_OTHER ? distrito : "Selecciona un distrito"}
                      </span>
                      <svg className={`combo-chevron ${comboOpen ? "open" : ""}`}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                      </svg>
                    </button>

                    {comboOpen && (
                      <div className="combo-dropdown">
                        <div className="combo-search-wrap">
                          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round"
                              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                          </svg>
                          <input
                            className="combo-search"
                            type="text" placeholder="Buscar distrito…"
                            value={comboQuery}
                            onChange={e => setComboQuery(e.target.value)}
                            autoFocus
                          />
                        </div>
                        <div className="combo-list">
                          {filtered.length === 1 && filtered[0] === ADD_OTHER && comboQuery ? (
                            <div className="combo-empty">Sin resultados para "{comboQuery}"</div>
                          ) : null}
                          {filtered.map(d => (
                            <div
                              key={d}
                              className={`combo-item ${d === ADD_OTHER ? "add-other" : ""} ${d === distrito ? "selected" : ""}`}
                              onClick={() => {
                                setDistrito(d);
                                if (d !== ADD_OTHER) setDistritoCustom("");
                                setComboOpen(false);
                                setComboQuery("");
                              }}
                            >
                              {d}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Custom distrito */}
                {isAddOther && (
                  <div className="field conditional-field">
                    <label htmlFor="distrito-custom">Nombre del nuevo distrito</label>
                    <div className="input-wrap">
                      <input
                        id="distrito-custom" type="text"
                        placeholder="Escribe el nombre del distrito"
                        value={distritoCustom}
                        onChange={e => setDistritoCustom(e.target.value)}
                        autoFocus
                      />
                      <svg className="ico" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round"
                          d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>

              {/* ── Clasificación ── */}
              <div className="section-label" style={{ marginTop:24 }}>Clasificación</div>
              <div className="fields">
                <div className="field">
                  <label>Tipo de proyecto</label>
                  <div className="clasif-wrap">
                    {(["Malla","Extensión"] as Clasificacion[]).map(op => (
                      <button
                        key={op} type="button"
                        className={`clasif-option ${clasificacion === op ? "active" : ""}`}
                        onClick={() => setClasificacion(op)}
                      >
                        {op === "Malla" ? (
                          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round"
                              d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                          </svg>
                        ) : (
                          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round"
                              d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                          </svg>
                        )}
                        {op}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Conditional: Nombre extensión */}
                {clasificacion === "Extensión" && (
                  <div className="field conditional-field">
                    <label htmlFor="extension">Nombre de la Extensión</label>
                    <div className="input-wrap">
                      <input
                        id="extension" type="text"
                        placeholder="Ej. EXT RED A EDIFICIO LOS LAURELES"
                        value={extension}
                        onChange={e => setExtension(e.target.value)}
                        autoFocus
                      />
                      <svg className="ico" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round"
                          d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>

              {/* ── Error ── */}
              {(errorMsg || status === "error") && (
                <div className="error-banner" style={{ marginTop:18 }}>
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                  {errorMsg || "Error al guardar. Intenta de nuevo."}
                </div>
              )}

              {/* ── Submit ── */}
              <button type="submit" className="btn-submit" disabled={status === "saving"}>
                {status === "saving" ? (
                  <><span className="spinner" /> Guardando proyecto…</>
                ) : (
                  <>
                    <svg style={{ width:17,height:17 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                      <path strokeLinecap="round" strokeLinejoin="round"
                        d="M9 3.75H6.912a2.25 2.25 0 00-2.15 1.588L2.35 13.177a2.25 2.25 0 00-.1.661V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 00-2.15-1.588H15M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859M12 3v8.25m0 0l-3-3m3 3l3-3" />
                    </svg>
                    Guardar Proyecto
                  </>
                )}
              </button>

            </form>
          )}
        </div>
      </div>
    </>
  );
}