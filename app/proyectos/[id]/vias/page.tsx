"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Trash2, Plus, Map, ArrowLeft, Save, ChevronRight, Copy, X, CheckSquare, Square, Search, Camera, Image as ImageIcon, Loader2 } from "lucide-react";

export default function GestionVias() {
  const params = useParams();
  const router = useRouter();
  const proyectoId = params?.id as string;

  const [view, setView] = useState<"list" | "form">("list");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [vias, setVias] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  /* ── Form States ── */
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [nombreVia, setNombreVia] = useState("");
  const [tipoViaCat, setTipoViaCat] = useState("");
  const [otroTipo, setOtroTipo] = useState("");
  const [estadoVia, setEstadoVia] = useState("");
  const [material, setMaterial] = useState("");
  const [jerarquia, setJerarquia] = useState("");
  const [impacto, setImpacto] = useState("");
  const [nivelacion, setNivelacion] = useState("");
  const [carriles, setCarriles] = useState("");
  const [sentido, setSentido] = useState("");
  const [fotoUrl, setFotoUrl] = useState("");
  
  // Condicionales e Infraestructura
  const [hasSenV, setHasSenV] = useState(""); const [estSenV, setEstSenV] = useState("");
  const [hasSenH, setHasSenH] = useState(""); const [estSenH, setEstSenH] = useState("");
  const [hasRomp, setHasRomp] = useState(""); const [estRomp, setEstRomp] = useState("");
  const [hasVer, setHasVer] = useState(""); const [estVer, setEstVer] = useState("");
  const [hasSar, setHasSar] = useState(""); const [estSar, setEstSar] = useState("");
  
  const [transito, setTransito] = useState("");
  const [vehiculos, setVehiculos] = useState<string[]>([]);
  const [hasAV, setHasAV] = useState("");
  const [avTipos, setAvTipos] = useState<string[]>([]);
  const [nombreParque, setNombreParque] = useState("");
  const [estAV, setEstAV] = useState("");
  const [comentarios, setComentarios] = useState("");

  const cargarVias = async () => {
    setLoading(true);
    const { data } = await supabase.from("vias").select("*").eq("proyecto_id", proyectoId).order("created_at", { ascending: false });
    if (data) setVias(data);
    setLoading(false);
  };

  useEffect(() => { if (proyectoId) cargarVias(); }, [proyectoId]);

  const viasFiltradas = vias.filter(v => v.nombre_via.toLowerCase().includes(searchTerm.toLowerCase()));

  const toggleArray = (arr: string[], val: string, set: (v: string[]) => void) => {
    arr.includes(val) ? set(arr.filter(i => i !== val)) : set([...arr, val]);
  };

  const handleUploadFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!e.target.files || e.target.files.length === 0) return;
      setUploading(true);
      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${proyectoId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('vias_fotos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('vias_fotos').getPublicUrl(filePath);
      setFotoUrl(data.publicUrl);
    } catch (error: any) {
      alert('Error subiendo imagen: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const abrirFormulario = (via?: any, isDuplicate = false) => {
    if (via) {
      setSelectedId(isDuplicate ? null : via.id);
      setNombreVia(isDuplicate ? `${via.nombre_via} (Copia)` : via.nombre_via);
      setTipoViaCat(via.tipo_via_cat || ""); setEstadoVia(via.estado_via || ""); setMaterial(via.material_pavimentacion || "");
      setJerarquia(via.jerarquia_via || ""); setImpacto(via.impacto || ""); setNivelacion(via.nivelacion || "");
      setCarriles(via.carriles || ""); setSentido(via.sentido || ""); setFotoUrl(isDuplicate ? "" : (via.foto_url || ""));
      setHasSenV(via.has_sen_vertical || ""); setEstSenV(via.estado_sen_vertical || "");
      setHasSenH(via.has_sen_horizontal || ""); setEstSenH(via.estado_sen_horizontal || "");
      setHasRomp(via.has_rompemuelle || ""); setEstRomp(via.estado_rompemuelle || "");
      setHasVer(via.has_veredas || ""); setEstVer(via.estado_veredas || "");
      setHasSar(via.has_sardinel || ""); setEstSar(via.estado_sardinel || "");
      setTransito(via.transito_nivel || ""); setVehiculos(via.vehiculos_tipos || []);
      setHasAV(via.has_areas_verdes || ""); setAvTipos(via.areas_verdes_tipos || []);
      setNombreParque(via.nombre_parque || ""); setEstAV(via.estado_areas_verdes || "");
      setComentarios(via.comentarios || "");
    } else {
      setSelectedId(null); setNombreVia(""); setTipoViaCat(""); setEstadoVia(""); setMaterial("");
      setJerarquia(""); setImpacto(""); setNivelacion(""); setCarriles(""); setSentido(""); setFotoUrl("");
      setHasSenV(""); setEstSenV(""); setHasSenH(""); setEstSenH(""); setHasRomp(""); setEstRomp("");
      setHasVer(""); setEstVer(""); setHasSar(""); setEstSar(""); setTransito(""); setVehiculos([]);
      setHasAV(""); setAvTipos([]); setNombreParque(""); setEstAV(""); setComentarios("");
    }
    setView("form");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      proyecto_id: proyectoId, nombre_via: nombreVia, tipo_via_cat: tipoViaCat === "Otro" ? otroTipo : tipoViaCat,
      estado_via: estadoVia, material_pavimentacion: material, jerarquia_via: jerarquia, impacto, nivelacion,
      carriles, sentido, foto_url: fotoUrl, has_sen_vertical: hasSenV, estado_sen_vertical: estSenV,
      has_sen_horizontal: hasSenH, estado_sen_horizontal: estSenH, has_rompemuelle: hasRomp, estado_rompemuelle: estRomp,
      has_veredas: hasVer, estado_veredas: estVer, has_sardinel: hasSar, estado_sardinel: estSar,
      transito_nivel: transito, vehiculos_tipos: vehiculos, has_areas_verdes: hasAV, areas_verdes_tipos: avTipos,
      nombre_parque: nombreParque, estado_areas_verdes: estAV, comentarios
    };

    if (selectedId) await supabase.from("vias").update(payload).eq("id", selectedId);
    else await supabase.from("vias").insert([payload]);

    await cargarVias(); setView("list"); setSaving(false);
  };

  return (
    <>
      <style>{`
        .page { min-height: 100vh; background: #001e3c; color: #fff; font-family: 'DM Sans', sans-serif; padding-bottom: 40px; }
        .header { position: sticky; top: 0; z-index: 20; background: rgba(0,30,60,0.8); backdrop-filter: blur(15px); border-bottom: 1px solid rgba(255,255,255,0.1); padding: 15px 20px; display: flex; align-items: center; gap: 15px; }
        .content { max-width: 600px; margin: 0 auto; padding: 20px; }
        .search-container { position: relative; margin-bottom: 20px; }
        .search-container input { width: 100%; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 14px; padding: 12px 12px 12px 42px; color: #fff; outline: none; transition: 0.2s; color-scheme: dark; }
        .search-container svg { position: absolute; left: 14px; top: 13px; color: #34d399; opacity: 0.6; }
        .form-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; padding: 20px; margin-bottom: 16px; }
        label { display: block; font-size: 11px; color: #34d399; font-weight: 700; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; }
        input, select, textarea { width: 100%; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 12px; color: #fff; font-size: 14px; outline: none; color-scheme: dark; }
        select option { background-color: #01162b; color: #ffffff; }
        .btn-main { width: 100%; padding: 16px; border-radius: 12px; border: none; background: linear-gradient(135deg, #059669, #10b981); color: #fff; font-family: 'Sora'; font-weight: 700; cursor: pointer; }
        
        /* Ajuste de list-card para incluir miniatura */
        .list-card { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 14px; margin-bottom: 12px; cursor: pointer; }
        .card-content { display: flex; align-items: center; gap: 14px; width: 100%; }
        .thumb { width: 52px; height: 52px; border-radius: 10px; background: rgba(255,255,255,0.05); flex-shrink: 0; overflow: hidden; display: flex; alignItems: center; justifyContent: center; border: 1px solid rgba(255,255,255,0.1); }
        .thumb img { width: 100%; height: 100%; object-fit: cover; }
        .card-info { flex: 1; }

        .multi-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 5px; }
        .opt-chip { display: flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.03); padding: 10px; border-radius: 10px; font-size: 13px; cursor: pointer; border: 1px solid transparent; }
        .opt-chip.active { background: rgba(52,211,153,0.1); border-color: #34d399; color: #34d399; }
        .photo-area { border: 2px dashed rgba(255,255,255,0.1); border-radius: 16px; padding: 20px; text-align: center; cursor: pointer; position: relative; overflow: hidden; transition: 0.2s; }
        .photo-area:hover { background: rgba(255,255,255,0.03); border-color: #34d399; }
        .preview-img { width: 100%; height: 200px; object-fit: cover; border-radius: 12px; margin-top: 10px; }
      `}</style>

      <div className="page">
        <div className="header">
          <button onClick={() => view === "list" ? router.push(`/proyectos/${proyectoId}`) : setView("list")} style={{ background: 'none', border: 'none', color: '#fff' }}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 style={{ fontFamily: 'Sora', fontSize: '18px', fontWeight: 800 }}>Vías del Proyecto</h1>
            <p style={{ fontSize: '11px', color: '#34d399' }}>Gestión de Infraestructura</p>
          </div>
        </div>

        <div className="content">
          {view === "list" ? (
            <>
              <div className="search-container">
                <Search size={18} /><input type="text" placeholder="Buscar vía..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
              <button className="btn-main" style={{ marginBottom: 20 }} onClick={() => abrirFormulario()}>
                <Plus size={18} style={{ marginRight: 8 }} /> REGISTRAR NUEVA VÍA
              </button>
              
              {viasFiltradas.map(v => (
                <div key={v.id} className="list-card" onClick={() => abrirFormulario(v)}>
                  <div className="card-content">
                    {/* 👇 Miniatura de la Foto */}
                    <div className="thumb">
                      {v.foto_url ? (
                        <img src={v.foto_url} alt="Vía" />
                      ) : (
                        <Map size={20} style={{ opacity: 0.2, margin: 'auto' }} />
                      )}
                    </div>
                    
                    <div className="card-info">
                      <h3 style={{fontFamily:'Sora', fontSize:15}}>{v.nombre_via}</h3>
                      <p style={{fontSize:12, color:'#34d399'}}>{v.tipo_via_cat} • Impacto {v.impacto || "—"}</p>
                    </div>

                    <div style={{display:'flex', gap:10}}>
                      <button onClick={(e) => { e.stopPropagation(); abrirFormulario(v, true); }} style={{background:'none', border:'none', color:'#93c5fd'}}><Copy size={18}/></button>
                      <button onClick={(e) => { e.stopPropagation(); if(confirm("¿Eliminar?")) supabase.from("vias").delete().eq("id", v.id).then(cargarVias); }} style={{background:'none', border:'none', color:'#f87171'}}><Trash2 size={18}/></button>
                    </div>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <form onSubmit={handleSave}>
              {/* Formulario permanece igual pero con el input de foto optimizado */}
              <div className="form-card">
                <label>Tipo de vía</label>
                <select value={tipoViaCat} onChange={e => setTipoViaCat(e.target.value)}>
                  <option value="">Seleccionar...</option>
                  {["Avenida", "Calle", "Jirón", "Pasaje", "Otro"].map(o => <option key={o} value={o}>{o}</option>)}
                </select>
                {tipoViaCat === "Otro" && <input style={{marginTop:10}} placeholder="¿Cuál?" value={otroTipo} onChange={e => setOtroTipo(e.target.value)} />}
                <label style={{marginTop:15}}>Nombre de la vía</label>
                <input required value={nombreVia} onChange={e => setNombreVia(e.target.value)} placeholder="Ej. Jr. Los Laureles" />
              </div>

              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
                <div className="form-card"><label>Tipo de Pavimento</label><select value={material} onChange={e => setMaterial(e.target.value)}><option value="">--</option>{["Terreno natural","Asfalto","Concreto","Adoquinado"].map(o=><option key={o} value={o}>{o}</option>)}</select></div>
                <div className="form-card"><label>Estado</label><select value={estadoVia} onChange={e => setEstadoVia(e.target.value)}><option value="">--</option>{["Nuevo","Bueno","Regular","Malo"].map(o=><option key={o} value={o}>{o}</option>)}</select></div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-card"><label>Tipo de Vía</label><select value={jerarquia} onChange={e => setJerarquia(e.target.value)}><option value="">--</option><option value="Principal">Principal</option><option value="Secundaria">Secundaria</option></select></div>
                <div className="form-card"><label>Impacto</label><select value={impacto} onChange={e => setImpacto(e.target.value)}><option value="">--</option><option value="Directo">Directo</option><option value="Indirecto">Indirecto</option></select></div>
              </div>

              <div className="form-card"><label>Nivelación</label><select value={nivelacion} onChange={e => setNivelacion(e.target.value)}><option value="">--</option><option value="Plano">Plano</option><option value="Pendiente Elevada">Pendiente Elevada</option></select></div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-card"><label>Carril</label><select value={carriles} onChange={e => setCarriles(e.target.value)}><option value="">#</option>{[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n}</option>)}</select></div>
                <div className="form-card"><label>Sentido</label><select value={sentido} onChange={e => setSentido(e.target.value)}><option value="">--</option><option value="Único">Único</option><option value="Doble">Doble</option></select></div>
              </div>

              {[
                { label: "Señalización Vertical", val: hasSenV, set: setHasSenV, est: estSenV, setEst: setEstSenV },
                { label: "Señalización Horizontal", val: hasSenH, set: setHasSenH, est: estSenH, setEst: setEstSenH },
                { label: "Rompemuelle", val: hasRomp, set: setHasRomp, est: estRomp, setEst: setEstRomp },
                { label: "Veredas", val: hasVer, set: setHasVer, est: estVer, setEst: setEstVer },
                { label: "Sardinel", val: hasSar, set: setHasSar, est: estSar, setEst: setEstSar }
              ].map((item, i) => (
                <div key={i} className="form-card">
                  <label>{item.label}</label>
                  <select value={item.val} onChange={e => item.set(e.target.value)}><option value="">--</option><option value="Sí">Sí</option><option value="No">No</option></select>
                  {item.val === "Sí" && (
                    <div style={{marginTop:10}}><label>Estado de {item.label}</label><select value={item.est} onChange={e => item.setEst(e.target.value)}><option value="">--</option>{["Nuevo","Bueno","Regular","Malo"].map(o=><option key={o} value={o}>{o}</option>)}</select></div>
                  )}
                </div>
              ))}

              <div className="form-card"><label>Nivel de Tránsito</label><select value={transito} onChange={e => setTransito(e.target.value)}><option value="">--</option>{["Leve","Regular","Moderado","Alto"].map(o=><option key={o} value={o}>{o}</option>)}</select></div>

              <div className="form-card">
                <label>¿Tiene Áreas Verdes?</label>
                <select value={hasAV} onChange={e => setHasAV(e.target.value)}><option value="">--</option><option value="Sí">Sí</option><option value="No">No</option></select>
                {hasAV === "Sí" && (
                  <div style={{marginTop:10}}>
                    <label>Tipos</label>
                    <div className="multi-grid">
                      {["Berma lateral", "Berma central", "Parque"].map(t => (
                        <div key={t} className={`opt-chip ${avTipos.includes(t) ? 'active' : ''}`} onClick={() => toggleArray(avTipos, t, setAvTipos)}>{t}</div>
                      ))}
                    </div>
                    {avTipos.includes("Parque") && <input style={{marginTop:10}} value={nombreParque} onChange={e => setNombreParque(e.target.value)} placeholder="Nombre del Parque" />}
                    <div style={{marginTop:10}}><label>Estado Áreas Verdes</label><select value={estAV} onChange={e => setEstAV(e.target.value)}><option value="">--</option>{["Nuevo","Bueno","Regular","Malo"].map(o=><option key={o} value={o}>{o}</option>)}</select></div>
                  </div>
                )}
              </div>

              <div className="form-card"><label>Comentario adicional</label><textarea value={comentarios} onChange={e => setComentarios(e.target.value)} rows={3} /></div>

              <div className="form-card">
                <label>Registro Fotográfico</label>
                <div className="photo-area" onClick={() => document.getElementById('fileInput')?.click()}>
                  {uploading ? (
                    <div style={{padding:20}}><Loader2 className="animate-spin" style={{margin:'0 auto'}}/><p style={{marginTop:10, fontSize:12}}>Subiendo archivo...</p></div>
                  ) : fotoUrl ? (
                    <div>
                      <img src={fotoUrl} className="preview-img" alt="Vista previa" />
                      <button type="button" onClick={(e) => { e.stopPropagation(); setFotoUrl(""); }} style={{marginTop:10, color:'#f87171', fontSize:12, background:'none', border:'none', textDecoration:'underline'}}>Eliminar y cambiar</button>
                    </div>
                  ) : (
                    <div style={{opacity:0.6}}>
                      <Camera size={32} style={{margin:'0 auto 10px'}} />
                      <p style={{fontSize:13}}>Subir fotografía</p>
                      <p style={{fontSize:10, marginTop:5}}>Selecciona correctamente la fotografía que corresponde a esta vía.</p>
                    </div>
                  )}
                </div>
                <input id="fileInput" type="file" accept="image/*" style={{display:'none'}} onChange={handleUploadFoto} />
              </div>

              <button type="submit" disabled={saving || uploading} className="btn-main">
                {saving ? "GUARDANDO..." : "GUARDAR VÍA"}
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}