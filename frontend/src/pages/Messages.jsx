import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import Loading from "../components/Loading";
import {
  MessageSquare,
  Send,
  ArrowLeft,
  Check,
  CheckCheck,
  Inbox,
  Search,
  MoreVertical,
  Smile,
  Circle,
} from "lucide-react";
import "./Messages.css";

const Messages = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [conversations, setConversations] = useState([]);
  const [filteredConversations, setFilteredConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Check for userId in URL params (for direct messaging from offer page)
  useEffect(() => {
    const userId = searchParams.get("userId");
    const userName = searchParams.get("userName");

    if (userId && userName) {
      setSelectedUser({
        _id: userId,
        name: userName,
      });
    }
  }, [searchParams]);

  // Filter conversations based on search
  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = conversations.filter((conv) =>
        conv.otherUser.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredConversations(filtered);
    } else {
      setFilteredConversations(conversations);
    }
  }, [searchQuery, conversations]);

  // Fetch conversations list
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const { data } = await api.get("/messages/conversations");
        setConversations(data);
        setFilteredConversations(data);
      } catch {
        setError("Failed to load conversations");
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, []);

  // Fetch messages when a user is selected
  const fetchMessages = useCallback(async () => {
    if (!selectedUser) return;

    try {
      const { data } = await api.get(
        `/messages/conversation/${selectedUser._id}`
      );
      setMessages(data.messages);

      // Update conversation unread count
      setConversations((prev) =>
        prev.map((conv) =>
          conv.otherUser._id === selectedUser._id
            ? { ...conv, unreadCount: 0 }
            : conv
        )
      );
    } catch {
      // Silently fail on polling
    }
  }, [selectedUser]);

  useEffect(() => {
    if (!selectedUser) return;

    setMessagesLoading(true);
    fetchMessages().finally(() => setMessagesLoading(false));

    // Poll for new messages every 5 seconds when in conversation
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [selectedUser, fetchMessages]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Focus input when user is selected
  useEffect(() => {
    if (selectedUser && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [selectedUser]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser || sending) return;

    const messageContent = newMessage.trim();
    setNewMessage("");
    setSending(true);

    // Optimistic update
    const tempId = `temp-${Date.now()}`;
    const optimisticMessage = {
      _id: tempId,
      content: messageContent,
      sender: { _id: user.id },
      receiver: { _id: selectedUser._id },
      createdAt: new Date().toISOString(),
      read: false,
      pending: true,
    };
    setMessages((prev) => [...prev, optimisticMessage]);

    try {
      const { data } = await api.post("/messages", {
        receiverId: selectedUser._id,
        content: messageContent,
      });

      // Replace optimistic message with real one
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === tempId ? { ...data, pending: false } : msg
        )
      );

      // Update or add conversation to list
      setConversations((prev) => {
        const existingIndex = prev.findIndex(
          (c) => c.otherUser._id === selectedUser._id
        );
        const updatedConv = {
          otherUser: selectedUser,
          lastMessage: {
            _id: data._id,
            content: data.content,
            createdAt: data.createdAt,
            sender: user.id,
            read: false,
          },
          unreadCount: 0,
        };

        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = updatedConv;
          return [
            updated[existingIndex],
            ...updated.filter((_, i) => i !== existingIndex),
          ];
        } else {
          return [updatedConv, ...prev];
        }
      });
    } catch {
      // Remove optimistic message on error
      setMessages((prev) => prev.filter((msg) => msg._id !== tempId));
      setError("Failed to send message");
      setNewMessage(messageContent); // Restore message
    } finally {
      setSending(false);
    }
  };

  const handleSelectConversation = (conv) => {
    setSelectedUser(conv.otherUser);
    setMessages([]);
    setSearchParams({});
  };

  const handleBack = () => {
    setSelectedUser(null);
    setMessages([]);
    setSearchParams({});
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: "short" });
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  };

  const formatMessageTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateHeader = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    return date.toLocaleDateString([], {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  };

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarColor = (name) => {
    const colors = [
      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
      "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
      "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
      "linear-gradient(135deg, #5ee7df 0%, #b490ca 100%)",
      "linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)",
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const getTotalUnread = () => {
    return conversations.reduce(
      (sum, conv) => sum + (conv.unreadCount || 0),
      0
    );
  };

  if (loading) {
    return <Loading message="Loading messages..." fullScreen />;
  }

  return (
    <div className="messages-page">
      <div className="messages-container">
        {/* Conversations Sidebar */}
        <aside
          className={`conversations-sidebar ${
            selectedUser ? "hidden-mobile" : ""
          }`}
        >
          <header className="sidebar-header">
            <div className="sidebar-title">
              <MessageSquare size={22} strokeWidth={2.5} />
              <h1>Messages</h1>
              {getTotalUnread() > 0 && (
                <span className="total-unread">{getTotalUnread()}</span>
              )}
            </div>
            <button className="icon-btn" title="Options">
              <MoreVertical size={20} />
            </button>
          </header>

          <div className="search-container">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          {error && <div className="error-toast">{error}</div>}

          <div className="conversations-list">
            {filteredConversations.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <Inbox size={40} strokeWidth={1.5} />
                </div>
                <h3>No conversations</h3>
                <p>
                  {searchQuery
                    ? "No matches found"
                    : "Start chatting from an offer page"}
                </p>
                {!searchQuery && (
                  <Link to="/offers" className="empty-cta">
                    Browse Offers
                  </Link>
                )}
              </div>
            ) : (
              filteredConversations.map((conv) => (
                <div
                  key={conv.otherUser._id}
                  className={`conversation-card ${
                    selectedUser?._id === conv.otherUser._id ? "selected" : ""
                  } ${conv.unreadCount > 0 ? "has-unread" : ""}`}
                  onClick={() => handleSelectConversation(conv)}
                >
                  <div
                    className="avatar"
                    style={{ background: getAvatarColor(conv.otherUser.name) }}
                  >
                    <span className="avatar-text">
                      {getInitials(conv.otherUser.name)}
                    </span>
                  </div>
                  <div className="conversation-content">
                    <div className="conversation-top">
                      <span className="user-name">{conv.otherUser.name}</span>
                      <span className="timestamp">
                        {formatTime(conv.lastMessage.createdAt)}
                      </span>
                    </div>
                    <div className="conversation-bottom">
                      <p className="last-message">
                        {conv.lastMessage.sender === user.id && (
                          <span className="you-prefix">You: </span>
                        )}
                        {conv.lastMessage.content}
                      </p>
                      {conv.unreadCount > 0 && (
                        <span className="unread-count">{conv.unreadCount}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>

        {/* Chat Area */}
        <main className={`chat-area ${selectedUser ? "active" : ""}`}>
          {selectedUser ? (
            <>
              <header className="chat-header">
                <button className="back-button" onClick={handleBack}>
                  <ArrowLeft size={20} />
                </button>
                <div className="chat-user-profile">
                  <div
                    className="avatar small"
                    style={{ background: getAvatarColor(selectedUser.name) }}
                  >
                    <span className="avatar-text">
                      {getInitials(selectedUser.name)}
                    </span>
                  </div>
                  <div className="user-details">
                    <h2>{selectedUser.name}</h2>
                    <span className="user-status">
                      <Circle size={8} fill="#22c55e" stroke="#22c55e" />
                      Active now
                    </span>
                  </div>
                </div>
                <div className="chat-actions">
                  <button className="icon-btn" title="More options">
                    <MoreVertical size={20} />
                  </button>
                </div>
              </header>

              <div className="chat-body">
                {messagesLoading && messages.length === 0 ? (
                  <div className="chat-loader">
                    <Loading message="Loading conversation..." />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="empty-chat">
                    <div
                      className="empty-chat-avatar"
                      style={{ background: getAvatarColor(selectedUser.name) }}
                    >
                      <span>{getInitials(selectedUser.name)}</span>
                    </div>
                    <h3>{selectedUser.name}</h3>
                    <p>Send a message to start the conversation</p>
                  </div>
                ) : (
                  <div className="messages-wrapper">
                    {messages.map((msg, index) => {
                      const isMine =
                        msg.sender._id === user.id || msg.sender === user.id;
                      const showDate =
                        index === 0 ||
                        new Date(msg.createdAt).toDateString() !==
                          new Date(
                            messages[index - 1].createdAt
                          ).toDateString();

                      // Group consecutive messages from same sender
                      const prevMsg = messages[index - 1];
                      const nextMsg = messages[index + 1];
                      const sameSenderAsPrev =
                        prevMsg &&
                        !showDate &&
                        (prevMsg.sender._id || prevMsg.sender) ===
                          (msg.sender._id || msg.sender);
                      const sameSenderAsNext =
                        nextMsg &&
                        new Date(msg.createdAt).toDateString() ===
                          new Date(nextMsg.createdAt).toDateString() &&
                        (nextMsg.sender._id || nextMsg.sender) ===
                          (msg.sender._id || msg.sender);

                      const isFirstInGroup = !sameSenderAsPrev;
                      const isLastInGroup = !sameSenderAsNext;

                      return (
                        <div key={msg._id}>
                          {showDate && (
                            <div className="date-separator">
                              <span>{formatDateHeader(msg.createdAt)}</span>
                            </div>
                          )}
                          <div
                            className={`message-row ${
                              isMine ? "outgoing" : "incoming"
                            } 
                              ${isFirstInGroup ? "first" : ""} 
                              ${isLastInGroup ? "last" : ""}
                              ${msg.pending ? "pending" : ""}`}
                          >
                            {!isMine && isLastInGroup && (
                              <div
                                className="message-avatar"
                                style={{
                                  background: getAvatarColor(selectedUser.name),
                                }}
                              >
                                <span>{getInitials(selectedUser.name)}</span>
                              </div>
                            )}
                            {!isMine && !isLastInGroup && (
                              <div className="message-avatar-placeholder" />
                            )}
                            <div className="message-content">
                              <div
                                className={`message-bubble ${
                                  isFirstInGroup ? "first" : ""
                                } ${isLastInGroup ? "last" : ""}`}
                              >
                                <p>{msg.content}</p>
                              </div>
                              {isLastInGroup && (
                                <div className="message-info">
                                  <span className="time">
                                    {formatMessageTime(msg.createdAt)}
                                  </span>
                                  {isMine && (
                                    <span className="status">
                                      {msg.pending ? (
                                        <Circle size={12} />
                                      ) : msg.read ? (
                                        <CheckCheck
                                          size={14}
                                          className="read"
                                        />
                                      ) : (
                                        <Check size={14} />
                                      )}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              <footer className="chat-footer">
                <form className="message-form" onSubmit={handleSendMessage}>
                  <div className="input-wrapper">
                    <input
                      ref={inputRef}
                      type="text"
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={sending}
                      maxLength={1000}
                    />
                    <button
                      type="button"
                      className="icon-btn emoji"
                      title="Add emoji"
                    >
                      <Smile size={20} />
                    </button>
                  </div>
                  <button
                    type="submit"
                    className={`send-button ${
                      newMessage.trim() ? "active" : ""
                    }`}
                    disabled={!newMessage.trim() || sending}
                    title="Send message"
                  >
                    <Send size={18} />
                  </button>
                </form>
              </footer>
            </>
          ) : (
            <div className="welcome-screen">
              <div className="welcome-content">
                <div className="welcome-illustration">
                  <div className="illustration-circle">
                    <MessageSquare size={48} strokeWidth={1.5} />
                  </div>
                </div>
                <h2>Your Messages</h2>
                <p>
                  Connect with skill providers and clients. Select a
                  conversation or start a new one.
                </p>
                <Link to="/offers" className="welcome-cta">
                  <span>Browse Offers</span>
                </Link>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Messages;
