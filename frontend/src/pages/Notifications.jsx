import { useEffect, useState } from "react";
import api from "../api/axios";
import "./Notifications.css";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    api.get("/notifications").then((res) => setNotifications(res.data));
  }, []);

  const markRead = async (id) => {
    await api.put(`/notifications/${id}/read`);
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
    );
  };

  return (
    <div className="notifications-page">
      <div className="notifications-container">
        <div className="notifications-header">
          <h2>Notifications</h2>
        </div>

        {notifications.length === 0 && (
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
              <div className="notification-header">
                {!n.isRead && (
                  <span
                    className="notification-badge"
                    style={{
                      backgroundColor: "var(--primary-color)",
                      color: "white",
                    }}
                  >
                    New
                  </span>
                )}
              </div>
              <p className="notification-message">{n.message}</p>
              {!n.isRead && (
                <div className="notification-footer">
                  <div className="notification-actions">
                    <button
                      className="btn-mark-read"
                      onClick={() => markRead(n._id)}
                    >
                      Mark as read
                    </button>
                  </div>
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
