import { useState } from "react";
import { useApp } from "../../context/AppContext";
import { participantService } from "../../services/api";
import toast from "react-hot-toast";

export default function ProfileModal({ isOpen, onClose }) {
  const { user, login, t } = useApp();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    username: user?.username || "",
  });

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updatedUser = await participantService.update(user.id, form);
      const token = localStorage.getItem("eh-token");
      login(updatedUser, token);
      toast.success("Profil mis à jour !");
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Erreur lors de la mise à jour");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.")) {
      setLoading(true);
      try {
        await participantService.delete(user.id);
        const { logout } = useApp();
        logout();
        toast.success("Compte supprimé");
        window.location.href = "/";
      } catch (err) {
        toast.error(err.response?.data?.detail || "Erreur lors de la suppression");
      } finally {
        setLoading(false);
        onClose();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal profile-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>✏️ Modifier mon profil</h2>
          <button className="icon-btn" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleUpdateProfile} className="profile-form">
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">{t("auth.firstName")} *</label>
              <input
                type="text"
                className="form-input"
                value={form.first_name}
                onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                placeholder="Jean"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">{t("auth.lastName")} *</label>
              <input
                type="text"
                className="form-input"
                value={form.last_name}
                onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                placeholder="Dupont"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">{t("auth.email")} *</label>
            <input
              type="email"
              className="form-input"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="vous@exemple.fr"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t("auth.phone")} *</label>
            <input
              type="tel"
              className="form-input"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+33 6 00 00 00 00"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t("auth.username")} *</label>
            <input
              type="text"
              className="form-input"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              placeholder="Username"
              required
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-danger" onClick={handleDeleteAccount} disabled={loading}>
              🗑️ Supprimer mon compte
            </button>
            <div>
              <button type="button" className="btn btn-ghost" onClick={onClose}>
                {t("general.cancel")}
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? <><span className="spinner" /> Enregistrement...</> : "Enregistrer"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}