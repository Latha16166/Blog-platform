import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getPosts, likePost, deletePost } from '../api/client';
import { useAuth } from '../context/AuthContext';

const timeAgo = (iso) => {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const { user } = useAuth();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getPosts({ search, page, limit: 10 });
      setPosts(data.posts);
      setPages(data.pages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => { load(); }, [load]);

  const handleLike = async (id) => {
    if (!user) return;
    const { data } = await likePost(id);
    setPosts(posts.map(p => p._id === id ? { ...p, likes: Array(data.likes).fill(0) } : p));
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this post?')) return;
    await deletePost(id);
    setPosts(posts.filter(p => p._id !== id));
  };

  return (
    <div className="page">
      <input className="search-bar" placeholder="🔍  Search posts..."
        value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />

      {loading && <div className="empty">Loading posts...</div>}
      {!loading && posts.length === 0 && (
        <div className="empty">
          <div className="empty-icon">📭</div>
          <div>{search ? 'No posts match your search.' : 'No posts yet. Be the first!'}</div>
        </div>
      )}

      {posts.map(post => (
        <div className="card post-card" key={post._id}>
          <div className="post-header">
            <div className="avatar">{post.author?.name?.[0] || '?'}</div>
            <div>
              <div className="author-name">{post.author?.name}</div>
              <div className="post-date">{timeAgo(post.createdAt)}</div>
            </div>
            {user && user._id === post.author?._id && (
              <button className="btn-icon danger" onClick={() => handleDelete(post._id)} title="Delete">🗑️</button>
            )}
          </div>
          <Link to={`/posts/${post._id}`} className="post-title">{post.title}</Link>
          <p className="post-excerpt">{post.content}</p>
          <div className="post-actions">
            <button className="btn-icon like" onClick={() => handleLike(post._id)}>
              ❤️ {post.likes?.length || 0}
            </button>
            <Link to={`/posts/${post._id}`} className="btn-icon">💬 {post.commentCount || 0} comments</Link>
            <Link to={`/posts/${post._id}`} className="btn btn-primary btn-sm" style={{ marginLeft: 'auto' }}>Read More →</Link>
          </div>
        </div>
      ))}

      {pages > 1 && (
        <div className="pagination">
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
          <span>Page {page} of {pages}</span>
          <button disabled={page >= pages} onClick={() => setPage(p => p + 1)}>Next →</button>
        </div>
      )}
    </div>
  );
}
