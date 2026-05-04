"use client";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Papa from "papaparse";
import { 
  Search, Loader2, ArrowLeft, Upload, UserCheck, 
  AlertCircle, RefreshCw, X, Save, Users, Trash2, AlignLeft, UserPlus, ChevronDown 
} from "lucide-react";

export default function SemaforoSIRC() {
  const router = useRouter();
  const [proyectos, setProyectos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [query, setQuery] = useState("");
  
  // Estados para delegación masiva
  const [showMassAssign, setShowMassAssign] = useState(false);
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [targetRes, setTargetRes] = useState("");
  const [updatingMass, setUpdatingMass] = useState(false);
  const [viewDelegate, setViewDelegate] = useState(""); // Filtro para ver delegaciones activas

  // Estados para edición individual
  const [editingProject, setEditingProject] = useState<any>(null);
  const [newResponsible, setNewResponsible] = useState("");
  const [saving, setSaving] = useState(false);

  const listaResponsables = useMemo(() => {
    const nombres = proyectos.map(p => p.responsable_sirc).filter(Boolean);
    return Array.from(new Set(nombres)).sort();
  }, [proyectos]);

  // Lista de personas que tienen algo delegado a su nombre
  const receptoresCarga = useMemo(() => {
    const nombres = proyectos.filter(p => p.responsable_designado).map(p => p.responsable_designado);
    return Array.from(new Set(nombres)).sort();
  }, [proyectos]);

  const fetchData = async () => {
    setLoading(true);
    const { data } = await supabase.from("semaforo_social").select("*").order("riesgo_social", { ascending: false });
    setProyectos(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleFileUpload = (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    setImporting(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      Papa.parse(event.target?.result as string, {
        header: true, skipEmptyLines: 'greedy', delimiter: ";",
        complete: async (results) => {
          const headers = results.meta.fields || [];
          const rawData = results.data.map((row: any) => {
            const getVal = (names: string[]) => {
              const key = headers.find(h => names.includes(h.trim().toUpperCase()));
              return key ? row[key] : null;
            };
            const cod = getVal(["COD.PROYECTO", "COD_PROYECTO", "CODIGO"]);
            if (!cod) return null;
            return {
              cod_proyecto: cod.toString().trim(),
              distrito: (getVal(["DISTRITO"]) || "").toString().trim(),
              malla: (getVal(["MALLA"]) || "").toString().trim(),
              sector: (getVal(["SECTOR"]) || "").toString().trim(),
              etapa_proyecto: (getVal(["ETAPA PROYECTO"]) || "").toString().trim(),
              responsable_sirc: (getVal(["RESPONSABLE"]) || "").toString().trim(),
              riesgo_social: (getVal(["RIESGO SOCIAL"]) || "Muy bajo").toString().trim(),
              descripcion_sirc: (getVal(["DESCRIPCION", "DESCRIPCIÓN"]) || "").toString().trim()
            };
          }).filter(item => item !== null);
          const uniqueData = Array.from(new Map(rawData.map(item => [item.cod_proyecto, item])).values());
          await supabase.from("semaforo_social").upsert(uniqueData);
          fetchData();
          setImporting(false);
        }
      });
    };
    reader.readAsText(file, "ISO-8859-1");
  };

  const handleMassDelegate = async () => {
    if (selectedSources.length === 0 || !targetRes) return;
    setUpdatingMass(true);
    await supabase.from("semaforo_social").update({ responsable_designado: targetRes }).in("responsable_sirc", selectedSources);
    setSelectedSources([]); setTargetRes(""); setShowMassAssign(false); fetchData();
    setUpdatingMass(false);
  };

  const clearMassDelegation = async (de: string, a: string) => {
    if (!confirm(`¿Deseas que ${a} deje de apoyar los proyectos de ${de}?`)) return;
    setUpdatingMass(true);
    await supabase.from("semaforo_social").update({ responsable_designado: null }).match({ responsable_sirc: de, responsable_designado: a });
    fetchData();
    setUpdatingMass(false);
  };

  const updateIndividual = async (clear = false) => {
    setSaving(true);
    await supabase.from("semaforo_social").update({ responsable_designado: clear ? null : newResponsible }).eq("cod_proyecto", editingProject.cod_proyecto);
    setEditingProject(null); fetchData(); setSaving(false);
  };

  const getRiesgoStyle = (riesgo: string) => {
    const r = riesgo?.toLowerCase().trim();
    if (r === 'muy alto') return { color: '#ef4444', label: 'MUY ALTO', bg: '#fee2e2' };
    if (r === 'alto') return { color: '#f97316', label: 'ALTO', bg: '#ffedd5' };
    if (r === 'medio') return { color: '#eab308', label: 'MEDIO', bg: '#fef9c3' };
    if (r === 'bajo') return { color: '#86efac', label: 'BAJO', bg: '#f0fdf4' };
    return { color: '#22c55e', label: 'MUY BAJO', bg: '#dcfce7' };
  };

  // Función para formatear Sector y Malla según las reglas de José
  const formatSectorMalla = (p: any) => {
    let sector = (p.sector || "").toString().trim();
    if (/^\d/.test(sector)) sector = "SECTOR " + sector;
    return `${sector} MALLA ${p.malla || ""}`;
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? proyectos.filter(p => 
      p.cod_proyecto?.toLowerCase().includes(q) || 
      p.distrito?.toLowerCase().includes(q) ||
      (p.responsable_designado || p.responsable_sirc)?.toLowerCase().includes(q)
    ) : proyectos;
  }, [query, proyectos]);

  if (loading) return <div style={{height:'100vh', display:'flex', alignItems:'center', justifyContent:'center'}}><Loader2 className="animate-spin" size={40} color="#283c91" /></div>;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700&family=DM+Sans:wght@400;500;700&display=swap');
        :root { --alfaco-azul: #283c91; --bg-main: #f4f7fa; }
        body { margin: 0; background: var(--bg-main); font-family: 'DM Sans', sans-serif; }
        .header { background: white; border-bottom: 1px solid #e2e8f0; padding: 15px 20px; position: sticky; top: 0; z-index: 10; }
        .card { background: white; border-radius: 20px; padding: 20px; border: 1px solid #e2e8f0; position: relative; overflow: hidden; margin-bottom: 15px; }
        .card-accent { position: absolute; left: 0; top: 0; bottom: 0; width: 6px; }
        .description-box { background: #f8fafc; border-radius: 12px; padding: 12px; border: 1px solid #f1f5f9; margin-top: 12px; user-select: text; -webkit-user-select: text; }
        .badge-delegado { background: #eff6ff; color: #1d4ed8; padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: 700; display: inline-flex; align-items: center; gap: 4px; border: 1px solid #dbeafe; }
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 50; display: flex; align-items: flex-end; }
        .modal-content { background: white; width: 100%; border-radius: 30px 30px 0 0; padding: 25px; box-sizing: border-box; max-height: 92vh; overflow-y: auto; }
        .selector-box { border: 1px solid #e2e8f0; border-radius: 12px; max-height: 180px; overflow-y: auto; margin-top: 8px; background: #f8fafc; }
        .selector-item { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; display: flex; align-items: center; gap: 10px; cursor: pointer; font-size: 13px; }
        .delegation-list-item { display: flex; justify-content: space-between; align-items: center; padding: 12px; background: #f8fafc; border-radius: 12px; margin-top: 8px; border: 1px solid #f1f5f9; font-size: 13px; }
      `}</style>

      <header className="header">
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: '15px'}}>
          <button onClick={() => router.push("/dashboard")} style={{background:'none', border:'none', color:'var(--alfaco-azul)', fontWeight:'bold', display:'flex', alignItems:'center', gap:5, cursor:'pointer'}}><ArrowLeft size={18}/> Menú</button>
          <div style={{display:'flex', gap: 8}}>
              <button onClick={() => setShowMassAssign(true)} style={{background: '#f1f5f9', border:'none', padding: '10px', borderRadius: 10, cursor:'pointer'}}><Users size={20} color="#283c91"/></button>
              <label style={{background: 'var(--alfaco-azul)', color:'white', padding: '10px 14px', borderRadius: 10, fontSize: 13, fontWeight: 'bold', cursor:'pointer'}}>
                 Sincronizar <input type="file" accept=".csv" onChange={handleFileUpload} style={{display:'none'}} />
              </label>
          </div>
        </div>
        <input type="text" placeholder="Buscar proyecto, distrito o personal..." value={query} onChange={e => setQuery(e.target.value)} style={{width:'100%', height:'42px', padding:'0 15px', borderRadius:12, border:'1px solid #e2e8f0', background:'#f1f5f9', outline:'none'}} />
      </header>

      <main style={{padding: '15px'}}>
        <div style={{marginBottom: 10, fontSize: 13, fontWeight: 700, color: '#64748b'}}>TOTAL: {filtered.length} PROYECTOS</div>
        
        {filtered.map((p) => {
          const style = getRiesgoStyle(p.riesgo_social);
          return (
            <div key={p.cod_proyecto} className="card">
              <div className="card-accent" style={{ background: style.color }} />
              
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
                <div style={{flex: 1}}>
                  <h3 style={{fontFamily:'Sora', color:'var(--alfaco-azul)', margin:0, fontSize: 18, fontWeight: 800}}>{p.cod_proyecto}</h3>
                  {/* SEGUNDO Y TERCER REGLÓN PERSONALIZADOS */}
                  <p style={{margin: '4px 0 2px', fontSize: 12, fontWeight: 600, color: '#334155'}}>{formatSectorMalla(p)}</p>
                  <p style={{margin: 0, fontSize: 12, opacity: 0.6}}>{p.distrito}</p>
                </div>
                <div style={{ fontSize: 9, fontWeight: 900, padding: '4px 10px', borderRadius: 8, color: style.color, background: style.bg, border: `1px solid ${style.color}30` }}>{style.label}</div>
              </div>

              <div className="description-box">
                <div style={{fontSize: 10, fontWeight: 700, color: '#94a3b8', marginBottom: 4, display:'flex', alignItems:'center', gap: 4}}>
                  <AlignLeft size={12}/> DESCRIPCIÓN SIRC:
                </div>
                <div style={{fontSize: 12, color: '#475569', lineHeight: 1.4}}>
                  {p.descripcion_sirc || "Sin descripción."}
                </div>
              </div>

              <div style={{marginTop: 12, paddingTop: 10, borderTop: '1px solid #f1f5f9', display:'flex', justifyContent:'space-between', alignItems:'flex-end'}}>
                <div>
                  <div style={{fontSize: 10, opacity: 0.5}}>RESPONSABLE SIRC: {p.responsable_sirc}</div>
                  {p.responsable_designado && <div className="badge-delegado"><UserCheck size={14}/> Apoya: {p.responsable_designado}</div>}
                </div>
                <button onClick={() => { setEditingProject(p); setNewResponsible(p.responsable_designado || ""); }} style={{background: '#f1f5f9', color: 'var(--alfaco-azul)', border: 'none', padding: '6px 12px', borderRadius: 8, fontSize: 11, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4}}>
                    <UserPlus size={14}/> ASIGNAR
                </button>
              </div>
            </div>
          )
        })}
      </main>

      {/* MODAL GESTOR DE CARGAS (REDISEÑADO CON FILTRO) */}
      {showMassAssign && (
        <div className="modal-overlay" onClick={() => setShowMassAssign(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 15}}>
                <h2 style={{fontFamily:'Sora', color:'var(--alfaco-azul)', margin:0, fontSize: 20}}>Delegar Carga</h2>
                <button onClick={() => setShowMassAssign(false)} style={{background:'none', border:'none'}}><X size={24}/></button>
            </div>
            
            {/* VISTA DE DELEGACIONES ACTIVAS CON FILTRO */}
            <div style={{background: '#f1f5f9', padding: 15, borderRadius: 15, marginBottom: 25}}>
                <label style={{fontSize: 11, fontWeight: 800, color: 'var(--alfaco-azul)'}}>VER DELEGACIONES DE:</label>
                <select style={{width:'100%', padding: 10, borderRadius: 8, marginTop: 5, border: '1px solid #cbd5e1'}} value={viewDelegate} onChange={e => setViewDelegate(e.target.value)}>
                    <option value="">Seleccionar relacionista...</option>
                    {receptoresCarga.map(n => <option key={n} value={n}>{n}</option>)}
                </select>

                {viewDelegate && (
                    <div style={{marginTop: 10}}>
                        <p style={{fontSize: 12, margin: '0 0 5px'}}>Perfiles delegados a <strong>{viewDelegate}</strong>:</p>
                        {Array.from(new Set(proyectos.filter(p => p.responsable_designado === viewDelegate).map(p => p.responsable_sirc))).map(sircName => (
                            <div key={sircName} className="delegation-list-item">
                                <span>{sircName}</span>
                                <button onClick={() => clearMassDelegation(sircName, viewDelegate)} style={{background:'none', border:'none', color:'#ef4444'}}><Trash2 size={16}/></button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <h3 style={{fontSize: 15, margin: '0 0 10px'}}>Nueva Delegación:</h3>
            <label style={{fontSize: 11, fontWeight: 800}}>DE (Origen - Selección múltiple):</label>
            <div className="selector-box">
                {listaResponsables.map(nombre => (
                    <div key={nombre} className="selector-item" onClick={() => setSelectedSources(prev => prev.includes(nombre) ? prev.filter(n => n !== nombre) : [...prev, nombre])}>
                        <div style={{width: 16, height: 16, borderRadius: 4, border: '2px solid #cbd5e1', background: selectedSources.includes(nombre) ? 'var(--alfaco-azul)' : 'transparent', display:'flex', alignItems:'center', justifyContent:'center'}}>
                            {selectedSources.includes(nombre) && <Save size={10} color="white"/>}
                        </div>
                        {nombre}
                    </div>
                ))}
            </div>
            
            <div style={{height: 15}}/>
            <label style={{fontSize: 11, fontWeight: 800}}>A (Destino - Quién asume):</label>
            <select style={{width:'100%', padding: 12, borderRadius: 10, marginTop: 5}} value={targetRes} onChange={e => setTargetRes(e.target.value)}>
                <option value="">Seleccionar responsable...</option>
                {listaResponsables.map(n => <option key={n} value={n}>{n}</option>)}
            </select>

            <button onClick={handleMassDelegate} style={{background:'var(--alfaco-azul)', color:'white', border:'none', width:'100%', padding:15, borderRadius:15, fontWeight:'bold', marginTop:20}} disabled={updatingMass || selectedSources.length === 0 || !targetRes}>
                {updatingMass ? "ACTUALIZANDO..." : "ASIGNAR CARGA"}
            </button>
          </div>
        </div>
      )}

      {/* MODAL INDIVIDUAL */}
      {editingProject && (
        <div className="modal-overlay" onClick={() => setEditingProject(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2 style={{fontFamily:'Sora', color:'var(--alfaco-azul)', margin:0, fontSize: 19}}>Asignar Delegado</h2>
            <p style={{fontSize: 14, fontWeight: 800, marginTop: 10, color: 'var(--alfaco-azul)'}}>{editingProject.cod_proyecto}</p>
            <input style={{width:'100%', padding: 14, borderRadius: 12, border: '1px solid #e2e8f0', marginTop: 15, boxSizing: 'border-box'}} value={newResponsible} onChange={e => setNewResponsible(e.target.value)} placeholder="Nombre del delegado..." />
            <div style={{display:'flex', gap: 10, marginTop: 20}}>
                <button onClick={() => updateIndividual(true)} style={{flex: 1, background:'#fee2e2', color:'#ef4444', border:'none', padding: 15, borderRadius: 12, fontWeight:'bold', display:'flex', alignItems:'center', justifyContent:'center', gap:8}}><Trash2 size={18}/> LIMPIAR</button>
                <button onClick={() => updateIndividual(false)} style={{flex: 2, background:'var(--alfaco-azul)', color:'white', border:'none', padding: 15, borderRadius: 12, fontWeight:'bold', display:'flex', alignItems:'center', justifyContent:'center', gap:8}}><Save size={18}/> GUARDAR</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}