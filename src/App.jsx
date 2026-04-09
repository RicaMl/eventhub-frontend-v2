import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AppProvider, useApp } from "./context/AppContext.jsx";
import Navbar from "./components/layout/Navbar.jsx";
import ProtectedRoute from "./components/ui/ProtectedRoute.jsx";
import DashboardEvents from "./pages/dashboard/DashboardEvents.jsx";
import DashboardParticipants from "./pages/dashboard/DashboardParticipants.jsx"
import Home from "./pages/home/Home.jsx";
import Error404 from "./pages/errors/Error404.jsx"
import Events from "./pages/events/Events.jsx";
import EventDetail from "./pages/events/EventDetail.jsx";
import MyEvents from "./pages/events/MyEvents.jsx";
import { Login, Register } from "./pages/auth/Auth.jsx";
import Dashboard from "./pages/dashboard/Dashboard.jsx";
import './css/index.css'

export function LayoutWithNavbar() {
  return (
    <>
      <Navbar />
      <Outlet /> 
    </>
  );
}

// Composant pour bloquer TOUTES les routes non-admin
function AdminBlocker({ children }) {
  const { user, isAdmin } = useApp();
  
  // Si admin connecté, rediriger vers dashboard
  if (user && isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
}

// Composant pour rediriger les non-admins du dashboard
function DashboardRedirect() {
  const { user, isAdmin } = useApp();
  
  // Si non connecté → login
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // Si non-admin → accueil
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }
  
  // Si admin → afficher Dashboard avec ses routes enfants
  return <Dashboard />;
}

function AppRoutes() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "var(--bg-card)",
            color: "var(--text-primary)",
            border: "1px solid var(--border)",
            fontFamily: "var(--font-body)",
            fontSize: "14px",
            borderRadius: "12px",
          },
          success: { iconTheme: { primary: "var(--success)", secondary: "var(--bg-card)" } },
          error:   { iconTheme: { primary: "var(--danger)",  secondary: "var(--bg-card)" } },
        }}
      />

      <BrowserRouter>
        <Routes>
          {/* Dashboard → UNIQUEMENT pour admins */}
          <Route path="/dashboard" element={<DashboardRedirect />}>
            <Route path="allevents" element={<DashboardEvents />} />
            <Route path="allparticipants" element={<DashboardParticipants />} />
          </Route>

          {/* Routes publiques / utilisateurs → BLOQUÉES pour les admins */}
          <Route element={<LayoutWithNavbar />}>
            <Route 
              path="/" 
              element={
                <AdminBlocker>
                  <Home />
                </AdminBlocker>
              } 
            />
            <Route 
              path="/events" 
              element={
                <AdminBlocker>
                  <Events />
                </AdminBlocker>
              } 
            />
            <Route 
              path="/events/:id" 
              element={
                <AdminBlocker>
                  <EventDetail />
                </AdminBlocker>
              } 
            />
            <Route 
              path="/my-events" 
              element={
                <AdminBlocker>
                  <MyEvents />
                </AdminBlocker>
              } 
            />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<Error404 />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppRoutes />
    </AppProvider>
  );
}