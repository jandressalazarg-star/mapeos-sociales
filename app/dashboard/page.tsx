"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { LogOut, Plus, Search, Map, BarChart3, ChevronRight } from "lucide-react";

/* ─── Types ───────────────────────────────────────────────── */
interface Proyecto {
  id: string;
  codigo: string;
  sector: string;
  malla: string;
  distrito: string;
  clasificacion: "Malla" | "Extensión";
  extension?: string;
  created_at: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [fetchError, setFetchError] = useState(false);

  /* ── 🛡️ Protección de Ruta ── */
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/");
      } else {
        fetchProyectos();
      }
    };
    checkUser();
  }, [router]);

  const fetchProyectos = async () => {
    const { data, error } = await supabase
      .from("proyectos")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) { setFetchError(true); }
    else { setProyectos(data ?? []); }
    setLoading(false);
  };

  const handleLogout = async () => {
    if(confirm("¿Deseas cerrar sesión?")) {
      await supabase.auth.signOut();
      router.replace("/");
    }
  };

  /* ── Filtro ── */
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return proyectos;
    return proyectos.filter(p =>
      p.codigo?.toLowerCase().includes(q)   ||
      p.sector?.toLowerCase().includes(q)   ||
      p.malla?.toLowerCase().includes(q)    ||
      p.distrito?.toLowerCase().includes(q)
    );
  }, [query, proyectos]);

  if (loading) return <div style={{ background: '#001e3c', height: '100vh' }}></div>;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --blue-950: #001e3c; --blue-900: #00264d; --blue-800: #003366;
          --blue-700: #0a4080; --blue-600: #1a5299; --blue-500: #2563eb;
          --blue-400: #3b82f6; --blue-300: #93c5fd; --white: #ffffff;
          --amber: #fbbf24; --font-display: 'Sora', sans-serif; --font-body: 'DM Sans', sans-serif;
        }
        html, body { font-family: var(--font-body); background: var(--blue-950); color: #fff; }
        .page { min-height: 100dvh; display: flex; flex-direction: column; padding: 0 0 100px; position: relative; overflow-x: hidden; }
        
        .page::before {
          content: ''; position: fixed; inset: 0;
          background:
            radial-gradient(ellipse 80% 50% at 10% -8%, rgba(26,82,153,.5) 0%, transparent 56%),
            radial-gradient(ellipse 55% 40% at 95% 105%, rgba(0,51,102,.6) 0%, transparent 52%);
          pointer-events: none; z-index: 0;
        }

        .header { position: sticky; top: 0; z-index: 20; background: rgba(0,30,60,.75); backdrop-filter: blur(20px); border-bottom: 1px solid rgba(255,255,255,.06); padding: 14px 18px 12px; }
        .header-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
        .brand { display: flex; align-items: center; gap: 9px; }
        .brand-icon { width: 34px; height: 34px; border-radius: 10px; background: linear-gradient(135deg, var(--blue-700), var(--blue-400)); display: flex; align-items: center; justify-content: center; box-shadow: 0 3px 12px rgba(37,99,235,.55); }
        .brand-icon svg { width: 16px; height: 16px; color: #fff; }
        .brand-name { font-family: var(--font-display); font-size: 15px; font-weight: 700; color: var(--white); }
        
        .avatar-btn { width: 34px; height: 34px; border-radius: 50%; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); display: flex; align-items: center; justify-content: center; color: #f87171; cursor: pointer; }
        
        .search-wrap { position: relative; margin-bottom: 10px; }
        .search-ico { position: absolute; left: 13px; top: 14px; color: var(--blue-300); opacity: .55; }
        .search-input { width: 100%; height: 44px; padding: 0 40px; background: rgba(255,255,255,.065); border: 1px solid rgba(255,255,255,.1); border-radius: 12px; color: var(--white); outline: none; }
        
        /* 📊 Botón Resumen */
        .btn-resumen {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          width: 100%; height: 42px; background: rgba(255,255,255,.07);
          border: 1px solid rgba(255,255,255,.13); border-radius: 12px;
          color: rgba(255,255,255,.82); font-family: var(--font-display);
          font-size: 13px; font-weight: 600; text-decoration: none; transition: 0.2s;
        }
        .btn-resumen:active { background: rgba(59,130,246,.2); transform: scale(0.98); }

        .body { position: relative; z-index: 1; padding: 20px 16px 0; flex: 1; }
        .stats-bar { display: flex; gap: 10px; margin-bottom: 20px; }
        .stat-pill { display: flex; align-items: center; gap: 7px; padding: 7px 13px; background: rgba(255,255,255,.045); border: 1px solid rgba(255,255,255,.07); border-radius: 20px; font-size: 11px; color: rgba(255,255,255,.65); }
        
        .cards { display: flex; flex-direction: column; gap: 12px; }
        .card { background: rgba(255,255,255,.042); backdrop-filter: blur(24px); border: 1px solid rgba(255,255,255,.08); border-radius: 18px; padding: 18px; position: relative; overflow: hidden; }
        .card-accent { position: absolute; left: 0; top: 14px; bottom: 14px; width: 3px; border-radius: 0 3px 3px 0; }
        .card-codigo { font-family: var(--font-display); font-size: 17px; font-weight: 700; color: #fff; }
        .badge { padding: 4px 10px; border-radius: 20px; font-size: 10px; font-weight: 600; }
        .badge-malla { background: rgba(37,99,235,.18); color: var(--blue-300); border: 1px solid rgba(59,130,246,.2); }
        .badge-extension { background: rgba(251,191,36,.12); color: #fcd34d; border: 1px solid rgba(251,191,36,.2); }
        .meta-item { display: flex; align-items: center; gap: 6px; font-size: 12.5px; color: rgba(255,255,255,.6); margin-top: 8px; }
        
        .fab { position: fixed; bottom: 24px; right: 20px; z-index: 30; display: flex; align-items: center; gap: 8px; padding: 0 20px; height: 52px; border-radius: 26px; background: linear-gradient(135deg, var(--blue-700), var(--blue-500)); color: #fff; border: none; font-weight: 700; box-shadow: 0 6px 24px rgba(37,99,235,.55); }
      `}</style>

      <div className="page">
        <header className="header">
          <div className="header-top">
            <div className="brand">
              <div className="brand-icon"><Map size={18} /></div>
              <div>
                <span className="brand-name">AlfaCo</span>
                <p style={{ fontSize: '10px', color: 'var(--blue-300)', opacity: 0.6 }}>RELACIONES COMUNITARIAS</p>
              </div>
            </div>
            <button className="avatar-btn" onClick={handleLogout}><LogOut size={16} /></button>
          </div>

          <div className="search-wrap">
            <Search className="search-ico" size={16} />
            <input 
              className="search-input" 
              placeholder="Buscar proyecto..." 
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>

          {/* 👇 El Botón de Resumen Reintegrado */}
          <Link href="/resumen" className="btn-resumen">
            <BarChart3 size={16} />
            Ver Resumen General
          </Link>
        </header>

        <div className="body">
          <div className="stats-bar">
            <div className="stat-pill">Total: <strong>{proyectos.length}</strong></div>
            <div className="stat-pill">Malla: <strong>{proyectos.filter(p => p.clasificacion === "Malla").length}</strong></div>
            <div className="stat-pill">Ext.: <strong>{proyectos.filter(p => p.clasificacion === "Extensión").length}</strong></div>
          </div>

          <div className="cards">
            {filtered.map((p) => (
              <div key={p.id} className="card" onClick={() => router.push(`/proyectos/${p.id}`)}>
                <div className="card-accent" style={{ background: p.clasificacion === "Malla" ? "var(--blue-500)" : "var(--amber)" }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="card-codigo">{p.codigo || "—"}</span>
                  <span className={`badge ${p.clasificacion === "Malla" ? "badge-malla" : "badge-extension"}`}>{p.clasificacion}</span>
                </div>
                <div className="meta-item">Distrito: <strong>{p.distrito}</strong></div>
                <div className="meta-item">Sector: {p.sector} | Malla: {p.malla}</div>
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: '12px', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '10px', opacity: 0.4 }}>{new Date(p.created_at).toLocaleDateString()}</span>
                  <span style={{ color: 'var(--blue-400)', fontSize: '12px', fontWeight: 'bold' }}>VER MAPEO →</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button className="fab" onClick={() => router.push("/proyectos/nuevo")}>
          <Plus size={20} /> Registrar Proyecto
        </button>
      </div>
    </>
  );
}