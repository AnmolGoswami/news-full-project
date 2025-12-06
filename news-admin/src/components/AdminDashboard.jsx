import React, { useEffect, useState } from 'react';
import {
  Newspaper,
  Folder,
  MapPin,
  Landmark,
} from 'lucide-react';
import axios from 'axios';

const AdminDashboard = () => {
  const [stats, setStats] = useState([
    {
      title: 'Total News Articles',
      count: 0,
      icon: <Newspaper className="text-blue-500 w-6 h-6" />,
    },
    {
      title: 'Categories',
      count: 0,
      icon: <Folder className="text-green-500 w-6 h-6" />,
    },
    {
      title: 'States',
      count: 0,
      icon: <Landmark className="text-yellow-500 w-6 h-6" />,
    },
    {
      title: 'Districts',
      count: 0,
      icon: <MapPin className="text-red-500 w-6 h-6" />,
    },
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('https://api.anmol-goswami-resume.store/api/stats');
        const data = res.data;

        // Update the counts here if your API response matches:
        const updatedStats = [...stats];
        updatedStats[0].count = data.totalArticles || 0;
        updatedStats[1].count = data.totalCategories || 0;
        updatedStats[2].count = data.totalStates || 0;
        updatedStats[3].count = data.totalDistricts || 0;
        setStats(updatedStats);

        console.log(data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-6">Welcome, Admin 👋</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow hover:shadow-md transition"
          >
            <div className="flex items-center gap-4">
              <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full">
                {stat.icon}
              </div>
              <div>
                <h4 className="text-gray-500 dark:text-gray-300 text-sm">
                  {stat.title}
                </h4>
                <p className="text-lg font-bold">{stat.count}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10">
        <h3 className="text-xl font-semibold mb-4">Latest News</h3>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
          <p className="text-gray-600 dark:text-gray-300">
            This section can list the latest news articles with titles, categories, status, and actions.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
