"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { LogOut, Plus, Search, Map, BarChart3, ChevronRight, Loader2 } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const [proyectos, setProyectos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        window.location.href = "/";
      } else {
        const { data, error } = await supabase
          .from("proyectos")
          .select("*")
          .order("created_at", { ascending: false });

        setProyectos(data ?? []);
        setLoading(false);
      }
    };
    checkUser();
  }, []);

  const handleLogout = async () => {
    if(confirm("¿Deseas cerrar sesión?")) {
      await supabase.auth.signOut();
      window.location.href = "/";
    }
  };

  // Recuentos para las cápsulas
  const countMallas = proyectos.filter(p => p.clasificacion?.toUpperCase() === "MALLA").length;
  const countExt = proyectos.filter(p => p.clasificacion?.toUpperCase() === "EXTENSIÓN" || p.clasificacion?.toUpperCase() === "EXTENSION").length;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return proyectos;
    return proyectos.filter(p =>
      p.codigo?.toLowerCase().includes(q) ||
      p.distrito?.toLowerCase().includes(q)
    );
  }, [query, proyectos]);

  if (loading) return (
    <div style={{ background: '#f4f7fa', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Loader2 className="animate-spin text-[#283c91]" size={40} />
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700&family=DM+Sans:wght@400;500;700&display=swap');
        
        :root {
          --alfaco-azul: #283c91;
          --alfaco-plomo: #5a5a5a;
          --alfaco-celeste: #0aa0e1;
          --bg-main: #f4f7fa;
        }

        body { margin: 0; background: var(--bg-main); font-family: 'DM Sans', sans-serif; color: var(--alfaco-plomo); }
        
        .header { 
          position: sticky; top: 0; z-index: 30; 
          background: white; border-bottom: 1px solid #e2e8f0; 
          padding: 15px 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.03);
        }
        
        .header-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 15px; }
        .logo-nav { height: 32px; width: auto; object-fit: contain; }

        .btn-logout { 
          width: 38px; height: 38px; border-radius: 12px; border: none; 
          display: flex; align-items: center; justify-content: center; 
          background: rgba(225,30,45,0.05); color: #e11e2d; cursor: pointer;
        }

        .search-box { position: relative; }
        .search-box input { 
          width: 100%; height: 48px; padding: 0 45px; 
          background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 16px; 
          font-size: 14px; outline: none; transition: 0.2s;
        }
        .search-box input:focus { background: white; border-color: var(--alfaco-celeste); box-shadow: 0 0 0 4px rgba(10,160,225,0.1); }
        .search-icon { position: absolute; left: 15px; top: 15px; color: var(--alfaco-azul); opacity: 0.5; }

        .btn-resumen-full {
          display: flex; align-items: center; justify-content: center; gap: 10px;
          width: 100%; height: 44px; margin-top: 12px;
          background: white; border: 1px solid #e2e8f0; border-radius: 14px;
          color: var(--alfaco-azul); font-size: 13px; font-weight: 700; text-decoration: none;
        }

        .stats-strip { 
          display: flex; gap: 10px; padding: 12px 20px; 
          background: white; border-bottom: 1px solid #e2e8f0;
          overflow-x: auto; scrollbar-width: none;
        }
        
        .stat-pill { 
          flex-shrink: 0; padding: 8px 16px; background: white; 
          border-radius: 20px; border: 1.5px solid #e2e8f0; 
          font-size: 12px; font-weight: 700;
        }

        .content { padding: 20px; display: flex; flex-direction: column; gap: 16px; }
        
        .card { 
          background: white; border-radius: 24px; padding: 22px; 
          border: 1px solid rgba(226, 232, 240, 0.8); 
          box-shadow: 0 8px 16px rgba(40,60,145,0.04);
          position: relative; overflow: hidden; transition: 0.2s; cursor: pointer;
        }
        .card:hover { transform: translateY(-2px); box-shadow: 0 12px 24px rgba(40,60,145,0.08); }
        
        .card-accent { position: absolute; left: 0; top: 0; bottom: 0; width: 6px; }

        .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
        .project-code { font-family: 'Sora'; font-size: 19px; color: var(--alfaco-azul); font-weight: 700; }
        
        .badge { 
          font-size: 10px; padding: 6px 14px; border-radius: 12px; 
          font-weight: 800; text-transform: uppercase; color: white;
          box-shadow: 0 4px 8px rgba(0,0,0,0.08);
        }

        .card-body p { margin: 6px 0; font-size: 14px; color: var(--alfaco-plomo); line-height: 1.4; }
        .card-body strong { color: #0f172a; }

        .card-footer { 
          margin-top: 18px; padding-top: 18px; border-top: 1px solid #f1f5f9; 
          display: flex; justify-content: space-between; align-items: center;
        }
        .date { font-size: 11px; opacity: 0.5; font-weight: 500; }
        
        .btn-view { font-size: 12px; font-weight: 700; display: flex; align-items: center; gap: 4px; }

        .fab { 
          position: fixed; bottom: 30px; right: 20px; 
          background: linear-gradient(135deg, var(--alfaco-azul) 0%, var(--alfaco-celeste) 100%);
          color: white; padding: 16px 24px; border-radius: 20px; border: none; 
          font-family: 'Sora'; font-weight: 700; font-size: 14px;
          box-shadow: 0 12px 24px rgba(40,60,145,0.3);
          display: flex; align-items: center; gap: 10px; z-index: 40;
        }
      `}</style>

      <div className="dashboard">
        <header className="header">
          <div className="header-top">
            <img src="/logo-horizontal.png" alt="AlfaCo" className="logo-nav" />
            <button className="btn-logout" onClick={handleLogout}><LogOut size={20} /></button>
          </div>

          <div className="search-box">
            <Search className="search-icon" size={18} />
            <input type="text" placeholder="Buscar por código o distrito..." value={query} onChange={e => setQuery(e.target.value)} />
          </div>

          <Link href="/resumen" className="btn-resumen-full">
            <BarChart3 size={18} /> Ver Resumen General
          </Link>
        </header>

        <div className="stats-strip">
          {/* 👇 Cápsulas actualizadas con borde y texto del mismo color, fondo blanco */}
          <div className="stat-pill" style={{ borderColor: 'var(--alfaco-plomo)', color: 'var(--alfaco-plomo)' }}>
            Total: {proyectos.length}
          </div>
          <div className="stat-pill" style={{ borderColor: 'var(--alfaco-azul)', color: 'var(--alfaco-azul)' }}>
            Mallas: {countMallas}
          </div>
          <div className="stat-pill" style={{ borderColor: 'var(--alfaco-celeste)', color: 'var(--alfaco-celeste)' }}>
            Extensiones: {countExt}
          </div>
        </div>

        <main className="content">
          {filtered.length === 0 ? (
            <div style={{textAlign:'center', padding:'40px', opacity:0.5}}>
              <Map size={48} style={{margin:'0 auto 10px'}} /><p>No se encontraron proyectos</p>
            </div>
          ) : (
            filtered.map((p) => {
              const isMalla = p.clasificacion?.toUpperCase() === "MALLA";
              const colorBase = isMalla ? 'var(--alfaco-azul)' : 'var(--alfaco-celeste)';

              return (
                <div key={p.id} className="card" onClick={() => router.push(`/proyectos/${p.id}`)}>
                  <div className="card-accent" style={{ background: colorBase }} />
                  <div className="card-header">
                    <span className="project-code">{p.codigo}</span>
                    <span className="badge" style={{ backgroundColor: colorBase }}>
                      {p.clasificacion}
                    </span>
                  </div>
                  <div className="card-body">
                    <p>Distrito: <strong>{p.distrito}</strong></p>
                    <p>Malla: <strong>{p.malla}</strong> | Sector: <strong>{p.sector}</strong></p>
                  </div>
                  <div className="card-footer">
                    <span className="date">Registrado el {new Date(p.created_at).toLocaleDateString()}</span>
                    <span className="btn-view" style={{ color: colorBase }}>
                      GESTIONAR <ChevronRight size={16} />
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </main>

        <button className="fab" onClick={() => router.push("/proyectos/nuevo")}>
          <Plus size={20} /> REGISTRAR PROYECTO
        </button>
      </div>
    </>
  );
}