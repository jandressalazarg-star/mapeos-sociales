"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true); // 👈 Nuevo: estado de carga inicial
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // 🛡️ LÓGICA DE AUTO-LOGIN: 
  // Si abres la app y ya tienes sesión activa, vete directo al Dashboard
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.replace("/dashboard"); // Usamos replace para que no pueda volver atrás al login
      } else {
        setCheckingSession(false);
      }
    };
    checkUser();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error, data } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(
        error.message === "Invalid login credentials"
          ? "Correo o contraseña incorrectos."
          : error.message
      );
      setLoading(false);
    } else if (data.session) {
      // ✅ Redirección forzada tras éxito
      router.push("/dashboard");
    }
  };

  // Mientras verifica si ya estás logueado, mostramos un fondo limpio
  if (checkingSession) {
    return <div style={{ background: '#0a1628', height: '100vh' }}></div>;
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=DM+Sans:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --blue-950: #0a1628; --blue-900: #0d1f3c; --blue-800: #122952;
          --blue-700: #1a3a72; --blue-600: #1e4d9b; --blue-500: #2563eb;
          --blue-400: #3b82f6; --blue-300: #93c5fd; --white: #ffffff;
          --error: #ef4444; --font-display: 'Sora', sans-serif; --font-body: 'DM Sans', sans-serif;
        }

        html, body { height: 100%; font-family: var(--font-body); background: var(--blue-950); }

        .page {
          min-height: 100dvh; display: flex; flex-direction: column;
          align-items: center; justify-content: center; padding: 24px 20px;
          position: relative; overflow: hidden;
        }

        .page::before {
          content: ''; position: fixed; inset: 0;
          background:
            radial-gradient(ellipse 80% 60% at 20% -10%, rgba(37,99,235,0.35) 0%, transparent 60%),
            radial-gradient(ellipse 60% 50% at 90% 110%, rgba(30,77,155,0.4) 0%, transparent 55%);
          pointer-events: none; z-index: 0;
        }

        .card {
          position: relative; z-index: 1; width: 100%; max-width: 400px;
          background: rgba(255, 255, 255, 0.035); backdrop-filter: blur(24px) saturate(1.4);
          -webkit-backdrop-filter: blur(24px) saturate(1.4); border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 24px; padding: 40px 32px 36px; box-shadow: 0 32px 64px rgba(0, 0, 0, 0.45);
          animation: cardIn 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        @keyframes cardIn {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        .brand { display: flex; align-items: center; gap: 10px; margin-bottom: 32px; }
        .brand-icon {
          width: 36px; height: 36px; background: linear-gradient(135deg, var(--blue-500), var(--blue-400));
          border-radius: 10px; display: flex; align-items: center; justify-content: center;
        }

        .brand-name { font-family: var(--font-display); font-size: 17px; font-weight: 600; color: var(--white); }

        .heading { margin-bottom: 28px; }
        .heading h1 { font-family: var(--font-display); font-size: clamp(22px, 6vw, 26px); font-weight: 700; color: var(--white); margin-bottom: 6px; }
        .heading p { font-size: 14px; color: var(--blue-300); opacity: 0.8; }

        form { display: flex; flex-direction: column; gap: 16px; }
        .field { display: flex; flex-direction: column; gap: 6px; }
        label { font-size: 12px; font-weight: 500; color: var(--blue-300); text-transform: uppercase; }

        .input-wrap { position: relative; }
        input {
          width: 100%; height: 48px; padding: 0 44px 0 42px;
          background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.09);
          border-radius: 12px; color: var(--white); outline: none; font-size: 15px;
        }

        .input-icon { position: absolute; left: 14px; top: 14px; color: var(--blue-400); opacity: 0.6; }
        .toggle-password { position: absolute; right: 14px; top: 14px; background: none; border: none; color: var(--blue-400); cursor: pointer; }

        .error-banner {
          display: flex; align-items: center; gap: 8px; padding: 12px;
          background: rgba(239, 68, 68, 0.1); border-radius: 10px; color: #fca5a5; font-size: 13px;
        }

        .btn-submit {
          height: 50px; width: 100%; background: linear-gradient(135deg, var(--blue-600), var(--blue-500));
          color: white; border: none; border-radius: 12px; font-family: var(--font-display);
          font-weight: 600; cursor: pointer; margin-top: 10px;
        }
        .btn-submit:disabled { opacity: 0.6; }
        .footer-note { margin-top: 22px; text-align: center; font-size: 12px; color: rgba(148,163,184,0.4); }
        .footer-note a { color: var(--blue-300); text-decoration: none; }
      `}</style>

      <div className="page">
        <div className="card">
          <div className="brand">
            <div className="brand-icon">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
            </div>
            <span className="brand-name">AlfaCo Mapeos</span>
          </div>

          <div className="heading">
            <h1>Bienvenido</h1>
            <p>Ingresa tus credenciales para continuar</p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="field">
              <label>Correo electrónico</label>
              <div className="input-wrap">
                <input type="email" placeholder="usuario@alfaco.com.pe" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
            </div>

            <div className="field">
              <label>Contraseña</label>
              <div className="input-wrap">
                <input type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <button type="button" className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? "Ocultar" : "Ver"}
                </button>
              </div>
            </div>

            {error && <div className="error-banner">{error}</div>}

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? "Ingresando..." : "Ingresar"}
            </button>
          </form>
        </div>
        <p className="footer-note">¿Problemas? <a href="mailto:jose.salazar@alfaco.com.pe">Soporte</a></p>
      </div>
    </>
  );
}