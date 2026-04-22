"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Trash2, Plus, Users, ArrowLeft, Save, ChevronRight, Copy, X, Phone, Mail, User, MapPin, Search } from "lucide-react";

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

  const cargarDatos = async () => {
    setLoading(true);
    const { data } = await supabase.from("organizaciones").select("*").eq("proyecto_id", proyectoId).order("created_at", { ascending: false });
    if (data) setOrganizaciones(data);
    setLoading(false);
  };

  useEffect(() => { if (proyectoId) cargarDatos(); }, [proyectoId]);

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
        .page { min-height: 100vh; background: #001e3c; color: #fff; font-family: 'DM Sans', sans-serif; padding-bottom: 40px; }
        .header { position: sticky; top: 0; z-index: 20; background: rgba(0,30,60,0.8); backdrop-filter: blur(15px); border-bottom: 1px solid rgba(255,255,255,0.1); padding: 15px 20px; display: flex; align-items: center; gap: 15px; }
        .content { max-width: 600px; margin: 0 auto; padding: 20px; }
        
        .search-container { position: relative; margin-bottom: 20px; }
        .search-container input { width: 100%; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 14px; padding: 12px 12px 12px 42px; color: #fff; outline: none; color-scheme: dark; }
        .search-container svg { position: absolute; left: 14px; top: 13px; color: #3b82f6; opacity: 0.6; }

        .form-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; padding: 20px; margin-bottom: 16px; }
        .contact-block { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 15px; padding: 15px; margin-bottom: 15px; position: relative; }
        label { display: block; font-size: 11px; color: #93c5fd; font-weight: 700; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; }
        
        input, select, textarea { width: 100%; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 12px; color: #fff; font-size: 14px; outline: none; color-scheme: dark; }
        select option { background-color: #01162b; color: #ffffff; }

        .btn-main { width: 100%; padding: 16px; border-radius: 12px; border: none; background: linear-gradient(135deg, #0a4080, #2563eb); color: #fff; font-family: 'Sora'; font-weight: 700; cursor: pointer; box-shadow: 0 4px 15px rgba(37,99,235,0.3); }
        .btn-add { background: none; border: 1px dashed rgba(59,130,246,0.4); color: #93c5fd; padding: 10px; border-radius: 10px; width: 100%; cursor: pointer; font-size: 13px; display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 20px; }
        
        .list-card { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 16px; margin-bottom: 12px; display: flex; align-items: center; justify-content: space-between; cursor: pointer; }
        .input-ico-wrap { position: relative; margin-bottom: 10px; }
        .input-ico-wrap svg { position: absolute; left: 12px; top: 12px; opacity: 0.4; }
        .input-ico-wrap input { padding-left: 40px; }
      `}</style>

      <div className="page">
        <div className="header">
          <button onClick={() => view === "list" ? router.push(`/proyectos/${proyectoId}`) : setView("list")} style={{ background: 'none', border: 'none', color: '#fff' }}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 style={{ fontFamily: 'Sora', fontSize: '18px', fontWeight: 800 }}>Organizaciones Sociales</h1>
            <p style={{ fontSize: '11px', color: '#93c5fd' }}>Mapeo de Actores</p>
          </div>
        </div>

        <div className="content">
          {view === "list" ? (
            <>
              <div className="search-container">
                <Search size={18} />
                <input type="text" placeholder="Buscar organización..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>

              <button className="btn-main" style={{ marginBottom: 20 }} onClick={() => abrirFormulario()}>
                <Plus size={18} style={{ marginRight: 8 }} /> REGISTRAR ORGANIZACIÓN
              </button>
              
              {elementosFiltrados.map(org => (
                <div key={org.id} className="list-card" onClick={() => abrirFormulario(org)}>
                  <div>
                    <h3 style={{fontFamily:'Sora', fontSize:15}}>{org.nombre}</h3>
                    <p style={{fontSize:12, color:'#93c5fd'}}>Alcance: {org.alcance || "--"}</p>
                  </div>
                  <div style={{display:'flex', gap:10}}>
                    <button onClick={(e) => { e.stopPropagation(); abrirFormulario(org, true); }} style={{background:'none', border:'none', color:'#93c5fd'}}><Copy size={18}/></button>
                    <button onClick={(e) => { e.stopPropagation(); if(confirm("¿Eliminar?")) supabase.from("organizaciones").delete().eq("id", org.id).then(cargarDatos); }} style={{background:'none', border:'none', color:'#f87171'}}><Trash2 size={18}/></button>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <form onSubmit={handleSave}>
              <div className="form-card">
                <label>Nombre de la Organización</label>
                <input required value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Ej. Junta Vecinal Los Pinos" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-card">
                  <label>Alcance en el proyecto</label>
                  <select value={alcance} onChange={e => setAlcance(e.target.value)}>
                    <option value="">--</option>
                    <option value="Total">Total</option>
                    <option value="Parcial">Parcial</option>
                  </select>
                </div>
                <div className="form-card">
                  <label>¿Se encontró dirigencia?</label>
                  <select value={tieneDirigencia} onChange={e => setTieneDirigencia(e.target.value)}>
                    <option value="">--</option>
                    <option value="Sí">Sí</option>
                    <option value="No">No</option>
                  </select>
                </div>
              </div>

              {tieneDirigencia === "Sí" && (
                <>
                  <div style={{marginBottom:10}}><label>Datos de Contacto</label></div>
                  {contactos.map((c, i) => (
                    <div key={i} className="contact-block">
                      {contactos.length > 1 && (
                        <button type="button" onClick={() => eliminarContacto(i)} style={{position:'absolute', right:10, top:10, color:'#f87171', background:'none', border:'none'}}><X size={16}/></button>
                      )}
                      <div className="input-ico-wrap">
                        <User size={16}/><input value={c.nombre} onChange={e => updateContacto(i, "nombre", e.target.value)} placeholder="Nombre y Apellido" />
                      </div>
                      <label style={{marginTop:10, color:'rgba(255,255,255,0.4)', fontSize:'10px'}}>Cargo</label>
                      <input style={{marginBottom:10}} value={c.cargo} onChange={e => updateContacto(i, "cargo", e.target.value)} placeholder="Ej. Presidente, Representante, etc..." />
                      
                      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10}}>
                        <div>
                          <label style={{color:'rgba(255,255,255,0.4)', fontSize:'10px'}}>Teléfono</label>
                          <div className="input-ico-wrap"><Phone size={16}/><input value={c.telefono} onChange={e => updateContacto(i, "telefono", e.target.value)} placeholder="999..." /></div>
                        </div>
                        <div>
                          <label style={{color:'rgba(255,255,255,0.4)', fontSize:'10px'}}>Correo</label>
                          <div className="input-ico-wrap"><Mail size={16}/><input value={c.correo} onChange={e => updateContacto(i, "correo", e.target.value)} placeholder="correo@gmail.com" /></div>
                        </div>
                      </div>

                      <label style={{color:'rgba(255,255,255,0.4)', fontSize:'10px'}}>Dirección</label>
                      <div className="input-ico-wrap">
                        <MapPin size={16}/><input value={c.direccion} onChange={e => updateContacto(i, "direccion", e.target.value)} placeholder="Ej. Ca. María Curie 410" />
                      </div>
                    </div>
                  ))}
                  <button type="button" className="btn-add" onClick={agregarContacto}><Plus size={14}/> Agregar nuevo contacto</button>
                </>
              )}

              <div className="form-card">
                <label>Comentarios / Nota de Gestión</label>
                <textarea value={comentarios} onChange={e => setComentarios(e.target.value)} rows={4} placeholder="Detalles de la gestión o acuerdos..." />
              </div>

              <button type="submit" disabled={saving} className="btn-main">
                {saving ? "GUARDANDO..." : "GUARDAR CAMBIOS"}
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}