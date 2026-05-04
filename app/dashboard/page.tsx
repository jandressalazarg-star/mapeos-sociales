"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { LogOut, Loader2 } from "lucide-react";

export default function DashboardMenu() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) router.replace("/");
      else {
        const rawName = session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || "Usuario";
        setUserName(rawName.split(/[.@0-9_-]/)[0].charAt(0).toUpperCase() + rawName.split(/[.@0-9_-]/)[0].slice(1).toLowerCase());
        setLoading(false);
      }
    };
    check();
  }, [router]);

  if (loading) return <div style={{height:'100vh', display:'flex', alignItems:'center', justifyContent:'center'}}><Loader2 className="animate-spin" size={40} color="#283c91" /></div>;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700&family=DM+Sans:wght@400;500;700&display=swap');
        :root { --alfaco-azul: #283c91; --alfaco-celeste: #0aa0e1; --bg-main: #f4f7fa; }
        body { margin: 0; background: var(--bg-main); font-family: 'DM Sans', sans-serif; }
        .header { background: white; border-bottom: 1px solid #e2e8f0; padding: 15px 20px; display: flex; justify-content: space-between; align-items: center; }
        .menu-container { padding: 40px 20px; max-width: 600px; margin: 0 auto; text-align: center; }
        .welcome-text h1 { font-family: 'Sora'; color: var(--alfaco-azul); font-size: 36px; margin: 0; }
        .module-card { background: white; border-radius: 28px; padding: 32px; display: flex; align-items: center; gap: 24px; border: 1px solid #e2e8f0; transition: 0.2s; cursor: pointer; margin-top: 20px; box-shadow: 0 10px 20px rgba(0,0,0,0.05); }
        .module-card:hover { transform: translateY(-5px); border-color: var(--alfaco-celeste); }
        .icon-box { width: 70px; height: 70px; border-radius: 22px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
      `}</style>

      <header className="header">
        <img src="/logo-horizontal.png" alt="AlfaCo" style={{height:'32px'}} />
        <button style={{background:'none', border:'none', color:'#e11e2d'}} onClick={() => supabase.auth.signOut().then(()=>router.replace("/"))}><LogOut size={20} /></button>
      </header>

      <main className="menu-container">
        <div className="welcome-text" style={{marginBottom: '35px'}}>
          <h1>¡Bienvenido(a), {userName}!</h1>
          <p style={{fontSize:'18px', opacity:0.7}}>Selecciona el módulo de trabajo</p>
        </div>

        <div className="module-card" onClick={() => router.push("/dashboard/mapeos")}>
          <div className="icon-box" style={{background: 'var(--alfaco-azul)'}}>
            <img src="/icon-mapeos.png" alt="Mapeos" style={{width:'38px'}} />
          </div>
          <div style={{textAlign: 'left'}}>
            <h2 style={{fontFamily:'Sora', fontSize: '22px', margin: 0, color: '#283c91'}}>Mapeos Sociales</h2>
            <p style={{margin: '6px 0 0', fontSize: '15px', opacity: 0.8}}>Gestión de instituciones y campo.</p>
          </div>
        </div>

        <div className="module-card" onClick={() => router.push("/dashboard/semaforo")}>
          <div className="icon-box" style={{background: '#f59e0b'}}>
            <img src="/icon-semaforo.png" alt="Semáforo" style={{width:'38px'}} />
          </div>
          <div style={{textAlign: 'left'}}>
            <h2 style={{fontFamily:'Sora', fontSize: '22px', margin: 0, color: '#283c91'}}>Semáforo Social</h2>
            <p style={{margin: '6px 0 0', fontSize: '15px', opacity: 0.8}}>Programación y reportes semanales.</p>
          </div>
        </div>
      </main>
    </>
  );
}