"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Users, Map, Landmark, Star, ArrowLeft, ChevronRight } from "lucide-react";

/* ─── Types ───────────────────────────────────────────────── */
interface Proyecto {
  id: string;
  codigo: string;
  distrito: string;
  clasificacion: string;
  sector: string;
  malla: string;
}

interface ModuleCard {
  key: string;
  label: string;
  description: string;
  route: string;
  icon: React.ReactNode;
  color: string;
  glow: string;
}

/* ─── Module definitions ──────────────────────────────────── */
function getModules(id: string): ModuleCard[] {
  return [
    {
      key: "organizaciones",
      label: "Organizaciones Sociales",
      description: "Juntas vecinales, asociaciones y grupos comunitarios del área.",
      route: `/proyectos/${id}/organizaciones`,
      color: "rgba(59,130,246,.22)",
      glow: "#3b82f6",
      icon: <Users size={20} />,
    },
    {
      key: "vias",
      label: "Vías del Proyecto",
      description: "Calles, avenidas y pasajes comprendidos en el área.",
      route: `/proyectos/${id}/vias`,
      color: "rgba(52,211,153,.18)",
      glow: "#34d399",
      icon: <Map size={20} />,
    },
    {
      key: "instituciones",
      label: "Instituciones de Impacto",
      description: "Colegios, hospitales, municipios y entidades públicas.",
      route: `/proyectos/${id}/instituciones`,
      color: "rgba(167,139,250,.2)",
      glow: "#a78bfa",
      icon: <Landmark size={20} />,
    },
    {
      key: "elementos",
      label: "Elementos Valorados",
      description: "Patrimonio cultural, áreas verdes y valor social a preservar.",
      route: `/proyectos/${id}/elementos`,
      color: "rgba(251,191,36,.18)",
      glow: "#fbbf24",
      icon: <Star size={20} />,
    },
  ];
}

export default function HubProyecto() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [proyecto, setProyecto] = useState<Proyecto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      const { data } = await supabase
        .from("proyectos")
        .select("*")
        .eq("id", id)
        .single();
      if (data) setProyecto(data);
      setLoading(false);
    };
    load();
  }, [id]);

  const modules = getModules(id);
  const isMalla = proyecto?.clasificacion === "Malla";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500&display=swap');

        .page {
          min-height: 100vh; background: #001e3c; color: #fff;
          font-family: 'DM Sans', sans-serif; position: relative;
        }

        .header {
          position: sticky; top: 0; z-index: 50;
          background: rgba(0,30,60,.8); backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255,255,255,.06);
          padding: 14px 18px; display: flex; align-items: center; gap: 12px;
        }

        .btn-back {
          width: 36px; height: 36px; border-radius: 10px;
          background: rgba(255,255,255,.07); border: 1px solid rgba(255,255,255,.09);
          display: flex; align-items: center; justify-content: center; color: #fff; cursor: pointer;
        }

        .header-chip {
          display: inline-flex; padding: 2px 8px; border-radius: 20px;
          font-size: 10px; font-weight: 700; font-family: 'Sora'; margin-top: 4px;
        }
        .chip-malla { background: rgba(37,99,235,.2); color: #93c5fd; border: 1px solid rgba(59,130,246,.2); }
        .chip-ext { background: rgba(251,191,36,.12); color: #fcd34d; border: 1px solid rgba(251,191,36,.2); }

        .content { max-width: 540px; margin: 0 auto; padding: 24px 16px; }
        
        .module-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }

        .module-card {
          position: relative; overflow: hidden;
          background: rgba(255,255,255,.04); backdrop-filter: blur(24px);
          border: 1px solid rgba(255,255,255,.08); border-radius: 24px;
          padding: 24px 18px; display: flex; flex-direction: column;
          cursor: pointer; transition: all 0.2s ease;
          animation: cardIn 0.5s ease-out both;
        }
        .module-card:hover {
          transform: translateY(-4px); border-color: rgba(255,255,255,0.15);
          box-shadow: 0 12px 30px rgba(0,0,0,0.3);
        }

        .card-glow {
          position: absolute; width: 120px; height: 120px;
          border-radius: 50%; top: -30px; right: -30px;
          opacity: 0.15; filter: blur(25px); pointer-events: none;
        }

        .card-icon-wrap {
          width: 44px; height: 44px; border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 16px; border: 1px solid rgba(255,255,255,0.1);
        }

        .card-label { font-family: 'Sora'; font-size: 14px; font-weight: 700; margin-bottom: 6px; }
        .card-desc { font-size: 11px; color: rgba(255,255,255,0.4); line-height: 1.5; }

        @keyframes cardIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: none; } }
      `}</style>

      <div className="page">
        <div className="header">
          <button className="btn-back" onClick={() => router.push("/dashboard")}>
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 style={{ fontFamily: 'Sora', fontSize: '16px', fontWeight: 800 }}>{proyecto?.codigo || "—"}</h1>
            <span className={isMalla ? "header-chip chip-malla" : "header-chip chip-ext"}>
              {proyecto?.clasificacion}
            </span>
          </div>
        </div>

        <div className="content">
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ fontFamily: 'Sora', fontSize: '20px', fontWeight: 800 }}>Mapeo Social</h2>
            <p style={{ fontSize: '13px', color: '#93c5fd', opacity: 0.6 }}>Gestiona la información de campo</p>
          </div>

          <div className="module-grid">
            {modules.map((mod, i) => (
              <div 
                key={mod.key} 
                className="module-card" 
                style={{ animationDelay: `${i * 0.1}s` }}
                onClick={() => router.push(mod.route)}
              >
                <div className="card-glow" style={{ background: mod.glow }} />
                <div className="card-icon-wrap" style={{ background: mod.color, color: mod.glow }}>
                  {mod.icon}
                </div>
                <div className="card-label">{mod.label}</div>
                <div className="card-desc">{mod.description}</div>
                <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'flex-end', opacity: 0.2 }}>
                  <ChevronRight size={16} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}