import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import { authService } from "../../services/api";
import toast from "react-hot-toast";
import "../../css/Auth.css";

//LOGIN 
export function Login() {
  const { t, login } = useApp();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const from = location.state?.from?.pathname || localStorage.getItem("redirectAfterLogin") || "/";


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) { toast.error("Veuillez remplir tous les champs"); return; }
    setLoading(true);
    try {
      const data = await authService.login(username, password);
      console.log(data);
      const userData = {
      id: data.user_id,
      username: data.username,
      email: data.email || "",
      first_name: data.first_name || "",
      last_name: data.last_name || "",
      role: data.is_staff ? "admin" : "user",
      phone: data.phone || "",
      };
      login(userData, data.token);
      toast.success("Connexion réussie !");
      //navigate(data.user?.role === "admin" ? "/" : "/dashboard");
      //navigate(userData.role === "admin" ? "/dashboard" : "/");
      // Nettoyer la redirection stockée
      localStorage.removeItem("redirectAfterLogin");
      // Rediriger vers la page précédente ou vers la page d'accueil
      if (userData.role === "admin") {
        navigate("/dashboard");
      } else {
        navigate(from);
      }
      
    
    } catch (err) {
      
      if (err.response) {
        
        // Le serveur a répondu avec un code (4xx, 5xx)
        //toast.error("Data du serveur :", err.response.data);
        //toast.error("Statut HTTP :", err.response.status);
        //const status = err.response.status; 
        const serverData = err.response.data;

        toast.error(err.response?.data?.detail || "Email ou mot de passe incorrect");
        //toast.error(`Erreur ${status}: ${errorMessages || "Données invalides"}`);
        
        console.log("Détails complets du serveur :", serverData);
        //const msg = err.response?.data?.email?.[0] || err.response?.data?.detail || t("general.error");
        //toast.error(msg);
      } else if (err.request) {
        toast.error("erveur éteint ou problème de CORS");
      } else {
        // Other Error
        toast.error("Erreur de config :", err.message);
      }
        
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title={t("auth.loginTitle")} subtitle={t("auth.loginSubtitle")}>
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label className="form-label">{t("auth.username")}</label>
          <input type="text" className="form-input" value={username} onChange={(e) => setUsername(e.target.value)}
            placeholder="username" autoComplete="username" />
        </div>

        <div className="form-group">
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <label className="form-label">{t("auth.password")}</label>
            <button type="button" className="forgot-link" onClick={() => toast("Contactez l'administrateur")}>
              {t("auth.forgotPassword")}
            </button>
          </div>
          <div className="pw-wrapper">
            <input type={showPw ? "text" : "password"} className="form-input" value={password}
              onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" />
            <button type="button" className="pw-toggle" onClick={() => setShowPw((v) => !v)}>
              {showPw ? "🙈" : "👁️"}
            </button>
          </div>
        </div>

        <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
          {loading ? <><span className="spinner" /> Connexion...</> : t("auth.loginBtn")}
        </button>

        <p className="auth-switch">
          {t("auth.noAccount")}{" "}
          <Link to="/register" className="auth-link">{t("auth.registerBtn")}</Link>
        </p>
      </form>
    </AuthLayout>
  );
}

// REGISTER 
export function Register() {
  const { t, login } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState({ first_name: "", last_name: "", email: "", phone: "", username: "", password: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password || !form.first_name || !form.last_name || !form.phone || !form.username ) {
      toast.error("Veuillez remplir les champs obligatoires"); return;
    }
    if (form.password !== form.confirm) {
      toast.error("Les mots de passe ne correspondent pas"); return;
    }
    if (form.password.length < 6) {
      toast.error("Mot de passe trop court (min. 8 caractères)"); return;
    }
    setLoading(true);
    try {
      const { confirm, ...payload } = form;
      const data = await authService.register(payload);
      login(data.user, data.access || data.token);
      toast.success("Compte créé avec succès !");
      navigate("/login");
    } catch (err) {
      const status = err.response.status; // ex: 400
      const serverData = err.response.data; // ex: { email: ["Cet email existe déjà"] }

      // On transforme l'objet d'erreurs en une chaîne lisible
      // On prend la première erreur de chaque champ
      const errorMessages = Object.entries(serverData)
        .map(([field, messages]) => `${field}: ${messages.join(", ")}`)
        .join(" | ");

      toast.error(`Erreur ${status}: ${errorMessages || "Données invalides"}`);
      
      console.log("Détails complets du serveur :", serverData);
      //const msg = err.response?.data?.email?.[0] || err.response?.data?.detail || t("general.error");
      //toast.error(msg);

    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title={t("auth.registerTitle")} subtitle={t("auth.registerSubtitle")}>
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">{t("auth.firstName")} *</label>
            <input type="text" className="form-input" value={form.first_name} onChange={set("first_name")} placeholder="Jean" />
          </div>
          <div className="form-group">
            <label className="form-label">{t("auth.lastName")} *</label>
            <input type="text" className="form-input" value={form.last_name} onChange={set("last_name")} placeholder="Dupont" />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">{t("auth.email")} *</label>
          <input type="email" className="form-input" value={form.email} onChange={set("email")} placeholder="vous@exemple.fr" />
        </div>

        <div className="form-group">
          <label className="form-label">{t("auth.phone")} *</label>
          <input type="tel" className="form-input" value={form.phone} onChange={set("phone")} placeholder="+33 6 00 00 00 00" />
        </div>

        <div className="form-group">
          <label className="form-label">{t("auth.username")} *</label>
          <input type="text" className="form-input" value={form.username}
            onChange={set("username")} placeholder="Username" />
        </div>

        <div className="form-group">
          <label className="form-label">{t("auth.password")} *</label>
          <div className="pw-wrapper">
            <input type={showPw ? "text" : "password"} className="form-input" value={form.password}
              onChange={set("password")} placeholder="Min. 6 caractères" />
            <button type="button" className="pw-toggle" onClick={() => setShowPw((v) => !v)}>
              {showPw ? "🙈" : "👁️"}
            </button>
          </div>
          {form.password && (
            <div className="pw-strength">
              {["Faible", "Moyen", "Fort", "Très fort"].map((l, i) => (
                <div key={i} className={`pw-bar ${form.password.length > i * 2 ? "filled" : ""}`} />
              ))}
            </div>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">{t("auth.confirmPassword")} *</label>
          <input type={showPw ? "text" : "password"} className="form-input" value={form.confirm}
            onChange={set("confirm")} placeholder="Répétez le mot de passe" />
          {form.confirm && form.password !== form.confirm && (
            <span style={{ fontSize: 12, color: "var(--danger)" }}>Les mots de passe ne correspondent pas</span>
          )}
        </div>

        <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
          {loading ? <><span className="spinner" /> Création...</> : t("auth.registerBtn")}
        </button>

        <p className="auth-switch">
          {t("auth.hasAccount")}{" "}
          <Link to="/login" className="auth-link">{t("auth.loginBtn")}</Link>
        </p>
      </form>
    </AuthLayout>
  );
}

// Shared layout after put in component form
function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-orb orb1" />
        <div className="auth-orb orb2" />
        <div className="auth-orb orb3" />
      </div>
      <div className="auth-card animate-fade">
        <div className="auth-header">
          <Link to="/" className="auth-logo">
            <span className="logo-icon">⬡</span>
            <span className="logo-text">Event<strong>Hub</strong></span>
          </Link>
          <h1 className="auth-title">{title}</h1>
          <p className="auth-subtitle">{subtitle}</p>
        </div>
        {children}
      </div>
    </div>
  );
}
