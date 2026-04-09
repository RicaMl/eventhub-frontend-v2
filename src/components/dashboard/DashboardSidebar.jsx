import { useApp } from "../../context/AppContext";
import { useNavigate, useLocation } from "react-router-dom";
import "../../css/Dashboard.css";

const NAV_ITEMS = [
  { key: "overview",      icon: "📊", path: "/dashboard" },
  { key: "events",        icon: "🗓️", path: "/dashboard/allevents" },
  { key: "participants",  icon: "👥", path: "/dashboard/allparticipants" },
];

export default function DashboardSidebar() {
  const { t, user } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const activeKey = NAV_ITEMS.find((item) => item.path === location.pathname)?.key ?? "overview";

  return (
    <aside className="dash-sidebar">
      <div className="dash-logo">
        <span className="logo-icon" aria-hidden="true">⬡</span>
        <span className="logo-text">Event<strong>Hub</strong></span>
      </div>
      
      {/* Navigation sémantique */}
      <nav className="dash-nav" aria-label="Dashboard navigation">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.key}
            className={`dash-nav-item ${activeKey === item.key ? "active" : ""}`}
            onClick={() => navigate(item.path)}
            aria-current={activeKey === item.key ? "page" : undefined}
          >
            <span className="nav-item-icon" aria-hidden="true">{item.icon}</span>
            <span>
              {item.key === "overview"
                ? t("nav.dashboard")
                : item.key === "events"
                ? t("events.title")
                : t("participants.title")}
            </span>
          </button>
        ))}
      </nav>
      
      {/* Footer avec balises sémantiques */}
      <footer className="dash-sidebar-footer">
        <div className="dash-user">
          <div className="avatar" aria-label={`Avatar de ${user?.first_name || "Admin"}`}>
            {user?.first_name?.[0] || "A"}
          </div>
          <div>
            <p className="du-name">{user?.first_name} {user?.last_name}</p>
            <p className="du-role" aria-label="Rôle administrateur">Admin</p>
          </div>
        </div>
      </footer>
    </aside>
  );
}