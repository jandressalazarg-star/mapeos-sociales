"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  // 🛡️ Verificar si ya hay sesión al cargar
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        window.location.assign("/dashboard");
      } else {
        setCheckingSession(false);
      }
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
      setError(loginError.message === "Invalid login credentials" ? "Correo o contraseña incorrectos." : loginError.message);
      setLoading(false);
    } else if (data.session) {
      window.location.assign("/dashboard");
    }
  };

  if (checkingSession) return <div style={{ background: '#001e3c', height: '100vh' }}></div>;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&family=DM+Sans:wght@400;500&display=swap');
        :root { --blue-950: #001e3c; --blue-500: #2563eb; --blue-300: #93c5fd; }
        body { margin: 0; font-family: 'DM Sans', sans-serif; background: var(--blue-950); }
        .page { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; position: relative; overflow: hidden; }
        .page::before { content: ''; position: fixed; inset: 0; background: radial-gradient(ellipse 80% 60% at 20% -10%, rgba(37,99,235,0.35) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 90% 110%, rgba(30,77,155,0.4) 0%, transparent 55%); z-index: 0; }
        .card { position: relative; z-index: 1; width: 100%; max-width: 400px; background: rgba(255, 255, 255, 0.035); backdrop-filter: blur(24px); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 24px; padding: 40px 32px; box-shadow: 0 32px 64px rgba(0, 0, 0, 0.45); }
        .brand { display: flex; align-items: center; gap: 10px; margin-bottom: 30px; }
        .brand-icon { width: 36px; height: 36px; background: linear-gradient(135deg, #1a5299, #3b82f6); border-radius: 10px; display: flex; align-items: center; justify-content: center; }
        .brand-name { font-family: 'Sora'; font-size: 17px; font-weight: 600; color: white; }
        h1 { font-family: 'Sora'; font-size: 24px; color: white; margin-bottom: 8px; }
        p.sub { color: var(--blue-300); font-size: 14px; margin-bottom: 25px; opacity: 0.8; }
        label { display: block; font-size: 11px; color: var(--blue-300); text-transform: uppercase; margin-bottom: 8px; font-weight: 600; }
        input { width: 100%; height: 48px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 0 15px; color: white; outline: none; margin-bottom: 20px; }
        .btn-submit { width: 100%; height: 52px; background: linear-gradient(135deg, #1e40af, #3b82f6); color: white; border: none; border-radius: 12px; font-family: 'Sora'; font-weight: 700; cursor: pointer; box-shadow: 0 4px 15px rgba(37,99,235,0.3); }
        .error { color: #f87171; font-size: 13px; margin-bottom: 15px; text-align: center; }
      `}</style>
      <div className="page">
        <div className="card">
          <div className="brand">
            <div className="brand-icon"><div style={{width:15, height:15, background:'white', borderRadius:3}}></div></div>
            <span className="brand-name">AlfaCo Mapeos</span>
          </div>
          <h1>Bienvenido</h1>
          <p className="sub">Ingresa tus credenciales para continuar</p>
          <form onSubmit={handleLogin}>
            <label>Correo Electrónico</label>
            <input type="email" placeholder="usuario@alfaco.com.pe" value={email} onChange={e => setEmail(e.target.value)} required />
            <label>Contraseña</label>
            <input type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
            {error && <div className="error">{error}</div>}
            <button type="submit" disabled={loading} className="btn-submit">
              {loading ? "INGRESANDO..." : "INGRESAR"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}