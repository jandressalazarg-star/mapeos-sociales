"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Trash2, Plus, Star, ArrowLeft, ChevronRight, Copy, Save, Search, X } from "lucide-react";

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

  // Función para recortar a 10 palabras
  const recortarTexto = (texto: string) => {
    if (!texto) return "Sin descripción";
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
        .page { min-height: 100vh; background: #001e3c; color: #fff; font-family: 'DM Sans', sans-serif; padding-bottom: 40px; }
        .header { position: sticky; top: 0; z-index: 20; background: rgba(0,30,60,0.8); backdrop-filter: blur(15px); border-bottom: 1px solid rgba(255,255,255,0.1); padding: 15px 20px; display: flex; align-items: center; gap: 15px; }
        .content { max-width: 600px; margin: 0 auto; padding: 20px; }
        
        /* Buscador con acento Amarillo */
        .search-container { position: relative; margin-bottom: 20px; }
        .search-container input { width: 100%; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 14px; padding: 12px 12px 12px 42px; color: #fff; outline: none; transition: 0.2s; color-scheme: dark; }
        .search-container input:focus { border-color: #fbbf24; box-shadow: 0 0 0 1px #fbbf24; }
        .search-container svg { position: absolute; left: 14px; top: 13px; color: #fbbf24; opacity: 0.8; }

        .form-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; padding: 20px; margin-bottom: 16px; }
        label { display: block; font-size: 11px; color: #fbbf24; font-weight: 700; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; }
        input, textarea { width: 100%; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 12px; color: #fff; font-size: 14px; outline: none; color-scheme: dark; }
        
        /* Botón Principal Amarillo */
        .btn-main { width: 100%; padding: 16px; border-radius: 12px; border: none; background: linear-gradient(135deg, #b45309, #fbbf24); color: #fff; font-family: 'Sora'; font-weight: 800; cursor: pointer; box-shadow: 0 4px 15px rgba(251,191,36,0.2); transition: 0.2s; }
        .btn-main:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(251,191,36,0.3); }

        .list-card { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 16px; margin-bottom: 12px; display: flex; align-items: flex-start; justify-content: space-between; cursor: pointer; transition: 0.2s; }
        .list-card:hover { background: rgba(255,255,255,0.08); border-color: rgba(251,191,36,0.3); }
        
        .info { flex: 1; padding-right: 10px; }
        .info h3 { font-family: 'Sora'; font-size: 15px; font-weight: 700; margin-bottom: 4px; color: #fff; }
        .info p { font-size: 12px; color: #fbbf24; opacity: 0.7; line-height: 1.4; }

        .actions { display: flex; gap: 10px; flex-shrink: 0; padding-top: 5px; }
      `}</style>

      <div className="page">
        <div className="header">
          <button onClick={() => view === "list" ? router.push(`/proyectos/${proyectoId}`) : setView("list")} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 style={{ fontFamily: 'Sora', fontSize: '18px', fontWeight: 800 }}>Elementos Valorados</h1>
            <p style={{ fontSize: '11px', color: '#fbbf24' }}>Patrimonio y Puntos de Interés</p>
          </div>
        </div>

        <div className="content">
          {view === "list" ? (
            <>
              <div className="search-container">
                <Search size={18} />
                <input 
                  type="text" 
                  placeholder="Buscar por nombre o ubicación..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <button className="btn-main" style={{ marginBottom: 25 }} onClick={() => abrirFormulario()}>
                <Plus size={18} style={{ marginRight: 8, strokeWidth: 3 }} /> REGISTRAR NUEVO ELEMENTO
              </button>

              {loading ? (
                <p style={{ textAlign: 'center', opacity: 0.5 }}>Cargando elementos...</p>
              ) : elementosFiltrados.length === 0 ? (
                <p style={{ textAlign: 'center', opacity: 0.3, padding: 20 }}>No se encontraron elementos.</p>
              ) : (
                elementosFiltrados.map(el => (
                  <div key={el.id} className="list-card" onClick={() => abrirFormulario(el)}>
                    <div className="info">
                      <h3>{el.nombre}</h3>
                      <p>{recortarTexto(el.comentarios_ubicacion)}</p>
                    </div>
                    <div className="actions">
                      <button onClick={(e) => { e.stopPropagation(); abrirFormulario(el, true); }} style={{ background: 'none', border: 'none', color: '#93c5fd' }} title="Duplicar"><Copy size={18} /></button>
                      <button onClick={(e) => { e.stopPropagation(); if(confirm("¿Eliminar?")) supabase.from("elementos_valorados").delete().eq("id", el.id).then(cargarDatos); }} style={{ background: 'none', border: 'none', color: '#f87171' }}><Trash2 size={18} /></button>
                    </div>
                  </div>
                ))
              )}
            </>
          ) : (
            <form onSubmit={handleSave}>
              <div className="form-card">
                <label>Nombre del elemento valorado</label>
                <input 
                  required 
                  value={nombre} 
                  onChange={e => setNombre(e.target.value)} 
                  placeholder="Ej. Gruta de la Virgen..." 
                />
              </div>

              <div className="form-card">
                <label>Comentarios / Ubicación</label>
                <textarea 
                  required
                  value={comentarios} 
                  onChange={e => setComentarios(e.target.value)} 
                  rows={6} 
                  placeholder="Escribe la ubicación detallada..." 
                />
              </div>

              <button type="submit" disabled={saving} className="btn-main">
                {saving ? "GUARDANDO..." : "GUARDAR ELEMENTO"}
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}