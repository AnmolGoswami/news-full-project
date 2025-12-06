import React from 'react';
import AdminLayout from '../layout/AdminLayout';
import AdminDashboard from '../components/AdminDashboard';
import ManageNews from './ManageNews';
import Addnews from './Addnews';
import LatestNews from '../components/LatestNews';

const AdminHome = () => {
  return (
    <AdminLayout>
      <AdminDashboard/>
      <LatestNews/>
      
      
    </AdminLayout>
  );
};

export default AdminHome;
