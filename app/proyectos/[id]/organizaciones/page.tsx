"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Trash2, Plus, Users, ArrowLeft, Save, ChevronRight, Copy, X, Phone, Mail, User, MapPin, Search, Loader2, ChevronDown } from "lucide-react";

interface Contacto {
  nombre: string;
  cargo: string;
  telefono: string;
  correo: string;
  direccion: string;
}

export default function GestionOrganizaciones() {
  const params = useParams();
  const router = useRouter();
  const proyectoId = params?.id as string;

  const [view, setView] = useState<"list" | "form">("list");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [organizaciones, setOrganizaciones] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  /* ── Form States ── */
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [nombre, setNombre] = useState("");
  const [alcance, setAlcance] = useState("");
  const [tieneDirigencia, setTieneDirigencia] = useState("");
  const [contactos, setContactos] = useState<Contacto[]>([]);
  const [comentarios, setComentarios] = useState("");

  /* ── Refs ── */
  const [openAlcance, setOpenAlcance] = useState(false);
  const [openDirigencia, setOpenDirigencia] = useState(false);
  const alcanceRef = useRef<HTMLDivElement>(null);
  const dirigenciaRef = useRef<HTMLDivElement>(null);

  const cargarDatos = async () => {
    setLoading(true);
    const { data } = await supabase.from("organizaciones").select("*").eq("proyecto_id", proyectoId).order("created_at", { ascending: false });
    if (data) setOrganizaciones(data);
    setLoading(false);
  };

  useEffect(() => { if (proyectoId) cargarDatos(); }, [proyectoId]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (alcanceRef.current && !alcanceRef.current.contains(e.target as Node)) setOpenAlcance(false);
      if (dirigenciaRef.current && !dirigenciaRef.current.contains(e.target as Node)) setOpenDirigencia(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const elementosFiltrados = organizaciones.filter(org => 
    org.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const abrirFormulario = (org?: any, isDuplicate = false) => {
    if (org) {
      setSelectedId(isDuplicate ? null : org.id);
      setNombre(isDuplicate ? `${org.nombre} (Copia)` : org.nombre);
      setAlcance(org.alcance || "");
      setTieneDirigencia(org.tiene_dirigencia ? "Sí" : "No");
      setContactos(org.contactos?.length > 0 ? org.contactos : [{ nombre: "", cargo: "", telefono: "", correo: "", direccion: "" }]);
      setComentarios(org.comentarios || "");
    } else {
      setSelectedId(null); setNombre(""); setAlcance(""); setTieneDirigencia("");
      setContactos([{ nombre: "", cargo: "", telefono: "", correo: "", direccion: "" }]);
      setComentarios("");
    }
    setView("form");
  };

  const agregarContacto = () => {
    setContactos([...contactos, { nombre: "", cargo: "", telefono: "", correo: "", direccion: "" }]);
  };

  const eliminarContacto = (index: number) => {
    setContactos(contactos.filter((_, i) => i !== index));
  };

  const updateContacto = (index: number, field: keyof Contacto, value: string) => {
    const nuevos = [...contactos];
    nuevos[index][field] = value;
    setContactos(nuevos);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      proyecto_id: proyectoId,
      nombre,
      alcance,
      tiene_dirigencia: tieneDirigencia === "Sí",
      contactos: tieneDirigencia === "Sí" ? contactos : [],
      comentarios
    };

    if (selectedId) await supabase.from("organizaciones").update(payload).eq("id", selectedId);
    else await supabase.from("organizaciones").insert([payload]);

    await cargarDatos(); setView("list"); setSaving(false);
  };

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
        .page { min-height: 100vh; padding-bottom: 40px; }

        .header { 
          position: sticky; top: 0; z-index: 50; background: white; 
          border-bottom: 1px solid #e2e8f0; padding: 12px 20px; 
          display: flex; align-items: center; gap: 15px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.03);
        }

        .btn-icon-back {
          width: 38px; height: 38px; border-radius: 12px; border: 1px solid #e2e8f0;
          background: #f8fafc; color: var(--alfaco-azul); display: flex; 
          align-items: center; justify-content: center; cursor: pointer;
        }

        .content { max-width: 600px; margin: 0 auto; padding: 20px; }
        
        .search-container { position: relative; margin-bottom: 20px; }
        .search-container input { 
          width: 100%; height: 48px; background: white; border: 1.5px solid #e2e8f0; 
          border-radius: 16px; padding: 0 15px 0 45px; color: var(--alfaco-plomo); 
          outline: none; font-size: 14px; transition: 0.2s;
        }
        .search-container input:focus { border-color: var(--alfaco-celeste); box-shadow: 0 0 0 4px rgba(10,160,225,0.1); }
        .search-container svg { position: absolute; left: 16px; top: 15px; color: var(--alfaco-celeste); }

        .list-card { 
          background: white; border-radius: 20px; padding: 18px; margin-bottom: 12px; 
          display: flex; align-items: center; justify-content: space-between; 
          border: 1px solid rgba(226, 232, 240, 0.8); cursor: pointer;
          transition: 0.2s; box-shadow: 0 4px 10px rgba(0,0,0,0.02);
        }
        .list-card:hover { transform: translateY(-2px); border-color: var(--alfaco-celeste); box-shadow: 0 8px 20px rgba(40,60,145,0.06); }

        .form-card { background: white; border-radius: 24px; padding: 22px; border: 1px solid #e2e8f0; margin-bottom: 16px; }
        
        /* ✨ El contenedor ahora es overflow: visible para que el botón flote fuera si es necesario ✨ */
        .contact-block { background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 20px; padding: 20px; margin-bottom: 25px; position: relative; overflow: visible; }
        
        label { display: block; font-size: 11px; color: var(--alfaco-azul); font-weight: 700; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; opacity: 0.7; }
        
        input, textarea { 
          width: 100%; background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 14px; 
          padding: 12px 15px; color: var(--alfaco-plomo); font-size: 14px; outline: none; transition: 0.2s;
        }
        input:focus, textarea:focus { border-color: var(--alfaco-celeste); background: white; }

        .custom-select-wrap { position: relative; }
        .select-trigger {
          width: 100%; height: 48px; background: #f8fafc; border: 1.5px solid #e2e8f0; 
          border-radius: 14px; padding: 0 15px; display: flex; align-items: center; 
          justify-content: space-between; cursor: pointer; font-size: 14px; transition: 0.2s;
        }
        .select-trigger.has-val { color: var(--alfaco-plomo); font-weight: 500; }
        .select-trigger.placeholder { color: #94a3b8; }

        .select-dropdown {
          position: absolute; top: 100%; left: 0; right: 0; background: white; z-index: 100;
          border-radius: 18px; border: 1px solid #e2e8f0; margin-top: 8px; 
          box-shadow: 0 15px 35px rgba(0,0,0,0.1); overflow: hidden;
          animation: slideDown 0.2s ease-out both; padding: 6px;
        }
        
        .select-item { 
          padding: 12px 15px; cursor: pointer; font-size: 14px; transition: 0.2s;
          border-radius: 12px;
        }
        .select-item:hover { background: #f4f7fa; color: var(--alfaco-azul); }
        .select-item.selected { background: rgba(10,160,225,0.08); color: var(--alfaco-celeste); font-weight: 700; }

        @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }

        .btn-main { 
          width: 100%; padding: 16px; border-radius: 16px; border: none; 
          background: linear-gradient(135deg, var(--alfaco-azul), var(--alfaco-celeste)); 
          color: #fff; font-family: 'Sora'; font-weight: 700; cursor: pointer; 
          box-shadow: 0 8px 20px rgba(40,60,145,0.2); transition: 0.2s;
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .btn-main:hover { transform: translateY(-2px); box-shadow: 0 12px 25px rgba(40,60,145,0.3); }

        .btn-add { 
          background: white; border: 1.5px dashed var(--alfaco-celeste); color: var(--alfaco-celeste); 
          padding: 12px; border-radius: 14px; width: 100%; cursor: pointer; font-family: 'Sora';
          font-weight: 700; font-size: 13px; display: flex; align-items: center; justify-content: center; 
          gap: 8px; margin-bottom: 25px;
        }

        .input-ico-wrap { position: relative; margin-bottom: 12px; }
        .input-ico-wrap svg { position: absolute; left: 14px; top: 14px; color: var(--alfaco-azul); opacity: 0.5; }
        .input-ico-wrap input { padding-left: 42px; }
      `}</style>

      <div className="page">
        <div className="header">
          <button className="btn-icon-back" onClick={() => view === "list" ? router.push(`/proyectos/${proyectoId}`) : setView("list")}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 style={{ fontFamily: 'Sora', fontSize: '17px', fontWeight: 800, color: 'var(--alfaco-azul)', margin: 0 }}>Organizaciones Sociales</h1>
            <p style={{ fontSize: '11px', color: 'var(--alfaco-celeste)', fontWeight: 700 }}>MAPEO DE ACTORES SOCIALES</p>
          </div>
        </div>

        <div className="content">
          {view === "list" ? (
            <>
              <div className="search-container">
                <Search size={20} />
                <input type="text" placeholder="Buscar por nombre..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>

              <button className="btn-main" style={{ marginBottom: 25 }} onClick={() => abrirFormulario()}>
                <Plus size={20} /> REGISTRAR NUEVA ORGANIZACIÓN
              </button>
              
              {loading ? (
                <div style={{textAlign:'center', padding:'40px'}}><Loader2 className="animate-spin" color="var(--alfaco-azul)" /></div>
              ) : (
                elementosFiltrados.map(org => (
                  <div key={org.id} className="list-card" onClick={() => abrirFormulario(org)}>
                    <div>
                      <h3 style={{fontFamily:'Sora', fontSize:16, color:'var(--alfaco-azul)', margin:'0 0 4px 0'}}>{org.nombre}</h3>
                      <p style={{fontSize:12, opacity:0.6}}>Alcance: {org.alcance || "--"}</p>
                    </div>
                    <div style={{display:'flex', gap:8}}>
                      <button onClick={(e) => { e.stopPropagation(); abrirFormulario(org, true); }} style={{background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:10, padding:8, color:'var(--alfaco-celeste)'}}><Copy size={18}/></button>
                      <button onClick={(e) => { e.stopPropagation(); if(confirm("¿Eliminar?")) supabase.from("organizaciones").delete().eq("id", org.id).then(cargarDatos); }} style={{background:'#fef2f2', border:'1px solid #fee2e2', borderRadius:10, padding:8, color:'#ef4444'}}><Trash2 size={18}/></button>
                    </div>
                  </div>
                ))
              )}
            </>
          ) : (
            <form onSubmit={handleSave}>
              <div className="form-card">
                <label>Nombre de la Organización</label>
                <input required value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Ej. Junta Vecinal Los Pinos" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}>
                <div className="form-card" style={{ overflow: 'visible' }}>
                  <label>Alcance</label>
                  <div className="custom-select-wrap" ref={alcanceRef}>
                    <div className={`select-trigger ${alcance ? 'has-val' : 'placeholder'}`} onClick={() => setOpenAlcance(!openAlcance)}>
                      {alcance || "Seleccionar..."}
                      <ChevronDown size={16} style={{ opacity: 0.5 }} />
                    </div>
                    {openAlcance && (
                      <div className="select-dropdown">
                        {["Total", "Parcial"].map(opt => (
                          <div key={opt} className={`select-item ${alcance === opt ? 'selected' : ''}`} onClick={() => { setAlcance(opt); setOpenAlcance(false); }}>
                            {opt}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-card" style={{ overflow: 'visible' }}>
                  <label>¿Se encontró Dirigencia?</label>
                  <div className="custom-select-wrap" ref={dirigenciaRef}>
                    <div className={`select-trigger ${tieneDirigencia ? 'has-val' : 'placeholder'}`} onClick={() => setOpenDirigencia(!openDirigencia)}>
                      {tieneDirigencia || "Seleccionar..."}
                      <ChevronDown size={16} style={{ opacity: 0.5 }} />
                    </div>
                    {openDirigencia && (
                      <div className="select-dropdown">
                        {["Sí", "No"].map(opt => (
                          <div key={opt} className={`select-item ${tieneDirigencia === opt ? 'selected' : ''}`} onClick={() => { setTieneDirigencia(opt); setOpenDirigencia(false); }}>
                            {opt}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {tieneDirigencia === "Sí" && (
                <>
                  <h3 style={{fontFamily:'Sora', fontSize:14, color:'var(--alfaco-azul)', margin:'10px 0 15px 5px'}}>Contactos</h3>
                  {contactos.map((c, i) => (
                    <div key={i} className="contact-block">
                      <div className="input-ico-wrap"><User size={18}/><input value={c.nombre} onChange={e => updateContacto(i, "nombre", e.target.value)} placeholder="Nombres completos" /></div>
                      <div style={{marginBottom:15}}><label>Cargo</label><input value={c.cargo} onChange={e => updateContacto(i, "cargo", e.target.value)} placeholder="Ej. Presidente" /></div>
                      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:15}}>
                        <div><label>Teléfono</label><div className="input-ico-wrap"><Phone size={18}/><input value={c.telefono} onChange={e => updateContacto(i, "telefono", e.target.value)} placeholder="999..." /></div></div>
                        <div><label>Correo</label><div className="input-ico-wrap"><Mail size={18}/><input value={c.correo} onChange={e => updateContacto(i, "correo", e.target.value)} placeholder="correo@..." /></div></div>
                      </div>
                      <label>Dirección</label>
                      <div className="input-ico-wrap" style={{marginBottom:0}}><MapPin size={18}/><input value={c.direccion} onChange={e => updateContacto(i, "direccion", e.target.value)} placeholder="Dirección" /></div>

                      {/* ✨ BOTÓN ELIMINAR MOVIDO A LA ESQUINA SUPERIOR IZQUIERDA (FLOTANTE) ✨ */}
                      {contactos.length > 1 && (
                        <button 
                          type="button" 
                          onClick={() => eliminarContacto(i)} 
                          style={{
                            position:'absolute', 
                            left: '-10px', 
                            top: '-10px', 
                            color:'#ef4444', 
                            background:'#fff1f1', 
                            border:'1.5px solid #fee2e2', 
                            borderRadius:'12px', 
                            width: '38px',
                            height: '38px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)',
                            zIndex: 999, /* Por encima de todo */
                            cursor: 'pointer'
                          }}
                        >
                          <Trash2 size={20}/>
                        </button>
                      )}
                    </div>
                  ))}
                  <button type="button" className="btn-add" onClick={agregarContacto}><Plus size={16}/> AGREGAR OTRO CONTACTO</button>
                </>
              )}

              <div className="form-card">
                <label>Notas de Gestión</label>
                <textarea value={comentarios} onChange={e => setComentarios(e.target.value)} rows={4} placeholder="Detalles relevantes..." />
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