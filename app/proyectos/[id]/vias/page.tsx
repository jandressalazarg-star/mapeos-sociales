"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { 
  Trash2, Plus, Map, ArrowLeft, Save, Copy, X, Search, Camera, 
  Loader2, ChevronDown, MapPin, Car, Bike, Bus, Truck, 
  Motorbike 
} from "lucide-react";

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
  
  const [hasSenV, setHasSenV] = useState(""); const [estSenV, setEstSenV] = useState("");
  const [hasSenH, setHasSenH] = useState(""); const [estSenH, setEstSenH] = useState("");
  const [hasSem, setHasSem] = useState("");   const [estSem, setEstSem] = useState("");
  const [hasRomp, setHasRomp] = useState(""); const [estRomp, setEstRomp] = useState("");
  const [hasVer, setHasVer] = useState("");   const [estVer, setEstVer] = useState("");
  const [hasSar, setHasSar] = useState("");   const [estSar, setEstSar] = useState("");
  const [hasCiclo, setHasCiclo] = useState(""); const [estCiclo, setEstCiclo] = useState("");
  
  const [transito, setTransito] = useState("");
  const [vehiculos, setVehiculos] = useState<string[]>([]);
  const [hasAV, setHasAV] = useState("");
  const [avTipos, setAvTipos] = useState<string[]>([]);
  const [nombreParque, setNombreParque] = useState("");
  const [estAV, setEstAV] = useState("");
  const [comentarios, setComentarios] = useState("");

  const [activeDrop, setActiveDrop] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const cargarVias = async () => {
    setLoading(true);
    const { data } = await supabase.from("vias").select("*").eq("proyecto_id", proyectoId).order("created_at", { ascending: false });
    if (data) setVias(data);
    setLoading(false);
  };

  useEffect(() => { if (proyectoId) cargarVias(); }, [proyectoId]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setActiveDrop(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const viasFiltradas = vias.filter(v => v.nombre_via.toLowerCase().includes(searchTerm.toLowerCase()));

  const toggleArray = (arr: string[], val: string, set: (v: string[]) => void) => {
    arr.includes(val) ? set(arr.filter(i => i !== val)) : set([...arr, val]);
  };

  const handleUploadFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!e.target.files || e.target.files.length === 0) return;
      setUploading(true);
      const file = e.target.files[0];
      const filePath = `${proyectoId}/${Math.random()}.${file.name.split('.').pop()}`;
      const { error: uploadError } = await supabase.storage.from('vias_fotos').upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from('vias_fotos').getPublicUrl(filePath);
      setFotoUrl(data.publicUrl);
    } catch (error: any) {
      alert('Error: ' + error.message);
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
      setHasSem(via.has_semaforo || ""); setEstSem(via.estado_semaforo || "");
      setHasRomp(via.has_rompemuelle || ""); setEstRomp(via.estado_rompemuelle || "");
      setHasVer(via.has_veredas || ""); setEstVer(via.estado_veredas || "");
      setHasSar(via.has_sardinel || ""); setEstSar(via.estado_sardinel || "");
      setHasCiclo(via.has_ciclovia || ""); setEstCiclo(via.estado_ciclovia || "");
      setTransito(via.transito_nivel || ""); setVehiculos(via.vehiculos_tipos || []);
      setHasAV(via.has_areas_verdes || ""); setAvTipos(via.areas_verdes_tipos || []);
      setNombreParque(via.nombre_parque || ""); setEstAV(via.estado_areas_verdes || "");
      setComentarios(via.comentarios || "");
    } else {
      setSelectedId(null); setNombreVia(""); setTipoViaCat(""); setEstadoVia(""); setMaterial("");
      setJerarquia(""); setImpacto(""); setNivelacion(""); setCarriles(""); setSentido(""); setFotoUrl("");
      setHasSenV(""); setEstSenV(""); setHasSenH(""); setEstSenH(""); setHasSem(""); setEstSem("");
      setHasRomp(""); setEstRomp(""); setHasVer(""); setEstVer(""); setHasSar(""); setEstSar("");
      setHasCiclo(""); setEstCiclo(""); setTransito(""); setVehiculos([]);
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
      has_sen_horizontal: hasSenH, estado_sen_horizontal: estSenH, has_semaforo: hasSem, estado_semaforo: estSem,
      has_rompemuelle: hasRomp, estado_rompemuelle: estRomp, has_veredas: hasVer, estado_veredas: estVer,
      has_sardinel: hasSar, estado_sardinel: estSar, has_ciclovia: hasCiclo, estado_ciclovia: estCiclo,
      transito_nivel: transito, vehiculos_tipos: vehiculos, has_areas_verdes: hasAV, 
      areas_verdes_tipos: avTipos, nombre_parque: nombreParque, estado_areas_verdes: estAV, comentarios
    };
    if (selectedId) await supabase.from("vias").update(payload).eq("id", selectedId);
    else await supabase.from("vias").insert([payload]);
    await cargarVias(); setView("list"); setSaving(false);
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

  const StateSelector = ({ label, value, onChange }: any) => (
    <div style={{ marginTop: 10 }}>
      <label>{label}</label>
      <div className="state-btn-grid">
        {["Nuevo", "Bueno", "Regular", "Malo"].map(opt => (
          <button 
            key={opt} type="button" 
            className={`state-btn ${value === opt ? 'active' : ''}`} 
            onClick={() => onChange(opt)}
          >
            {opt}
          </button>
        ))}
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
        
        .list-card { background: white; border-radius: 20px; padding: 14px; margin-bottom: 12px; border: 1px solid rgba(226, 232, 240, 0.8); cursor: pointer; transition: 0.2s; }
        .list-card:hover { transform: translateY(-2px); border-color: var(--alfaco-celeste); box-shadow: 0 8px 20px rgba(40,60,145,0.06); }
        .thumb { width: 56px; height: 56px; border-radius: 12px; background: #f1f5f9; flex-shrink: 0; overflow: hidden; display: flex; align-items: center; justify-content: center; border: 1px solid #e2e8f0; }
        .thumb img { width: 100%; height: 100%; object-fit: cover; }

        .form-section { background: white; border-radius: 24px; padding: 22px; border: 1px solid #e2e8f0; margin-bottom: 16px; }
        .section-tag { font-size: 10px; font-weight: 800; color: var(--alfaco-celeste); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 15px; display: block; }
        label { display: block; font-size: 11px; color: var(--alfaco-azul); font-weight: 700; margin-bottom: 8px; text-transform: uppercase; opacity: 0.7; }
        input, textarea { width: 100%; background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 14px; padding: 12px 15px; color: var(--alfaco-plomo); font-size: 14px; outline: none; transition: 0.2s; }
        
        .select-container { position: relative; cursor: pointer; }
        .select-trigger { height: 48px; background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 14px; padding: 0 15px; display: flex; align-items: center; justify-content: space-between; font-size: 14px; transition: 0.2s; }
        .select-trigger.has-val { color: var(--alfaco-plomo); font-weight: 600; }
        .select-trigger.placeholder { color: #94a3b8; }
        
        .select-dropdown { position: absolute; top: 100%; left: 0; right: 0; background: white; z-index: 100; border-radius: 16px; border: 1px solid #e2e8f0; margin-top: 6px; box-shadow: 0 12px 25px rgba(0,0,0,0.1); animation: slideDown 0.2s ease-out; padding: 6px; }
        .select-item { padding: 10px 14px; font-size: 14px; border-radius: 10px; transition: 0.2s; }
        .select-item:hover { background: #f4f7fa; color: var(--alfaco-azul); }
        .select-item.selected { background: rgba(10,160,225,0.08); color: var(--alfaco-celeste); font-weight: 700; }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }

        .switch-container { display: flex; background: #f1f5f9; padding: 4px; border-radius: 12px; gap: 4px; }
        .sw-btn { border: none; padding: 6px 16px; border-radius: 8px; font-size: 12px; font-weight: 700; cursor: pointer; transition: 0.2s; background: transparent; color: var(--alfaco-plomo); }
        .sw-btn.active-si { background: var(--alfaco-azul); color: white; box-shadow: 0 2px 6px rgba(40,60,145,0.3); }
        .sw-btn.active-no { background: var(--alfaco-plomo); color: white; }

        .state-btn-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; }
        .state-btn { border: 1px solid #e2e8f0; background: #f8fafc; padding: 10px 2px; border-radius: 10px; font-size: 11px; font-weight: 700; color: var(--alfaco-plomo); cursor: pointer; transition: 0.2s; }
        .state-btn.active { background: var(--alfaco-azul); color: white; border-color: var(--alfaco-azul); box-shadow: 0 4px 10px rgba(40,60,145,0.2); }

        .opt-chip { display: flex; align-items: center; gap: 8px; background: #f8fafc; padding: 10px 12px; border-radius: 12px; font-size: 12px; font-weight: 700; cursor: pointer; border: 1.5px solid #e2e8f0; transition: 0.2s; color: var(--alfaco-plomo); }
        .opt-chip.active { background: rgba(40,60,145,0.1); border-color: var(--alfaco-azul); color: var(--alfaco-azul); }

        /* ✨ ESTILO BARRA REGISTRAR (IGUAL A ORGANIZACIONES) */
        .btn-main { 
          width: 100%; height: 58px; margin-top: 20px;
          background: linear-gradient(135deg, var(--alfaco-azul) 0%, var(--alfaco-celeste) 100%);
          color: white; border: none; border-radius: 20px; font-family: 'Sora'; font-weight: 700; font-size: 15px;
          text-transform: uppercase; letter-spacing: 0.5px;
          cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px;
          box-shadow: 0 10px 25px rgba(40,60,145,0.2); transition: 0.3s ease;
        }
        .btn-main:hover { transform: translateY(-2px); box-shadow: 0 15px 30px rgba(40,60,145,0.3); }
        .btn-main:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

        .photo-area { border: 2px dashed #cbd5e1; border-radius: 20px; padding: 25px; text-align: center; cursor: pointer; background: #f8fafc; }
      `}</style>

      <div className="page">
        <header className="header">
          <button className="btn-icon-back" onClick={() => view === "list" ? router.push(`/proyectos/${proyectoId}`) : setView("list")}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 style={{ fontFamily: 'Sora', fontSize: '17px', fontWeight: 800, color: 'var(--alfaco-azul)', margin: 0 }}>Vías y Calles</h1>
            <p style={{ fontSize: '11px', color: 'var(--alfaco-celeste)', fontWeight: 700 }}>INFRAESTRUCTURA Y VIALIDAD</p>
          </div>
        </header>

        <div className="content" ref={dropdownRef}>
          {view === "list" ? (
            <>
              <div style={{ position: 'relative', marginBottom: '20px' }}>
                <Search size={20} style={{position:'absolute', left:16, top:14, color:'var(--alfaco-azul)', opacity:0.5}} />
                <input style={{ paddingLeft: '45px' }} type="text" placeholder="Buscar vía..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
              
              <button className="btn-main" style={{ marginBottom: 25 }} onClick={() => abrirFormulario()}>
                <Plus size={20} /> REGISTRAR NUEVA VÍA
              </button>
              
              {loading ? (
                <div style={{textAlign:'center', padding:'40px'}}><Loader2 className="animate-spin" color="var(--alfaco-azul)" /></div>
              ) : (
                viasFiltradas.map(v => (
                  <div key={v.id} className="list-card" onClick={() => abrirFormulario(v)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
                      <div className="thumb">{v.foto_url ? <img src={v.foto_url} alt="Vía" /> : <MapPin size={22} color="var(--alfaco-azul)" style={{ opacity: 0.3 }} />}</div>
                      <div style={{ flex: 1 }}>
                        <h3 style={{fontFamily:'Sora', fontSize:15, color:'var(--alfaco-azul)', margin:0}}>{v.nombre_via}</h3>
                        <p style={{fontSize:12, opacity:0.6}}>{v.tipo_via_cat} • Impacto {v.impacto || "—"}</p>
                      </div>
                      <div style={{display:'flex', gap:8}}>
                        <button onClick={(e) => { e.stopPropagation(); abrirFormulario(v, true); }} style={{background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:10, padding:8, color:'var(--alfaco-azul)'}}><Copy size={18}/></button>
                        <button onClick={(e) => { e.stopPropagation(); if(confirm("¿Eliminar?")) supabase.from("vias").delete().eq("id", v.id).then(cargarVias); }} style={{background:'#fef2f2', border:'1px solid #fee2e2', borderRadius:10, padding:8, color:'#ef4444'}}><Trash2 size={18}/></button>
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
                <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:15}}>
                  <CustomSelect id="tipo" label="Tipo de vía" value={tipoViaCat} options={["Avenida", "Calle", "Jirón", "Pasaje", "Otro"]} onChange={setTipoViaCat} />
                  <div><label>Nombre de la vía</label><input required value={nombreVia} onChange={e => setNombreVia(e.target.value)} placeholder="Ej. Jr. Los Laureles" /></div>
                </div>
                {tipoViaCat === "Otro" && <input style={{marginTop:10}} placeholder="¿Cuál?" value={otroTipo} onChange={e => setOtroTipo(e.target.value)} />}
              </div>

              <div className="form-section">
                <span className="section-tag">Impacto Social</span>
                <CustomSelect id="imp" label="Grado de Impacto" value={impacto} options={["Directo", "Indirecto"]} onChange={setImpacto} />
              </div>

              <div className="form-section">
                <span className="section-tag">Especificaciones Técnicas</span>
                <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:15}}>
                  <CustomSelect id="mat" label="Pavimento" value={material} options={["Terreno natural","Asfalto","Concreto","Adoquinado"]} onChange={setMaterial} />
                  <CustomSelect id="estv" label="Estado de Pavimento" value={estadoVia} options={["Nuevo","Bueno","Regular","Malo"]} onChange={setEstadoVia} />
                </div>
                <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:15, marginTop:15}}>
                  <CustomSelect id="jer" label="Jerarquía" value={jerarquia} options={["Principal", "Secundaria"]} onChange={setJerarquia} />
                  <CustomSelect id="niv" label="Nivelación" value={nivelacion} options={["Plano", "Pendiente Elevada"]} onChange={setNivelacion} />
                </div>
                <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:15, marginTop:15}}>
                  <CustomSelect id="car" label="Carriles" value={carriles} options={["1","2","3","4","5","6"]} onChange={setCarriles} />
                  <CustomSelect id="sent" label="Sentido" value={sentido} options={["Único", "Doble"]} onChange={setSentido} />
                </div>
              </div>

              <div className="form-section">
                <span className="section-tag">Señalización y Estructura</span>
                {[
                  { label: "Señalización Vertical", val: hasSenV, set: setHasSenV, est: estSenV, setEst: setEstSenV, id: 'sv' },
                  { label: "Señalización Horizontal", val: hasSenH, set: setHasSenH, est: estSenH, setEst: setEstSenH, id: 'sh' },
                  { label: "Semáforo", val: hasSem, set: setHasSem, est: estSem, setEst: setEstSem, id: 'sm' },
                  { label: "Rompemuelle", val: hasRomp, set: setHasRomp, est: estRomp, setEst: setEstRomp, id: 'rm' },
                  { label: "Ciclovía", val: hasCiclo, set: setHasCiclo, est: estCiclo, setEst: setEstCiclo, id: 'cv' },
                  { label: "Veredas", val: hasVer, set: setHasVer, est: estVer, setEst: setEstVer, id: 'vr' },
                  { label: "Sardinel", val: hasSar, set: setHasSar, est: estSar, setEst: setEstSar, id: 'sr' }
                ].map((item) => (
                  <div key={item.id} style={{borderBottom:'1px solid #f1f5f9', paddingBottom:15, marginBottom:15}}>
                    <ToggleSwitch label={item.label} value={item.val} onChange={item.set} />
                    {item.val === "Sí" && <StateSelector label={`Estado de ${item.label}`} value={item.est} onChange={item.setEst} />}
                  </div>
                ))}
              </div>

              <div className="form-section">
                <span className="section-tag">Entorno y áreas verdes</span>
                <CustomSelect id="tr" label="Nivel de Tránsito" value={transito} options={["Leve","Regular","Moderado","Alto"]} onChange={setTransito} />
                
                <div style={{marginTop:20, marginBottom:25}}>
                  <label>Tipos de Vehículos frecuentes</label>
                  <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginTop:8}}>
                    {[
                      { name: "Bicicleta", ico: <Bike size={16}/> },
                      { name: "Moto", ico: <Motorbike size={18}/> },
                      { name: "Autos", ico: <Car size={16}/> },
                      { name: "Transporte Público", ico: <Bus size={16}/> },
                      { name: "Camiones", ico: <Truck size={16}/> }
                    ].map(v => (
                      <div key={v.name} className={`opt-chip ${vehiculos.includes(v.name) ? 'active' : ''}`} onClick={() => toggleArray(vehiculos, v.name, setVehiculos)}>
                        {v.ico} {v.name}
                      </div>
                    ))}
                  </div>
                </div>

                <ToggleSwitch label="¿Tiene Áreas Verdes?" value={hasAV} onChange={setHasAV} />
                {hasAV === "Sí" && (
                  <div style={{marginTop:15}}>
                    <label>Tipo de área verde</label>
                    <div style={{display:'flex', flexWrap:'wrap', gap:8, marginBottom:15, marginTop:8}}>
                      {["Berma lateral", "Berma central", "Parque"].map(t => (
                        <div key={t} className={`opt-chip ${avTipos.includes(t) ? 'active' : ''}`} onClick={() => toggleArray(avTipos, t, setAvTipos)}>{t}</div>
                      ))}
                    </div>
                    {avTipos.includes("Parque") && <input style={{marginBottom:15}} value={nombreParque} onChange={e => setNombreParque(e.target.value)} placeholder="Nombre del Parque" />}
                    <StateSelector label="Estado Áreas Verdes" value={estAV} onChange={setEstAV} />
                  </div>
                )}
              </div>

              <div className="form-section">
                <span className="section-tag">Multimedia y Notas</span>
                <div className="photo-area" onClick={() => document.getElementById('fileInput')?.click()}>
                  {uploading ? <Loader2 className="animate-spin" style={{margin:'0 auto'}}/> : fotoUrl ? <img src={fotoUrl} style={{width:'100%', height:180, objectFit:'cover', borderRadius:14}} alt="Vía" /> : <div style={{opacity:0.4}}><Camera size={32} style={{margin:'auto'}}/><p style={{fontSize:'13px', fontWeight:700, marginTop:10}}>Subir fotografía</p></div>}
                </div>
                <input id="fileInput" type="file" accept="image/*" style={{display:'none'}} onChange={handleUploadFoto} />
                <textarea style={{marginTop:20}} value={comentarios} onChange={e => setComentarios(e.target.value)} rows={3} placeholder="Notas adicionales..." />
              </div>

              <button type="submit" disabled={saving || uploading} className="btn-main">
                {saving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                {saving ? "GUARDANDO..." : "GUARDAR"}
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}