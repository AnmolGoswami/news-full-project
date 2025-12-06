import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const NewsContex = createContext();

export const NewsProvider = ({ children }) => {
  const [newsList, setNewsList] = useState([]);
  const [allNews, setAllNews] = useState([]);
  const [trendingNews, setTrendingNews] = useState([]);
  const [token, setToken] = useState(localStorage.getItem('token') || null);

  const navigate = useNavigate();

  // Save token to localStorage whenever it changes
  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
    }
  }, [token]);

  const fetchNews = async () => {
    try {
      const response = await axios.get('https://api.anmol-goswami-resume.store/api/latest5');
      setNewsList(response.data);
    } catch (error) {
      toast.error('Failed to load news');
      console.error("Failed to fetch news:", error);
    }
  };

  const fetchAllNews = async () => {
    try {
      const response = await axios.get('https://api.anmol-goswami-resume.store/api/news');
      setAllNews(response.data);
    } catch (error) {
      toast.error('Failed to load all news');
      console.error("Failed to fetch all news:", error);
    }
  };

  const fetchTrendingNews = async () => {
    try {
      const response = await axios.get('https://api.anmol-goswami-resume.store/api/trending');
      setTrendingNews(response.data);
    } catch (error) {
      toast.error('Failed to load trending news');
      console.error("Failed to fetch trending news:", error);
    }
  };

  const registerUser = async (data) => {
    try {
      const res = await axios.post('https://api.anmol-goswami-resume.store/api/user/register', data);
      if (res.status === 201) {
        setToken(res.data.jwt);
        toast.success("Registered successfully");
        navigate('/');
      }
    } catch (error) {
      toast.error("Registration failed");
      console.error("Registration error:", error);
    }
  };

  const loginUser = async (data) => {
    try {
      const res = await axios.post('https://api.anmol-goswami-resume.store/api/user/loginUser', data);
      
      if (res.status === 200) {
        setToken(res.data.jwt);
        toast.success("Login successful");
        navigate('/');
      }
    } catch (error) {
      toast.error("Login failed");
      console.error("Login error:", error);
    }
  };

  useEffect(() => {
    fetchNews();
    fetchAllNews();
    fetchTrendingNews();
  }, []);

  return (
    <NewsContex.Provider value={{
      newsList,
      allNews,
      trendingNews,
      token,
      setToken,
      registerUser,
      loginUser, // ✅ make sure this is exposed
    }}>
      {children}
    </NewsContex.Provider>
  );
};

export const useNews = () => useContext(NewsContex);
