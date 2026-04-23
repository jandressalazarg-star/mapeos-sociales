"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Users, Map, Landmark, Star, ArrowLeft, ChevronRight, Loader2, MapPin } from "lucide-react";

/* ─── Types ───────────────────────────────────────────────── */
interface Proyecto {
  id: string;
  codigo: string;
  distrito: string;
  clasificacion: string;
  sector: string;
  malla: string;
  extension?: string;
}

interface ModuleCard {
  key: string;
  label: string;
  description: string;
  route: string;
  icon: React.ReactNode;
  color: string;
}

function getModules(id: string): ModuleCard[] {
  return [
    {
      key: "organizaciones",
      label: "Organizaciones",
      description: "Juntas vecinales y grupos comunitarios.",
      route: `/proyectos/${id}/organizaciones`,
      color: "#0aa0e1",
      icon: <Users size={22} />,
    },
    {
      key: "vias",
      label: "Vías y Calles",
      description: "Mapeo de avenidas y pasajes del área.",
      route: `/proyectos/${id}/vias`,
      color: "#5a5a5a",
      icon: <Map size={22} />,
    },
    {
      key: "instituciones",
      label: "Instituciones",
      description: "Entidades públicas y puntos de impacto.",
      route: `/proyectos/${id}/instituciones`,
      color: "#283c91",
      icon: <Landmark size={22} />,
    },
    {
      key: "elementos",
      label: "Valor Social",
      description: "Patrimonio y áreas verdes a preservar.",
      route: `/proyectos/${id}/elementos`,
      color: "#e11e2d",
      icon: <Star size={22} />,
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
  
  // 🎨 Lógica de Identificación Visual
  const isExt = proyecto?.clasificacion?.toUpperCase() === "EXTENSIÓN" || proyecto?.clasificacion?.toUpperCase() === "EXTENSION";
  
  // El badge y los bordes siguen siendo dinámicos para identificar el tipo
  const typeAccentColor = isExt ? "#0aa0e1" : "#283c91";
  
  // El texto de las cápsulas es SIEMPRE el azul oscuro institucional
  const textPrimaryColor = "#283c91";

  if (loading) return (
    <div style={{ background: '#f4f7fa', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Loader2 className="animate-spin text-[#283c91]" size={40} />
    </div>
  );

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

        .page {
          min-height: 100vh; background: var(--bg-main); color: var(--alfaco-plomo);
          font-family: 'DM Sans', sans-serif;
        }

        .header {
          position: sticky; top: 0; z-index: 50;
          background: white; border-bottom: 1px solid #e2e8f0;
          padding: 12px 18px; display: flex; align-items: center; gap: 14px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.03);
        }

        .btn-back {
          width: 40px; height: 40px; border-radius: 12px;
          background: #f8fafc; border: 1px solid #e2e8f0;
          display: flex; align-items: center; justify-content: center; 
          color: var(--alfaco-azul); cursor: pointer;
        }

        .project-info h1 { font-family: 'Sora'; font-size: 17px; font-weight: 800; color: var(--alfaco-azul); margin: 0; }
        
        .badge-main { 
          display: inline-block; padding: 4px 10px; border-radius: 8px;
          font-size: 10px; font-weight: 800; font-family: 'Sora'; text-transform: uppercase;
          color: white; margin-top: 2px;
        }

        .hero-card {
          background: white; margin: 20px; padding: 24px; border-radius: 28px;
          border: 1px solid rgba(226, 232, 240, 0.8);
          box-shadow: 0 10px 25px rgba(40,60,145,0.05);
        }

        .hero-details { 
          display: grid; 
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); 
          gap: 15px; 
          margin-top: 15px; 
        }

        .detail-item { 
          background: #f8fafc; 
          padding: 12px 16px; 
          border-radius: 16px; 
          border: 1px solid #f1f5f9;
          border-left: 4px solid transparent; 
        }

        .detail-label { font-size: 10px; font-weight: 700; text-transform: uppercase; opacity: 0.6; }
        .detail-value { font-size: 13px; font-weight: 700; display: block; margin-top: 2px; }

        .content { padding: 0 20px 40px; }
        .section-title { font-family: 'Sora'; font-size: 20px; font-weight: 800; color: var(--alfaco-azul); margin-bottom: 20px; }

        .module-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

        .module-card {
          background: white; border-radius: 26px;
          border: 1px solid #e2e8f0; padding: 22px 18px;
          display: flex; flex-direction: column;
          cursor: pointer; transition: 0.2s;
        }
        .module-card:hover { transform: translateY(-5px); border-color: var(--alfaco-celeste); }

        .card-icon-wrap {
          width: 48px; height: 48px; border-radius: 16px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 16px; color: white;
        }

        .card-label { font-family: 'Sora'; font-size: 15px; font-weight: 700; color: var(--alfaco-azul); margin-bottom: 6px; }
        .card-desc { font-size: 11px; color: var(--alfaco-plomo); line-height: 1.4; opacity: 0.8; }

        .chevron-indicator { margin-top: auto; padding-top: 15px; display: flex; justify-content: flex-end; color: var(--alfaco-celeste); opacity: 0.5; }
      `}</style>

      <div className="page">
        <header className="header">
          <button className="btn-back" onClick={() => router.push("/dashboard")}>
            <ArrowLeft size={18} />
          </button>
          <div className="project-info">
            <h1>{proyecto?.codigo || "PROYECTO"}</h1>
            <span className="badge-main" style={{ background: typeAccentColor }}>
              {proyecto?.clasificacion}
            </span>
          </div>
        </header>

        <div className="hero-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--alfaco-azul)', marginBottom: '15px' }}>
            <MapPin size={20} />
            <span style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: '18px' }}>{proyecto?.distrito}</span>
          </div>
          
          <div className="hero-details">
            {/* 🎯 SECTOR: Texto Azul, Borde Dinámico */}
            <div className="detail-item" style={{ borderLeftColor: typeAccentColor }}>
              <span className="detail-label" style={{ color: textPrimaryColor }}>Sector</span>
              <span className="detail-value" style={{ color: textPrimaryColor }}>{proyecto?.sector || "—"}</span>
            </div>

            {/* 🎯 MALLA: Texto Azul, Borde Dinámico */}
            <div className="detail-item" style={{ borderLeftColor: typeAccentColor }}>
              <span className="detail-label" style={{ color: textPrimaryColor }}>Malla</span>
              <span className="detail-value" style={{ color: textPrimaryColor }}>{proyecto?.malla || "—"}</span>
            </div>

            {/* 🎯 EXTENSIÓN: Texto Azul, Borde Dinámico (solo si aplica) */}
            {isExt && proyecto?.extension && (
              <div className="detail-item" style={{ borderLeftColor: typeAccentColor }}>
                <span className="detail-label" style={{ color: textPrimaryColor }}>Extensión</span>
                <span className="detail-value" style={{ color: textPrimaryColor }}>
                  {proyecto?.extension}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="content">
          <h2 className="section-title">Gestión de Campo</h2>
          
          <div className="module-grid">
            {modules.map((mod) => (
              <div key={mod.key} className="module-card" onClick={() => router.push(mod.route)}>
                <div className="card-icon-wrap" style={{ background: mod.color }}>
                  {mod.icon}
                </div>
                <div className="card-label">{mod.label}</div>
                <div className="card-desc">{mod.description}</div>
                <div className="chevron-indicator">
                  <ChevronRight size={18} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}