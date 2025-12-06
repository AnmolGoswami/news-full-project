import { Route, Routes } from 'react-router-dom';
import AdminHome from './pages/AdminHome';
import ManageNews from './pages/ManageNews';
import Addnews from './pages/Addnews';
import { ToastContainer, toast } from 'react-toastify';
import { AuthProvider } from './context/AuthContext';
import AdminLogin from './pages/AdminLogin';
import PrivateRoute from './components/PrivateRoute';
import ResetPassword from './pages/ResetPassword';
import AdminNotifications from './pages/AdminNotifications';
import ManageUser from './pages/ManageUser';
import Contact from './pages/Contact';

const App = () => {
  return (
    <>
      <ToastContainer />

      <AuthProvider>
        <Routes>
        <Route path="/" element={<PrivateRoute><AdminHome /></PrivateRoute>} />
        <Route path="/news" element={<PrivateRoute><ManageNews /></PrivateRoute>} />
        <Route path="/add-news" element={<PrivateRoute><Addnews /></PrivateRoute>} />
        <Route path="/contact" element={<PrivateRoute><Contact /></PrivateRoute>} />
        <Route path="/reset-password" element={<PrivateRoute><ResetPassword/></PrivateRoute>} />
        <Route path="/manage-user" element={<PrivateRoute><ManageUser/></PrivateRoute>} />
        <Route path="/notification" element={<PrivateRoute><AdminNotifications/></PrivateRoute>} />
        <Route path='/login' element={<AdminLogin />} />
        

      </Routes>

      </AuthProvider>
    </>
  );
};

export default App;
