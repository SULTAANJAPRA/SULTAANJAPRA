import { useState, useEffect, useRef, useCallback } from "react";

// ============================================================
// DESIGN SYSTEM
// Colors: Crimson Red, Electric Blue, Emerald Green, Amber Orange
// Dark backgrounds with glassmorphism cards
// Emergency-grade typography: bold, clear, accessible
// ============================================================

const COLORS = {
  sos: "#E53E3E",
  sosDark: "#C53030",
  sosGlow: "rgba(229,62,62,0.35)",
  police: "#3182CE",
  policeDark: "#2B6CB0",
  policeGlow: "rgba(49,130,206,0.3)",
  ambulance: "#38A169",
  ambulanceDark: "#276749",
  ambulanceGlow: "rgba(56,161,105,0.3)",
  fire: "#DD6B20",
  fireDark: "#C05621",
  fireGlow: "rgba(221,107,32,0.3)",
  bg: "#0A0E1A",
  bgCard: "rgba(255,255,255,0.05)",
  bgCardHover: "rgba(255,255,255,0.08)",
  border: "rgba(255,255,255,0.1)",
  text: "#F7FAFC",
  textMuted: "#A0AEC0",
  textDim: "#718096",
  success: "#48BB78",
  warning: "#ECC94B",
  danger: "#FC8181",
};

// ============================================================
// MOCK DATA
// ============================================================

const EMERGENCY_TYPES = {
  police: {
    label: "Police",
    icon: "🚓",
    color: COLORS.police,
    glow: COLORS.policeGlow,
    categories: [
      "Robbery","Assault","Kidnapping","Missing Person",
      "Domestic Violence","Suspicious Activity","Terror Threat","Other"
    ]
  },
  ambulance: {
    label: "Ambulance",
    icon: "🚑",
    color: COLORS.ambulance,
    glow: COLORS.ambulanceGlow,
    categories: [
      "Accident","Heart Attack","Stroke","Pregnancy Emergency",
      "Severe Bleeding","Child Emergency","Unconscious Person","Medical Emergency","Other"
    ]
  },
  fire: {
    label: "Fire Department",
    icon: "🚒",
    color: COLORS.fire,
    glow: COLORS.fireGlow,
    categories: [
      "House Fire","Vehicle Fire","Gas Leak","Electrical Fire",
      "Building Collapse","Wild Fire","Explosion","Other"
    ]
  }
};

const MOCK_EMERGENCIES = [
  { id: "e1", type: "police", category: "Robbery", status: "active", time: "2 min ago", user: "Ahmed Hassan", location: "Hodan District", priority: "high", responder: "Unit 12" },
  { id: "e2", type: "ambulance", category: "Heart Attack", status: "responding", time: "8 min ago", user: "Fadumo Ali", location: "Wadajir", priority: "critical", responder: "Ambulance 3" },
  { id: "e3", type: "fire", category: "House Fire", status: "active", time: "15 min ago", user: "Mohamed Omar", location: "Hawl Wadaag", priority: "high", responder: null },
  { id: "e4", type: "police", category: "Missing Person", status: "resolved", time: "1 hr ago", user: "Khadija Nur", location: "Dharkenley", priority: "medium", responder: "Unit 7" },
  { id: "e5", type: "ambulance", category: "Accident", status: "pending", time: "3 min ago", user: "Abdi Warsame", location: "Yaqshid", priority: "high", responder: null },
];

const MOCK_MESSAGES = [
  { id: "m1", from: "dispatcher", text: "We have received your emergency. Units are being dispatched.", time: "10:32 AM", type: "text" },
  { id: "m2", from: "user", text: "Please hurry, it's urgent!", time: "10:33 AM", type: "text" },
  { id: "m3", from: "dispatcher", text: "Police Unit 12 is on the way. ETA: 6 minutes.", time: "10:34 AM", type: "text" },
  { id: "m4", from: "user", text: "Thank you. I'm at the main entrance.", time: "10:35 AM", type: "text" },
];

const MOCK_STATS = {
  total: 1247,
  active: 23,
  resolved: 1198,
  fake: 26,
  police: 512,
  ambulance: 489,
  fire: 246,
  avgResponse: "4.2 min",
  weeklyTrend: [45, 52, 38, 61, 48, 55, 43],
};

const MOCK_USERS = [
  { id: "u1", name: "Ahmed Hassan", phone: "+252612345678", status: "active", reports: 3, reputation: 95, warnings: 0 },
  { id: "u2", name: "Fadumo Ali", phone: "+252615678901", status: "active", reports: 1, reputation: 100, warnings: 0 },
  { id: "u3", name: "Suspicious User", phone: "+252617777777", status: "suspended", reports: 8, reputation: 12, warnings: 3 },
  { id: "u4", name: "Mohamed Omar", phone: "+252619876543", status: "active", reports: 2, reputation: 88, warnings: 1 },
];

// ============================================================
// UTILITIES
// ============================================================

function useInterval(cb, delay) {
  const cbRef = useRef(cb);
  useEffect(() => { cbRef.current = cb; });
  useEffect(() => {
    if (delay === null) return;
    const id = setInterval(() => cbRef.current(), delay);
    return () => clearInterval(id);
  }, [delay]);
}

function Badge({ children, color = COLORS.police, small }) {
  return (
    <span style={{
      background: color + "22",
      color: color,
      border: `1px solid ${color}44`,
      borderRadius: 20,
      padding: small ? "2px 8px" : "4px 12px",
      fontSize: small ? 10 : 11,
      fontWeight: 700,
      letterSpacing: 0.5,
      textTransform: "uppercase",
      whiteSpace: "nowrap",
    }}>{children}</span>
  );
}

function StatusBadge({ status }) {
  const map = {
    active: { label: "Active", color: COLORS.warning },
    responding: { label: "Responding", color: COLORS.police },
    resolved: { label: "Resolved", color: COLORS.success },
    pending: { label: "Pending", color: COLORS.textMuted },
    suspended: { label: "Suspended", color: COLORS.danger },
    "suspected fake": { label: "Suspected Fake", color: COLORS.sos },
    verified: { label: "Verified", color: COLORS.success },
  };
  const s = map[status] || { label: status, color: COLORS.textMuted };
  return <Badge color={s.color} small>{s.label}</Badge>;
}

function GlassCard({ children, style, onClick, hover }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => hover && setHovered(true)}
      onMouseLeave={() => hover && setHovered(false)}
      style={{
        background: hovered ? COLORS.bgCardHover : COLORS.bgCard,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 16,
        backdropFilter: "blur(20px)",
        transition: "all 0.2s",
        cursor: onClick ? "pointer" : "default",
        transform: hovered ? "translateY(-2px)" : "none",
        ...style,
      }}
    >{children}</div>
  );
}

function PulseRing({ color, size = 60 }) {
  return (
    <div style={{ position: "relative", width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center" }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          position: "absolute",
          width: size,
          height: size,
          borderRadius: "50%",
          border: `2px solid ${color}`,
          animation: `pulse-ring 2s ease-out ${i * 0.6}s infinite`,
          opacity: 0,
        }} />
      ))}
      <style>{`
        @keyframes pulse-ring {
          0% { transform: scale(0.8); opacity: 0.8; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        @keyframes sos-beat {
          0%, 100% { transform: scale(1); box-shadow: 0 0 40px ${COLORS.sosGlow}; }
          50% { transform: scale(1.04); box-shadow: 0 0 80px ${COLORS.sosGlow}, 0 0 120px rgba(229,62,62,0.15); }
        }
        @keyframes slide-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes count-down {
          from { stroke-dashoffset: 0; }
          to { stroke-dashoffset: 283; }
        }
        * { box-sizing: border-box; }
        body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif; background: ${COLORS.bg}; color: ${COLORS.text}; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${COLORS.border}; border-radius: 4px; }
      `}</style>
    </div>
  );
}

// ============================================================
// NAVIGATION
// ============================================================

