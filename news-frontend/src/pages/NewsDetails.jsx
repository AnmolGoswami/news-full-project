import React, { useEffect, useState } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import axios from 'axios';
import {
  FacebookShareButton,
  TwitterShareButton,
  WhatsappShareButton,
  LinkedinShareButton,
  TelegramShareButton,
  EmailShareButton,
  FacebookIcon,
  TwitterIcon,
  WhatsappIcon,
  LinkedinIcon,
  TelegramIcon,
  EmailIcon,
} from 'react-share';
import { toast } from 'react-toastify';
import { useNews } from '../context/NewsContex';
import DOMPurify from 'dompurify';
import parse from 'html-react-parser';

const slugify = (text, id) => {
  if (!text || typeof text !== 'string' || text.trim() === '') {
    return `news-article-${id}`;
  }
  return text
    .trim()
    .toLowerCase()
    .normalize('NFD') // Normalize diacritics (safe for most scripts)
    .replace(/[^\p{L}\p{N}\s-]/gu, '')  // Keep letters, numbers, spaces, dashes
    .replace(/\s+/g, '-')               // Convert spaces to dashes
    .replace(/--+/g, '-')               // Collapse multiple dashes
    .replace(/^-+|-+$/g, '')            // Trim leading/trailing dashes
    .substring(0, 100);                 // Limit length
};


const getEmbeddedYouTubeUrl = (url) => {
  try {
    const videoId = new URL(url).searchParams.get('v');
    return `https://www.youtube.com/embed/${videoId}`;
  } catch (err) {
    console.error('Invalid YouTube URL:', url);
    return null;
  }
};

