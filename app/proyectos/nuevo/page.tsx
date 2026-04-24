"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
/* Se agregó AlertCircle a la lista de importación */
import { 
  ArrowLeft, MapPin, Hash, Layers, CheckCircle2, 
  Loader2, PlusCircle, Search, Save, AlertCircle 
} from "lucide-react";

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

export default function NuevoProyectoPage() {
  const router = useRouter();

  const [codigo, setCodigo] = useState("");
  const [sector, setSector] = useState("");
  const [malla, setMalla] = useState("");
  const [distrito, setDistrito] = useState("");
  const [distritoCustom, setDistritoCustom] = useState("");
  const [clasificacion, setClasificacion] = useState<Clasificacion>("Malla");
  const [extension, setExtension] = useState("");

  const [comboQuery, setComboQuery] = useState("");
  const [comboOpen, setComboOpen] = useState(false);
  const comboRef = useRef<HTMLDivElement>(null);

  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const isAddOther = distrito === ADD_OTHER;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (comboRef.current && !comboRef.current.contains(e.target as Node))
        setComboOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = [
    ...DISTRITOS.filter(d => d.toLowerCase().includes(comboQuery.toLowerCase())),
    ADD_OTHER,
  ];

  const validate = () => {
    if (!codigo.trim()) return "El código de proyecto es obligatorio.";
    if (!/^\d{6}$/.test(sector)) return "El sector debe tener exactamente 6 dígitos.";
    if (!/^\d{3}$/.test(malla)) return "La malla debe tener exactamente 3 dígitos.";
    if (!distrito) return "Selecciona un distrito.";
    if (isAddOther && !distritoCustom.trim()) return "Escribe el nombre del nuevo distrito.";
    if (clasificacion === "Extensión" && !extension.trim()) return "El nombre de la extensión es obligatorio.";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) { setErrorMsg(err); return; }
    setErrorMsg("");
    setStatus("saving");

    const distritoFinal = isAddOther ? distritoCustom.trim() : distrito;

    const payload: any = {
      codigo: codigo.trim(),
      sector,
      malla,
      distrito: distritoFinal,
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

  const handleSector = (v: string) => { if (/^\d{0,6}$/.test(v)) setSector(v); };
  const handleMalla = (v: string) => { if (/^\d{0,3}$/.test(v)) setMalla(v); };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=DM+Sans:wght@400;500;700&display=swap');

        :root {
          --alfaco-azul: #283c91;
          --alfaco-plomo: #5a5a5a;
          --alfaco-celeste: #0aa0e1;
          --bg-main: #f4f7fa;
        }

        body { background: var(--bg-main); font-family: 'DM Sans', sans-serif; color: var(--alfaco-plomo); }

        .page { min-height: 100vh; padding: 20px 20px 60px; display: flex; flex-direction: column; align-items: center; }

        .top-nav { width: 100%; max-width: 500px; display: flex; align-items: center; gap: 15px; margin-bottom: 25px; }
        .btn-back { 
          width: 42px; height: 42px; border-radius: 14px; border: 1px solid #e2e8f0; 
          background: white; color: var(--alfaco-azul); display: flex; align-items: center; justify-content: center; cursor: pointer;
        }

        .card { 
          background: white; border-radius: 30px; padding: 35px 25px; width: 100%; max-width: 500px;
          border: 1px solid rgba(226, 232, 240, 0.8); box-shadow: 0 15px 35px rgba(40,60,145,0.05);
        }

        .card-header h1 { font-family: 'Sora'; font-size: 22px; font-weight: 800; color: var(--alfaco-azul); margin-bottom: 6px; }
        .card-header p { font-size: 14px; opacity: 0.6; margin-bottom: 30px; }

        .section-label { font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--alfaco-azul); letter-spacing: 1px; margin-bottom: 15px; opacity: 0.5; }

        .field { margin-bottom: 20px; }
        label { display: block; font-size: 12px; font-weight: 700; color: var(--alfaco-plomo); margin-bottom: 8px; margin-left: 4px; }
        
        .input-group { position: relative; display: flex; align-items: center; }
        .input-icon { position: absolute; left: 15px; color: var(--alfaco-azul); opacity: 0.4; }
        
        input, .combo-trigger {
          width: 100%; height: 54px; padding: 0 15px 0 45px; background: #f8fafc;
          border: 1.5px solid #e2e8f0; border-radius: 16px; color: var(--alfaco-plomo); font-size: 15px; outline: none; transition: 0.2s;
        }
        input:focus, .combo-trigger:focus { border-color: var(--alfaco-celeste); background: white; box-shadow: 0 0 0 4px rgba(10,160,225,0.1); }

        .switch-box { display: grid; grid-template-columns: 1fr 1fr; background: #f1f5f9; padding: 5px; border-radius: 18px; gap: 5px; }
        .switch-btn { 
          height: 44px; border-radius: 14px; border: none; font-family: 'Sora'; font-size: 13px; font-weight: 700; 
          cursor: pointer; transition: 0.2s; color: var(--alfaco-plomo); background: transparent;
        }
        .switch-btn.active { background: var(--alfaco-azul); color: white; box-shadow: 0 4px 10px rgba(40,60,145,0.2); }

        .combo-wrap { position: relative; }
        .combo-dropdown { 
          position: absolute; top: 100%; left: 0; right: 0; background: white; z-index: 100;
          border-radius: 18px; border: 1px solid #e2e8f0; margin-top: 8px; box-shadow: 0 15px 30px rgba(0,0,0,0.1);
          overflow: hidden; animation: slideDown 0.2s ease-out;
        }
        .combo-search-wrap { padding: 10px; border-bottom: 1px solid #f1f5f9; display: flex; align-items: center; }
        .combo-search-wrap input { height: 40px; padding: 0 35px; font-size: 13px; border-radius: 10px; }
        .combo-list { max-height: 200px; overflow-y: auto; padding: 8px; }
        .combo-item { padding: 12px 15px; border-radius: 10px; cursor: pointer; font-size: 14px; }
        .combo-item:hover { background: #f4f7fa; color: var(--alfaco-azul); }
        .combo-item.selected { background: rgba(10,160,225,0.1); color: var(--alfaco-celeste); font-weight: 700; }

        .btn-submit {
          width: 100%; height: 58px; margin-top: 20px;
          background: linear-gradient(135deg, var(--alfaco-azul) 0%, var(--alfaco-celeste) 100%);
          color: white; border: none; border-radius: 20px; font-family: 'Sora'; font-weight: 700; font-size: 16px;
          cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px;
          box-shadow: 0 10px 20px rgba(40,60,145,0.2); transition: 0.2s;
        }
        .btn-submit:hover { transform: translateY(-2px); box-shadow: 0 15px 25px rgba(40,60,145,0.3); }
        .btn-submit:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

        .success-card { text-align: center; padding: 20px 0; }
        .success-card svg { color: #34d399; margin-bottom: 15px; }

        .error-banner { 
          background: rgba(225,30,45,0.05); color: #e11e2d; padding: 12px; 
          border-radius: 12px; font-size: 13px; margin-top: 15px; border: 1px solid rgba(225,30,45,0.1);
          display: flex; align-items: center; gap: 8px;
        }

        @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <div className="page">
        <div className="top-nav">
          <button className="btn-back" onClick={() => router.back()}><ArrowLeft size={20} /></button>
          <span style={{ fontFamily: 'Sora', fontWeight: 700, color: 'var(--alfaco-azul)' }}>Nuevo Proyecto</span>
        </div>

        <div className="card">
          {status === "success" ? (
            <div className="success-card">
              <CheckCircle2 size={60} />
              <h2 style={{ fontFamily: 'Sora', color: 'var(--alfaco-azul)' }}>¡Registro Exitoso!</h2>
              <p>El proyecto ha sido guardado correctamente.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="card-header">
                <h1>Plano Constructivo</h1>
                <p>Ingresa los datos del proyecto.</p>
              </div>

              <div className="section-label">Identificación</div>
              
              <div className="field">
                <label>Código de Proyecto</label>
                <div className="input-group">
                  <Hash className="input-icon" size={18} />
                  <input 
                    type="text" placeholder="Ej: PPEO-24-001" 
                    value={codigo} onChange={e => setCodigo(e.target.value)} 
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="field">
                  <label>Sector (6 dígitos)</label>
                  <div className="input-group">
                    <Layers className="input-icon" size={18} />
                    <input 
                      type="text" placeholder="000100" 
                      value={sector} onChange={e => handleSector(e.target.value)} maxLength={6}
                    />
                  </div>
                </div>
                <div className="field">
                  <label>Malla (3 dígitos)</label>
                  <div className="input-group">
                    <Layers className="input-icon" size={18} />
                    <input 
                      type="text" placeholder="001" 
                      value={malla} onChange={e => handleMalla(e.target.value)} maxLength={3}
                    />
                  </div>
                </div>
              </div>

              <div className="section-label" style={{ marginTop: '10px' }}>Ubicación y Tipo</div>

              <div className="field">
                <label>Distrito</label>
                <div className="combo-wrap" ref={comboRef}>
                  <div className="input-group" onClick={() => setComboOpen(!comboOpen)}>
                    <MapPin className="input-icon" size={18} />
                    <div className="combo-trigger" style={{ display: 'flex', alignItems: 'center' }}>
                      {distrito && distrito !== ADD_OTHER ? distrito : "Seleccionar distrito..."}
                    </div>
                  </div>
                  
                  {comboOpen && (
                    <div className="combo-dropdown">
                      <div className="combo-search-wrap">
                        <Search style={{ position: 'absolute', left: '22px', opacity: 0.4 }} size={14} />
                        <input 
                          type="text" placeholder="Buscar..." 
                          value={comboQuery} onChange={e => setComboQuery(e.target.value)}
                          autoFocus
                        />
                      </div>
                      <div className="combo-list">
                        {filtered.map(d => (
                          <div 
                            key={d} 
                            className={`combo-item ${d === distrito ? "selected" : ""}`}
                            onClick={() => { setDistrito(d); setComboOpen(false); setComboQuery(""); }}
                          >
                            {d}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {isAddOther && (
                <div className="field">
                  <label>Especificar Distrito</label>
                  <div className="input-group">
                    <PlusCircle className="input-icon" size={18} />
                    <input 
                      type="text" placeholder="Nombre del distrito" 
                      value={distritoCustom} onChange={e => setDistritoCustom(e.target.value)} 
                    />
                  </div>
                </div>
              )}

              <div className="field">
                <label>Clasificación</label>
                <div className="switch-box">
                  <button 
                    type="button" className={`switch-btn ${clasificacion === "Malla" ? "active" : ""}`}
                    onClick={() => setClasificacion("Malla")}
                  >Malla</button>
                  <button 
                    type="button" className={`switch-btn ${clasificacion === "Extensión" ? "active" : ""}`}
                    onClick={() => setClasificacion("Extensión")}
                  >Extensión</button>
                </div>
              </div>

              {clasificacion === "Extensión" && (
                <div className="field">
                  <label>Nombre de la Extensión</label>
                  <div className="input-group">
                    <PlusCircle className="input-icon" size={18} />
                    <input 
                      type="text" placeholder="Ej: EXT RED A EDIFICIO LOS LAURELES" 
                      value={extension} onChange={e => setExtension(e.target.value)} 
                    />
                  </div>
                </div>
              )}

              {errorMsg && <div className="error-banner"><AlertCircle size={16}/> {errorMsg}</div>}

              <button type="submit" className="btn-submit" disabled={status === "saving"}>
                {status === "saving" ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                {status === "saving" ? "Guardando..." : "Guardar Proyecto"}
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}