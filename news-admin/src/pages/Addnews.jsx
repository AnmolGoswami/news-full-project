import React, { useContext, useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from '../layout/AdminLayout';
import { toast } from 'react-toastify';
import { AuthContext } from '../context/AuthContext';
import { Editor } from '@tinymce/tinymce-react';

const AddNews = () => {
  const { token } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    state: '',
    district: '',
    category: '',
    language: '',
    videoLink: '',
    publishDate: new Date().toISOString().slice(0, 16),
  });
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [editorError, setEditorError] = useState('');

  // Check if TinyMCE script is loaded
  useEffect(() => {
    const checkTinyMCE = () => {
      if (!window.tinymce) {
        setEditorError('TinyMCE failed to load. Please ensure /tinymce/tinymce.min.js is accessible in the public directory.');
      } else {
        setEditorError('');
      }
    };

    // Delay check to ensure script has time to load
    const timer = setTimeout(checkTinyMCE, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleEditorChange = (content) => {
    setFormData({ ...formData, content });
    const words = content.replace(/<[^>]+>/g, '').trim().split(/\s+/).filter((word) => word.length > 0);
    setWordCount(words.length);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && !file.type.startsWith('image/')) {
      setError('Please select a valid image file (PNG, JPEG, etc.).');
      toast.error('Please select a valid image file.');
      setFile(null);
      return;
    }
    setFile(file);
    setError('');
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
    setMessage('');
    setError('');
    setIsSubmitting(true);

    if (!file) {
      setError('Please select an image file.');
      toast.error('Please select an image file.');
      setIsSubmitting(false);
      return;
    }

    if (!formData.title || !formData.content || !formData.state || !formData.district || !formData.category || !formData.language || !formData.publishDate) {
      setError('Please fill in all required fields.');
      toast.error('Please fill in all required fields.');
      setIsSubmitting(false);
      return;
    }

    if (formData.title.length < 5) {
      setError('Title must be at least 5 characters long.');
      toast.error('Title must be at least 5 characters long.');
      setIsSubmitting(false);
      return;
    }

    if (formData.videoLink && !isValidUrl(formData.videoLink)) {
      setError('Please enter a valid URL for the video link.');
      toast.error('Please enter a valid URL for the video link.');
      setIsSubmitting(false);
      return;
    }

    if (wordCount < 600) {
      setError('Content must be at least 600 words.');
      toast.error('Content must be at least 600 words.');
      setIsSubmitting(false);
      return;
    }

    const data = new FormData();
    data.append(
      'news',
      new Blob([JSON.stringify(formData)], { type: 'application/json' })
    );
    data.append('file', file);

    try {
      const response = await axios.post('https://api.anmol-goswami-resume.store/api/admin/addNews', data, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      setMessage(response.data.message || 'News added successfully.');
      toast.success('News added successfully!');
      setFormData({
        title: '',
        content: '',
        state: '',
        district: '',
        category: '',
        language: '',
        videoLink: '',
        publishDate: new Date().toISOString().slice(0, 16),
      });
      setFile(null);
      setWordCount(0);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to add news.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="w-full max-w-4xl bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 sm:p-8">
          <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-white mb-6 text-center">
            Add News Article
          </h2>
          {editorError && (
            <p className="text-red-600 dark:text-red-400 text-sm font-medium mb-4">
              {editorError}
            </p>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Title * (Minimum 5 characters)
              </label>
              <input
                id="title"
                name="title"
                type="text"
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="Enter news title"
                value={formData.title}
                onChange={handleInputChange}
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Content * (Minimum 600 words)
              </label>
              <div className="border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700">
                <Editor
                  apiKey="uffyjvvyaxkyohcgitmsr461lte6xpvy7ryp7ud6m7dfkh0b"
                  init={{
                    height: 500,
                    menubar: false,
                    plugins: [
                      'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                      'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                      'insertdatetime', 'media', 'table', 'help', 'wordcount', 'emoticons', 'paste'
                    ],
                    toolbar:
                      'undo redo | blocks | bold italic underline strikethrough forecolor backcolor | ' +
                      'alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | ' +
                      'link image media table blockquote code | preview fullscreen',
                    content_style: `
       body {
    font-family: 'Inter', sans-serif;
    background-color: white;
    padding: 0.25rem 1rem 1rem 1rem; /* top right bottom left */
    line-height: 1.75;
    color: #1f2937;
  }

      h1 { font-size: 2rem; font-weight: 700; margin-bottom: 1rem; }
      h2 { font-size: 1.5rem; font-weight: 600; margin-top: 1.5rem; margin-bottom: 0.75rem; }
      h3 { font-size: 1.25rem; font-weight: 600; margin-top: 1rem; margin-bottom: 0.5rem; }
      p { margin-bottom: 1rem; }
      ul { list-style: disc; padding-left: 1.5rem; margin-bottom: 1rem; }
      li { margin-bottom: 0.5rem; }
      a { color: #2563eb; text-decoration: underline; }
      blockquote {
        border-left: 4px solid #3b82f6;
        padding-left: 1rem;
        color: #4b5563;
        font-style: italic;
        background-color: #f9fafb;
        margin: 1rem 0;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 1rem;
      }
      th, td {
        border: 1px solid #e5e7eb;
        padding: 0.75rem;
        text-align: left;
      }
      th {
        background-color: #f3f4f6;
        font-weight: 600;
      }
      img {
        max-width: 100%;
        border-radius: 0.5rem;
        margin: 1rem 0;
      }
      .highlight-yellow { background-color: #fef3c7; padding: 0 0.25rem; }
      .highlight-red { background-color: #fecaca; padding: 0 0.25rem; }
      .highlight-blue { background-color: #bfdbfe; padding: 0 0.25rem; }
      .highlight-green { background-color: #bbf7d0; padding: 0 0.25rem; }
    `,
                    branding: false,
                    statusbar: true,
                    paste_data_images: true,
                    images_upload_handler: async (blobInfo, success, failure) => {
                      try {
                        const formData = new FormData();
                        formData.append('file', blobInfo.blob(), blobInfo.filename());
                        const res = await axios.post('https://api.anmol-goswami-resume.store/api/admin/uploadImage', formData, {
                          headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'multipart/form-data',
                          },
                        });
                        success(res.data.imageUrl); // Adjust based on backend response
                      } catch (err) {
                        failure('Image upload failed: ' + err.message);
                      }
                    },
                    setup: (editor) => {
                      editor.on('init', () => {
                        console.log('✅ TinyMCE initialized');
                      });
                      editor.on('error', (err) => {
                        console.error('❌ TinyMCE error:', err);
                        setEditorError('TinyMCE failed to initialize: ' + err.message);
                      });
                    },
                  }}
                  value={formData.content}
                  onEditorChange={handleEditorChange}
                  disabled={isSubmitting}
                />

              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Words: {wordCount} {wordCount < 600 && '(Minimum 600 words required)'}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="state" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  State *
                </label>
                <input
                  id="state"
                  name="state"
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  placeholder="e.g., Bihar"
                  value={formData.state}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label htmlFor="district" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  District *
                </label>
                <input
                  id="district"
                  name="district"
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  placeholder="e.g., Patna"
                  value={formData.district}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category *
                </label>
                <input
                  id="category"
                  name="category"
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  placeholder="e.g., Education"
                  value={formData.category}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label htmlFor="language" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Language *
                </label>
                <input
                  id="language"
                  name="language"
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  placeholder="e.g., English"
                  value={formData.language}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label htmlFor="publishDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Publish Date *
                </label>
                <input
                  id="publishDate"
                  name="publishDate"
                  type="datetime-local"
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  value={formData.publishDate}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label htmlFor="videoLink" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Video Link (Optional)
                </label>
                <input
                  id="videoLink"
                  name="videoLink"
                  type="url"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  placeholder="e.g., https://youtube.com/watch?v=..."
                  value={formData.videoLink}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                />
              </div>
              <div className="col-span-1 sm:col-span-2">
                <label htmlFor="file" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Image * (PNG, JPEG)
                </label>
                <input
                  id="file"
                  name="file"
                  type="file"
                  accept="image/*"
                  required
                  className="w-full text-sm text-gray-600 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-gray-100 dark:file:bg-gray-700 file:text-gray-700 dark:file:text-gray-300 hover:file:bg-blue-100 dark:hover:file:bg-blue-600 transition"
                  onChange={handleFileChange}
                  disabled={isSubmitting}
                />
              </div>
            </div>
            {message && <p className="text-green-600 dark:text-green-400 text-sm font-medium">{message}</p>}
            {error && <p className="text-red-600 dark:text-red-400 text-sm font-medium">{error}</p>}
            <button
              type="submit"
              disabled={isSubmitting || wordCount < 600}
              className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'Add News'}
            </button>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AddNews;