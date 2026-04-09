import { useApp } from "../../context/AppContext";
import Language from "../layout/Language.jsx";
import Theme from "../layout/Theme.jsx";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import "../../css/Dashboard.css";
import { capitalize } from "../../utils/string.js";

const NAV_ITEMS = [
  { key: "overview",      icon: "📊", path: "/dashboard" },
  { key: "events",        icon: "🗓️", path: "/dashboard/allevents" },
  { key: "participants",  icon: "👥", path: "/dashboard/allparticipants" },
];

export default function DashboardNavBar() {
  const { t, user, logout } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      // await authService.logout();
    } catch (err) {
      console.error("Erreur lors de la déconnexion back:", err);
    } finally {
      logout();     
      navigate("/login");
      toast.success("À bientôt !");
    }
  };

  const activeKey = NAV_ITEMS.find((n) => n.path === location.pathname)?.key ?? "overview";

  const pageTitle = () => {
    if (activeKey === "overview") return `${t("dashboard.welcome")}, ${capitalize(user?.username)} `;
    if (activeKey === "events") return t("dashboard.manageEvents");
    return t("dashboard.manageParticipants");
  };

  return (
    <header className="dash-header" aria-label="En-tête du tableau de bord">
      <h1 className="dash-page-title" id="dashboard-title">
        {pageTitle()}
      </h1>
      
      <div className="header-actions" role="group" aria-label="Actions du tableau de bord">
        <Theme />
        <Language />
        <button 
          className="btn btn-danger" 
          onClick={handleLogout}
          aria-label={t("nav.logout")}
        >
          {t("nav.logout")}
        </button>
      </div>
    </header>
  );
}