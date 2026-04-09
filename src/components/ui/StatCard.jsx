import "../../css/StatCard.css";

export default function StatCard({ icon, label, value, trend, color = "accent" }) {
  return (
    <div className={`stat-card stat-card--${color} animate-fade`}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-info">
        <span className="stat-label">{label}</span>
        <span className="stat-value">{value ?? "—"}</span>
        {trend !== undefined && (
          <span className={`stat-trend ${trend >= 0 ? "up" : "down"}`}>
            {trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}% ce mois
          </span>
        )}
      </div>
    </div>
  );
}
