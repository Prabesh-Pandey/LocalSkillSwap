import { useEffect, useState } from "react";
import api from "../api/axios";

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        api.get("/notifications").then((res) => setNotifications(res.data));
    }, []);

    const markRead = async (id) => {
        await api.put(`/notifications/${id}/read`);
        setNotifications((prev) =>
            prev.map((n) =>
                n._id === id ? { ...n, isRead: true } : n
            )
        );
    };

    return (
        <div>
            <h2>Notifications</h2>

            {notifications.map((n) => (
                <div key={n._id} style={{ opacity: n.isRead ? 0.5 : 1 }}>
                    <p>{n.message}</p>
                    {!n.isRead && (
                        <button onClick={() => markRead(n._id)}>
                            Mark as read
                        </button>
                    )}
                </div>
            ))}
        </div>
    );
};

export default Notifications;
