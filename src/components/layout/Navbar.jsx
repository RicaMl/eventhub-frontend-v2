import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Language from "./Language.jsx";
import Theme from "./Theme.jsx";
import ProfileModal from "../profile/ProfileModal.jsx";
import { useApp } from "../../context/AppContext";
import "../../css/Navbar.css";

export default function Navbar() {
  const { user, logout, t, isAdmin } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
    setProfileOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  const getInitials = () => {
    const first = user?.first_name?.charAt(0)?.toUpperCase() || "";
    const last = user?.last_name?.charAt(0)?.toUpperCase() || "";
    if (first || last) return first + last;
    return user?.email?.charAt(0)?.toUpperCase() || "U";
  };

  const getDisplayName = () => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    return user?.username || t("nav.user");
  };

  return (
    <>
      <header className="navbar" role="banner">
        <div className="navbar-inner container">
          {/* Logo */}
          <Link to="/" className="navbar-logo" aria-label="EventHub - Accueil">
            <span className="logo-icon" aria-hidden="true">⬡</span>
            <span className="logo-text">Event<strong>Hub</strong></span>
          </Link>

          {/* Navigation principale */}
          <nav className={`navbar-links ${menuOpen ? "open" : ""}`} aria-label="Navigation principale">
            <Link to="/" className={`nav-link ${isActive("/") ? "active" : ""}`} onClick={() => setMenuOpen(false)}>
              {t("nav.home")}
            </Link>
            <Link to="/events" className={`nav-link ${isActive("/events") ? "active" : ""}`} onClick={() => setMenuOpen(false)}>
              {t("nav.events")}
            </Link>
            {isAdmin && (
              <Link to="/dashboard" className={`nav-link ${isActive("/dashboard") ? "active" : ""}`} onClick={() => setMenuOpen(false)}>
                {t("nav.dashboard")}
              </Link>
            )}
            {user && (
              <Link to="/my-events" className={`nav-link ${isActive("/my-events") ? "active" : ""}`} onClick={() => setMenuOpen(false)}>
                {t("nav.myEvents")}
              </Link>
            )}
          </nav>

          {/* Contrôles droits */}
          <div className="navbar-actions">
            <Language />
            <Theme />

            {user ? (
              <div className="profile-dropdown">
                <button 
                  className="profile-btn" 
                  onClick={() => setProfileOpen((v) => !v)}
                  aria-expanded={profileOpen}
                  aria-haspopup="true"
                  aria-label="Menu utilisateur"
                >
                  <div className="avatar" aria-hidden="true">
                    {getInitials()}
                  </div>
                  <span className="profile-name">{getDisplayName()}</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {profileOpen && (
                  <div className="dropdown-menu animate-fade" role="menu" aria-label="Menu utilisateur">
                    <div className="dropdown-header" role="none">
                      <div className="avatar large" aria-hidden="true">{getInitials()}</div>
                      <div>
                        <p className="dh-name">{getDisplayName()}</p>
                        <p className="dh-email">{user.email}</p>
                        <span className={`badge ${isAdmin ? "badge-accent" : "badge-muted"}`} style={{ fontSize: 11, marginTop: 4 }}>
                          {isAdmin ? t("participants.admin") : t("participants.viewer")}
                        </span>
                      </div>
                    </div>
                    <div className="dropdown-divider" role="separator" />
                    <button 
                      className="dropdown-item" 
                      onClick={() => { setShowProfileModal(true); setProfileOpen(false); }}
                      role="menuitem"
                    >
                      <span aria-hidden="true">👤</span> {t("profile.edit")}
                    </button>
                    
                    {isAdmin && (
                      <Link to="/dashboard" className="dropdown-item" onClick={() => setProfileOpen(false)} role="menuitem">
                        <span aria-hidden="true">📊</span> {t("nav.dashboard")}
                      </Link>
                    )}
                    <div className="dropdown-divider" role="separator" />
                    <button 
                      className="dropdown-item danger" 
                      onClick={handleLogout}
                      role="menuitem"
                    >
                      <span aria-hidden="true">🚪</span> {t("nav.logout")}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="auth-buttons">
                <Link to="/login" className="btn btn-ghost" style={{ padding: "8px 16px" }}>
                  {t("nav.login")}
                </Link>
                <Link to="/register" className="btn btn-primary" style={{ padding: "8px 16px" }}>
                  {t("nav.register")}
                </Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button 
              className="hamburger" 
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
              aria-expanded={menuOpen}
            >
              <span className={menuOpen ? "close" : "open"} aria-hidden="true">
                {menuOpen ? "✕" : "☰"}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Modals */}
      <ProfileModal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} />
      
    </>
  );
}