function NavBar({ currentPage, setPage, role }) {
  const userNav = [
    { id: "dashboard", icon: "⊞", label: "Home" },
    { id: "sos", icon: "🆘", label: "SOS" },
    { id: "map", icon: "🗺", label: "Map" },
    { id: "chat", icon: "💬", label: "Chat" },
    { id: "profile", icon: "👤", label: "Profile" },
  ];
  const adminNav = [
    { id: "admin", icon: "⊞", label: "Dashboard" },
    { id: "emergencies", icon: "🚨", label: "Cases" },
    { id: "map", icon: "🗺", label: "Live Map" },
    { id: "users", icon: "👥", label: "Users" },
    { id: "analytics", icon: "📊", label: "Analytics" },
  ];
  const nav = role === "admin" ? adminNav : userNav;

  return (
    <div style={{
      position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100,
      background: "rgba(10,14,26,0.95)",
      backdropFilter: "blur(20px)",
      borderTop: `1px solid ${COLORS.border}`,
      padding: "8px 0 max(8px, env(safe-area-inset-bottom))",
      display: "flex", justifyContent: "space-around",
    }}>
      {nav.map(n => (
        <button key={n.id} onClick={() => setPage(n.id)} style={{
          background: "none", border: "none", cursor: "pointer",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
          padding: "4px 12px",
          color: currentPage === n.id ? COLORS.sos : COLORS.textDim,
          transition: "color 0.2s",
        }}>
          <span style={{ fontSize: 20 }}>{n.icon}</span>
          <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: 0.3 }}>{n.label}</span>
        </button>
      ))}
    </div>
  );
}

