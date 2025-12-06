import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from '../layout/AdminLayout';

const Contact = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch contacts on mount
  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('https://api.anmol-goswami-resume.store/admin/get/contacts', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setContacts(response.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to fetch contacts');
      setLoading(false);
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm('Are you sure you want to delete all contacts?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete('https://api.anmol-goswami-resume.store/admin/delete/contacts', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setContacts([]);
      alert('All contacts deleted successfully.');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to delete contacts');
    }
  };

  return (
    <AdminLayout>
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col items-center p-4 transition-colors duration-300">
      <div className="w-full max-w-4xl bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transform transition-all duration-300 hover:shadow-xl">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6 text-center">
          Contact Messages
        </h1>

        {loading && (
          <p className="text-center text-gray-500 dark:text-gray-400 transition-opacity duration-300">
            Loading...
          </p>
        )}
        {error && (
          <p className="text-center text-red-500 dark:text-red-400 transition-opacity duration-300">
            {error}
          </p>
        )}
        {!loading && !error && contacts.length === 0 && (
          <p className="text-center text-gray-500 dark:text-gray-400 transition-opacity duration-300">
            No contacts found.
          </p>
        )}

        {contacts.length > 0 && (
          <div className="space-y-4 max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-100 dark:scrollbar-track-gray-800">
            <div className="flex justify-end mb-4">
              <button
                onClick={handleDeleteAll}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 transition-colors duration-200 transform hover:scale-105"
              >
                Delete All Contacts
              </button>
            </div>
            <div className="grid gap-4">
              {contacts.map((contact, index) => (
                <div
                  key={contact.id || index}
                  className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 hover:shadow-md transition-all duration-200 hover:-translate-y-1"
                >
                  <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                    {contact.name}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300">
                    <span className="font-medium">Email:</span> {contact.email}
                  </p>
                  {contact.company && (
                    <p className="text-gray-600 dark:text-gray-300">
                      <span className="font-medium">Company:</span> {contact.company}
                    </p>
                  )}
                  <p className="text-gray-600 dark:text-gray-300 mt-2">
                    <span className="font-medium">Message:</span> {contact.message}
                  </p>
                  <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
                    <span className="font-medium">Received:</span> {new Date(contact.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
    </AdminLayout>
  );
};

export default Contact;