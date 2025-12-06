import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import AdminLayout from '../layout/AdminLayout';

/**
 * Admin Notifications component for managing notifications
 * @returns {JSX.Element} The rendered component
 */
const AdminNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [comments, setComments] = useState({}); // Store comment content by commentId
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [warningMessage, setWarningMessage] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [stompClient, setStompClient] = useState(null);
  const [userId, setUserId] = useState(null);
  const token = localStorage.getItem('token');

  // Fetch user details to get userId for WebSocket
  const fetchUser = async () => {
    if (!token) {
      setError('Please log in to view notifications');
      setLoading(false);
      return;
    }
    try {
      const res = await axios.get('https://api.anmol-goswami-resume.store/api/auth/user', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserId(res.data.id);
    } catch (err) {
      setError('Failed to fetch user details. Please log in again.');
      toast.error('Session invalid. Please log in again.');
    }
  };

  // Fetch comment content by commentId
  const fetchComment = async (commentId) => {
    if (!token || comments[commentId]) return;
    try {
      const res = await axios.get(`https://api.anmol-goswami-resume.store/api/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setComments((prev) => ({ ...prev, [commentId]: res.data }));
    } catch (err) {
      console.error(`Failed to fetch comment ${commentId}:`, err);
      setComments((prev) => ({ ...prev, [commentId]: { content: 'Failed to load comment' } }));
    }
  };

  // Fetch all notifications (seen and unseen)
  const fetchNotifications = async () => {
    if (!token) {
      setError('Please log in to view notifications');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get('https://api.anmol-goswami-resume.store/api/admin/notifications/all', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(res.data || []);
      console.log(res.data);
      // Fetch comments for COMMENT type notifications
      res.data
        .filter((n) => n.type === 'COMMENT' && n.commentId)
        .forEach((n) => fetchComment(n.commentId));
    } catch (err) {
      const status = err.response?.status;
      let errorMessage = 'Failed to load notifications. Please try again.';
      if (status === 401) {
        errorMessage = 'Session expired. Please log in again.';
      } else if (status === 403) {
        errorMessage = 'Unauthorized access. Admin privileges required.';
      }
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Send warning notification
  const sendWarning = async () => {
    if (!token || !warningMessage.trim()) return;
    try {
      setActionLoading('warning');
      await axios.post(
        'https://api.anmol-goswami-resume.store/api/admin/sendWarning',
        { message: warningMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setWarningMessage('');
      toast.success('Warning sent to all users');
      setShowConfirm(false);
    } catch (err) {
      toast.error('Failed to send warning');
    } finally {
      setActionLoading(null);
    }
  };

  // Mark notification as seen
  const markAsSeen = async (id) => {
    if (!token) return;
    setActionLoading(id);
    const originalNotifications = [...notifications];
    // Optimistically update the notification as seen
    const updatedNotifications = notifications.map((n) =>
      n.id === id ? { ...n, seen: true } : n
    );
    setNotifications(updatedNotifications);
    try {
      await axios.post(
        `https://api.anmol-goswami-resume.store/api/news/notifications/${id}/mark-seen`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Notification marked as seen');
    } catch (err) {
      setNotifications(originalNotifications);
      toast.error('Failed to mark notification as seen');
    } finally {
      setActionLoading(null);
    }
  };

  // Delete notification
  const deleteNotification = async (id) => {
    if (!token || !window.confirm('Delete this notification?')) return;
    setActionLoading(id);
    const originalNotifications = [...notifications];
    const updatedNotifications = notifications.filter((n) => n.id !== id);
    setNotifications(updatedNotifications);
    try {
      await axios.delete(`https://api.anmol-goswami-resume.store/api/news/notifications/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Notification deleted');
    } catch (err) {
      setNotifications(originalNotifications);
      toast.error('Failed to delete notification');
    } finally {
      setActionLoading(null);
    }
  };

  // Handle warning confirmation
  const handleSendWarning = () => {
    if (warningMessage.trim()) {
      setShowConfirm(true);
    } else {
      toast.warn('Please enter a warning message');
    }
  };

  // Setup WebSocket connection
  const connectWebSocket = () => {
    if (!token || !userId) return;
    const socket = new SockJS('https://api.anmol-goswami-resume.store/ws');
    const client = Stomp.over(socket);
    client.connect(
      { Authorization: `Bearer ${token}` },
      () => {
        setStompClient(client);
        // Subscribe to user-specific notifications
        client.subscribe(`/topic/notifications/${userId}`, (message) => {
          const notification = JSON.parse(message.body);
          // Add all notifications (seen and unseen)
          setNotifications((prev) => [
            {
              id: notification.id,
              type: notification.type,
              message: notification.message,
              newsId: notification.newsId,
              seen: notification.seen,
              email: notification.email,
              createdAt: notification.createdAt,
              commentId: notification.commentId,
              username: notification.username,
            },
            ...prev.filter((n) => n.id !== notification.id),
          ]);
          // Fetch comment for new COMMENT notification
          if (notification.type === 'COMMENT' && notification.commentId) {
            fetchComment(notification.commentId);
          }
          toast.info(`New notification: ${notification.message}`);
        });
        // Subscribe to deletion events
        client.subscribe('/topic/notifications/deleted', (message) => {
          const deleted = JSON.parse(message.body);
          if (deleted === 'all') {
            setNotifications([]);
          } else {
            setNotifications((prev) => prev.filter((n) => n.id !== deleted.id));
          }
          toast.info('Notification deleted');
        });
      },
      () => {
        toast.error('Failed to connect to real-time notifications');
      }
    );
    return () => client.disconnect(() => setStompClient(null));
  };

  // Fetch user and notifications on mount
  useEffect(() => {
    if (token) {
      fetchUser();
    }
  }, [token]);

  useEffect(() => {
    if (token && userId) {
      fetchNotifications();
      const disconnect = connectWebSocket();
      return () => {
        if (stompClient) {
          stompClient.disconnect(() => setStompClient(null));
        }
        if (disconnect) disconnect();
      };
    }
  }, [token, userId]);

  return (
    <AdminLayout>
      <div className="p-6 bg-white dark:bg-gray-800 shadow-2xl rounded-2xl max-w-5xl mx-auto transition-all duration-300">
        {/* Admin Warning Form */}
        <div className="mb-8 p-6 bg-gray-100 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
            Send Warning to All Users
          </h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={warningMessage}
              onChange={(e) => setWarningMessage(e.target.value)}
              placeholder="Enter warning message"
              className="flex-1 px-4 py-3 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              aria-label="Warning message input"
            />
            <button
              onClick={handleSendWarning}
              disabled={actionLoading === 'warning'}
              className="px-6 py-3 rounded-lg bg-yellow-600 hover:bg-yellow-700 text-white font-medium transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
              aria-label="Send warning"
            >
              {actionLoading === 'warning' ? 'Sending...' : 'Send Warning'}
            </button>
          </div>
        </div>

        {/* Confirmation Dialog */}
        {showConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" role="dialog" aria-modal="true">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl max-w-md w-full">
              <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Confirm Warning</h4>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Are you sure you want to send this warning to all users?
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="px-4 py-2 rounded-lg bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-100 hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                  aria-label="Cancel sending warning"
                >
                  Cancel
                </button>
                <button
                  onClick={sendWarning}
                  className="px-4 py-2 rounded-lg bg-yellow-600 hover:bg-yellow-700 text-white transition-colors"
                  aria-label="Confirm sending warning"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Notification Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <h2
            className="text-3xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-3"
            aria-label="Admin notifications"
          >
            <span role="img" aria-label="Bell icon">🔔</span>
            Notifications
            {notifications.filter((n) => !n.seen).length > 0 && (
              <span
                className="ml-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse"
                aria-label={`${notifications.filter((n) => !n.seen).length} unseen notifications`}
              >
                {notifications.filter((n) => !n.seen).length}
              </span>
            )}
          </h2>
          <div className="flex gap-3">
            <button
              onClick={fetchNotifications}
              disabled={loading || actionLoading !== null}
              className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
              aria-label="Refresh notifications"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Notification List */}
        <div role="region" aria-live="polite" className="max-h-[500px] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <svg
                className="w-8 h-8 animate-spin text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                aria-label="Loading notifications"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              <span className="ml-3 text-lg text-gray-600 dark:text-gray-300">Loading notifications...</span>
            </div>
          ) : error ? (
            <p className="text-red-600 dark:text-red-400 font-medium py-6 text-center text-lg" role="alert">
              {error}
            </p>
          ) : notifications.length === 0 ? (
            <p className="text-green-600 dark:text-green-400 font-medium py-6 text-center text-lg">
              No notifications found
            </p>
          ) : (
            <ul className="space-y-4" role="list" aria-label="Notification list">
              {notifications.map((notification) => (
                <li
                  key={notification.id}
                  className={`p-5 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border ${
                    notification.seen
                      ? 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600'
                      : 'bg-blue-50 dark:bg-blue-950 border-l-4 border-blue-500'
                  } transition-all duration-300 hover:shadow-lg animate-fade-in`}
                  role="listitem"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                          notification.type === 'WARNING'
                            ? 'bg-yellow-200 text-yellow-800'
                            : notification.type === 'COMMENT'
                            ? 'bg-green-200 text-green-800'
                            : 'bg-blue-200 text-blue-800'
                        }`}
                      >
                        {notification.type}
                      </span>
                      <p className="text-lg font-medium text-gray-800 dark:text-gray-100">
                        {notification.message || 'No message available'}
                      </p>
                      {notification.seen && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">(Seen)</span>
                      )}
                    </div>
                    {notification.type === 'COMMENT' && notification.commentId && comments[notification.commentId] && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 italic">
                        Comment: {comments[notification.commentId].content}
                      </p>
                    )}
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      From: {notification.username || notification.email || 'Unknown'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {new Date(notification.createdAt).toLocaleString('en-IN', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {!notification.seen && (
                      <button
                        onClick={() => markAsSeen(notification.id)}
                        disabled={actionLoading === notification.id}
                        className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        aria-label={`Mark notification ${notification.id} as seen`}
                      >
                        {actionLoading === notification.id ? 'Marking...' : 'Mark Seen'}
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notification.id)}
                      disabled={actionLoading === notification.id}
                      className="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
                      aria-label={`Delete notification ${notification.id}`}
                    >
                      {actionLoading === notification.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <style jsx>{`
          @keyframes fade-in {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-fade-in {
            animation: fade-in 0.5s ease-out;
          }
        `}</style>
      </div>
    </AdminLayout>
  );
};

export default AdminNotifications;