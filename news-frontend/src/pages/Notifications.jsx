import React, { useState, useEffect, useRef } from 'react';
import { FaTimes, FaBell, FaInfoCircle, FaCommentAlt, FaExclamationTriangle } from 'react-icons/fa';
import axios from 'axios';

const typeStyles = {
  comment: {
    icon: <FaCommentAlt className="w-7 h-7 text-blue-600 animate-pulse-slow" />,
    bg: 'bg-gradient-to-r from-blue-400 to-cyan-300 dark:from-blue-500 dark:to-cyan-400',
    hover: 'hover:bg-gradient-to-r hover:from-blue-500 hover:to-cyan-400 dark:hover:from-blue-400 dark:hover:to-cyan-300',
    border: 'border-l-4 border-blue-500',
    badge: 'bg-blue-600 text-white shadow-lg shadow-blue-500/50',
  },
  info: {
    icon: <FaInfoCircle className="w-7 h-7 text-green-600 animate-bounce-slow" />,
    bg: 'bg-gradient-to-r from-green-400 to-lime-300 dark:from-green-500 dark:to-lime-400',
    hover: 'hover:bg-gradient-to-r hover:from-green-500 hover:to-lime-400 dark:hover:from-green-400 dark:hover:to-lime-300',
    border: 'border-l-4 border-green-500',
    badge: 'bg-green-600 text-white shadow-lg shadow-green-500/50',
  },
  warning: {
    icon: <FaExclamationTriangle className="w-7 h-7 text-red-600 animate-shake-slow" />,
    bg: 'bg-gradient-to-r from-red-400 to-orange-300 dark:from-red-500 dark:to-orange-400',
    hover: 'hover:bg-gradient-to-r hover:from-red-500 hover:to-orange-400 dark:hover:from-red-400 dark:hover:to-orange-300',
    border: 'border-l-4 border-red-500',
    badge: 'bg-red-600 text-white shadow-lg shadow-red-500/50',
  },
};

const Notifications = () => {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const notificationRef = useRef(null);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await axios.get('https://api.anmol-goswami-resume.store/api/user/unseen', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsSeen = async (id) => {
    try {
      await axios.post(`https://api.anmol-goswami-resume.store/api/news/notifications/${id}/mark-seen`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (error) {
      console.error(`Error marking notification ${id} as seen`, error);
    }
  };

  const toggleNotification = () => {
    const newState = !isNotificationOpen;
    setIsNotificationOpen(newState);
    if (newState) fetchNotifications();
  };

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (
        isNotificationOpen &&
        notificationRef.current &&
        !notificationRef.current.contains(e.target)
      ) {
        setIsNotificationOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isNotificationOpen]);

  return (
    <div className="relative">
      <button
        onClick={toggleNotification}
        className="relative p-3 text-gray-700 dark:text-gray-100 hover:text-amber-500 dark:hover:text-amber-400 transition-colors duration-300 rounded-full hover:bg-gradient-to-br from-amber-100 to-yellow-100 dark:hover:bg-gradient-to-br dark:from-amber-900 dark:to-yellow-900/50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
        aria-label="View notifications"
        aria-expanded={isNotificationOpen}
      >
        <FaBell className="w-7 h-7 animate-bounce-slow" />
        {notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full px-2.5 py-1 shadow-md animate-pulse-fast">
            {notifications.length}
          </span>
        )}
      </button>

      {isNotificationOpen && (
        <div
          ref={notificationRef}
          className="absolute right-0 mt-4 w-96 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-2xl p-6 z-50 transform transition-all duration-300 ease-in-out animate-slide-in max-w-[calc(100vw-1rem)] border border-gray-200 dark:border-gray-700 glow-border"
        >
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent animate-pulse-slow">
              Notifications
            </h3>
            <button
              onClick={toggleNotification}
              className="text-gray-500 dark:text-gray-300 hover:text-amber-500 dark:hover:text-amber-400 transition-colors duration-200 rounded-full p-1.5 hover:bg-gradient-to-br hover:from-gray-100 hover:to-white dark:hover:from-gray-800 dark:hover:to-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
              aria-label="Close notifications"
            >
              <FaTimes className="w-5 h-5" />
            </button>
          </div>

          {loading ? (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-amber-500 mx-auto"></div>
              <span className="text-sm mt-3 block font-medium text-amber-600 dark:text-amber-400">Loading notifications...</span>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8 text-sm font-medium text-yellow-600 dark:text-yellow-400">
              No new notifications
            </div>

          ) : (
            <div className="max-h-80 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`flex items-start gap-4 p-4 rounded-xl ${typeStyles[notification.type]?.bg || 'bg-gray-100 dark:bg-gray-700'} ${typeStyles[notification.type]?.hover || 'hover:bg-gray-200 dark:hover:bg-gray-600'} ${typeStyles[notification.type]?.border || 'border-l-4 border-gray-400'} transition-all duration-300 cursor-pointer group relative shadow-md hover:shadow-lg animate-fade-in`}
                >
                  <div className="pt-1">
                    {typeStyles[notification.type]?.icon || <FaInfoCircle className="w-7 h-7 text-gray-400 animate-pulse-slow" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-transparent font-semibold leading-relaxed bg-gradient-to-r from-purple-600 to-pink-500 dark:from-purple-400 dark:to-pink-300 bg-clip-text">
                      {notification.message}
                    </p>
                    <div className="flex justify-between items-center mt-2">
                      <span
                        className={`inline-block text-xs font-bold uppercase tracking-wide px-3 py-1 rounded-full ${typeStyles[notification.type]?.badge || 'bg-gray-400 text-white'} transform transition-transform duration-200 group-hover:scale-110 animate-glow`}
                      >
                        {notification.type}
                      </span>
                      <span className="text-xs text-transparent font-medium bg-gradient-to-r from-teal-500 to-emerald-400 dark:from-teal-300 dark:to-emerald-200 bg-clip-text">
                        {new Date(notification.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      markAsSeen(notification.id);
                    }}
                    className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 text-gray-500 hover:text-amber-500 dark:hover:text-amber-400 transition-all duration-200 bg-white dark:bg-gray-800 rounded-full p-1.5 shadow-md hover:shadow-lg transform hover:scale-110 animate-bounce-slow"
                    aria-label="Mark notification as seen"
                  >
                    <FaTimes className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <style>{`
        .animate-slide-in {
          animation: slideIn 0.3s ease-out;
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-in;
        }
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-15px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-pulse-slow {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .animate-bounce-slow {
          animation: bounce 2s ease-in-out infinite;
        }
        .animate-shake-slow {
          animation: shake 1.5s ease-in-out infinite;
        }
        .animate-pulse-fast {
          animation: pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .animate-glow {
          animation: glow 1.5s ease-in-out infinite alternate;
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        @keyframes glow {
          from { box-shadow: 0 0 5px rgba(255, 255, 255, 0.3); }
          to { box-shadow: 0 0 10px rgba(255, 255, 255, 0.7); }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #f59e0b;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #d97706;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #f59e0b;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #d97706;
        }
        .glow-border {
          box-shadow: 0 0 10px rgba(251, 191, 36, 0.3), 0 0 20px rgba(251, 191, 36, 0.1);
        }
        .dark .glow-border {
          box-shadow: 0 0 10px rgba(245, 158, 11, 0.3), 0 0 20px rgba(245, 158, 11, 0.1);
        }
      `}</style>
    </div>
  );
};

export default Notifications;