"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Lock, Mail, Eye, EyeOff, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) window.location.assign("/dashboard");
      else setCheckingSession(false);
    };
    checkUser();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error: loginError } = await supabase.auth.signInWithPassword({
      email, password,
    });

    if (loginError) {
      setError("Credenciales incorrectas. Intenta de nuevo.");
      setLoading(false);
    } else if (data.session) {
      window.location.assign("/dashboard");
    }
  };

  if (checkingSession) return <div style={{ background: '#f4f7fa', height: '100vh' }}></div>;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&family=DM+Sans:wght@400;500;700&display=swap');
        
        :root {
          --alfaco-azul: #283c91;
          --alfaco-plomo: #5a5a5a;
          --alfaco-celeste: #0aa0e1;
          --alfaco-rojo: #e11e2d;
          --bg-light: #f4f7fa;
        }

        body { margin: 0; font-family: 'DM Sans', sans-serif; background: var(--bg-light); color: var(--alfaco-plomo); }
        
        .page { 
          min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; 
          background-image: radial-gradient(circle at 0% 0%, rgba(40,60,145,0.05) 0%, transparent 40%),
                            radial-gradient(circle at 100% 100%, rgba(10,160,225,0.08) 0%, transparent 40%);
        }

        .card { 
          background: white; border-radius: 28px; padding: 50px 35px; width: 100%; max-width: 420px;
          box-shadow: 0 20px 40px rgba(40,60,145,0.08); border: 1px solid rgba(255,255,255,0.8);
          text-align: center;
        }

        /* 🎯 Centrado absoluto del área del logo */
        .logo-area { 
          margin-bottom: 35px; 
          display: flex; 
          flex-direction: column; 
          align-items: center; 
        }

        /* 🚀 Logo horizontal sin caja de fondo */
        .logo-img { 
          width: auto; 
          max-width: 260px; /* Un poco más grande para que destaque */
          height: auto;
          max-height: 55px; 
          margin-bottom: 20px;
          object-fit: contain;
          display: block;
        }

        h1 { font-family: 'Sora'; color: var(--alfaco-azul); font-size: 26px; font-weight: 700; margin: 0; letter-spacing: -0.5px; }
        p.subtitle { color: var(--alfaco-plomo); font-size: 15px; margin-top: 5px; margin-bottom: 0; opacity: 0.8; font-weight: 500; letter-spacing: 0.5px; }

        .input-group { text-align: left; margin-top: 30px; margin-bottom: 20px; position: relative; }
        label { display: block; font-size: 11px; font-weight: 700; color: var(--alfaco-azul); text-transform: uppercase; margin-bottom: 8px; margin-left: 5px; opacity: 0.9; }
        
        .input-wrapper { position: relative; display: flex; align-items: center; }
        .field-icon { position: absolute; left: 15px; color: var(--alfaco-azul); opacity: 0.5; pointer-events: none; }
        
        input { 
          width: 100%; height: 52px; background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 16px; 
          padding: 0 45px 0 45px; /* Espacio simétrico para iconos */
          color: var(--alfaco-plomo); font-size: 15px; outline: none; transition: 0.3s;
        }
        input:focus { border-color: var(--alfaco-celeste); background: white; box-shadow: 0 0 0 4px rgba(10,160,225,0.1); }

        /* 👁️ Centrado del ojo corregido */
        .btn-show { 
          position: absolute; 
          right: 12px; 
          height: 40px; 
          width: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: none; 
          border: none; 
          cursor: pointer; 
          color: var(--alfaco-azul); 
          opacity: 0.4; 
          transition: 0.2s;
        }
        .btn-show:hover { opacity: 0.8; }

        .btn-login { 
          width: 100%; height: 56px; margin-top: 15px;
          background: linear-gradient(135deg, var(--alfaco-azul) 0%, var(--alfaco-celeste) 100%);
          color: white; border: none; border-radius: 18px; font-family: 'Sora'; font-weight: 700; font-size: 16px;
          cursor: pointer; transition: 0.3s; box-shadow: 0 8px 20px rgba(40,60,145,0.25);
          display: flex; align-items: center; justify-content: center; gap: 10px;
        }
        .btn-login:hover { transform: translateY(-2px); box-shadow: 0 12px 25px rgba(40,60,145,0.35); }

        .error-msg { background: rgba(225,30,45,0.05); color: var(--alfaco-rojo); padding: 12px; border-radius: 12px; font-size: 13px; margin-bottom: 20px; font-weight: 500; border: 1px solid rgba(225,30,45,0.1); }
      `}</style>

      <div className="page">
        <div className="card">
          <div className="logo-area">
            <img src="/logo-horizontal.png" alt="AlfaCo" className="logo-img" />
            <h1>Mapeos Sociales</h1>
            <p className="subtitle">Relaciones Comunitarias</p>
          </div>

          <form onSubmit={handleLogin}>
            {error && <div className="error-msg">{error}</div>}

            <div className="input-group">
              <label>Correo Institucional</label>
              <div className="input-wrapper">
                <Mail size={18} className="field-icon" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="usuario@alfaco.com.pe" required />
              </div>
            </div>

            <div className="input-group">
              <label>Contraseña</label>
              <div className="input-wrapper">
                <Lock size={18} className="field-icon" />
                <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
                <button type="button" className="btn-show" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-login" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" size={20} /> : "Iniciar Sesión"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}