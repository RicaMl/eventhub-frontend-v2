import { useState, useEffect, useCallback, useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import { participantService } from "../../services/api";
import ConfirmModal from "../../components/ui/ConfirmModal";
import ParticipantEventsModal from "../../components/participant/ParticipantEventsModal";
import { useDebounce } from "../../hooks/useApi";
import { capitalizeEachWord } from "../../utils/string";
import toast from "react-hot-toast";
import "../../css/Dashboard.css";

export default function DashboardParticipants() { 
  const { t } = useApp();
  const { loadStats } = useOutletContext();
  
  const [allParticipants, setAllParticipants] = useState([]);
  const [pLoading, setPLoading] = useState(false);
  const [pSearch, setPSearch] = useState("");
  const debouncedPSearch = useDebounce(pSearch, 400);
  
  const [deleteParticipant, setDeleteParticipant] = useState(null);
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [showEventsModal, setShowEventsModal] = useState(false);

  // Charger TOUS les participants
  const loadParticipants = useCallback(() => {
    setPLoading(true);
    participantService.getAll({})
      .then((d) => {
        const data = Array.isArray(d) ? d : d.results || [];
        setAllParticipants(data);
      })
      .catch(() => setAllParticipants([]))
      .finally(() => setPLoading(false));
  }, []);

  useEffect(() => { loadParticipants(); }, [loadParticipants]);

  // Filtrer les participants côté front
  const filteredParticipants = useMemo(() => {
    if (!debouncedPSearch.trim()) {
      return allParticipants;
    }
    
    const searchLower = debouncedPSearch.toLowerCase();
    return allParticipants.filter((p) => {
      return (
        p.username?.toLowerCase().includes(searchLower) ||
        p.first_name?.toLowerCase().includes(searchLower) ||
        p.last_name?.toLowerCase().includes(searchLower) ||
        p.email?.toLowerCase().includes(searchLower) ||
        p.phone?.toLowerCase().includes(searchLower)
      );
    });
  }, [allParticipants, debouncedPSearch]);

  const handleDeleteParticipant = async () => {
    try {
      await participantService.delete(deleteParticipant.id);
      toast.success(t("participant.deleted"));
      loadParticipants();
      loadStats();
    } catch (err) {
      toast.error(err.response?.data?.detail || t("general.error"));
    }
    setDeleteParticipant(null);
  };

  const openParticipantEvents = (participant) => {
    setSelectedParticipant(participant);
    setShowEventsModal(true);
  };

  // Vérifier si le participant est un admin (is_staff)
  const isStaff = (participant) => {
    return participant.is_staff === true;
  };

  const getDisplayName = (p) => {
    if (p.first_name || p.last_name) {
      return capitalizeEachWord(`${p.first_name || ""} ${p.last_name || ""}`).trim();
    }
    return p.username || "—";
  };

  return (
    <div className="dash-content">
      {/* Search */}
      <div className="search-box participants-search">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          className="form-input search-input"
          placeholder={t("participants.search")}
          value={pSearch}
          onChange={(e) => setPSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="events-table-wrap">
        <table className="events-table">
          <thead>
            <tr>
              <th></th>
              <th>{t("participants.username")}</th>
              <th>{t("participants.name")}</th>
              <th>{t("participants.email")}</th>
              <th>{t("participants.phone")}</th>
              <th>{t("participants.registeredEvents")}</th>
              <th>{t("participants.events")}</th>
              {/* <th>{t("participants.actions")}</th> */}
            </tr>
          </thead>
          <tbody>
            {filteredParticipants.map((p) => (
              <tr key={p.id}>
                <td>
                  <div className="avatar participant-avatar">
                    {p.username?.charAt(0)?.toUpperCase() || p.email?.[0]?.toUpperCase() || "?"}
                  </div>
                </td>
                <td className="participant-username">{p.username || "—"}</td>
                <td className="participant-name">{getDisplayName(p)}</td>
                <td className="participant-email">{p.email}</td>
                <td className="participant-phone">{p.phone || "—"}</td>
                <td>
                  <span className="badge badge-accent">{p.registrations_count || 0}</span>
                </td>
                <td>
                  {!isStaff(p) && (
                    <button 
                      className="action-btn" 
                      title={t("participants.viewEvents")}
                      onClick={() => openParticipantEvents(p)}
                    >
                      📅
                    </button>
                  )}
                </td>
                {/* <td>
                  <div className="action-btns">
                    {!isStaff(p) && (
                      <button 
                        className="action-btn danger" 
                        title={t("participants.delete")}
                        onClick={() => setDeleteParticipant(p)}
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </td> */}
              </tr>
            ))}
          </tbody>
        </table>
        {pLoading && <div className="table-loading"><span className="spinner" /></div>}
        {!pLoading && filteredParticipants.length === 0 && (
          <div className="table-empty">
            {pSearch ? t("participants.noResults") : t("dashboard.noData")}
          </div>
        )}
      </div>

      {/* Delete confirm */}
      {deleteParticipant && (
        <ConfirmModal
          title={`${t("participants.deleteConfirm")} ${getDisplayName(deleteParticipant)} ?`}
          message={t("dashboard.deleteWarning")}
          onConfirm={handleDeleteParticipant}
          onClose={() => setDeleteParticipant(null)}
        />
      )}

      {/* Events modal */}
      <ParticipantEventsModal 
        participant={selectedParticipant}
        isOpen={showEventsModal}
        onClose={() => setShowEventsModal(false)}
      />
    </div>
  );
}