function TopBar({ title, onBack, right }) {
  return (
    <div style={{
      position: "sticky", top: 0, zIndex: 50,
      background: "rgba(10,14,26,0.9)",
      backdropFilter: "blur(20px)",
      borderBottom: `1px solid ${COLORS.border}`,
      padding: "12px 16px",
      display: "flex", alignItems: "center", justifyContent: "space-between",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {onBack && (
          <button onClick={onBack} style={{ background: "none", border: "none", color: COLORS.text, cursor: "pointer", fontSize: 20, padding: 0 }}>←</button>
        )}
        <span style={{ fontWeight: 700, fontSize: 17 }}>{title}</span>
      </div>
      {right}
    </div>
  );
}

// ============================================================
// LANDING PAGE
// ============================================================

function LandingPage({ setPage }) {
  const [lang, setLang] = useState("en");
  const labels = {
    en: { title: "SOS Somalia", sub: "Emergency Response at Your Fingertips", login: "Sign In", register: "Create Account", tagline: "Fast · Reliable · Secure" },
    so: { title: "SOS Soomaaliya", sub: "Gargaar Degdeg ah oo Dhakhso ah", login: "Gal", register: "Samee Akoon", tagline: "Degdeg · Aamin · Ammaan" },
    ar: { title: "SOS الصومال", sub: "استجابة الطوارئ في متناول يدك", login: "تسجيل الدخول", register: "إنشاء حساب", tagline: "سريع · موثوق · آمن" },
  };
  const t = labels[lang];

  return (
    <div style={{
      minHeight: "100vh", background: COLORS.bg,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: "24px 20px", position: "relative", overflow: "hidden",
      animation: "fade-in 0.6s ease",
    }}>
      {/* Background radial */}
      <div style={{
        position: "absolute", top: "20%", left: "50%", transform: "translate(-50%,-50%)",
        width: 600, height: 600, borderRadius: "50%",
        background: `radial-gradient(circle, ${COLORS.sosGlow} 0%, transparent 70%)`,
        pointerEvents: "none",
      }} />

      {/* Lang selector */}
      <div style={{ position: "absolute", top: 20, right: 20, display: "flex", gap: 6 }}>
        {["en","so","ar"].map(l => (
          <button key={l} onClick={() => setLang(l)} style={{
            background: lang === l ? COLORS.sos : COLORS.bgCard,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 8, color: COLORS.text, cursor: "pointer",
            padding: "4px 10px", fontSize: 12, fontWeight: 600,
          }}>{l.toUpperCase()}</button>
        ))}
      </div>

      {/* Logo */}
      <div style={{ textAlign: "center", marginBottom: 48, animation: "slide-in 0.6s ease" }}>
        <div style={{
          width: 100, height: 100, borderRadius: "50%",
          background: `radial-gradient(135deg, ${COLORS.sos}, ${COLORS.sosDark})`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 44, margin: "0 auto 20px",
          boxShadow: `0 20px 60px ${COLORS.sosGlow}`,
          animation: "sos-beat 2.5s ease-in-out infinite",
        }}>🆘</div>
        <h1 style={{ fontSize: 36, fontWeight: 800, margin: 0, letterSpacing: -0.5 }}>{t.title}</h1>
        <p style={{ color: COLORS.textMuted, margin: "8px 0 4px", fontSize: 16 }}>{t.sub}</p>
        <p style={{ color: COLORS.textDim, fontSize: 12, letterSpacing: 2, textTransform: "uppercase" }}>{t.tagline}</p>
      </div>

      {/* Service icons */}
      <div style={{ display: "flex", gap: 24, marginBottom: 48 }}>
        {Object.values(EMERGENCY_TYPES).map(et => (
          <div key={et.label} style={{ textAlign: "center" }}>
            <div style={{
              width: 56, height: 56, borderRadius: 14,
              background: et.color + "22", border: `1px solid ${et.color}44`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 26, marginBottom: 6,
            }}>{et.icon}</div>
            <span style={{ fontSize: 10, color: COLORS.textMuted, fontWeight: 600 }}>{et.label}</span>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%", maxWidth: 360 }}>
        <button onClick={() => setPage("login")} style={{
          background: `linear-gradient(135deg, ${COLORS.sos}, ${COLORS.sosDark})`,
          border: "none", borderRadius: 14, color: "#fff",
          padding: "16px", fontSize: 16, fontWeight: 700, cursor: "pointer",
          boxShadow: `0 8px 30px ${COLORS.sosGlow}`,
        }}>{t.login}</button>
        <button onClick={() => setPage("register")} style={{
          background: COLORS.bgCard, border: `1px solid ${COLORS.border}`,
          borderRadius: 14, color: COLORS.text,
          padding: "16px", fontSize: 16, fontWeight: 700, cursor: "pointer",
        }}>{t.register}</button>
        <button onClick={() => setPage("admin")} style={{
          background: "none", border: "none", color: COLORS.textDim,
          fontSize: 12, cursor: "pointer", marginTop: 4,
        }}>Admin / Responder Portal →</button>
      </div>

      {/* Trust badges */}
      <div style={{ display: "flex", gap: 16, marginTop: 40, flexWrap: "wrap", justifyContent: "center" }}>
        {["🔒 Secure OTP Login","📍 Live GPS Tracking","⚡ Fast Response","🛡 Anti-Abuse System"].map(b => (
          <span key={b} style={{ fontSize: 11, color: COLORS.textDim, background: COLORS.bgCard, padding: "4px 10px", borderRadius: 20, border: `1px solid ${COLORS.border}` }}>{b}</span>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// LOGIN / REGISTER
// ============================================================

function AuthPage({ type, setPage, setRole }) {
  const [step, setStep] = useState("phone"); // phone | otp | profile
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["","","","","",""]);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const otpRefs = useRef([]);

  const handleOtpChange = (i, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp]; next[i] = val;
    setOtp(next);
    if (val && i < 5) otpRefs.current[i + 1]?.focus();
  };

  const handleSendOtp = async () => {
    if (phone.length < 9) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
    setStep("otp");
  };

  const handleVerifyOtp = async () => {
    if (otp.join("").length < 6) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);
    if (type === "register") setStep("profile");
    else { setRole("user"); setPage("dashboard"); }
  };

  const handleComplete = () => {
    setRole("user");
    setPage("dashboard");
  };

  const inputStyle = {
    background: COLORS.bgCard, border: `1px solid ${COLORS.border}`,
    borderRadius: 12, color: COLORS.text, padding: "14px 16px",
    fontSize: 16, width: "100%", outline: "none",
  };

  return (
    <div style={{ minHeight: "100vh", background: COLORS.bg, display: "flex", flexDirection: "column", padding: "24px 20px" }}>
      <button onClick={() => setPage("landing")} style={{ background: "none", border: "none", color: COLORS.textMuted, cursor: "pointer", fontSize: 14, textAlign: "left", marginBottom: 32 }}>← Back</button>

      <div style={{ maxWidth: 400, width: "100%", margin: "0 auto", animation: "slide-in 0.4s ease" }}>
        <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>
          {step === "phone" ? (type === "login" ? "Welcome back" : "Create account") : step === "otp" ? "Verify OTP" : "Your profile"}
        </h2>
        <p style={{ color: COLORS.textMuted, marginBottom: 32, fontSize: 14 }}>
          {step === "phone" ? "Enter your phone number to continue" : step === "otp" ? `Code sent to ${phone}` : "Complete your emergency profile"}
        </p>

        {step === "phone" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", gap: 8 }}>
              <select style={{ ...inputStyle, width: "auto", paddingRight: 12 }}>
                <option>+252</option><option>+1</option><option>+44</option>
              </select>
              <input style={inputStyle} type="tel" placeholder="61X XXX XXXX" value={phone} onChange={e => setPhone(e.target.value)} />
            </div>
            <button onClick={handleSendOtp} disabled={loading} style={{
              background: `linear-gradient(135deg, ${COLORS.sos}, ${COLORS.sosDark})`,
              border: "none", borderRadius: 12, color: "#fff", padding: "16px",
              fontSize: 16, fontWeight: 700, cursor: "pointer",
              opacity: loading ? 0.7 : 1,
            }}>{loading ? "Sending..." : "Send Code"}</button>
          </div>
        )}

        {step === "otp" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              {otp.map((d, i) => (
                <input key={i} ref={el => otpRefs.current[i] = el}
                  style={{ ...inputStyle, width: 44, textAlign: "center", padding: "14px 0", fontSize: 20, fontWeight: 700 }}
                  maxLength={1} value={d} onChange={e => handleOtpChange(i, e.target.value)}
                  onKeyDown={e => { if (e.key === "Backspace" && !d && i > 0) otpRefs.current[i-1].focus(); }}
                />
              ))}
            </div>
            <div style={{ background: "rgba(221,107,32,0.1)", border: "1px solid rgba(221,107,32,0.3)", borderRadius: 10, padding: 12 }}>
              <p style={{ color: COLORS.fire, fontSize: 12, margin: 0 }}>⚠️ Demo mode: any 6-digit code works</p>
            </div>
            <button onClick={handleVerifyOtp} disabled={loading} style={{
              background: `linear-gradient(135deg, ${COLORS.sos}, ${COLORS.sosDark})`,
              border: "none", borderRadius: 12, color: "#fff", padding: "16px",
              fontSize: 16, fontWeight: 700, cursor: "pointer",
            }}>{loading ? "Verifying..." : "Verify"}</button>
            <button onClick={() => setStep("phone")} style={{ background: "none", border: "none", color: COLORS.textMuted, fontSize: 14, cursor: "pointer" }}>Change number</button>
          </div>
        )}

        {step === "profile" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <input style={inputStyle} placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} />
            <select style={inputStyle} value={bloodGroup} onChange={e => setBloodGroup(e.target.value)}>
              <option value="">Blood Group</option>
              {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(b => <option key={b}>{b}</option>)}
            </select>
            <input style={inputStyle} placeholder="Medical conditions (optional)" />
            <input style={inputStyle} placeholder="Allergies (optional)" />
            <input style={inputStyle} placeholder="Emergency contact name" />
            <input style={inputStyle} type="tel" placeholder="Emergency contact phone" />
            <button onClick={handleComplete} style={{
              background: `linear-gradient(135deg, ${COLORS.sos}, ${COLORS.sosDark})`,
              border: "none", borderRadius: 12, color: "#fff", padding: "16px",
              fontSize: 16, fontWeight: 700, cursor: "pointer", marginTop: 8,
            }}>Complete Setup →</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// DASHBOARD
// ============================================================

function Dashboard({ setPage, setEmergencyType }) {
  const [time, setTime] = useState(new Date());
  useInterval(() => setTime(new Date()), 1000);

  const activeCount = MOCK_EMERGENCIES.filter(e => e.status === "active" || e.status === "pending").length;

  return (
    <div style={{ paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ padding: "20px 16px 16px", background: `linear-gradient(180deg, rgba(229,62,62,0.08) 0%, transparent 100%)` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <p style={{ color: COLORS.textMuted, fontSize: 13, margin: 0 }}>
              {time.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
            </p>
            <h1 style={{ fontSize: 24, fontWeight: 800, margin: "4px 0" }}>Stay Safe, Ahmed 👋</h1>
          </div>
          <div style={{ position: "relative", cursor: "pointer" }} onClick={() => setPage("notifications")}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🔔</div>
            <div style={{ position: "absolute", top: -4, right: -4, width: 16, height: 16, background: COLORS.sos, borderRadius: "50%", fontSize: 9, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>3</div>
          </div>
        </div>

        {/* Active alert */}
        {activeCount > 0 && (
          <div style={{ marginTop: 12, background: "rgba(229,62,62,0.1)", border: "1px solid rgba(229,62,62,0.3)", borderRadius: 12, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 16 }}>🚨</span>
            <span style={{ fontSize: 13, color: COLORS.danger }}>{activeCount} active emergencies in your area</span>
          </div>
        )}
      </div>

      <div style={{ padding: "0 16px" }}>
        {/* SOS Button */}
        <GlassCard style={{ padding: 24, textAlign: "center", marginBottom: 16, background: "rgba(229,62,62,0.06)", border: "1px solid rgba(229,62,62,0.2)" }}>
          <p style={{ color: COLORS.textMuted, fontSize: 13, marginBottom: 20 }}>Press in case of emergency</p>
          <div style={{ position: "relative", display: "inline-block" }}>
            <PulseRing color={COLORS.sos} size={120} />
            <button onClick={() => setPage("sos")} style={{
              position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
              width: 100, height: 100, borderRadius: "50%",
              background: `radial-gradient(135deg, ${COLORS.sos}, ${COLORS.sosDark})`,
              border: "4px solid rgba(255,255,255,0.2)",
              color: "#fff", fontSize: 14, fontWeight: 900,
              cursor: "pointer", letterSpacing: 2,
              boxShadow: `0 0 40px ${COLORS.sosGlow}`,
              animation: "sos-beat 2.5s ease-in-out infinite",
            }}>SOS</button>
          </div>
          <p style={{ color: COLORS.textDim, fontSize: 11, marginTop: 20 }}>Hold for silent panic mode</p>
        </GlassCard>

        {/* Emergency Services */}
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Emergency Services</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 20 }}>
          {Object.entries(EMERGENCY_TYPES).map(([key, et]) => (
            <GlassCard key={key} hover onClick={() => { setEmergencyType(key); setPage("emergency-form"); }}
              style={{ padding: 16, textAlign: "center", border: `1px solid ${et.color}33` }}>
              <div style={{ fontSize: 28, marginBottom: 6 }}>{et.icon}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: et.color }}>{et.label}</div>
            </GlassCard>
          ))}
        </div>

        {/* Quick Stats */}
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Area Status</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
          {[
            { label: "Avg Response", value: MOCK_STATS.avgResponse, icon: "⚡", color: COLORS.success },
            { label: "Active Cases", value: MOCK_STATS.active, icon: "🚨", color: COLORS.warning },
            { label: "Units Available", value: "12", icon: "🚓", color: COLORS.police },
            { label: "Resolved Today", value: "47", icon: "✅", color: COLORS.success },
          ].map(s => (
            <GlassCard key={s.label} style={{ padding: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ color: COLORS.textMuted, fontSize: 11, marginBottom: 4 }}>{s.label}</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
                </div>
                <span style={{ fontSize: 22 }}>{s.icon}</span>
              </div>
            </GlassCard>
          ))}
        </div>

        {/* Recent Activity */}
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Recent Near You</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
          {MOCK_EMERGENCIES.slice(0, 3).map(e => {
            const et = EMERGENCY_TYPES[e.type];
            return (
              <GlassCard key={e.id} hover style={{ padding: 14, display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: et.color + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{et.icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{e.category}</div>
                  <div style={{ color: COLORS.textMuted, fontSize: 12 }}>📍 {e.location} · {e.time}</div>
                </div>
                <StatusBadge status={e.status} />
              </GlassCard>
            );
          })}
        </div>

        {/* Warning */}
        <div style={{ background: "rgba(237,137,54,0.1)", border: "1px solid rgba(237,137,54,0.3)", borderRadius: 12, padding: 14, marginBottom: 20 }}>
          <p style={{ color: "#ED8936", fontSize: 12, margin: 0, fontWeight: 600 }}>
            ⚠️ False emergency reports are illegal and may result in account suspension or legal action under Somali law.
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// SOS SCREEN
// ============================================================

function SOSScreen({ setPage }) {
  const [phase, setPhase] = useState("warning"); // warning | countdown | sending | sent
  const [countdown, setCountdown] = useState(10);
  const [cancelled, setCancelled] = useState(false);
  const circumference = 2 * Math.PI * 45;

  useEffect(() => {
    if (phase === "countdown" && countdown > 0) {
      const t = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(t);
    }
    if (phase === "countdown" && countdown === 0) {
      setPhase("sending");
      setTimeout(() => setPhase("sent"), 2500);
    }
  }, [phase, countdown]);

  const handleStart = () => setPhase("countdown");
  const handleCancel = () => { setCancelled(true); setPhase("warning"); setCountdown(10); setCancelled(false); };

  if (phase === "sent") return (
    <div style={{ minHeight: "100vh", background: COLORS.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, animation: "fade-in 0.4s ease" }}>
      <div style={{ width: 100, height: 100, borderRadius: "50%", background: "rgba(72,187,120,0.2)", border: "2px solid #48BB78", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 50, marginBottom: 24 }}>✅</div>
      <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8, textAlign: "center" }}>Emergency Reported!</h2>
      <p style={{ color: COLORS.textMuted, textAlign: "center", marginBottom: 32 }}>Your location and details have been sent to emergency services. Help is on the way.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%", maxWidth: 360 }}>
        {[
          { label: "📍 Location Shared", color: COLORS.success },
          { label: "👤 Profile Sent", color: COLORS.success },
          { label: "🔋 Battery: 78%", color: COLORS.success },
          { label: "📱 Device ID Logged", color: COLORS.success },
        ].map(i => (
          <div key={i.label} style={{ background: `${i.color}15`, border: `1px solid ${i.color}33`, borderRadius: 10, padding: "10px 14px", fontSize: 14, color: i.color, fontWeight: 600 }}>{i.label}</div>
        ))}
      </div>
      <button onClick={() => setPage("chat")} style={{
        marginTop: 32, background: COLORS.sos, border: "none", borderRadius: 12,
        color: "#fff", padding: "14px 32px", fontSize: 16, fontWeight: 700, cursor: "pointer",
      }}>Chat with Dispatcher →</button>
      <button onClick={() => setPage("dashboard")} style={{ marginTop: 12, background: "none", border: "none", color: COLORS.textMuted, fontSize: 14, cursor: "pointer" }}>Return to Home</button>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: COLORS.bg, display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "16px", display: "flex", alignItems: "center" }}>
        <button onClick={() => setPage("dashboard")} style={{ background: "none", border: "none", color: COLORS.text, cursor: "pointer", fontSize: 20 }}>←</button>
        <span style={{ fontWeight: 700, fontSize: 17, marginLeft: 12 }}>Emergency SOS</span>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 24px 100px" }}>
        {phase === "warning" && (
          <div style={{ animation: "slide-in 0.4s ease", textAlign: "center", maxWidth: 400 }}>
            <div style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(237,137,54,0.15)", border: "2px solid #ED8936", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, margin: "0 auto 24px" }}>⚠️</div>
            <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 12 }}>Emergency Warning</h2>
            <p style={{ color: COLORS.textMuted, fontSize: 14, lineHeight: 1.6, marginBottom: 32 }}>
              False emergency reports are <strong style={{ color: COLORS.danger }}>illegal</strong> and may result in account suspension or legal action. Only proceed if you genuinely need emergency assistance.
            </p>

            <div style={{ background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: 16, marginBottom: 24, textAlign: "left" }}>
              <p style={{ color: COLORS.text, fontSize: 13, fontWeight: 700, marginBottom: 8 }}>What will be sent:</p>
              {["📍 Your live GPS location","👤 Your profile & medical info","📱 Device ID & battery level","🕐 Timestamp"].map(i => (
                <div key={i} style={{ color: COLORS.textMuted, fontSize: 13, padding: "4px 0" }}>{i}</div>
              ))}
            </div>

            <p style={{ color: COLORS.text, fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Are you sure you need emergency assistance?</p>
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => setPage("dashboard")} style={{
                flex: 1, background: COLORS.bgCard, border: `1px solid ${COLORS.border}`,
                borderRadius: 12, color: COLORS.text, padding: "14px", fontSize: 16, fontWeight: 700, cursor: "pointer",
              }}>No, Cancel</button>
              <button onClick={handleStart} style={{
                flex: 1, background: `linear-gradient(135deg, ${COLORS.sos}, ${COLORS.sosDark})`,
                border: "none", borderRadius: 12, color: "#fff", padding: "14px",
                fontSize: 16, fontWeight: 700, cursor: "pointer",
                boxShadow: `0 8px 24px ${COLORS.sosGlow}`,
              }}>Yes, SOS!</button>
            </div>
          </div>
        )}

        {phase === "countdown" && (
          <div style={{ animation: "fade-in 0.3s ease", textAlign: "center" }}>
            <div style={{ position: "relative", width: 160, height: 160, margin: "0 auto 32px" }}>
              <svg width="160" height="160" style={{ position: "absolute", top: 0, left: 0, transform: "rotate(-90deg)" }}>
                <circle cx="80" cy="80" r="45" fill="none" stroke={COLORS.border} strokeWidth="6" />
                <circle cx="80" cy="80" r="45" fill="none" stroke={COLORS.sos} strokeWidth="6"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference * (1 - countdown / 10)}
                  strokeLinecap="round"
                  style={{ transition: "stroke-dashoffset 0.9s linear" }}
                />
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <div style={{ fontSize: 56, fontWeight: 900, color: COLORS.sos, lineHeight: 1 }}>{countdown}</div>
                <div style={{ fontSize: 12, color: COLORS.textMuted }}>seconds</div>
              </div>
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Sending SOS...</h2>
            <p style={{ color: COLORS.textMuted, fontSize: 14, marginBottom: 32 }}>Emergency services will be notified automatically</p>
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={handleCancel} style={{
                flex: 1, background: COLORS.bgCard, border: `2px solid ${COLORS.border}`,
                borderRadius: 12, color: COLORS.text, padding: "16px",
                fontSize: 16, fontWeight: 700, cursor: "pointer",
              }}>Cancel SOS</button>
            </div>
          </div>
        )}

        {phase === "sending" && (
          <div style={{ textAlign: "center", animation: "fade-in 0.3s ease" }}>
            <div style={{ width: 80, height: 80, borderRadius: "50%", border: `4px solid ${COLORS.sos}`, borderTopColor: "transparent", margin: "0 auto 24px", animation: "spin 0.8s linear infinite" }} />
            <h2 style={{ fontSize: 22, fontWeight: 800 }}>Sending emergency signal...</h2>
            <p style={{ color: COLORS.textMuted }}>Contacting emergency services</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// EMERGENCY FORM
// ============================================================

function EmergencyForm({ emergencyType, setPage }) {
  const et = EMERGENCY_TYPES[emergencyType] || EMERGENCY_TYPES.police;
  const [selected, setSelected] = useState(null);
  const [desc, setDesc] = useState("");
  const [mediaCount, setMediaCount] = useState(0);

  return (
    <div style={{ minHeight: "100vh", background: COLORS.bg, paddingBottom: 100 }}>
      <TopBar title={`${et.icon} ${et.label}`} onBack={() => setPage("dashboard")} />
      <div style={{ padding: "16px" }}>
        <p style={{ color: COLORS.textMuted, fontSize: 14, marginBottom: 20 }}>Select the type of emergency and provide details</p>

        <h3 style={{ fontSize: 14, fontWeight: 700, color: COLORS.textMuted, marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>Emergency Type</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 20 }}>
          {et.categories.map(c => (
            <GlassCard key={c} hover onClick={() => setSelected(c)}
              style={{ padding: "12px 14px", border: selected === c ? `2px solid ${et.color}` : `1px solid ${COLORS.border}`, cursor: "pointer" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: selected === c ? et.color : COLORS.text }}>{c}</div>
            </GlassCard>
          ))}
        </div>

        <h3 style={{ fontSize: 14, fontWeight: 700, color: COLORS.textMuted, marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>Description</h3>
        <textarea value={desc} onChange={e => setDesc(e.target.value)}
          placeholder="Describe the situation in detail..."
          style={{
            background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 12,
            color: COLORS.text, padding: 14, fontSize: 14, width: "100%",
            minHeight: 100, resize: "vertical", outline: "none", marginBottom: 16,
          }} />

        <h3 style={{ fontSize: 14, fontWeight: 700, color: COLORS.textMuted, marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>Media</h3>
        <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
          {["📷 Photo","🎥 Video","🎤 Voice"].map(m => (
            <GlassCard key={m} hover onClick={() => setMediaCount(c => c + 1)} style={{ padding: "10px 14px", cursor: "pointer" }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{m}</span>
            </GlassCard>
          ))}
        </div>
        {mediaCount > 0 && <p style={{ color: COLORS.success, fontSize: 12, marginBottom: 16 }}>✅ {mediaCount} file(s) attached</p>}

        <div style={{ background: "rgba(49,130,206,0.1)", border: "1px solid rgba(49,130,206,0.3)", borderRadius: 12, padding: 12, marginBottom: 20 }}>
          <p style={{ color: COLORS.police, fontSize: 12, margin: 0 }}>📍 Your live location will be attached automatically</p>
        </div>

        <button onClick={() => setPage("sos")} disabled={!selected} style={{
          width: "100%", background: selected ? `linear-gradient(135deg, ${et.color}, ${et.color}cc)` : COLORS.bgCard,
          border: "none", borderRadius: 14, color: "#fff", padding: "16px",
          fontSize: 16, fontWeight: 700, cursor: selected ? "pointer" : "not-allowed",
          boxShadow: selected ? `0 8px 24px ${et.glow}` : "none",
        }}>
          {selected ? `🆘 Send ${et.label} Emergency` : "Select emergency type to continue"}
        </button>
      </div>
    </div>
  );
}

// ============================================================
// MAP
// ============================================================

function MapPage() {
  const [filter, setFilter] = useState("all");
  const markers = [
    { id: 1, type: "police", label: "Police HQ", x: 45, y: 35, icon: "🚓" },
    { id: 2, type: "police", label: "Station 2", x: 70, y: 25, icon: "🚓" },
    { id: 3, type: "ambulance", label: "Ambulance Base", x: 30, y: 55, icon: "🚑" },
    { id: 4, type: "ambulance", label: "Hospital", x: 60, y: 70, icon: "🏥" },
    { id: 5, type: "fire", label: "Fire Station", x: 80, y: 50, icon: "🚒" },
    { id: 6, type: "user", label: "You", x: 50, y: 50, icon: "📍" },
    { id: 7, type: "emergency", label: "Active Case", x: 40, y: 40, icon: "🚨" },
  ];
  const filtered = filter === "all" ? markers : markers.filter(m => m.type === filter || m.type === "user");

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <TopBar title="🗺 Live Map" right={
        <div style={{ display: "flex", gap: 6 }}>
          {["all","police","ambulance","fire"].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              background: filter === f ? COLORS.sos : COLORS.bgCard,
              border: `1px solid ${COLORS.border}`, borderRadius: 8,
              color: COLORS.text, padding: "4px 8px", fontSize: 11, fontWeight: 600, cursor: "pointer",
            }}>{f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1,3)}</button>
          ))}
        </div>
      } />

      {/* Map Canvas */}
      <div style={{ flex: 1, position: "relative", background: "linear-gradient(135deg, #0d1b2a 0%, #1a2d44 50%, #0d1b2a 100%)", overflow: "hidden" }}>
        {/* Grid lines */}
        {[...Array(8)].map((_, i) => (
          <div key={`h${i}`} style={{ position: "absolute", top: `${(i+1)*12.5}%`, left: 0, right: 0, height: 1, background: "rgba(255,255,255,0.04)" }} />
        ))}
        {[...Array(8)].map((_, i) => (
          <div key={`v${i}`} style={{ position: "absolute", left: `${(i+1)*12.5}%`, top: 0, bottom: 0, width: 1, background: "rgba(255,255,255,0.04)" }} />
        ))}

        {/* Roads (simulated) */}
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
          <line x1="20%" y1="50%" x2="80%" y2="50%" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
          <line x1="50%" y1="10%" x2="50%" y2="90%" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
          <line x1="20%" y1="30%" x2="75%" y2="75%" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
        </svg>

        {/* Markers */}
        {filtered.map(m => {
          const colorMap = { police: COLORS.police, ambulance: COLORS.ambulance, fire: COLORS.fire, user: COLORS.sos, emergency: "#ECC94B" };
          const c = colorMap[m.type] || COLORS.text;
          return (
            <div key={m.id} style={{ position: "absolute", left: `${m.x}%`, top: `${m.y}%`, transform: "translate(-50%,-50%)", textAlign: "center", cursor: "pointer" }}>
              {m.type === "user" && <div style={{ position: "absolute", inset: -20, borderRadius: "50%", background: `${c}22`, animation: "pulse-ring 2s ease-out infinite" }} />}
              <div style={{ fontSize: 24, filter: `drop-shadow(0 0 8px ${c})` }}>{m.icon}</div>
              <div style={{ background: "rgba(0,0,0,0.8)", color: c, fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 6, whiteSpace: "nowrap", marginTop: 2 }}>{m.label}</div>
            </div>
          );
        })}

        {/* ETA Panel */}
        <div style={{ position: "absolute", bottom: 16, left: 16, right: 16 }}>
          <GlassCard style={{ padding: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 700 }}>Nearest Units</span>
              <span style={{ color: COLORS.textMuted, fontSize: 12 }}>Live tracking</span>
            </div>
            {[
              { icon: "🚓", label: "Police Unit 12", eta: "3 min", color: COLORS.police },
              { icon: "🚑", label: "Ambulance 3", eta: "6 min", color: COLORS.ambulance },
              { icon: "🚒", label: "Fire Unit 1", eta: "9 min", color: COLORS.fire },
            ].map(u => (
              <div key={u.label} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0", borderBottom: `1px solid ${COLORS.border}` }}>
                <span style={{ fontSize: 20 }}>{u.icon}</span>
                <span style={{ flex: 1, fontSize: 13 }}>{u.label}</span>
                <Badge color={u.color} small>ETA {u.eta}</Badge>
              </div>
            ))}
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// CHAT
// ============================================================

function ChatPage() {
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  const send = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { id: `m${Date.now()}`, from: "user", text: input, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), type: "text" }]);
    setInput("");
    setTimeout(() => {
      setMessages(prev => [...prev, { id: `m${Date.now()}`, from: "dispatcher", text: "Message received. We are monitoring the situation.", time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), type: "text" }]);
    }, 1500);
  };

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <TopBar title="💬 Dispatcher Chat" right={
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS.success, animation: "sos-beat 2s infinite" }} />
          <span style={{ fontSize: 12, color: COLORS.success }}>Online</span>
        </div>
      } />

      {/* Status banner */}
      <div style={{ background: "rgba(49,130,206,0.1)", borderBottom: "1px solid rgba(49,130,206,0.2)", padding: "8px 16px", display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 14 }}>🚓</span>
        <span style={{ fontSize: 12, color: COLORS.police }}>Police Unit 12 — En route · ETA 3 min</span>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
        {messages.map(m => (
          <div key={m.id} style={{ display: "flex", justifyContent: m.from === "user" ? "flex-end" : "flex-start", animation: "slide-in 0.3s ease" }}>
            {m.from !== "user" && (
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: COLORS.police + "33", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, marginRight: 8, flexShrink: 0 }}>👮</div>
            )}
            <div style={{ maxWidth: "75%" }}>
              <div style={{
                background: m.from === "user" ? COLORS.sos : COLORS.bgCard,
                border: `1px solid ${m.from === "user" ? COLORS.sos + "44" : COLORS.border}`,
                borderRadius: m.from === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                padding: "10px 14px", fontSize: 14, lineHeight: 1.5,
              }}>{m.text}</div>
              <div style={{ fontSize: 10, color: COLORS.textDim, marginTop: 4, textAlign: m.from === "user" ? "right" : "left" }}>{m.time}</div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div style={{ padding: "12px 16px", borderTop: `1px solid ${COLORS.border}`, display: "flex", gap: 10, background: COLORS.bg }}>
        <button style={{ background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: "10px 12px", fontSize: 18, cursor: "pointer" }}>📎</button>
        <button style={{ background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: "10px 12px", fontSize: 18, cursor: "pointer" }}>🎤</button>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()}
          placeholder="Type a message..."
          style={{ flex: 1, background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 10, color: COLORS.text, padding: "10px 14px", fontSize: 14, outline: "none" }} />
        <button onClick={send} style={{
          background: COLORS.sos, border: "none", borderRadius: 10,
          padding: "10px 16px", color: "#fff", fontSize: 18, cursor: "pointer",
        }}>➤</button>
      </div>
    </div>
  );
}

// ============================================================
// PROFILE
// ============================================================

function ProfilePage({ setPage }) {
  const [editing, setEditing] = useState(false);
  const [tab, setTab] = useState("info");

  const info = [
    { label: "Full Name", value: "Ahmed Hassan", icon: "👤" },
    { label: "Phone", value: "+252 61 234 5678", icon: "📱" },
    { label: "National ID", value: "SO-123456789", icon: "🪪" },
    { label: "Blood Group", value: "O+", icon: "🩸" },
    { label: "Medical Conditions", value: "None", icon: "💊" },
    { label: "Allergies", value: "Penicillin", icon: "⚠️" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: COLORS.bg, paddingBottom: 100 }}>
      <TopBar title="👤 My Profile" right={
        <button onClick={() => setEditing(e => !e)} style={{
          background: editing ? COLORS.sos : COLORS.bgCard, border: `1px solid ${COLORS.border}`,
          borderRadius: 8, color: COLORS.text, padding: "6px 12px", fontSize: 13, fontWeight: 600, cursor: "pointer",
        }}>{editing ? "Save" : "Edit"}</button>
      } />

      <div style={{ padding: 16 }}>
        {/* Avatar */}
        <GlassCard style={{ padding: 24, textAlign: "center", marginBottom: 16 }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: `linear-gradient(135deg, ${COLORS.sos}, ${COLORS.sosDark})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, margin: "0 auto 12px" }}>AH</div>
          <h2 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 4px" }}>Ahmed Hassan</h2>
          <p style={{ color: COLORS.textMuted, fontSize: 13, margin: "0 0 12px" }}>+252 61 234 5678</p>
          <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
            <Badge color={COLORS.success}>Verified</Badge>
            <Badge color={COLORS.police} small>Reputation: 95%</Badge>
          </div>
        </GlassCard>

        {/* QR Code placeholder */}
        <GlassCard style={{ padding: 16, marginBottom: 16, display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 60, height: 60, background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, flexShrink: 0 }}>⬛</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>Emergency QR Code</div>
            <div style={{ color: COLORS.textMuted, fontSize: 12 }}>Scan to access your medical info in emergencies</div>
          </div>
          <button style={{ background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 8, color: COLORS.text, padding: "6px 10px", fontSize: 12, cursor: "pointer", whiteSpace: "nowrap", marginLeft: "auto" }}>View QR</button>
        </GlassCard>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {[["info","Info"],["medical","Medical"],["contacts","Contacts"],["history","History"]].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} style={{
              background: tab === id ? COLORS.sos : COLORS.bgCard,
              border: `1px solid ${tab === id ? COLORS.sos : COLORS.border}`,
              borderRadius: 8, color: COLORS.text, padding: "6px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer",
            }}>{label}</button>
          ))}
        </div>

        {tab === "info" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {info.map(f => (
              <GlassCard key={f.label} style={{ padding: "12px 14px", display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 20 }}>{f.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: COLORS.textMuted, marginBottom: 2 }}>{f.label}</div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{f.value}</div>
                </div>
              </GlassCard>
            ))}
          </div>
        )}

        {tab === "medical" && (
          <GlassCard style={{ padding: 16 }}>
            <div style={{ background: COLORS.sos + "15", border: `1px solid ${COLORS.sos}33`, borderRadius: 10, padding: 14, marginBottom: 12 }}>
              <h3 style={{ color: COLORS.sos, fontSize: 14, fontWeight: 700, margin: "0 0 8px" }}>⚠️ Emergency Medical Card</h3>
              <p style={{ fontSize: 13, margin: "4px 0" }}><strong>Blood:</strong> O+</p>
              <p style={{ fontSize: 13, margin: "4px 0" }}><strong>Allergies:</strong> Penicillin</p>
              <p style={{ fontSize: 13, margin: "4px 0" }}><strong>Conditions:</strong> None</p>
            </div>
          </GlassCard>
        )}

        {tab === "contacts" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[{ name: "Fatima Hassan", rel: "Wife", phone: "+252 61 555 0001" }, { name: "Omar Hassan", rel: "Brother", phone: "+252 61 555 0002" }].map(c => (
              <GlassCard key={c.name} style={{ padding: 14 }}>
                <div style={{ fontWeight: 700 }}>{c.name}</div>
                <div style={{ color: COLORS.textMuted, fontSize: 13 }}>{c.rel} · {c.phone}</div>
              </GlassCard>
            ))}
            <button style={{ background: COLORS.bgCard, border: `1px dashed ${COLORS.border}`, borderRadius: 12, color: COLORS.textMuted, padding: 14, fontSize: 14, cursor: "pointer" }}>+ Add Contact</button>
          </div>
        )}

        {tab === "history" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {MOCK_EMERGENCIES.slice(3).map(e => {
              const et = EMERGENCY_TYPES[e.type];
              return (
                <GlassCard key={e.id} style={{ padding: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontWeight: 700 }}>{et.icon} {e.category}</span>
                    <StatusBadge status={e.status} />
                  </div>
                  <div style={{ color: COLORS.textMuted, fontSize: 12 }}>📍 {e.location} · {e.time}</div>
                </GlassCard>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// NOTIFICATIONS
// ============================================================

function NotificationsPage() {
  const notifs = [
    { id: 1, title: "Emergency Accepted", body: "Police Unit 12 has accepted your case", time: "5 min ago", icon: "🚓", read: false },
    { id: 2, title: "Responder On The Way", body: "Unit 12 is en route — ETA 6 minutes", time: "4 min ago", icon: "🚨", read: false },
    { id: 3, title: "Emergency Completed", body: "Your previous case has been resolved", time: "2 hrs ago", icon: "✅", read: true },
    { id: 4, title: "Safety Alert", body: "Active incident reported near Hodan District", time: "3 hrs ago", icon: "⚠️", read: true },
  ];

  return (
    <div style={{ minHeight: "100vh", background: COLORS.bg, paddingBottom: 80 }}>
      <TopBar title="🔔 Notifications" right={
        <button style={{ background: "none", border: "none", color: COLORS.textMuted, fontSize: 13, cursor: "pointer" }}>Mark all read</button>
      } />
      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 8 }}>
        {notifs.map(n => (
          <GlassCard key={n.id} style={{ padding: 14, display: "flex", gap: 12, opacity: n.read ? 0.6 : 1, borderLeft: n.read ? `1px solid ${COLORS.border}` : `3px solid ${COLORS.sos}` }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: COLORS.bgCard, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{n.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>{n.title}</div>
              <div style={{ color: COLORS.textMuted, fontSize: 13 }}>{n.body}</div>
              <div style={{ color: COLORS.textDim, fontSize: 11, marginTop: 4 }}>{n.time}</div>
            </div>
            {!n.read && <div style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS.sos, flexShrink: 0, marginTop: 4 }} />}
          </GlassCard>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// ADMIN DASHBOARD
// ============================================================

function AdminDashboard({ setPage, setRole }) {
  const [adminTab, setAdminTab] = useState("overview");

  const handleLogout = () => { setRole(null); setPage("landing"); };

  return (
    <div style={{ minHeight: "100vh", background: COLORS.bg, paddingBottom: 100 }}>
      <div style={{ padding: "16px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${COLORS.border}` }}>
        <div>
          <div style={{ fontSize: 11, color: COLORS.textMuted, letterSpacing: 1, textTransform: "uppercase" }}>SOS Somalia</div>
          <div style={{ fontSize: 20, fontWeight: 800 }}>Admin Dashboard</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setRole("user")} style={{ background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 8, color: COLORS.text, padding: "6px 10px", fontSize: 12, cursor: "pointer" }}>User View</button>
          <button onClick={handleLogout} style={{ background: COLORS.sos + "22", border: `1px solid ${COLORS.sos}44`, borderRadius: 8, color: COLORS.sos, padding: "6px 10px", fontSize: 12, cursor: "pointer" }}>Logout</button>
        </div>
      </div>

      {/* Admin nav */}
      <div style={{ display: "flex", gap: 0, overflowX: "auto", borderBottom: `1px solid ${COLORS.border}`, padding: "0 16px" }}>
        {[["overview","Overview"],["emergencies","Cases"],["users","Users"],["analytics","Analytics"],["map","Live Map"]].map(([id, label]) => (
          <button key={id} onClick={() => setAdminTab(id)} style={{
            background: "none", border: "none", borderBottom: adminTab === id ? `2px solid ${COLORS.sos}` : "2px solid transparent",
            color: adminTab === id ? COLORS.sos : COLORS.textMuted,
            padding: "12px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap",
          }}>{label}</button>
        ))}
      </div>

      <div style={{ padding: 16 }}>
        {adminTab === "overview" && <AdminOverview />}
        {adminTab === "emergencies" && <AdminEmergencies />}
        {adminTab === "users" && <AdminUsers />}
        {adminTab === "analytics" && <AdminAnalytics />}
        {adminTab === "map" && <AdminMap />}
      </div>
    </div>
  );
}

function AdminOverview() {
  const stats = [
    { label: "Total Reports", value: MOCK_STATS.total.toLocaleString(), change: "+12%", icon: "📋", color: COLORS.text },
    { label: "Active Now", value: MOCK_STATS.active, change: "", icon: "🚨", color: COLORS.warning },
    { label: "Resolved", value: MOCK_STATS.resolved.toLocaleString(), change: "+8%", icon: "✅", color: COLORS.success },
    { label: "Fake Reports", value: MOCK_STATS.fake, change: "-3%", icon: "🚫", color: COLORS.danger },
    { label: "Police Cases", value: MOCK_STATS.police, change: "+5%", icon: "🚓", color: COLORS.police },
    { label: "Ambulance", value: MOCK_STATS.ambulance, change: "+15%", icon: "🚑", color: COLORS.ambulance },
    { label: "Fire Calls", value: MOCK_STATS.fire, change: "+2%", icon: "🚒", color: COLORS.fire },
    { label: "Avg Response", value: MOCK_STATS.avgResponse, change: "-0.5min", icon: "⚡", color: COLORS.success },
  ];

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
        {stats.map(s => (
          <GlassCard key={s.label} style={{ padding: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: 20 }}>{s.icon}</span>
              {s.change && <span style={{ fontSize: 11, color: s.change.startsWith("+") ? COLORS.success : s.change.startsWith("-") && s.label === "Avg Response" ? COLORS.success : COLORS.danger, fontWeight: 700 }}>{s.change}</span>}
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 11, color: COLORS.textMuted }}>{s.label}</div>
          </GlassCard>
        ))}
      </div>

      {/* Live feed */}
      <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 10 }}>Live Feed</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {MOCK_EMERGENCIES.map(e => {
          const et = EMERGENCY_TYPES[e.type];
          const pColors = { high: COLORS.danger, critical: COLORS.sos, medium: COLORS.warning };
          return (
            <GlassCard key={e.id} style={{ padding: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 22 }}>{et.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                    <span style={{ fontWeight: 700, fontSize: 13 }}>{e.category}</span>
                    <Badge color={pColors[e.priority] || COLORS.textMuted} small>{e.priority}</Badge>
                    <StatusBadge status={e.status} />
                  </div>
                  <div style={{ color: COLORS.textMuted, fontSize: 12 }}>{e.user} · 📍 {e.location} · {e.time}</div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button style={{ background: COLORS.police + "22", border: `1px solid ${COLORS.police}44`, borderRadius: 6, color: COLORS.police, padding: "4px 8px", fontSize: 11, cursor: "pointer" }}>Assign</button>
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}

function AdminEmergencies() {
  const [filter, setFilter] = useState("all");
  const filtered = filter === "all" ? MOCK_EMERGENCIES : MOCK_EMERGENCIES.filter(e => e.status === filter || e.type === filter);

  return (
    <div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
        {["all","active","pending","responding","resolved"].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            background: filter === f ? COLORS.sos : COLORS.bgCard,
            border: `1px solid ${COLORS.border}`, borderRadius: 20,
            color: COLORS.text, padding: "5px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer",
          }}>{f.charAt(0).toUpperCase() + f.slice(1)}</button>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {filtered.map(e => {
          const et = EMERGENCY_TYPES[e.type];
          return (
            <GlassCard key={e.id} style={{ padding: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span>{et.icon}</span>
                  <span style={{ fontWeight: 700 }}>{e.category}</span>
                </div>
                <StatusBadge status={e.status} />
              </div>
              <div style={{ color: COLORS.textMuted, fontSize: 13, marginBottom: 8 }}>👤 {e.user} · 📍 {e.location} · 🕐 {e.time}</div>
              {e.responder && <div style={{ color: COLORS.police, fontSize: 12 }}>🚓 {e.responder}</div>}
              <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
                <button style={{ background: COLORS.police + "22", border: `1px solid ${COLORS.police}44`, borderRadius: 6, color: COLORS.police, padding: "4px 10px", fontSize: 11, cursor: "pointer" }}>View</button>
                <button style={{ background: COLORS.success + "22", border: `1px solid ${COLORS.success}44`, borderRadius: 6, color: COLORS.success, padding: "4px 10px", fontSize: 11, cursor: "pointer" }}>Resolve</button>
                <button style={{ background: COLORS.danger + "22", border: `1px solid ${COLORS.danger}44`, borderRadius: 6, color: COLORS.danger, padding: "4px 10px", fontSize: 11, cursor: "pointer" }}>Flag</button>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}

function AdminUsers() {
  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <input placeholder="🔍 Search users..." style={{
          background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 10,
          color: COLORS.text, padding: "10px 14px", fontSize: 14, width: "100%", outline: "none",
        }} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {MOCK_USERS.map(u => (
          <GlassCard key={u.id} style={{ padding: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <div style={{ fontWeight: 700 }}>{u.name}</div>
              <StatusBadge status={u.status} />
            </div>
            <div style={{ color: COLORS.textMuted, fontSize: 13, marginBottom: 8 }}>{u.phone}</div>
            <div style={{ display: "flex", gap: 12, marginBottom: 8 }}>
              <span style={{ fontSize: 12 }}>📋 Reports: <strong>{u.reports}</strong></span>
              <span style={{ fontSize: 12 }}>⭐ Rep: <strong style={{ color: u.reputation > 50 ? COLORS.success : COLORS.danger }}>{u.reputation}%</strong></span>
              <span style={{ fontSize: 12 }}>⚠️ Warnings: <strong style={{ color: u.warnings > 0 ? COLORS.warning : COLORS.textMuted }}>{u.warnings}/3</strong></span>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button style={{ background: COLORS.police + "22", border: `1px solid ${COLORS.police}44`, borderRadius: 6, color: COLORS.police, padding: "4px 10px", fontSize: 11, cursor: "pointer" }}>View</button>
              {u.status === "active" ? (
                <button style={{ background: COLORS.warning + "22", border: `1px solid ${COLORS.warning}44`, borderRadius: 6, color: COLORS.warning, padding: "4px 10px", fontSize: 11, cursor: "pointer" }}>Suspend</button>
              ) : (
                <button style={{ background: COLORS.success + "22", border: `1px solid ${COLORS.success}44`, borderRadius: 6, color: COLORS.success, padding: "4px 10px", fontSize: 11, cursor: "pointer" }}>Restore</button>
              )}
              <button style={{ background: COLORS.danger + "22", border: `1px solid ${COLORS.danger}44`, borderRadius: 6, color: COLORS.danger, padding: "4px 10px", fontSize: 11, cursor: "pointer" }}>Ban</button>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}

function AdminAnalytics() {
  const days = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
  const max = Math.max(...MOCK_STATS.weeklyTrend);

  return (
    <div>
      <GlassCard style={{ padding: 16, marginBottom: 16 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Weekly Emergency Trend</h3>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 120 }}>
          {MOCK_STATS.weeklyTrend.map((v, i) => (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div style={{ width: "100%", background: `linear-gradient(to top, ${COLORS.sos}, ${COLORS.sos}88)`, borderRadius: "4px 4px 0 0", height: `${(v / max) * 100}px`, transition: "height 0.5s ease" }} />
              <span style={{ fontSize: 10, color: COLORS.textMuted }}>{days[i]}</span>
              <span style={{ fontSize: 10, fontWeight: 700 }}>{v}</span>
            </div>
          ))}
        </div>
      </GlassCard>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
        {Object.entries(EMERGENCY_TYPES).map(([key, et]) => (
          <GlassCard key={key} style={{ padding: 14, textAlign: "center" }}>
            <div style={{ fontSize: 28, marginBottom: 6 }}>{et.icon}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: et.color }}>{MOCK_STATS[key]}</div>
            <div style={{ fontSize: 11, color: COLORS.textMuted }}>{et.label}</div>
          </GlassCard>
        ))}
      </div>

      <GlassCard style={{ padding: 16, marginBottom: 16 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Abuse Detection</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 13 }}>Fake Reports Detected</span>
            <span style={{ fontWeight: 700, color: COLORS.danger }}>{MOCK_STATS.fake}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 13 }}>Suspended Accounts</span>
            <span style={{ fontWeight: 700, color: COLORS.warning }}>2</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 13 }}>Banned Accounts</span>
            <span style={{ fontWeight: 700, color: COLORS.sos }}>1</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 13 }}>False Report Rate</span>
            <span style={{ fontWeight: 700, color: COLORS.success }}>2.1%</span>
          </div>
        </div>
      </GlassCard>

      <button style={{ width: "100%", background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 12, color: COLORS.text, padding: "14px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
        📄 Export PDF Report
      </button>
    </div>
  );
}

function AdminMap() {
  return (
    <div>
      <GlassCard style={{ padding: 14, marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {[{ label: "Active Cases", count: 3, color: COLORS.sos }, { label: "Units Deployed", count: 8, color: COLORS.police }, { label: "Hospitals", count: 5, color: COLORS.ambulance }, { label: "Fire Stations", count: 4, color: COLORS.fire }].map(s => (
            <div key={s.label} style={{ flex: "1 1 120px", textAlign: "center" }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.count}</div>
              <div style={{ fontSize: 11, color: COLORS.textMuted }}>{s.label}</div>
            </div>
          ))}
        </div>
      </GlassCard>
      <div style={{ height: 400, background: "linear-gradient(135deg, #0d1b2a, #1a2d44)", borderRadius: 16, position: "relative", overflow: "hidden", border: `1px solid ${COLORS.border}` }}>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}>
          <div style={{ fontSize: 48 }}>🗺</div>
          <p style={{ color: COLORS.textMuted, fontSize: 14, textAlign: "center", padding: "0 24px" }}>Google Maps integration would render here with live unit positions, active cases, hospital & station locations</p>
          <Badge color={COLORS.success}>Google Maps API Ready</Badge>
        </div>
        {/* Simulated markers */}
        {[{ top: "25%", left: "40%", icon: "🚓", c: COLORS.police }, { top: "60%", left: "65%", icon: "🚑", c: COLORS.ambulance }, { top: "45%", left: "30%", icon: "🚨", c: COLORS.sos }, { top: "70%", left: "50%", icon: "🏥", c: COLORS.ambulance }].map((m, i) => (
          <div key={i} style={{ position: "absolute", top: m.top, left: m.left, fontSize: 22, filter: `drop-shadow(0 0 6px ${m.c})` }}>{m.icon}</div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// RESPONDER DASHBOARDS
// ============================================================

function ResponderDashboard({ type, setPage }) {
  const et = EMERGENCY_TYPES[type] || EMERGENCY_TYPES.police;
  const cases = MOCK_EMERGENCIES.filter(e => e.type === type);
  const [accepted, setAccepted] = useState(null);

  return (
    <div style={{ minHeight: "100vh", background: COLORS.bg, paddingBottom: 100 }}>
      <div style={{ padding: "16px", borderBottom: `1px solid ${COLORS.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 11, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: 1 }}>Responder Portal</div>
          <div style={{ fontSize: 20, fontWeight: 800 }}>{et.icon} {et.label}</div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: COLORS.success, animation: "sos-beat 2s infinite", marginTop: 4 }} />
          <span style={{ fontSize: 12, color: COLORS.success, fontWeight: 600 }}>On Duty</span>
        </div>
      </div>

      <div style={{ padding: 16 }}>
        {/* Status card */}
        <GlassCard style={{ padding: 16, marginBottom: 16, border: `1px solid ${et.color}33`, background: et.color + "08" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontWeight: 700, color: et.color }}>My Status</span>
            <Badge color={COLORS.success}>Available</Badge>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, textAlign: "center" }}>
            <div><div style={{ fontSize: 20, fontWeight: 800 }}>3</div><div style={{ fontSize: 11, color: COLORS.textMuted }}>Today</div></div>
            <div><div style={{ fontSize: 20, fontWeight: 800, color: et.color }}>1</div><div style={{ fontSize: 11, color: COLORS.textMuted }}>Active</div></div>
            <div><div style={{ fontSize: 20, fontWeight: 800, color: COLORS.success }}>2</div><div style={{ fontSize: 11, color: COLORS.textMuted }}>Resolved</div></div>
          </div>
        </GlassCard>

        {accepted && (
          <GlassCard style={{ padding: 14, marginBottom: 16, border: `2px solid ${et.color}`, background: et.color + "10" }}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 8, color: et.color }}>🔴 Active Case</div>
            <div style={{ color: COLORS.text, marginBottom: 6 }}>{accepted.category} — {accepted.location}</div>
            <div style={{ color: COLORS.textMuted, fontSize: 13, marginBottom: 12 }}>👤 {accepted.user}</div>
            <div style={{ display: "flex", gap: 8 }}>
              <button style={{ flex: 1, background: COLORS.police + "22", border: `1px solid ${COLORS.police}44`, borderRadius: 8, color: COLORS.police, padding: "10px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>🗺 Navigate</button>
              <button onClick={() => setAccepted(null)} style={{ flex: 1, background: COLORS.success + "22", border: `1px solid ${COLORS.success}44`, borderRadius: 8, color: COLORS.success, padding: "10px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>✅ Complete</button>
            </div>
          </GlassCard>
        )}

        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 10 }}>Incoming Cases</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {cases.filter(c => c.status !== "resolved").map(e => (
            <GlassCard key={e.id} style={{ padding: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <div style={{ fontWeight: 700 }}>{e.category}</div>
                <StatusBadge status={e.status} />
              </div>
              <div style={{ color: COLORS.textMuted, fontSize: 13, marginBottom: 10 }}>📍 {e.location} · {e.time} · 👤 {e.user}</div>
              {e.status === "pending" && (
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => setAccepted(e)} style={{ flex: 1, background: et.color + "22", border: `1px solid ${et.color}44`, borderRadius: 8, color: et.color, padding: "10px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Accept Case</button>
                  <button style={{ background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 8, color: COLORS.textMuted, padding: "10px 12px", fontSize: 13, cursor: "pointer" }}>Skip</button>
                </div>
              )}
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// ROLE SELECTOR (for demo)
// ============================================================

function RoleSelector({ setRole, setPage }) {
  return (
    <div style={{ minHeight: "100vh", background: COLORS.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <button onClick={() => setPage("landing")} style={{ background: "none", border: "none", color: COLORS.textMuted, cursor: "pointer", fontSize: 14, marginBottom: 32, alignSelf: "flex-start" }}>← Back</button>
      <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Select Portal</h2>
      <p style={{ color: COLORS.textMuted, marginBottom: 32, fontSize: 14 }}>Demo mode — choose a role to explore</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%", maxWidth: 360 }}>
        {[
          { label: "👑 Admin", role: "admin", page: "admin", color: COLORS.sos, desc: "Full system control" },
          { label: "🚓 Police Responder", role: "police", page: "police", color: COLORS.police, desc: "Police dispatcher view" },
          { label: "🚑 Ambulance Crew", role: "ambulance", page: "ambulance", color: COLORS.ambulance, desc: "Medical response view" },
          { label: "🚒 Fire Fighter", role: "fire", page: "fire", color: COLORS.fire, desc: "Fire department view" },
        ].map(r => (
          <GlassCard key={r.role} hover onClick={() => { setRole(r.role); setPage(r.page); }}
            style={{ padding: 16, border: `1px solid ${r.color}33`, cursor: "pointer" }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: r.color, marginBottom: 2 }}>{r.label}</div>
            <div style={{ fontSize: 13, color: COLORS.textMuted }}>{r.desc}</div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// MAIN APP
// ============================================================

export default function App() {
  const [page, setPage] = useState("landing");
  const [role, setRole] = useState(null);
  const [emergencyType, setEmergencyType] = useState("police");

  const userPages = ["dashboard","sos","emergency-form","map","chat","profile","notifications"];
  const adminPages = ["admin","police","ambulance","fire","emergencies","users","analytics"];
  const showNav = [...userPages, ...adminPages].includes(page);
  const isUser = role === "user";
  const isAdmin = role === "admin";

  const renderPage = () => {
    switch (page) {
      case "landing": return <LandingPage setPage={setPage} />;
      case "login": return <AuthPage type="login" setPage={setPage} setRole={setRole} />;
      case "register": return <AuthPage type="register" setPage={setPage} setRole={setRole} />;
      case "dashboard": return <Dashboard setPage={setPage} setEmergencyType={setEmergencyType} />;
      case "sos": return <SOSScreen setPage={setPage} />;
      case "emergency-form": return <EmergencyForm emergencyType={emergencyType} setPage={setPage} />;
      case "map": return <MapPage />;
      case "chat": return <ChatPage />;
      case "profile": return <ProfilePage setPage={setPage} />;
      case "notifications": return <NotificationsPage />;
      case "admin": return <AdminDashboard setPage={setPage} setRole={setRole} />;
      case "police": return <ResponderDashboard type="police" setPage={setPage} />;
      case "ambulance": return <ResponderDashboard type="ambulance" setPage={setPage} />;
      case "fire": return <ResponderDashboard type="fire" setPage={setPage} />;
      case "role-select": return <RoleSelector setRole={setRole} setPage={setPage} />;
      default: return <LandingPage setPage={setPage} />;
    }
  };

  // Auto-handle admin role page navigation
  const handleSetPage = (p) => {
    if (p === "admin" && !role) { setRole("admin"); }
    if (p === "dashboard" && !role) { setRole("user"); }
    setPage(p);
  };

  // Admin nav
  const handleAdminSetPage = (p) => {
    if (p === "map") setPage("map");
    else setPage(p);
  };

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", minHeight: "100vh", background: COLORS.bg, position: "relative" }}>
      {renderPage()}
      {showNav && (
        <NavBar
          currentPage={page}
          setPage={isAdmin || role === "admin" ? handleAdminSetPage : setPage}
          role={role === "admin" ? "admin" : "user"}
        />
      )}
    </div>
  );
}
