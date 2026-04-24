"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { 
  Trash2, Plus, Landmark, ArrowLeft, Save, Copy, X, Phone, Mail, 
  User, MapPin, Search, Loader2, ChevronDown, Building2, Info 
} from "lucide-react";

interface Contacto {
  nombre: string;
  cargo: string;
  telefono: string;
  correo: string;
  direccion: string;
}

export default function GestionInstituciones() {
  const params = useParams();
  const router = useRouter();
  const proyectoId = params?.id as string;

  const [view, setView] = useState<"list" | "form">("list");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [instituciones, setInstituciones] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  /* ── Form States ── */
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [nombre, setNombre] = useState("");
  const [tipo, setTipo] = useState("");
  const [otroTipo, setOtroTipo] = useState("");
  const [impacto, setImpacto] = useState("");
  const [brindoInfo, setBrindoInfo] = useState(""); 
  const [contactos, setContactos] = useState<Contacto[]>([]);
  const [comentarios, setComentarios] = useState("");

  /* ── Control de Dropdowns ── */
  const [activeDrop, setActiveDrop] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const cargarDatos = async () => {
    setLoading(true);
    const { data } = await supabase.from("instituciones").select("*").eq("proyecto_id", proyectoId).order("created_at", { ascending: false });
    if (data) setInstituciones(data);
    setLoading(false);
  };

  useEffect(() => { if (proyectoId) cargarDatos(); }, [proyectoId]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setActiveDrop(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const elementosFiltrados = instituciones.filter(inst => 
    inst.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const abrirFormulario = (inst?: any, isDuplicate = false) => {
    if (inst) {
      setSelectedId(isDuplicate ? null : inst.id);
      setNombre(isDuplicate ? `${inst.nombre} (Copia)` : inst.nombre);
      setTipo(inst.tipo_institucion || "");
      setImpacto(inst.impacto || "");
      setBrindoInfo(inst.brindo_informacion || "");
      setContactos(inst.contactos?.length > 0 ? inst.contactos : [{ nombre: "", cargo: "", telefono: "", correo: "", direccion: "" }]);
      setComentarios(inst.comentarios || "");
    } else {
      setSelectedId(null); setNombre(""); setTipo(""); setOtroTipo(""); setImpacto("");
      setBrindoInfo(""); 
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
      tipo_institucion: tipo === "Otro" ? otroTipo : tipo,
      impacto,
      brindo_informacion: brindoInfo,
      contactos: brindoInfo === "Sí" ? contactos : [],
      comentarios
    };

    if (selectedId) await supabase.from("instituciones").update(payload).eq("id", selectedId);
    else await supabase.from("instituciones").insert([payload]);

    await cargarDatos(); setView("list"); setSaving(false);
  };

  /* ── UI Components ── */
  const CustomSelect = ({ label, value, options, onChange, id }: any) => (
    <div className="custom-select-wrap">
      <label>{label}</label>
      <div className="select-container" onClick={() => setActiveDrop(activeDrop === id ? null : id)}>
        <div className={`select-trigger ${value ? 'has-val' : 'placeholder'}`}>
          {value || "Seleccionar..."}
          <ChevronDown size={16} />
        </div>
        {activeDrop === id && (
          <div className="select-dropdown">
            {options.map((opt: string) => (
              <div 
                key={opt} 
                className={`select-item ${value === opt ? 'selected' : ''}`} 
                onClick={(e) => { e.stopPropagation(); onChange(opt); setActiveDrop(null); }}
              >
                {opt}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const ToggleSwitch = ({ label, value, onChange }: any) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
      <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--alfaco-azul)' }}>{label}</span>
      <div className="switch-container">
        <button type="button" className={`sw-btn ${value === 'Sí' ? 'active-si' : ''}`} onClick={() => onChange('Sí')}>Sí</button>
        <button type="button" className={`sw-btn ${value === 'No' ? 'active-no' : ''}`} onClick={() => onChange('No')}>No</button>
      </div>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=DM+Sans:wght@400;500;700&display=swap');
        :root { --alfaco-azul: #283c91; --alfaco-plomo: #5a5a5a; --alfaco-celeste: #0aa0e1; --bg-main: #f4f7fa; }
        body { background: var(--bg-main); font-family: 'DM Sans', sans-serif; color: var(--alfaco-plomo); margin: 0; }
        .page { min-height: 100vh; padding-bottom: 40px; }
        
        .header { position: sticky; top: 0; z-index: 50; background: white; border-bottom: 1px solid #e2e8f0; padding: 12px 20px; display: flex; align-items: center; gap: 15px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
        .btn-icon-back { width: 38px; height: 38px; border-radius: 12px; border: 1px solid #e2e8f0; background: #f8fafc; color: var(--alfaco-azul); display: flex; align-items: center; justify-content: center; cursor: pointer; }
        
        .content { max-width: 600px; margin: 0 auto; padding: 20px; }
        
        .list-card { background: white; border-radius: 20px; padding: 18px; margin-bottom: 12px; border: 1px solid rgba(226, 232, 240, 0.8); cursor: pointer; transition: 0.2s; box-shadow: 0 4px 10px rgba(0,0,0,0.02); }
        .list-card:hover { transform: translateY(-2px); border-color: var(--alfaco-celeste); box-shadow: 0 8px 20px rgba(40,60,145,0.06); }

        .form-section { background: white; border-radius: 24px; padding: 22px; border: 1px solid #e2e8f0; margin-bottom: 16px; overflow: visible; }
        .section-tag { font-size: 10px; font-weight: 800; color: var(--alfaco-celeste); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 15px; display: block; }
        
        label { display: block; font-size: 11px; color: var(--alfaco-azul); font-weight: 700; margin-bottom: 8px; text-transform: uppercase; opacity: 0.7; }
        input, textarea { width: 100%; background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 14px; padding: 12px 15px; color: var(--alfaco-plomo); font-size: 14px; outline: none; transition: 0.2s; }
        input:focus { border-color: var(--alfaco-celeste); background: white; }

        .select-container { position: relative; cursor: pointer; }
        .select-trigger { height: 48px; background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 14px; padding: 0 15px; display: flex; align-items: center; justify-content: space-between; font-size: 14px; transition: 0.2s; }
        .select-trigger.has-val { color: var(--alfaco-plomo); font-weight: 600; }
        
        .select-dropdown { position: absolute; top: 100%; left: 0; right: 0; background: white; z-index: 100; border-radius: 16px; border: 1px solid #e2e8f0; margin-top: 6px; box-shadow: 0 12px 25px rgba(0,0,0,0.1); animation: slideDown 0.2s ease-out; padding: 6px; }
        .select-item { padding: 10px 14px; font-size: 14px; border-radius: 10px; transition: 0.2s; }
        .select-item:hover { background: #f4f7fa; color: var(--alfaco-azul); }
        .select-item.selected { background: rgba(10,160,225,0.08); color: var(--alfaco-celeste); font-weight: 700; }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }

        .switch-container { display: flex; background: #f1f5f9; padding: 4px; border-radius: 12px; gap: 4px; }
        .sw-btn { border: none; padding: 6px 16px; border-radius: 8px; font-size: 12px; font-weight: 700; cursor: pointer; transition: 0.2s; background: transparent; color: var(--alfaco-plomo); }
        .sw-btn.active-si { background: var(--alfaco-azul); color: white; box-shadow: 0 2px 6px rgba(40,60,145,0.3); }
        .sw-btn.active-no { background: var(--alfaco-plomo); color: white; }

        .btn-main { 
          width: 100%; height: 58px; margin-top: 20px;
          background: linear-gradient(135deg, var(--alfaco-azul) 0%, var(--alfaco-celeste) 100%);
          color: white; border: none; border-radius: 20px; font-family: 'Sora'; font-weight: 700; font-size: 15px;
          text-transform: uppercase; letter-spacing: 0.5px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px;
          box-shadow: 0 10px 25px rgba(40,60,145,0.2); transition: 0.3s ease;
        }
        .btn-main:hover { transform: translateY(-2px); box-shadow: 0 15px 30px rgba(40,60,145,0.3); }

        /* ✨ Bloque de contacto con overflow visible ✨ */
        .contact-block { background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 20px; padding: 20px; margin-bottom: 25px; position: relative; overflow: visible; }
        .btn-add { background: white; border: 1.5px dashed var(--alfaco-celeste); color: var(--alfaco-celeste); padding: 12px; border-radius: 14px; width: 100%; cursor: pointer; font-family: 'Sora'; font-weight: 700; font-size: 13px; display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 25px; }
        
        .input-ico-wrap { position: relative; margin-bottom: 12px; }
        .input-ico-wrap svg { position: absolute; left: 14px; top: 14px; color: var(--alfaco-azul); opacity: 0.5; }
        .input-ico-wrap input { padding-left: 42px; }
      `}</style>

      <div className="page">
        <header className="header">
          <button className="btn-icon-back" onClick={() => view === "list" ? router.push(`/proyectos/${proyectoId}`) : setView("list")}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 style={{ fontFamily: 'Sora', fontSize: '17px', fontWeight: 800, color: 'var(--alfaco-azul)', margin: 0 }}>Instituciones</h1>
            <p style={{ fontSize: '11px', color: 'var(--alfaco-celeste)', fontWeight: 700 }}>MAPEO DE ENTIDADES DE IMPACTO</p>
          </div>
        </header>

        <div className="content" ref={dropdownRef}>
          {view === "list" ? (
            <>
              <div style={{ position: 'relative', marginBottom: '20px' }}>
                <Search size={20} style={{position:'absolute', left:16, top:14, color:'var(--alfaco-azul)', opacity:0.5}} />
                <input style={{ paddingLeft: '45px', height: '48px', background: 'white', border: '1.5px solid #e2e8f0', borderRadius: '16px', width: '100%', outline: 'none' }} type="text" placeholder="Buscar institución..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
              
              <button className="btn-main" style={{ marginBottom: 25 }} onClick={() => abrirFormulario()}>
                <Plus size={20} /> REGISTRAR INSTITUCIÓN
              </button>
              
              {loading ? (
                <div style={{textAlign:'center', padding:'40px'}}><Loader2 className="animate-spin" color="var(--alfaco-azul)" /></div>
              ) : elementosFiltrados.length === 0 ? (
                <div style={{textAlign:'center', padding:'40px', opacity:0.5, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center'}}>
                  <Building2 size={40} style={{marginBottom:10}} />
                  <p>No hay instituciones registradas.</p>
                </div>
              ) : (
                elementosFiltrados.map(inst => (
                  <div key={inst.id} className="list-card" onClick={() => abrirFormulario(inst)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
                      <div style={{ width: 48, height: 48, borderRadius: 12, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--alfaco-azul)' }}>
                        <Building2 size={24} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <h3 style={{fontFamily:'Sora', fontSize:15, color:'var(--alfaco-azul)', margin:0}}>{inst.nombre}</h3>
                        <p style={{fontSize:12, opacity:0.6}}>{inst.tipo_institucion} • Impacto {inst.impacto || "--"}</p>
                      </div>
                      <div style={{display:'flex', gap:8}}>
                        <button onClick={(e) => { e.stopPropagation(); abrirFormulario(inst, true); }} style={{background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:10, padding:8, color:'var(--alfaco-azul)'}}><Copy size={18}/></button>
                        <button onClick={(e) => { e.stopPropagation(); if(confirm("¿Eliminar?")) supabase.from("instituciones").delete().eq("id", inst.id).then(cargarDatos); }} style={{background:'#fef2f2', border:'1px solid #fee2e2', borderRadius:10, padding:8, color:'#ef4444'}}><Trash2 size={18}/></button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </>
          ) : (
            <form onSubmit={handleSave}>
              <div className="form-section">
                <span className="section-tag">Identificación</span>
                <div style={{marginBottom:16}}>
                  <label>Nombre de la Institución</label>
                  <input required value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Ej. IE Gabriela Mistral" />
                </div>
                <CustomSelect 
                  id="tipo" label="Tipo de Institución" value={tipo} 
                  options={["Institución Educativa", "Institución de Salud", "Institución Pública", "Empresa", "Multifamiliar", "Bodega / Minimarket", "Centro Comercial", "Mercado / Supermercado", "Comedor Popular", "Restaurante", "Hospedaje", "Salón de Belleza / Spa", "Grifo", "Otro"]} 
                  onChange={setTipo} 
                />
                {tipo === "Otro" && <input style={{marginTop:15}} value={otroTipo} onChange={e => setOtroTipo(e.target.value)} placeholder="Ej. Taller automotriz" />}
              </div>

              <div className="form-section">
                <span className="section-tag">Impacto Social</span>
                <CustomSelect id="imp" label="Grado de Impacto" value={impacto} options={["Directo", "Indirecto"]} onChange={setImpacto} />
              </div>

              <div className="form-section">
                <span className="section-tag">Relacionamiento</span>
                <ToggleSwitch label="¿Brindó información?" value={brindoInfo} onChange={setBrindoInfo} />
                
                {brindoInfo === "Sí" && (
                  <div style={{marginTop:20}}>
                    <label style={{marginBottom:15, display:'block'}}>Directorio de Contactos</label>
                    {contactos.map((c, i) => (
                      <div key={i} className="contact-block">
                        <div className="input-ico-wrap"><User size={18}/><input value={c.nombre} onChange={e => updateContacto(i, "nombre", e.target.value)} placeholder="Nombre y Apellido" /></div>
                        <div style={{marginBottom:15}}><label>Cargo</label><input value={c.cargo} onChange={e => updateContacto(i, "cargo", e.target.value)} placeholder="Ej. Administrador" /></div>
                        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:15}}>
                          <div><label>Teléfono</label><div className="input-ico-wrap"><Phone size={18}/><input value={c.telefono} onChange={e => updateContacto(i, "telefono", e.target.value)} placeholder="999..." /></div></div>
                          <div><label>Correo</label><div className="input-ico-wrap"><Mail size={18}/><input value={c.correo} onChange={e => updateContacto(i, "correo", e.target.value)} placeholder="correo@..." /></div></div>
                        </div>
                        <label>Dirección</label>
                        <div className="input-ico-wrap" style={{marginBottom:0}}><MapPin size={18}/><input value={c.direccion} onChange={e => updateContacto(i, "direccion", e.target.value)} placeholder="Dirección" /></div>

                        {/* ✨ BOTÓN ELIMINAR CORREGIDO: A LA DERECHA Y SIN RESPLANDOR ✨ */}
                        {contactos.length > 1 && (
                          <button 
                            type="button" 
                            onClick={() => eliminarContacto(i)} 
                            style={{
                              position:'absolute', 
                              right: '-12px', /* Movido a la derecha */
                              top: '-12px',
                              color:'#ef4444', 
                              background:'#fef2f2', 
                              border:'1.5px solid #fee2e2', 
                              borderRadius:'12px', 
                              width: '38px',
                              height: '38px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              /* Se eliminó boxShadow para quitar el resplandor */
                              zIndex: 9999,
                              cursor: 'pointer'
                            }}
                          >
                            <Trash2 size={18}/>
                          </button>
                        )}
                      </div>
                    ))}
                    <button type="button" className="btn-add" onClick={agregarContacto}><Plus size={16}/> AGREGAR OTRO CONTACTO</button>
                  </div>
                )}
              </div>

              <div className="form-section">
                <span className="section-tag">Notas de Gestión</span>
                <textarea value={comentarios} onChange={e => setComentarios(e.target.value)} rows={3} placeholder="Detalles relevantes de la visita o acuerdos..." />
              </div>

              <button type="submit" disabled={saving} className="btn-main">
                {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                {saving ? "GUARDANDO..." : "GUARDAR INSTITUCIÓN"}
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}