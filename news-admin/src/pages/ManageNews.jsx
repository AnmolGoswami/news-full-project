import React, { useState, useEffect, useContext, useRef } from 'react';
import { Newspaper, Pencil, Trash2, X, ImageOff, Loader2 } from 'lucide-react';
import AdminLayout from '../layout/AdminLayout';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AuthContext } from '../context/AuthContext';
import { Editor } from '@tinymce/tinymce-react';

const ManageNews = () => {
  const [newsData, setNewsData] = useState([]);
  const [stateData, setStateData] = useState([]);
  const [districtData, setDistrictData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [languageData, setLanguageData] = useState([]);
  const [filteredDistricts, setFilteredDistricts] = useState([]);
  const [editingNews, setEditingNews] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [editorError, setEditorError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const { token } = useContext(AuthContext);
  const [useCustomLanguage, setUseCustomLanguage] = useState(false);
  const modalRef = useRef(null);
  const submitButtonRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    state: '',
    district: '',
    category: '',
    language: '',
    videoLink: '',
    imageFile: null,
  });

  // TinyMCE API key
  const tinymceApiKey = 'uffyjvvyaxkyohcgitmsr461lte6xpvy7ryp7ud6m7dfkh0b';

  // Fetch data functions
  const getStateData = async () => {
    try {
      const res = await axios.get('https://api.anmol-goswami-resume.store/api/getState', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStateData(res.data);
    } catch (err) {
      console.error('Failed to fetch states:', err);
      toast.error('Failed to load states');
    }
  };

  const getDistrictData = async () => {
    try {
      const res = await axios.get('https://api.anmol-goswami-resume.store/api/getDistricts', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDistrictData(res.data);
    } catch (err) {
      console.error('Failed to fetch districts:', err);
      toast.error('Failed to load districts');
    }
  };

  const getCategoryData = async () => {
    try {
      const res = await axios.get('https://api.anmol-goswami-resume.store/api/getCategories', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategoryData(res.data);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      toast.error('Failed to load categories');
    }
  };

  const getLanguageData = async () => {
    try {
      const res = await axios.get('https://api.anmol-goswami-resume.store/api/getLanguage', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLanguageData(res.data);
    } catch (err) {
      console.error('Failed to fetch languages:', err);
      toast.error('Failed to load languages');
      setLanguageData([
        { id: 1, name: 'English' },
        { id: 2, name: 'Hindi' },
        { id: 3, name: 'Bengali' },
        { id: 4, name: 'Tamil' },
        { id: 5, name: 'Telugu' },
      ]);
    }
  };

  const getData = async () => {
    try {
      const res = await axios.get('https://api.anmol-goswami-resume.store/api/news', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNewsData(res.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch news: ' + (err.response?.data?.message || err.message));
      toast.error('Failed to fetch news');
    }
  };

  useEffect(() => {
    getData();
    getStateData();
    getCategoryData();
    getDistrictData();
    getLanguageData();
  }, []);

  useEffect(() => {
    if (formData.state) {
      const state = stateData.find((s) => s.name === formData.state);
      if (state) {
        setFilteredDistricts(districtData.filter((d) => d.stateId === state.id));
        setFormData((prev) => ({ ...prev, district: '' }));
      }
    } else {
      setFilteredDistricts([]);
    }
  }, [formData.state, stateData, districtData]);

  useEffect(() => {
    if (isModalOpen && modalRef.current) {
      modalRef.current.focus(); // Focus the modal for accessibility
    }
  }, [isModalOpen]);

  const openModal = (news) => {
    setEditingNews(news);
    const isCustomLanguage = news.language && !languageData.some((lang) => lang.name === news.language);
    setUseCustomLanguage(isCustomLanguage);
    const content = news.content || '';
    const words = content.replace(/<[^>]+>/g, '').trim().split(/\s+/).filter((word) => word.length > 0);
    setWordCount(words.length);
    setFormData({
      title: news.title || '',
      content: content,
      state: news.stateName || news.state?.name || '',
      district: news.districtName || news.district?.name || '',
      category: news.categoryName || news.category?.name || '',
      language: news.language || '',
      videoLink: news.videoLink || '',
      imageFile: null,
    });
    setIsModalOpen(true);
    setError('');
    setEditorError('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditorChange = (content) => {
    setFormData((prev) => ({ ...prev, content }));
    const words = content.replace(/<[^>]+>/g, '').trim().split(/\s+/).filter((word) => word.length > 0);
    setWordCount(words.length);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && !file.type.startsWith('image/')) {
      setError('Please select a valid image file (e.g., PNG, JPEG).');
      toast.error('Please select a valid image file.');
      return;
    }
    setFormData((prev) => ({ ...prev, imageFile: file }));
  };

  const toggleLanguageInput = () => {
    setUseCustomLanguage((prev) => !prev);
    setFormData((prev) => ({ ...prev, language: '' }));
  };

  const isValidUrl = (url) => {
    if (!url) return true;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('handleSubmit triggered', { formData, wordCount }); // Debug log
    if (!formData.title || !formData.content || !formData.state || !formData.category || !formData.language) {
      setError('Please fill in all required fields.');
      toast.error('Please fill in all required fields.');
      console.log('Validation failed: Missing required fields');
      return;
    }
    if (formData.title.length < 5) {
      setError('Title must be at least 5 characters long.');
      toast.error('Title must be at least 5 characters long.');
      console.log('Validation failed: Title too short');
      return;
    }
    if (formData.videoLink && !isValidUrl(formData.videoLink)) {
      setError('Please enter a valid URL for the video link.');
      toast.error('Please enter a valid URL for the video link.');
      console.log('Validation failed: Invalid video URL');
      return;
    }
    if (wordCount < 600) {
      setError('Content must be at least 600 words.');
      toast.error('Content must be at least 600 words.');
      console.log('Validation failed: Word count too low', wordCount);
      return;
    }

    setIsLoading(true);
    const formDataToSend = new FormData();
    formDataToSend.append(
      'news',
      new Blob(
        [
          JSON.stringify({
            title: formData.title,
            content: formData.content,
            state: formData.state,
            district: formData.district || null,
            category: formData.category,
            language: formData.language,
            videoLink: formData.videoLink || null,
            publishDate: editingNews?.publishedDate || new Date().toISOString().slice(0, 19),
          }),
        ],
        { type: 'application/json' }
      )
    );

    if (formData.imageFile) {
      formDataToSend.append('file', formData.imageFile);
    }

    try {
      const res = await axios.put(
        `https://api.anmol-goswami-resume.store/api/admin/updateNews/${editingNews.id}`,
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      console.log('Update successful', res.data); // Debug log

      setNewsData((prev) =>
        prev.map((n) =>
          n.id === editingNews.id
            ? {
                ...n,
                title: formData.title,
                content: formData.content,
                stateName: formData.state,
                districtName: formData.district || null,
                categoryName: formData.category,
                language: formData.language,
                videoLink: formData.videoLink || null,
                imageUrl: res.data.imageUrl || n.imageUrl,
                publishedDate: editingNews.publishedDate,
              }
            : n
        )
      );

      if (useCustomLanguage && !languageData.some((lang) => lang.name === formData.language)) {
        setLanguageData((prev) => [
          ...prev,
          { id: Date.now(), name: formData.language },
        ]);
      }

      setIsModalOpen(false);
      setEditingNews(null);
      setUseCustomLanguage(false);
      setFormData({
        title: '',
        content: '',
        state: '',
        district: '',
        category: '',
        language: '',
        videoLink: '',
        imageFile: null,
      });
      setWordCount(0);
      setError('');
      toast.success('News updated successfully');
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message;
      setError('Failed to update news: ' + errorMessage);
      toast.error('Failed to update news: ' + errorMessage);
      console.error('Update failed:', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(`https://api.anmol-goswami-resume.store/api/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 200) {
        toast.success('Post deleted successfully');
        setNewsData((prev) => prev.filter((news) => news.id !== id));
      } else {
        toast.error('Post deletion failed');
      }
    } catch (err) {
      toast.error('Post deletion failed: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md hover:shadow-lg transition">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
            <Newspaper className="w-6 h-6 text-blue-500" />
            Manage News
          </h2>
          {error && <p className="text-red-600 dark:text-red-400 text-sm font-medium mb-4">{error}</p>}
          {editorError && (
            <p className="text-red-600 dark:text-red-400 text-sm font-medium mb-4">{editorError}</p>
          )}
          {newsData.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-sm">No news available.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Image</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">State</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">District</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Language</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {newsData.map((news) => (
                    <tr key={news.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {news.imageUrl ? (
                          <img
                            src={news.imageUrl}
                            alt={news.title || 'News Image'}
                            className="w-16 h-16 object-cover rounded-md"
                            onError={(e) => (e.target.src = 'https://via.placeholder.com/64')}
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded-md flex items-center justify-center">
                            <ImageOff className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{news.title || 'Untitled'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{news.categoryName || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{news.stateName || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{news.districtName || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{news.language || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => openModal(news)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-2"
                          aria-label={`Edit news: ${news.title || 'Untitled'}`}
                        >
                          <Pencil className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(news.id)}
                          className="text-red-600 hover:text-red-400 dark:text-red-400 dark:hover:text-red-300"
                          aria-label={`Delete news: ${news.title || 'Untitled'}`}
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Edit Modal */}
          {isModalOpen && (
            <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50" role="dialog" aria-modal="true" aria-labelledby="edit-news-modal-title">
              <div
                ref={modalRef}
                tabIndex="-1"
                className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto relative"
              >
                {isLoading && (
                  <div className="absolute inset-0 bg-gray-200 bg-opacity-50 flex items-center justify-center z-10">
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" aria-label="Loading" />
                  </div>
                )}
                <div className="flex justify-between items-center mb-4">
                  <h3 id="edit-news-modal-title" className="text-lg font-semibold text-gray-900 dark:text-white">Edit News</h3>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
                    aria-label="Close modal"
                    disabled={isLoading}
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                {editorError && (
                  <p className="text-red-600 dark:text-red-400 text-sm font-medium mb-4">{editorError}</p>
                )}
                <form onSubmit={handleSubmit} className="space-y-4 pb-20">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="title">Title * (Minimum 5 characters)</label>
                    <input
                      id="title"
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      required
                      placeholder="Enter news title"
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="content">Content * (Minimum 600 words)</label>
                    <div className="border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700">
                      <Editor
                        apiKey={tinymceApiKey}
                        cloudChannel="5"
                        init={{
                          plugins: ['paste', 'lists', 'link', 'code'],
                          toolbar: 'undo redo | formatselect | bold italic underline | forecolor backcolor | alignleft aligncenter alignright alignjustify | bullist numlist | blockquote | code',
                          style_formats: [
                            {
                              title: 'Headings',
                              items: [
                                { title: 'Heading 1', block: 'h1' },
                                { title: 'Heading 2', block: 'h2' },
                                { title: 'Heading 3', block: 'h3' },
                              ],
                            },
                            {
                              title: 'Inline',
                              items: [
                                { title: 'Bold', inline: 'strong' },
                                { title: 'Italic', inline: 'em' },
                                { title: 'Highlight Yellow', inline: 'span', classes: 'highlight-yellow' },
                                { title: 'Highlight Blue', inline: 'span', classes: 'highlight-blue' },
                                { title: 'Highlight Green', inline: 'span', classes: 'highlight-green' },
                                { title: 'Highlight Red', inline: 'span', classes: 'highlight-red' },
                              ],
                            },
                            {
                              title: 'Blocks',
                              items: [
                                { title: 'Paragraph', block: 'p' },
                                { title: 'Blockquote', block: 'blockquote' },
                              ],
                            },
                          ],
                          content_style: `
                            body { font-family: 'Noto Sans', 'Noto Sans Devanagari', sans-serif; line-height: 1.6; color: #1f2937; padding: 1rem; }
                            .dark body { color: #d1d5db; background-color: #1f2937; }
                            h1 { font-size: 2rem; font-weight: 700; margin-bottom: 1rem; }
                            h2 { font-size: 1.5rem; font-weight: 600; margin-top: 1.5rem; margin-bottom: 0.75rem; }
                            h3 { font-size: 1.25rem; font-weight: 600; margin-top: 1rem; margin-bottom: 0.5rem; }
                            p { margin-bottom: 1rem; }
                            ul { list-style: disc; padding-left: 1.5rem; margin-bottom: 1rem; }
                            li { margin-bottom: 0.5rem; }
                            blockquote { border-left: 4px solid #3b82f6; padding-left: 1rem; font-style: italic; margin: 1rem 0; }
                            .highlight-yellow { background-color: #fef3c7; padding: 0 0.25rem; }
                            .highlight-red { background-color: #fecaca; padding: 0 0.25rem; }
                            .highlight-blue { background-color: #bfdbfe; padding: 0 0.25rem; }
                            .highlight-green { background-color: #bbf7d0; padding: 0 0.25rem; }
                          `,
                          height: 400,
                          menubar: false,
                          statusbar: true,
                          branding: false,
                          content_css: 'default',
                          setup: (editor) => {
                            editor.on('init', () => {
                              console.log('TinyMCE initialized successfully');
                              setEditorError('');
                            });
                            editor.on('error', (err) => {
                              console.error('TinyMCE error:', err);
                              setEditorError('TinyMCE failed to initialize: ' + err.message);
                            });
                          },
                        }}
                        value={formData.content}
                        onEditorChange={handleEditorChange}
                        disabled={isLoading}
                      />
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      Words: {wordCount} {wordCount < 600 && '(Minimum 600 words required)'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="state">State *</label>
                    <select
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      required
                      disabled={isLoading}
                    >
                      <option value="">Select State</option>
                      {stateData.map((state) => (
                        <option key={state.id} value={state.name}>
                          {state.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="district">District</label>
                    <select
                      id="district"
                      name="district"
                      value={formData.district}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      disabled={!formData.state || isLoading}
                    >
                      <option value="">Select District</option>
                      {filteredDistricts.map((district) => (
                        <option key={district.id} value={district.name}>
                          {district.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="category">Category *</label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      required
                      disabled={isLoading}
                    >
                      <option value="">Select Category</option>
                      {categoryData.map((category) => (
                        <option key={category.id} value={category.name}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="language">Language *</label>
                    <div className="flex items-center gap-2">
                      <select
                        id="language"
                        name="language"
                        value={useCustomLanguage ? '' : formData.language}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        disabled={useCustomLanguage || isLoading}
                        required={!useCustomLanguage}
                      >
                        <option value="">Select Language</option>
                        {languageData.map((language) => (
                          <option key={language.id} value={language.name}>
                            {language.name}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={toggleLanguageInput}
                        className="mt-1 px-3 py-1 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
                        aria-label={useCustomLanguage ? 'Select existing language' : 'Add new language'}
                        disabled={isLoading}
                      >
                        {useCustomLanguage ? 'Select' : 'Add New'}
                      </button>
                    </div>
                    {useCustomLanguage && (
                      <input
                        type="text"
                        name="language"
                        value={formData.language}
                        onChange={handleInputChange}
                        className="mt-2 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        placeholder="Enter new language"
                        required
                        disabled={isLoading}
                      />
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="videoLink">Video Link</label>
                    <input
                      id="videoLink"
                      type="url"
                      name="videoLink"
                      value={formData.videoLink}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      placeholder="Enter video link (optional)"
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="imageFile">Image</label>
                    <input
                      id="imageFile"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="mt-1 block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-gray-100 dark:file:bg-gray-700 file:text-gray-700 dark:file:text-gray-300 hover:file:bg-blue-100 dark:hover:file:bg-blue-600"
                      disabled={isLoading}
                    />
                    {editingNews?.imageUrl && !formData.imageFile && (
                      <img
                        src={editingNews.imageUrl}
                        alt="Current Image"
                        className="w-16 h-16 mt-2 object-cover rounded-md"
                      />
                    )}
                  </div>
                  {error && <p className="text-red-600 dark:text-red-400 text-sm font-medium">{error}</p>}
                  <div className="flex justify-end gap-2 sticky bottom-0 bg-white dark:bg-gray-800 pt-4 z-20">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg dark:bg-gray-600 dark:text-gray-200 hover:bg-gray-400 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
                      disabled={isLoading}
                    >
                      Cancel
                    </button>
                    <button
                      ref={submitButtonRef}
                      type="submit"
                      disabled={isLoading || wordCount < 600}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? 'Updating...' : 'Update'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default ManageNews;