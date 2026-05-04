"use client";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { LogOut, Plus, Search, Map, BarChart3, ChevronRight, Loader2, ArrowLeft } from "lucide-react";

export default function MapeosPage() {
  const router = useRouter();
  const [proyectos, setProyectos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.replace("/"); }
      else {
        const { data } = await supabase.from("proyectos").select("*").order("created_at", { ascending: false });
        setProyectos(data ?? []);
        setLoading(false);
      }
    };
    checkUser();
  }, [router]);

  const countMallas = proyectos.filter(p => p.clasificacion?.toUpperCase() === "MALLA").length;
  const countExt = proyectos.filter(p => p.clasificacion?.toUpperCase() === "EXTENSIÓN" || p.clasificacion?.toUpperCase() === "EXTENSION").length;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? proyectos.filter(p => p.codigo?.toLowerCase().includes(q) || p.distrito?.toLowerCase().includes(q)) : proyectos;
  }, [query, proyectos]);

  if (loading) return <div style={{height:'100vh', display:'flex', alignItems:'center', justifyContent:'center'}}><Loader2 className="animate-spin" size={40} color="#283c91" /></div>;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700&family=DM+Sans:wght@400;500;700&display=swap');
        :root { --alfaco-azul: #283c91; --alfaco-plomo: #5a5a5a; --alfaco-celeste: #0aa0e1; --bg-main: #f4f7fa; }
        body { margin: 0; background: var(--bg-main); font-family: 'DM Sans', sans-serif; }
        .header { position: sticky; top: 0; z-index: 30; background: white; border-bottom: 1px solid #e2e8f0; padding: 15px 20px; }
        .header-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 15px; }
        .logo-nav { height: 32px; }
        .search-box { position: relative; }
        .search-box input { width: 100%; height: 48px; padding: 0 45px; background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 16px; outline: none; }
        .stats-strip { display: flex; gap: 10px; padding: 12px 20px; background: white; border-bottom: 1px solid #e2e8f0; overflow-x: auto; }
        .stat-pill { flex-shrink: 0; padding: 8px 16px; background: white; border-radius: 20px; border: 1.5px solid #e2e8f0; font-size: 12px; font-weight: 700; }
        .content { padding: 20px; display: flex; flex-direction: column; gap: 16px; }
        .card { background: white; border-radius: 24px; padding: 22px; border: 1px solid #e2e8f0; position: relative; overflow: hidden; cursor: pointer; }
        .card-accent { position: absolute; left: 0; top: 0; bottom: 0; width: 6px; }
        .project-code { font-family: 'Sora'; font-size: 19px; color: var(--alfaco-azul); font-weight: 700; }
        .badge { font-size: 10px; padding: 6px 14px; border-radius: 12px; font-weight: 800; color: white; }
        .fab { position: fixed; bottom: 30px; right: 20px; background: linear-gradient(135deg, var(--alfaco-azul), var(--alfaco-celeste)); color: white; padding: 16px 24px; border-radius: 20px; border: none; font-weight: 700; display: flex; gap: 10px; box-shadow: 0 12px 24px rgba(40,60,145,0.3); }
      `}</style>

      <header className="header">
        <div className="header-top">
          <button onClick={() => router.push("/dashboard")} style={{background:'none', border:'none', color:'var(--alfaco-azul)', display:'flex', alignItems:'center', gap:'5px', cursor:'pointer', fontWeight:'bold'}}>
            <ArrowLeft size={20}/> Menú
          </button>
          <img src="/logo-horizontal.png" alt="AlfaCo" className="logo-nav" />
          <button className="btn-logout" style={{background:'none', border:'none', color:'#e11e2d'}} onClick={() => supabase.auth.signOut().then(()=>router.replace("/"))}><LogOut size={20} /></button>
        </div>
        <div className="search-box">
          <Search style={{position:'absolute', left:15, top:15, opacity:0.5}} size={18} />
          <input type="text" placeholder="Buscar por código o distrito..." value={query} onChange={e => setQuery(e.target.value)} />
        </div>
      </header>

      <div className="stats-strip">
        <div className="stat-pill" style={{color:'var(--alfaco-plomo)'}}>Total: {proyectos.length}</div>
        <div className="stat-pill" style={{color:'var(--alfaco-azul)'}}>Mallas: {countMallas}</div>
        <div className="stat-pill" style={{color:'var(--alfaco-celeste)'}}>Ext.: {countExt}</div>
      </div>

      <main className="content">
        {filtered.map((p) => (
          <div key={p.id} className="card" onClick={() => router.push(`/proyectos/${p.id}`)}>
            <div className="card-accent" style={{ background: p.clasificacion?.toUpperCase() === "MALLA" ? 'var(--alfaco-azul)' : 'var(--alfaco-celeste)' }} />
            <div style={{display:'flex', justifyContent:'space-between', marginBottom: '14px'}}>
              <span className="project-code">{p.codigo}</span>
              <span className="badge" style={{ background: p.clasificacion?.toUpperCase() === "MALLA" ? 'var(--alfaco-azul)' : 'var(--alfaco-celeste)' }}>{p.clasificacion}</span>
            </div>
            <p style={{margin:'6px 0', fontSize:'14px'}}>Distrito: <strong>{p.distrito}</strong></p>
            <p style={{margin:'6px 0', fontSize:'14px'}}>Malla: <strong>{p.malla}</strong></p>
            <div style={{marginTop: '18px', paddingTop: '18px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <span style={{fontSize:'11px', opacity:0.5}}>Registrado el {new Date(p.created_at).toLocaleDateString()}</span>
              <span style={{color: 'var(--alfaco-azul)', fontWeight:700, fontSize:'12px', display:'flex', alignItems:'center'}}>GESTIONAR <ChevronRight size={16}/></span>
            </div>
          </div>
        ))}
      </main>

      <button className="fab" onClick={() => router.push("/proyectos/nuevo")}>
        <Plus size={20} /> REGISTRAR PROYECTO
      </button>
    </>
  );
}