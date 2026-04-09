import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import { eventService } from "../../services/api";
import EventCard from "../../components/events/EventCard";
import "../../css/Home.css";

export default function Home() {
  const { t, user } = useApp();
  const navigate = useNavigate();

  const [ongoingEvents, setOngoingEvents] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [slide, setSlide] = useState(0);
  const sliderRef = useRef(null);
  const autoRef = useRef(null);

  // Charger les événements en cours (ongoing)
  useEffect(() => {
    eventService.getAll({ status: "ongoing" })
      .then((data) => {
        const eventsData = Array.isArray(data) ? data : data.results || [];
        setOngoingEvents(eventsData.slice(0, 10));
      })
      .catch((err) => {
        console.error("Erreur chargement événements en cours", err);
        setOngoingEvents([]);
      });
  }, []);

  // Charger les événements à venir (upcoming)
  useEffect(() => {
    eventService.getAll({ status: "upcoming" })
      .then((data) => {
        const eventsData = Array.isArray(data) ? data : data.results || [];
        setUpcomingEvents(eventsData.slice(0, 3));
      })
      .catch((err) => {
        console.error("Erreur chargement événements à venir", err);
        setUpcomingEvents([]);
      })
      .finally(() => setLoading(false));
  }, []);

  // Auto-slide hero (uniquement sur les événements en cours)
  useEffect(() => {
    if (!ongoingEvents.length) return;
    autoRef.current = setInterval(() => setSlide((s) => (s + 1) % ongoingEvents.length), 4500);
    return () => clearInterval(autoRef.current);
  }, [ongoingEvents.length]);

  const goSlide = (i) => {
    setSlide(i);
    clearInterval(autoRef.current);
  };

  const featured = ongoingEvents[slide];

  return (
    <main className="home-page">
      {/* ── Hero Slider (Événements en cours) ── */}
      <section className="hero-section">
        {loading ? (
          <div className="hero-skeleton skeleton" />
        ) : ongoingEvents.length > 0 ? (
          <div
            className="hero-bg"
            style={{ backgroundImage: featured.image_url ? `url(${featured.image_url})` : undefined }}
          >
            <div className="hero-overlay" />
            <div className="hero-content container animate-fade" key={slide}>
              <div className="hero-badges">
                <span className="badge badge-success">{t("events.ongoing")}</span>
                {featured.price === 0 && <span className="badge badge-success">{t("events.free")}</span>}
              </div>
              <h1 className="hero-title">{featured.title}</h1>
              <p className="hero-subtitle">{featured.description?.substring(0, 150)}...</p>
              <div className="hero-meta">
                {featured.start_date && (
                  <span>📅 {new Date(featured.start_date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</span>
                )}
                {featured.location && <span>📍 {featured.location}</span>}
                <span>👥 {featured.registered_count || 0}/{featured.max_participants || "∞"} participants</span>
              </div>
              <div className="hero-actions">
                <button className="btn btn-primary" style={{ fontSize: 15, padding: "12px 28px" }} onClick={() => navigate(`/events/${featured.id}`)}>
                  {t("events.seeDetails")}
                </button>
              </div>
            </div>

            {/* Dots */}
            {ongoingEvents.length > 1 && (
              <div className="hero-dots">
                {ongoingEvents.map((_, i) => (
                  <button key={i} className={`dot ${i === slide ? "active" : ""}`} onClick={() => goSlide(i)} />
                ))}
              </div>
            )}

            {/* Arrows */}
            {ongoingEvents.length > 1 && (
              <>
                <button className="hero-arrow left" onClick={() => goSlide((slide - 1 + ongoingEvents.length) % ongoingEvents.length)}>‹</button>
                <button className="hero-arrow right" onClick={() => goSlide((slide + 1) % ongoingEvents.length)}>›</button>
              </>
            )}
          </div>
        ) : (
          <div className="hero-empty container">
            <div className="hero-empty-content">
              <span className="empty-icon">🎯</span>
              <h1>{t("events.noOngoing")}</h1>
              <p>{t("events.noOngoingDesc")}</p>
              <Link to="/events" className="btn btn-primary">{t("events.exploreUpcoming")}</Link>
            </div>
          </div>
        )}
      </section>

      {/* ── Upcoming Events Grid (max 3) ── */}
      <section className="upcoming-section container">
        <div className="section-header">
          <div>
            <h2 className="section-title">{t("events.upcoming")}</h2>
            <p className="section-subtitle">{t("events.subtitle")}</p>
          </div>
          <Link to="/events" className="btn btn-ghost">{t("general.seeAll")} →</Link>
        </div>

        {loading ? (
          <div className="grid-3">
            {[1,2,3].map((i) => <div key={i} className="skeleton" style={{ height: 340, borderRadius: "var(--radius-lg)" }} />)}
          </div>
        ) : upcomingEvents.length > 0 ? (
          <div className="events-grid grid-3" ref={sliderRef}>
            {upcomingEvents.map((ev, i) => (
              <div key={ev.id} style={{ animationDelay: `${i * 0.06}s` }}>
                <EventCard event={ev} />
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <span className="empty-icon">📭</span>
            <p>{t("events.noUpcoming")}</p>
          </div>
        )}
      </section>

      {/* ── CTA Banner ── */}
      {!user && (
        <section className="cta-section">
          <div className="cta-inner container">
            <div className="cta-text">
              <h2>{t("home.ctaTitle")}</h2>
              <p>{t("home.ctaDesc")}</p>
            </div>
            <div className="cta-actions">
              <Link to="/register" className="btn btn-primary" style={{ fontSize: 15, padding: "12px 28px" }}>
                {t("auth.registerBtn")}
              </Link>
              <Link to="/login" className="btn btn-ghost" style={{ fontSize: 15, padding: "12px 28px" }}>
                {t("nav.login")}
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── Footer ── */}
      <footer className="footer">
        <div className="container footer-inner">
          <div className="footer-brand">
            <span className="logo-icon">⬡</span>
            <span className="logo-text">Event<strong>Hub</strong></span>
          </div>
          <p className="footer-copy">© 2026 EventHub — Projet Web Programming Master- Rica Mouele - Ho Bao Khanh Nguyen - Alexandre Coudert</p>
        </div>
      </footer>
    </main>
  );
}