const NewsDetails = () => {
  const { id, slug } = useParams();
  const { token } = useNews();
  const [article, setArticle] = useState(null);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [comments, setComments] = useState([]);
  const [likeCount, setLikeCount] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [commentContent, setCommentContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentEmail, setCurrentEmail] = useState('');
  const shareUrl = window.location.href;

  useEffect(() => {
    if (!id || isNaN(id)) {
      setError('Invalid article ID');
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch article
        const articleRes = await axios.get(`https://api.anmol-goswami-resume.store/api/news/${id}`);
        setArticle(articleRes.data);

        // Track view
        await axios.post(`https://api.anmol-goswami-resume.store/api/news/${id}/view`).catch((err) => {
          console.error('View tracking failed:', err);
        });

        // Fetch related articles
        const relatedRes = await axios.get(`https://api.anmol-goswami-resume.store/api/news/related/${id}`).catch(() => ({ data: [] }));
        setRelatedArticles(relatedRes.data);

        // Fetch comments
        const commentsRes = await axios.get(`https://api.anmol-goswami-resume.store/api/${id}/comments`).catch(() => ({ data: [] }));
        setComments(commentsRes.data);

        // Fetch like count
        const likesRes = await axios.get(`https://api.anmol-goswami-resume.store/api/news/${id}/likes/count`).catch(() => ({ data: 0 }));
        setLikeCount(likesRes.data);

        // Fetch current user if token exists
        if (token) {
          const userRes = await axios.get('https://api.anmol-goswami-resume.store/api/users/me', {
            headers: { Authorization: `Bearer ${token}` },
          });
          setCurrentEmail(userRes.data.email || '');
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.response?.status === 404 ? 'Article not found' : 'Failed to load article. Please try again later.');
        toast.error('Failed to load article');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, token]);

  const trackShare = () => {
    axios
      .post(`https://api.anmol-goswami-resume.store/api/news/${id}/share`)
      .then(() => console.log('Share tracked'))
      .catch((err) => console.error('Share tracking failed:', err));
  };

  const handleLike = async () => {
    if (!token) {
      toast.error('Please log in to like this article.');
      return;
    }
    setIsLoading(true);
    try {
      const res = await axios.post(
        `https://api.anmol-goswami-resume.store/api/news/${id}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.status === 200) {
        setHasLiked(true);
        setLikeCount((prev) => prev + 1);
        toast.success('Article liked!');
      }
    } catch (err) {
      toast.error(err.response?.data || 'Failed to like article.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      toast.error('Please log in to comment on this article.');
      return;
    }
    if (!commentContent.trim()) {
      toast.error('Comment cannot be empty.');
      return;
    }
    setIsLoading(true);
    try {
      const res = await axios.post(
        `https://api.anmol-goswami-resume.store/api/news/${id}/comments`,
        { content: commentContent },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      setComments([
        {
          content: res.data.content,
          username: res.data.username,
          email: res.data.email,
          createdAt: res.data.createdAt,
        },
        ...comments,
      ]);
      setCommentContent('');
      toast.success('Comment posted!');
    } catch (err) {
      toast.error(err.response?.status === 401 ? 'Session expired. Please log in again.' : err.response?.data || 'Failed to post comment.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-lg text-gray-600 dark:text-gray-300 animate-pulse">Loading news...</div>
      </div>
    );
  }

  if (error && !article) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-lg text-red-600 dark:text-red-400">{error}</div>
      </div>
    );
  }

  const expectedSlug = slugify(article?.title || 'Untitled', id);
  if (!slug || slug !== expectedSlug) {
    return <Navigate to={`/news/${id}/${expectedSlug}`} replace />;
  }

  const pagetitle = article?.title && typeof article.title === 'string' && article.title.trim()
    ? `${article.title} | Talewire`
    : 'News Article | Talewire';
  const description = article?.content
    ? article.content.replace(/<[^>]+>/g, '').substring(0, 160) + '...'
    : 'Read the latest news article on Talewire.';
  const keywords = [
    article?.title,
    article?.categoryName,
    article?.stateName,
    article?.districtName,
    'AI in education',
    'EdTech India',
    'personalized learning',
    'NEP 2020',
    'Talewire',
  ].filter(Boolean).join(', ');

  return (
    <>
      <Helmet>
        <meta charset="utf-8" />
        <title>{pagetitle}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords} />
        <meta name="robots" content="index, follow" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="author" content="Staff Reporter" />
        <link rel="canonical" href={shareUrl} />
        <meta property="og:title" content={article?.title || 'News Article'} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={article?.imageUrl || '/images/default-news.jpg'} />
        <meta property="og:url" content={shareUrl} />
        <meta property="og:type" content="article" />
        <meta property="og:site_name" content="Talewire" />
        <meta property="og:locale" content="en_IN" />
        <meta property="article:published_time" content={article?.publishedDate || new Date().toISOString()} />
        <meta property="article:author" content="Staff Reporter" />
        <meta property="article:section" content={article?.categoryName || 'Education'} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={article?.title || 'News Article'} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={article?.imageUrl || '/images/default-news.jpg'} />
        <meta name="twitter:site" content="@SamaySiwan" />
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'NewsArticle',
            headline: article?.title || 'Untitled',
            description: description,
            image: article?.imageUrl || '/images/default-news.jpg',
            datePublished: article?.publishedDate || new Date().toISOString(),
            dateModified: article?.publishedDate || new Date().toISOString(),
            author: { '@type': 'Person', name: 'Staff Reporter' },
            publisher: {
              '@type': 'Organization',
              name: 'Talewire',
              logo: { '@type': 'ImageObject', url: '/images/logo.png', width: 300, height: 100 },
            },
            mainEntityOfPage: { '@type': 'WebPage', '@id': shareUrl },
            articleSection: article?.categoryName || 'Education',
            keywords: keywords,
            contentLocation: { '@type': 'Place', name: `${article?.districtName || 'India'}, ${article?.stateName || 'India'}` },
          })}
        </script>
      </Helmet>

      <article className="bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen font-sans">
        <header className="relative h-80 md:h-[500px] w-full overflow-hidden">
          <img
            src={article?.imageUrl || '/images/default-news.jpg'}
            alt={article?.title ? `${article.title} - Featured Image` : 'News Article Image'}
            className="w-full h-full object-cover object-center transition-transform duration-700 hover:scale-105"
            loading="eager"
            itemProp="image"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent flex items-end">
            <div className="container mx-auto px-4 py-8">
              <h1
                className="text-3xl md:text-4xl font-extrabold text-white max-w-4xl leading-tight animate-slide-up"
                itemProp="headline"
              >
                {article?.title || 'News Article'}
              </h1>
              <div className="mt-4 flex flex-wrap gap-3 text-sm text-gray-200">
                <time itemProp="datePublished" dateTime={article?.publishedDate}>
                  {article?.publishedDate ? new Date(article.publishedDate).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  }) : 'July 1, 2025'}
                </time>
                {article?.stateName && article?.districtName && (
                  <>
                    <span className="mx-2">•</span>
                    <span itemProp="contentLocation">
                      {article.stateName}, {article.districtName}
                    </span>
                  </>
                )}
                <span className="mx-2">•</span>
                <span itemProp="author">By Staff Reporter</span>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-4 gap-8">
          <section className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-8 transition-all duration-300 hover:shadow-2xl">
              <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  {article?.viewCount || 0} Views
                </span>
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 13.938 9.384 14.5 10.05 14.5h3.9c.666 0 1.164-.562 1.366-1.158l2.073-5.842H6.61l2.074 5.842z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12h2m-8 0H7" />
                  </svg>
                  {article?.shareCount || 0} Shares
                </span>
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  {likeCount} Likes
                </span>
              </div>

              <div
                className="prose dark:prose-invert prose-lg max-w-none leading-relaxed"
                itemProp="articleBody"
              >
                {article?.content ? parse(DOMPurify.sanitize(article.content, { ADD_TAGS: ['h1', 'h2', 'h3', 'p', 'ul', 'li', 'strong', 'em', 'blockquote'] })) : <p>No content available.</p>}
              </div>

              <div className="mt-6">
                <button
                  onClick={handleLike}
                  disabled={isLoading || hasLiked || !token}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
                    hasLiked
                      ? 'bg-red-100 text-red-600'
                      : token
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-gray-400 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <svg className="w-5 h-5" fill={hasLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  {hasLiked ? 'Liked' : 'Like'} ({likeCount})
                </button>
              </div>
            </div>

            <section className="mb-8" aria-labelledby="comments-heading">
              <h2 id="comments-heading" className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">
                Comments
              </h2>
              {error && <p className="text-red-500 mb-4">{error}</p>}
              {token ? (
                <div className="mb-6">
                  <textarea
                    value={commentContent}
                    onChange={(e) => setCommentContent(e.target.value)}
                    placeholder="Write your comment..."
                    className="w-full p-4 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 resize-y"
                    rows="4"
                  ></textarea>
                  <button
                    onClick={handleCommentSubmit}
                    disabled={isLoading || !commentContent.trim()}
                    className="mt-2 px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all duration-300 disabled:bg-gray-400"
                  >
                    {isLoading ? 'Posting...' : 'Post Comment'}
                  </button>
                </div>
              ) : (
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  <Link to="/login" className="text-blue-600 hover:underline">
                    Log in
                  </Link>{' '}
                  to post a comment.
                </p>
              )}
              <div className="space-y-4">
                {comments.length > 0 ? (
                  comments.map((comment, index) => (
                    <div key={index} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-gray-800 dark:text-gray-100">
                          {comment.email === currentEmail ? 'You' : comment.username || 'Guest'}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(comment.createdAt).toLocaleString('en-IN')}
                        </span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300">{comment.content}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600 dark:text-gray-400">No comments available.</p>
                )}
              </div>
            </section>

            <section className="mb-8" aria-labelledby="share-heading">
              <h2 id="share-heading" className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">
                Share This Article
              </h2>
              <div className="flex flex-wrap gap-3">
                <FacebookShareButton url={shareUrl} quote={article?.title} onClick={trackShare}>
                  <div className="flex items-center gap-2 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">
                    <FacebookIcon size={32} round />
                    <span>Facebook</span>
                  </div>
                </FacebookShareButton>
                <TwitterShareButton url={shareUrl} title={article?.title} onClick={trackShare}>
                  <div className="flex items-center gap-2 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">
                    <TwitterIcon size={32} round />
                    <span>Twitter</span>
                  </div>
                </TwitterShareButton>
                <WhatsappShareButton url={shareUrl} title={article?.title} onClick={trackShare}>
                  <div className="flex items-center gap-2 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">
                    <WhatsappIcon size={32} round />
                    <span>WhatsApp</span>
                  </div>
                </WhatsappShareButton>
                <TelegramShareButton url={shareUrl} title={article?.title} onClick={trackShare}>
                  <div className="flex items-center gap-2 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">
                    <TelegramIcon size={32} round />
                    <span>Telegram</span>
                  </div>
                </TelegramShareButton>
                <LinkedinShareButton url={shareUrl} title={article?.title} onClick={trackShare}>
                  <div className="flex items-center gap-2 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">
                    <LinkedinIcon size={32} round />
                    <span>LinkedIn</span>
                  </div>
                </LinkedinShareButton>
                <EmailShareButton url={shareUrl} subject={article?.title} body={description} onClick={trackShare}>
                  <div className="flex items-center gap-2 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">
                    <EmailIcon size={32} round />
                    <span>Email</span>
                  </div>
                </EmailShareButton>
              </div>
            </section>

            {article?.videoLink && (
              <section className="mb-8" aria-labelledby="video-heading">
                <h2 id="video-heading" className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">
                  Related Video
                </h2>
                <div className="aspect-video rounded-xl overflow-hidden shadow-lg transition-transform duration-300 hover:scale-[1.02]">
                  <iframe
                    src={getEmbeddedYouTubeUrl(article.videoLink)}
                    title={`${article?.title || 'News Article'} - Related Video`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                    loading="lazy"
                  ></iframe>
                </div>
              </section>
            )}
          </section>

          <aside className="lg:col-span-1" aria-label="Related Articles">
            <div className="sticky top-20 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
              <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">
                Related Articles
              </h2>
              {relatedArticles.length > 0 ? (
                <ul className="space-y-6">
                  {relatedArticles.map((related) => (
                    <li key={related.id} itemScope itemType="https://schema.org/NewsArticle">
                      <Link
                        to={`/news/${related.id}/${slugify(related.title || 'Untitled', related.id)}`}
                        className="flex items-start gap-4 group"
                        itemProp="url"
                      >
                        <img
                          src={related.imageUrl || '/images/default-news.jpg'}
                          alt={related.title ? `${related.title} - Related News Image` : 'Related News Image'}
                          className="w-20 h-20 rounded-lg object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                          itemProp="image"
                        />
                        <div className="flex-1">
                          <h3
                            className="text-sm font-semibold text-gray-800 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
                            itemProp="headline"
                          >
                            {related.title || 'Untitled'}
                          </h3>
                          <time
                            className="text-xs text-gray-500 dark:text-gray-400 mt-1"
                            itemProp="datePublished"
                            dateTime={related.publishedDate}
                          >
                            {new Date(related.publishedDate).toLocaleDateString('en-IN')}
                          </time>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-600 dark:text-gray-400">No related articles available.</p>
              )}
            </div>
          </aside>
        </div>

        <style>
          {`
            @keyframes slide-up {
              from { opacity: 0; transform: translateY(30px); }
              to { opacity: 1; transform: translateY(0); }
            }
            .animate-slide-up {
              animation: slide-up 0.8s ease-out;
            }
            .prose h1 { font-size: 2rem; font-weight: 700; margin-bottom: 1rem; }
            .prose h2 { font-size: 1.5rem; font-weight: 600; margin-top: 2rem; margin-bottom: 1rem; }
            .prose p { margin-bottom: 1rem; }
            .prose ul { list-style: disc; padding-left: 1.5rem; margin-bottom: 1rem; }
            .prose li { margin-bottom: 0.5rem; }
            .prose blockquote { border-left: 4px solid #3b82f6; padding-left: 1rem; font-style: italic; margin: 1rem 0; }
            .prose strong { font-weight: 600; }
            .prose em { font-style: italic; }
          `}
        </style>
      </article>
    </>
  );
};

export default NewsDetails;