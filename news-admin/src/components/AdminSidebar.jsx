import React, { useContext } from 'react';
import { Home, Newspaper, LogOut, X, ChartBar, Bell, Contact } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const links = [
  { name: 'Dashboard', icon: Home, path: '/' },
  { name: 'Manage News', icon: Newspaper, path: '/news' },
  { name: 'Add News', icon: Newspaper, path: '/add-news' },
  { name: 'Reset Password', icon: Newspaper, path: '/reset-password' },
  { name: 'Manage User', icon: ChartBar, path: '/manage-user' },
  { name: 'Notification', icon: Bell, path: '/notification' },
  { name: 'Contact', icon: Contact, path: '/contact' },
];

const AdminSidebar = ({ isOpen, setIsOpen }) => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside
      className={`
        fixed top-0 left-0 h-screen w-72 
        bg-gradient-to-b from-gray-900 to-gray-800 text-white 
        z-50 transform transition-transform duration-300 ease-in-out 
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
      `}
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between h-20 px-6 border-b border-gray-700/50">
        <h1 className="text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
          Admin Panel
        </h1>
        <button
          onClick={() => setIsOpen(false)}
          className="md:hidden p-2 rounded-full hover:bg-gray-700/50"
        >
          <X size={20} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 px-4 py-6 overflow-y-auto">
        {links.map(({ name, icon: Icon, path }) => (
          <Link
            key={name}
            to={path}
            className="flex items-center gap-4 p-3 rounded-lg hover:bg-gradient-to-r hover:from-purple-600 hover:to-indigo-600 transition duration-200 text-sm font-medium"
            onClick={() => setIsOpen(false)}
          >
            <Icon size={20} />
            <span>{name}</span>
          </Link>
        ))}
      </nav>

      {/* Logout */}
      <div className="mt-auto p-6 border-t border-gray-700/50">
        <div
          onClick={handleLogout}
          className="flex items-center gap-4 p-3 rounded-lg hover:bg-gradient-to-r hover:from-red-600 hover:to-red-800 transition cursor-pointer text-sm font-medium"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
