import { useState, useEffect, useCallback } from "react";
import StatCard from "../../components/ui/StatCard";
import { useApp } from "../../context/AppContext";
import { statsService } from "../../services/api";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import DashboardSidebar from "../../components/dashboard/DashboardSidebar";
import DashboardNavBar from "../../components/dashboard/DasshboardNavbar";
import "../../css/Dashboard.css";

const NAV_ITEMS = [
  { key: "overview",      path: "/dashboard" },
  { key: "events",        path: "/dashboard/allevents" },
  { key: "participants",  path: "/dashboard/allparticipants" },
];

export default function Dashboard() {
  const { t, user, logout } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const [stats, setStats] = useState(null);

  const activeKey = NAV_ITEMS.find((item) => item.path === location.pathname)?.key ?? "overview";

  // const pageTitle = () => {
  //   if (activeKey === "overview") return `${t("dashboard.welcome")}, ${user?.first_name}`;
  //   if (activeKey === "events") return t("dashboard.manageEvents");
  //   return t("dashboard.manageParticipants");
  // };

  // const handleLogout = async () => {
  //   logout();
  //   navigate("/login");
  //   toast.success("À bientôt !");
  // };

  const loadStats = useCallback(() => {
    statsService.getStats()
      .then(setStats)
      .catch(() => setStats({
        nb_events: 0, nb_participants: 0, nb_registrations: 0,
        upcoming_events: 0, completed_events: 0, cancelled_events: 0
      }));
  }, []);

  useEffect(() => { loadStats(); }, [loadStats]);

  return (
    <main className="dashboard animate-fade">
      <DashboardSidebar />
      <div className="dash-main">
        {/* <header className="dash-header">
          <div>
            <h1 className="dash-page-title">{pageTitle()}</h1>
          </div>
          <button className="btn btn-danger" onClick={handleLogout}>
            {t("nav.logout")}
          </button>
        </header> */}
        <DashboardNavBar/>

        {activeKey === "overview" && (
                  <div className="dash-content">
                    <div className="grid-4" style={{ marginBottom: 32 }}>
                      <StatCard icon="🗓️" label={t("dashboard.totalEvents")}        value={stats?.nb_events ?? "—"}        color="accent" />
                      <StatCard icon="👥" label={t("dashboard.totalParticipants")}  value={stats?.nb_participants ?? "—"}  color="success" />
                      <StatCard icon="📝" label={t("dashboard.totalRegistrations")} value={stats?.nb_registrations ?? "—"} color="warning" />
                      <StatCard icon="⏳" label={t("dashboard.upcomingEvents")}     value={stats?.upcoming_events ?? "—"}  color="accent" />
                      <StatCard icon="📅" label={t("dashboard.completedEvents")}    value={stats?.completed_events ?? "—"} color="success" />
                      <StatCard icon="🚫" label={t("dashboard.cancelledEvents")}    value={stats?.cancelled_events ?? "—"} color="accent" />
                      <StatCard icon="🔴" label={t("dashboard.ongoingEvents")} value={stats?.ongoing_events ?? "—"} color="danger" />
                    </div>
                  </div>
                )}
        

        {/* Passage de stats ET loadStats aux enfants */}
        <Outlet context={{ loadStats, stats }} />
      </div>
    </main>
  );
}