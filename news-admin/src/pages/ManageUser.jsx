import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from '../layout/AdminLayout';

const ManageUser = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notificationModal, setNotificationModal] = useState({ open: false, email: '' });
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState('INFO');

  const API_BASE_URL = 'https://api.anmol-goswami-resume.store';

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No authentication token found');

        const response = await axios.get(`${API_BASE_URL}/admin/users`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const usersData = Array.isArray(response.data) ? response.data : [];
        setUsers(usersData);
        setLoading(false);
      } catch (err) {
        setError(err.message || 'Failed to fetch users');
        setUsers([]);
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleSuspend = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      await axios.put(`${API_BASE_URL}/admin/users/${userId}/suspend`, null, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(users.map(user =>
        user.id === userId ? { ...user, enabled: false } : user
      ));
      alert('User suspended successfully');
    } catch (err) {
      setError(err.message || 'Failed to suspend user');
    }
  };

  const handleActivate = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      await axios.put(`${API_BASE_URL}/admin/users/${userId}/activate`, null, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(users.map(user =>
        user.id === userId ? { ...user, enabled: true } : user
      ));
      alert('User activated successfully');
    } catch (err) {
      setError(err.message || 'Failed to activate user');
    }
  };

  const openNotificationModal = (email) => {
    setNotificationModal({ open: true, email });
    setNotificationMessage('');
    setNotificationType('INFO');
  };

  const closeNotificationModal = () => {
    setNotificationModal({ open: false, email: '' });
  };

  const handleSendNotification = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      const response = await axios.post(
        `${API_BASE_URL}/admin/users/send-notification`,
        {
          email: notificationModal.email,
          message: notificationMessage,
          type: notificationType
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(response.data);
      closeNotificationModal();
    } catch (err) {
      setError(err.response?.data || 'Failed to send notification');
    }
  };

  if (loading) return <div className="text-center mt-8 text-gray-700 dark:text-gray-300">Loading...</div>;
  if (error) return <div className="text-center mt-8 text-red-500 dark:text-red-400">{error}</div>;

  return (
    <AdminLayout>
      <div className="container mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Manage Users</h1>
        {users.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400">No users found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-700">
                  <th className="py-3 px-6 border-b border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100">ID</th>
                  <th className="py-3 px-6 border-b border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100">Username</th>
                  <th className="py-3 px-6 border-b border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100">Email</th>
                  <th className="py-3 px-6 border-b border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100">Status</th>
                  <th className="py-3 px-6 border-b border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="py-3 px-6 border-b border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100">{user.id}</td>
                    <td className="py-3 px-6 border-b border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100">{user.displayUsername || user.username}</td>
                    <td className="py-3 px-6 border-b border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100">{user.email}</td>
                    <td className="py-3 px-6 border-b border-gray-200 dark:border-gray-600">
                      {user.enabled ? (
                        <span className="text-green-500 dark:text-green-400">Active</span>
                      ) : (
                        <span className="text-red-500 dark:text-red-400">Suspended</span>
                      )}
                    </td>
                    <td className="py-3 px-6 border-b border-gray-200 dark:border-gray-600 flex space-x-3">
                      {user.enabled ? (
                        <button
                          onClick={() => handleSuspend(user.id)}
                          className="bg-red-500 dark:bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-600 dark:hover:bg-red-700 transition-colors"
                        >
                          Suspend
                        </button>
                      ) : (
                        <button
                          onClick={() => handleActivate(user.id)}
                          className="bg-green-500 dark:bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-600 dark:hover:bg-green-700 transition-colors"
                        >
                          Activate
                        </button>
                      )}
                      <button
                        onClick={() => openNotificationModal(user.email)}
                        className="bg-blue-500 dark:bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors"
                      >
                        Notify
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Notification Modal */}
        {notificationModal.open && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-lg">
              <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Send Notification to {notificationModal.email}</h2>
              <form onSubmit={handleSendNotification}>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Message</label>
                  <textarea
                    value={notificationMessage}
                    onChange={(e) => setNotificationMessage(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                    rows="5"
                    required
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notification Type</label>
                  <div className="flex space-x-4">
                    {['INFO', 'WARNING', 'ERROR'].map(type => (
                      <label key={type} className="flex items-center space-x-2">
                        <input
                          type="radio"
                          value={type}
                          checked={notificationType === type}
                          onChange={(e) => setNotificationType(e.target.value)}
                          className="h-4 w-4 text-blue-500 focus:ring-blue-500 dark:focus:ring-blue-400"
                        />
                        <span className="text-gray-700 dark:text-gray-300">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={closeNotificationModal}
                    className="bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-500 dark:bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors"
                  >
                    Send
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default ManageUser;