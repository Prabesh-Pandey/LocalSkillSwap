import { useEffect, useState } from "react";
import api from "../api/axios";
import Loading from "../components/Loading";
import { Calendar, Mail, Star, Bell, CheckCheck } from "lucide-react";
import "./Notifications.css";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const { data } = await api.get("/notifications");
        setNotifications(data);
      } catch (err) {
        setError("Failed to load notifications");
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  const markRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      // Ignore errors
    }
  };

  const markAllRead = async () => {
    try {
      await api.put("/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      // Fallback to individual updates if bulk endpoint fails
      const unread = notifications.filter((n) => !n.isRead);
      await Promise.all(
        unread.map((n) => api.put(`/notifications/${n._id}/read`))
      );
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  if (loading)
    return (
      <div className="notifications-page">
        <div className="notifications-container">
          <Loading message="Loading notifications..." />
        </div>
      </div>
    );

  return (
    <div className="notifications-page">
      <div className="notifications-container">
        <div className="notifications-header">
          <div className="notifications-title">
            <h2>Notifications</h2>
            {unreadCount > 0 && (
              <span className="unread-count">{unreadCount} unread</span>
            )}
          </div>
          {unreadCount > 0 && (
            <button className="btn-mark-all-read" onClick={markAllRead}>
              Mark All as Read
            </button>
          )}
        </div>

        {error && <div className="error-message">{error}</div>}

        {notifications.length === 0 && !error && (
          <div className="no-notifications">
            <h3>No notifications</h3>
            <p>You're all caught up!</p>
          </div>
        )}

        <div className="notifications-list">
          {notifications.map((n) => (
            <div
              key={n._id}
              className={`notification-card ${!n.isRead ? "unread" : ""}`}
            >
              <div className="notification-content">
                <div className="notification-header">
                  <span className={`notification-type ${n.type}`}>
                    {n.type === "booking" && (
                      <>
                        <Calendar size={14} /> Booking Request
                      </>
                    )}
                    {n.type === "booking_status" && (
                      <>
                        <Mail size={14} /> Booking Update
                      </>
                    )}
                    {n.type === "review" && (
                      <>
                        <Star size={14} /> New Review
                      </>
                    )}
                  </span>
                  {!n.isRead && <span className="notification-badge">New</span>}
                </div>
                <p className="notification-message">{n.message}</p>
                <span className="notification-time">
                  {new Date(n.createdAt).toLocaleDateString()} at{" "}
                  {new Date(n.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              {!n.isRead && (
                <div className="notification-actions">
                  <button
                    className="btn-mark-read"
                    onClick={() => markRead(n._id)}
                  >
                    Mark as Read
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
