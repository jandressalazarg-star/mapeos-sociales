"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

/* ─── Types ─────────────────────────────────────────────── */
interface Perfil {
  nombre_completo: string;
  correo: string;
  cargo: string;
}

type Status = "loading" | "idle" | "editing" | "saving" | "saved" | "error";

/* ─── Helpers ────────────────────────────────────────────── */
function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

/* ═══════════════════════════════════════════════════════════
   COMPONENT
═══════════════════════════════════════════════════════════ */
export default function PerfilPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [perfil, setPerfil] = useState<Perfil>({ nombre_completo: "", correo: "", cargo: "" });
  const [draft, setDraft] = useState<Perfil>({ nombre_completo: "", correo: "", cargo: "" });
  const [status, setStatus] = useState<Status>("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [isNew, setIsNew] = useState(false);
  const nombreRef = useRef<HTMLInputElement>(null);

  /* ── Auth + fetch perfil ── */
  useEffect(() => {
    const init = async () => {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) { router.push("/login"); return; }
      setUser(user);

      const { data, error } = await supabase
        .from("perfiles")
        .select("nombre_completo, correo, cargo")
        .eq("id", user.id)
        .single();

      if (error || !data) {
        // Primera vez: usar valores predeterminados
        const blank: Perfil = {
          nombre_completo: "",
          correo: user.email ?? "",
          cargo: "Relacionista Comunitario",
        };
        setPerfil(blank);
        setDraft(blank);
        setIsNew(true);
        setStatus("editing");
      } else {
        setPerfil(data);
        setDraft(data);
        setStatus("idle");
      }
    };
    init();
  }, [router]);

  /* Auto-focus al entrar en modo edición */
  useEffect(() => {
    if (status === "editing") setTimeout(() => nombreRef.current?.focus(), 80);
  }, [status]);

  /* ── Handlers ── */
  const handleEdit = () => { setDraft(perfil); setStatus("editing"); };
  const handleCancel = () => { setDraft(perfil); setStatus("idle"); };

  const handleSave = async () => {
    if (!user) return;
    if (!draft.nombre_completo.trim()) { setErrorMsg("El nombre es obligatorio."); return; }
    setErrorMsg("");
    setStatus("saving");

    const payload = { id: user.id, ...draft, correo: draft.correo || user.email };

    const { error } = await supabase
      .from("perfiles")
      .upsert(payload, { onConflict: "id" });

    if (error) {
      setErrorMsg("No se pudo guardar. Intenta de nuevo.");
      setStatus("error");
    } else {
      setPerfil({ ...draft });
      setIsNew(false);
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 2200);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const isEditing = status === "editing";
  const isSaving  = status === "saving";
  const initials  = getInitials(perfil.nombre_completo || user?.email || "?");

  /* ════════════════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════════════════ */
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=DM+Sans:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --blue-950: #0a1628;
          --blue-900: #0d1f3c;
          --blue-700: #1a3a72;
          --blue-600: #1e4d9b;
          --blue-500: #2563eb;
          --blue-400: #3b82f6;
          --blue-300: #93c5fd;
          --white: #ffffff;
          --success: #34d399;
          --error:   #ef4444;
          --font-display: 'Sora', sans-serif;
          --font-body:    'DM Sans', sans-serif;
        }

        html, body { height: 100%; font-family: var(--font-body); background: var(--blue-950); }

        /* ── Page shell ── */
        .page {
          min-height: 100dvh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          padding: 28px 18px 48px;
          position: relative;
          overflow-x: hidden;
        }

        .page::before {
          content: '';
          position: fixed; inset: 0;
          background:
            radial-gradient(ellipse 80% 60% at 15% -5%,  rgba(37,99,235,.35) 0%, transparent 58%),
            radial-gradient(ellipse 55% 45% at 88% 105%, rgba(30,77,155,.40) 0%, transparent 55%);
          pointer-events: none; z-index: 0;
        }
        .page::after {
          content: '';
          position: fixed; inset: 0;
          background-image:
            linear-gradient(rgba(59,130,246,.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59,130,246,.04) 1px, transparent 1px);
          background-size: 40px 40px;
          pointer-events: none; z-index: 0;
        }

        /* ── Top bar ── */
        .topbar {
          position: relative; z-index: 2;
          width: 100%; max-width: 440px;
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 28px;
          animation: fadeUp .45s .05s cubic-bezier(.22,1,.36,1) both;
        }

        .brand { display: flex; align-items: center; gap: 9px; }
        .brand-icon {
          width: 32px; height: 32px;
          background: linear-gradient(135deg, var(--blue-600), var(--blue-400));
          border-radius: 9px; display: flex; align-items: center; justify-content: center;
          box-shadow: 0 3px 10px rgba(37,99,235,.5);
        }
        .brand-icon svg { width: 15px; height: 15px; color: #fff; }
        .brand-name {
          font-family: var(--font-display); font-size: 15px; font-weight: 600;
          color: var(--white); letter-spacing: -.3px;
        }

        /* ── Card ── */
        .card {
          position: relative; z-index: 1;
          width: 100%; max-width: 440px;
          background: rgba(255,255,255,.038);
          backdrop-filter: blur(28px) saturate(1.5);
          -webkit-backdrop-filter: blur(28px) saturate(1.5);
          border: 1px solid rgba(255,255,255,.08);
          border-radius: 24px;
          padding: 36px 28px 32px;
          box-shadow:
            0 0 0 1px rgba(37,99,235,.10),
            0 28px 60px rgba(0,0,0,.45),
            inset 0 1px 0 rgba(255,255,255,.06);
          animation: cardIn .5s cubic-bezier(.22,1,.36,1) both;
        }

        @keyframes cardIn  { from { opacity:0; transform: translateY(22px) scale(.97); } to { opacity:1; transform: none; } }
        @keyframes fadeUp  { from { opacity:0; transform: translateY(12px); } to { opacity:1; transform: none; } }
        @keyframes fadeIn  { from { opacity:0; } to { opacity:1; } }
        @keyframes scaleIn { from { opacity:0; transform: scale(.85); } to { opacity:1; transform: scale(1); } }
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes shimmer {
          0%   { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }

        /* ── Avatar ── */
        .avatar-wrap {
          display: flex; flex-direction: column; align-items: center;
          gap: 4px; margin-bottom: 28px;
          animation: fadeUp .45s .12s cubic-bezier(.22,1,.36,1) both;
        }
        .avatar {
          width: 80px; height: 80px; border-radius: 50%;
          background: linear-gradient(135deg, var(--blue-700), var(--blue-500));
          display: flex; align-items: center; justify-content: center;
          font-family: var(--font-display); font-size: 26px; font-weight: 700;
          color: #fff; letter-spacing: -1px;
          box-shadow: 0 0 0 3px rgba(59,130,246,.25), 0 8px 24px rgba(0,0,0,.35);
          margin-bottom: 6px;
        }
        .avatar-role {
          font-size: 12px; font-weight: 500; color: var(--blue-300);
          background: rgba(37,99,235,.18);
          border: 1px solid rgba(59,130,246,.2);
          border-radius: 20px; padding: 3px 12px; letter-spacing: .4px;
        }

        /* ── Section title ── */
        .section-title {
          font-family: var(--font-display);
          font-size: 17px; font-weight: 700;
          color: var(--white); letter-spacing: -.3px;
          margin-bottom: 20px;
          animation: fadeUp .45s .18s cubic-bezier(.22,1,.36,1) both;
        }

        /* ── Fields ── */
        .fields {
          display: flex; flex-direction: column; gap: 14px;
          animation: fadeUp .45s .22s cubic-bezier(.22,1,.36,1) both;
        }

        .field { display: flex; flex-direction: column; gap: 5px; }

        label {
          font-size: 11px; font-weight: 500;
          color: var(--blue-300); opacity: .8;
          letter-spacing: .55px; text-transform: uppercase;
        }

        /* Read-only display */
        .field-value {
          height: 46px; display: flex; align-items: center;
          padding: 0 14px 0 42px;
          background: rgba(255,255,255,.03);
          border: 1px solid rgba(255,255,255,.06);
          border-radius: 11px;
          color: var(--white); font-size: 14.5px;
          position: relative;
          transition: background .2s;
        }
        .field-value.empty { color: rgba(148,163,184,.4); font-style: italic; }

        /* Editable input */
        .input-wrap { position: relative; }
        .input-wrap svg.ico {
          position: absolute; left: 13px; top: 50%; transform: translateY(-50%);
          width: 15px; height: 15px; color: var(--blue-400); opacity: .55;
          pointer-events: none; transition: opacity .2s;
        }
        .input-wrap:focus-within svg.ico { opacity: 1; }

        input {
          width: 100%; height: 46px;
          padding: 0 14px 0 40px;
          background: rgba(255,255,255,.055);
          border: 1px solid rgba(255,255,255,.09);
          border-radius: 11px;
          color: var(--white); font-family: var(--font-body); font-size: 14.5px;
          outline: none;
          transition: border-color .2s, background .2s, box-shadow .2s;
          -webkit-appearance: none;
        }
        input::placeholder { color: rgba(148,163,184,.4); font-size: 13.5px; }
        input:focus {
          border-color: rgba(59,130,246,.6);
          background: rgba(255,255,255,.075);
          box-shadow: 0 0 0 3px rgba(37,99,235,.18);
        }
        input:disabled { opacity: .5; cursor: not-allowed; }
        input:-webkit-autofill,
        input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0 100px rgba(18,41,82,.95) inset;
          -webkit-text-fill-color: var(--white);
          transition: background-color 9999s ease-in-out 0s;
        }

        /* Icon inside read-only */
        .field-value .ico-static {
          position: absolute; left: 13px; top: 50%; transform: translateY(-50%);
          width: 15px; height: 15px; color: var(--blue-400); opacity: .4;
        }

        /* ── Skeleton loader ── */
        .skeleton-block {
          height: 46px; border-radius: 11px;
          background: linear-gradient(90deg,
            rgba(255,255,255,.04) 25%,
            rgba(255,255,255,.09) 50%,
            rgba(255,255,255,.04) 75%);
          background-size: 400px 100%;
          animation: shimmer 1.4s infinite linear;
        }

        /* ── Error banner ── */
        .error-banner {
          display: flex; align-items: center; gap: 8px;
          padding: 11px 13px;
          background: rgba(239,68,68,.1);
          border: 1px solid rgba(239,68,68,.25);
          border-radius: 10px; color: #fca5a5; font-size: 13px;
          animation: fadeIn .25s ease both;
        }
        .error-banner svg { width: 14px; height: 14px; flex-shrink: 0; color: var(--error); }

        /* ── Success toast ── */
        .success-toast {
          display: flex; align-items: center; gap: 8px;
          padding: 11px 13px;
          background: rgba(52,211,153,.1);
          border: 1px solid rgba(52,211,153,.25);
          border-radius: 10px; color: #6ee7b7; font-size: 13px;
          animation: scaleIn .3s cubic-bezier(.22,1,.36,1) both;
        }
        .success-toast svg { width: 14px; height: 14px; color: var(--success); }

        /* ── Hint ── */
        .first-time-hint {
          display: flex; align-items: flex-start; gap: 8px;
          padding: 11px 13px;
          background: rgba(37,99,235,.1);
          border: 1px solid rgba(59,130,246,.2);
          border-radius: 10px; color: var(--blue-300); font-size: 12.5px; line-height: 1.5;
          animation: fadeIn .3s .3s ease both;
        }
        .first-time-hint svg { width: 14px; height: 14px; flex-shrink: 0; margin-top: 1px; }

        /* ── Buttons ── */
        .btn-row {
          display: flex; gap: 10px; margin-top: 22px;
          animation: fadeUp .45s .28s cubic-bezier(.22,1,.36,1) both;
        }

        button {
          font-family: var(--font-display); font-size: 14px; font-weight: 600;
          border: none; border-radius: 11px; cursor: pointer;
          height: 46px; display: flex; align-items: center; justify-content: center; gap: 7px;
          transition: transform .15s, box-shadow .15s, opacity .15s;
        }
        button:disabled { opacity: .5; cursor: not-allowed; transform: none !important; }

        .btn-primary {
          flex: 1;
          background: linear-gradient(135deg, var(--blue-600), var(--blue-500));
          color: #fff;
          box-shadow: 0 4px 18px rgba(37,99,235,.4), 0 1px 4px rgba(0,0,0,.3);
          position: relative; overflow: hidden;
        }
        .btn-primary::after {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,.12), transparent);
          pointer-events: none;
        }
        .btn-primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 7px 24px rgba(37,99,235,.55); }
        .btn-primary:active:not(:disabled) { transform: none; }

        .btn-ghost {
          flex: 1;
          background: rgba(255,255,255,.06);
          color: rgba(255,255,255,.75);
          border: 1px solid rgba(255,255,255,.09);
        }
        .btn-ghost:hover:not(:disabled) { background: rgba(255,255,255,.1); }

        .btn-danger {
          width: 100%; margin-top: 12px;
          background: rgba(239,68,68,.08);
          color: #fca5a5;
          border: 1px solid rgba(239,68,68,.2);
        }
        .btn-danger:hover:not(:disabled) {
          background: rgba(239,68,68,.15);
          border-color: rgba(239,68,68,.35);
        }

        .spinner {
          width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,.3);
          border-top-color: #fff; border-radius: 50%;
          animation: spin .65s linear infinite;
        }

        /* ── Divider ── */
        .divider {
          margin: 20px 0 0;
          border: none; border-top: 1px solid rgba(255,255,255,.06);
          animation: fadeIn .4s .35s ease both;
        }

        /* ── Responsive ── */
        @media (min-width: 480px) {
          .card { padding: 44px 36px 38px; }
        }
      `}</style>

      <div className="page">
        {/* Top bar */}
        <div className="topbar">
          <div className="brand">
            <div className="brand-icon">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
            </div>
            <span className="brand-name">AlfaCo</span>
          </div>
        </div>

        {/* Card */}
        <div className="card">

          {/* ── Loading skeleton ── */}
          {status === "loading" && (
            <>
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:8, marginBottom:28 }}>
                <div style={{ width:80, height:80, borderRadius:"50%", background:"rgba(255,255,255,.07)", animation:"shimmer 1.4s infinite linear", backgroundSize:"400px 100%", backgroundImage:"linear-gradient(90deg,rgba(255,255,255,.04) 25%,rgba(255,255,255,.09) 50%,rgba(255,255,255,.04) 75%)" }} />
                <div style={{ width:80, height:22, borderRadius:20 }} className="skeleton-block" />
              </div>
              <div className="fields">
                {[...Array(3)].map((_,i) => (
                  <div key={i} className="field">
                    <div style={{ width:60, height:10, borderRadius:4, marginBottom:4 }} className="skeleton-block" />
                    <div className="skeleton-block" />
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ── Content ── */}
          {status !== "loading" && (
            <>
              {/* Avatar */}
              <div className="avatar-wrap">
                <div className="avatar">{initials || "?"}</div>
                {perfil.cargo && <span className="avatar-role">{perfil.cargo}</span>}
              </div>

              <div className="section-title">
                {isNew ? "Completa tu perfil" : "Mi perfil"}
              </div>

              {/* First-time hint */}
              {isNew && isEditing && (
                <div className="first-time-hint" style={{ marginBottom:16 }}>
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                  </svg>
                  Es tu primera vez aquí. Rellena tus datos y guarda para continuar.
                </div>
              )}

              {/* Fields */}
              <div className="fields">

                {/* Nombre */}
                <div className="field">
                  <label htmlFor="nombre">Nombre completo</label>
                  {isEditing ? (
                    <div className="input-wrap">
                      <input
                        ref={nombreRef}
                        id="nombre"
                        type="text"
                        placeholder="Ej. José Andrés Salazar Gutiérrez"
                        value={draft.nombre_completo}
                        onChange={e => setDraft(p => ({ ...p, nombre_completo: e.target.value }))}
                        disabled={isSaving}
                      />
                      <svg className="ico" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round"
                          d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                      </svg>
                    </div>
                  ) : (
                    <div className={`field-value ${!perfil.nombre_completo ? "empty" : ""}`} style={{ position:"relative" }}>
                      <svg className="ico-static" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round"
                          d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                      </svg>
                      {perfil.nombre_completo || "Sin nombre"}
                    </div>
                  )}
                </div>

                {/* Correo */}
                <div className="field">
                  <label htmlFor="correo">Correo electrónico</label>
                  {isEditing ? (
                    <div className="input-wrap">
                      <input
                        id="correo"
                        type="email"
                        placeholder="Ej. jose.salazar@alfaco.com.pe"
                        value={draft.correo}
                        onChange={e => setDraft(p => ({ ...p, correo: e.target.value }))}
                        disabled={isSaving}
                      />
                      <svg className="ico" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round"
                          d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                      </svg>
                    </div>
                  ) : (
                    <div className={`field-value ${!perfil.correo ? "empty" : ""}`} style={{ position:"relative" }}>
                      <svg className="ico-static" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round"
                          d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                      </svg>
                      {perfil.correo || "Sin correo"}
                    </div>
                  )}
                </div>

                {/* Cargo */}
                <div className="field">
                  <label htmlFor="cargo">Cargo</label>
                  {isEditing ? (
                    <div className="input-wrap">
                      <input
                        id="cargo"
                        type="text"
                        placeholder="Ej. Desarrollador Frontend"
                        value={draft.cargo}
                        onChange={e => setDraft(p => ({ ...p, cargo: e.target.value }))}
                        disabled={isSaving}
                      />
                      <svg className="ico" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round"
                          d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
                      </svg>
                    </div>
                  ) : (
                    <div className={`field-value ${!perfil.cargo ? "empty" : ""}`} style={{ position:"relative" }}>
                      <svg className="ico-static" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round"
                          d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
                      </svg>
                      {perfil.cargo || "Sin cargo"}
                    </div>
                  )}
                </div>
              </div>

              {/* Error */}
              {(status === "error" || errorMsg) && (
                <div className="error-banner" style={{ marginTop:14 }}>
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                  {errorMsg || "Ocurrió un error. Intenta de nuevo."}
                </div>
              )}

              {/* Success */}
              {status === "saved" && (
                <div className="success-toast" style={{ marginTop:14 }}>
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Perfil guardado correctamente.
                </div>
              )}

              {/* Action buttons */}
              <div className="btn-row">
                {isEditing ? (
                  <>
                    <button className="btn-primary" onClick={handleSave} disabled={isSaving}>
                      {isSaving ? <><span className="spinner" /> Guardando…</> : <>
                        <svg style={{ width:15, height:15 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                        Guardar
                      </>}
                    </button>
                    {!isNew && (
                      <button className="btn-ghost" onClick={handleCancel} disabled={isSaving}>
                        Cancelar
                      </button>
                    )}
                  </>
                ) : (
                  <button className="btn-primary" onClick={handleEdit}>
                    <svg style={{ width:15, height:15 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                      <path strokeLinecap="round" strokeLinejoin="round"
                        d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                    </svg>
                    Editar perfil
                  </button>
                )}
              </div>

              {/* Sign-out */}
              <hr className="divider" />
              <button className="btn-danger" onClick={handleSignOut}>
                <svg style={{ width:15, height:15 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                </svg>
                Cerrar sesión
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}