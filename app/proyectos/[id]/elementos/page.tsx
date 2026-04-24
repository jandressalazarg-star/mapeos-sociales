"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { 
  Trash2, Plus, Star, ArrowLeft, Save, Copy, X, Search, 
  Loader2, MapPin, Info, Edit3, Sparkles 
} from "lucide-react";

export default function GestionElementos() {
  const params = useParams();
  const router = useRouter();
  const proyectoId = params?.id as string;

  const [view, setView] = useState<"list" | "form">("list");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [elementos, setElementos] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  /* ── Form States ── */
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [nombre, setNombre] = useState("");
  const [comentarios, setComentarios] = useState("");

  const cargarDatos = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("elementos_valorados")
      .select("*")
      .eq("proyecto_id", proyectoId)
      .order("created_at", { ascending: false });
    if (data) setElementos(data);
    setLoading(false);
  };

  useEffect(() => { if (proyectoId) cargarDatos(); }, [proyectoId]);

  // Función para recortar a 10 palabras (se mantiene lógica útil)
  const recortarTexto = (texto: string) => {
    if (!texto) return "Sin descripción de ubicación";
    const palabras = texto.split(/\s+/);
    if (palabras.length <= 10) return texto;
    return palabras.slice(0, 10).join(" ") + "...";
  };

  const elementosFiltrados = elementos.filter(el => 
    el.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    el.comentarios_ubicacion?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const abrirFormulario = (el?: any, isDuplicate = false) => {
    if (el) {
      setSelectedId(isDuplicate ? null : el.id);
      setNombre(isDuplicate ? `${el.nombre} (Copia)` : el.nombre);
      setComentarios(el.comentarios_ubicacion || "");
    } else {
      setSelectedId(null); setNombre(""); setComentarios("");
    }
    setView("form");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      proyecto_id: proyectoId,
      nombre,
      comentarios_ubicacion: comentarios
    };

    if (selectedId) await supabase.from("elementos_valorados").update(payload).eq("id", selectedId);
    else await supabase.from("elementos_valorados").insert([payload]);

    await cargarDatos();
    setView("list");
    setSaving(false);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=DM+Sans:wght@400;500;700&display=swap');
        :root { --alfaco-azul: #283c91; --alfaco-plomo: #5a5a5a; --alfaco-celeste: #0aa0e1; --alfaco-oro: #d97706; --bg-main: #f4f7fa; }
        
        body { background: var(--bg-main); font-family: 'DM Sans', sans-serif; color: var(--alfaco-plomo); margin: 0; }
        .page { min-height: 100vh; padding-bottom: 40px; }

        .header { position: sticky; top: 0; z-index: 50; background: white; border-bottom: 1px solid #e2e8f0; padding: 12px 20px; display: flex; align-items: center; gap: 15px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
        .btn-icon-back { width: 38px; height: 38px; border-radius: 12px; border: 1px solid #e2e8f0; background: #f8fafc; color: var(--alfaco-azul); display: flex; align-items: center; justify-content: center; cursor: pointer; }

        .content { max-width: 600px; margin: 0 auto; padding: 20px; }

        .search-container { position: relative; margin-bottom: 20px; }
        .search-container input { width: 100%; height: 48px; background: white; border: 1.5px solid #e2e8f0; border-radius: 16px; padding: 0 15px 0 45px; outline: none; font-size: 14px; transition: 0.2s; }
        .search-container input:focus { border-color: var(--alfaco-celeste); box-shadow: 0 0 0 4px rgba(10,160,225,0.1); }
        .search-container svg { position: absolute; left: 16px; top: 14px; color: var(--alfaco-azul); opacity: 0.5; }

        .list-card { background: white; border-radius: 20px; padding: 18px; margin-bottom: 12px; border: 1px solid rgba(226, 232, 240, 0.8); cursor: pointer; transition: 0.2s; box-shadow: 0 4px 10px rgba(0,0,0,0.02); display: flex; align-items: flex-start; gap: 15px; }
        .list-card:hover { transform: translateY(-2px); border-color: var(--alfaco-celeste); box-shadow: 0 8px 20px rgba(40,60,145,0.06); }
        
        .icon-box { width: 44px; height: 44px; border-radius: 12px; background: #fffbeb; color: #fbbf24; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }

        .form-section { background: white; border-radius: 24px; padding: 22px; border: 1px solid #e2e8f0; margin-bottom: 16px; }
        .section-tag { font-size: 10px; font-weight: 800; color: var(--alfaco-celeste); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 15px; display: block; }
        
        label { display: block; font-size: 11px; color: var(--alfaco-azul); font-weight: 700; margin-bottom: 8px; text-transform: uppercase; opacity: 0.7; }
        input, textarea { width: 100%; background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 14px; padding: 12px 15px; color: var(--alfaco-plomo); font-size: 14px; outline: none; transition: 0.2s; }
        input:focus, textarea:focus { border-color: var(--alfaco-celeste); background: white; }

        .btn-main { 
          width: 100%; height: 58px; margin-top: 20px;
          background: linear-gradient(135deg, var(--alfaco-azul) 0%, var(--alfaco-celeste) 100%);
          color: white; border: none; border-radius: 20px; font-family: 'Sora'; font-weight: 700; font-size: 15px;
          text-transform: uppercase; letter-spacing: 0.5px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px;
          box-shadow: 0 10px 25px rgba(40,60,145,0.2); transition: 0.3s ease;
        }
        .btn-main:hover { transform: translateY(-2px); box-shadow: 0 15px 30px rgba(40,60,145,0.3); }
      `}</style>

      <div className="page">
        <header className="header">
          <button className="btn-icon-back" onClick={() => view === "list" ? router.push(`/proyectos/${proyectoId}`) : setView("list")}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 style={{ fontFamily: 'Sora', fontSize: '17px', fontWeight: 800, color: 'var(--alfaco-azul)', margin: 0 }}>Elementos Valorados</h1>
            <p style={{ fontSize: '11px', color: 'var(--alfaco-celeste)', fontWeight: 700 }}>PUNTOS DE INTERÉS Y PATRIMONIO</p>
          </div>
        </header>

        <div className="content">
          {view === "list" ? (
            <>
              <div className="search-container">
                <Search size={20} />
                <input type="text" placeholder="Buscar por nombre o descripción..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>

              <button className="btn-main" style={{ marginBottom: 25 }} onClick={() => abrirFormulario()}>
                <Plus size={20} /> REGISTRAR NUEVO ELEMENTO
              </button>

              {loading ? (
                <div style={{textAlign:'center', padding:'40px'}}><Loader2 className="animate-spin" color="var(--alfaco-azul)" /></div>
              ) : elementosFiltrados.length === 0 ? (
                <div style={{textAlign:'center', padding:'40px', opacity:0.5}}>
                  <Sparkles size={40} style={{margin:'0 auto 10px'}} />
                  <p>No hay elementos registrados aún.</p>
                </div>
              ) : (
                elementosFiltrados.map(el => (
                  <div key={el.id} className="list-card" onClick={() => abrirFormulario(el)}>
                    <div className="icon-box">
                      <Star size={22} fill="#fbbf24" stroke="#fbbf24" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{fontFamily:'Sora', fontSize:15, color:'var(--alfaco-azul)', margin:0}}>{el.nombre}</h3>
                      <p style={{fontSize:12, opacity:0.6, marginTop:4}}>{recortarTexto(el.comentarios_ubicacion)}</p>
                    </div>
                    <div style={{display:'flex', gap:8}}>
                      <button onClick={(e) => { e.stopPropagation(); abrirFormulario(el, true); }} style={{background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:10, padding:8, color:'var(--alfaco-azul)'}}><Copy size={18}/></button>
                      <button onClick={(e) => { e.stopPropagation(); if(confirm("¿Eliminar este elemento?")) supabase.from("elementos_valorados").delete().eq("id", el.id).then(cargarDatos); }} style={{background:'#fef2f2', border:'1px solid #fee2e2', borderRadius:10, padding:8, color:'#ef4444'}}><Trash2 size={18}/></button>
                    </div>
                  </div>
                ))
              )}
            </>
          ) : (
            <form onSubmit={handleSave}>
              <div className="form-section">
                <span className="section-tag">Detalles del Elemento</span>
                <div style={{marginBottom:16}}>
                  <label>Nombre del elemento valorado</label>
                  <input 
                    required 
                    value={nombre} 
                    onChange={e => setNombre(e.target.value)} 
                    placeholder="Ej. Monumento Histórico, Gruta, etc." 
                  />
                </div>
                <div>
                  <label>Comentarios / Ubicación Específica</label>
                  <textarea 
                    required
                    value={comentarios} 
                    onChange={e => setComentarios(e.target.value)} 
                    rows={6} 
                    placeholder="Describe la ubicación exacta" 
                  />
                </div>
              </div>

              <button type="submit" disabled={saving} className="btn-main">
                {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                {saving ? "GUARDANDO..." : "GUARDAR"}
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}