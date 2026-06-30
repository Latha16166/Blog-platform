import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getPost, likePost, deletePost, getComments, addComment, deleteComment } from '../api/client';
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

export default function PostDetail() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  const load = useCallback(async () => {
    setLoading(true);
    const [{ data: postData }, { data: commentData }] = await Promise.all([
      getPost(id), getComments(id)
    ]);
    setPost(postData.post);
    setComments(commentData.comments);
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const handleLike = async () => {
    if (!user) return navigate('/login');
    const { data } = await likePost(id);
    setPost({ ...post, likes: Array(data.likes).fill(0) });
  };

  const handleDeletePost = async () => {
    if (!window.confirm('Delete this post?')) return;
    await deletePost(id);
    navigate('/');
  };

  const submitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    const { data } = await addComment(id, { text: newComment });
    setComments([...comments, data.comment]);
    setNewComment('');
  };

  const handleDeleteComment = async (commentId) => {
    await deleteComment(commentId);
    setComments(comments.filter(c => c._id !== commentId));
  };

  if (loading) return <div className="page empty">Loading...</div>;
  if (!post) return <div className="page empty">Post not found.</div>;

  const isOwner = user && user._id === post.author?._id;

  return (
    <div className="page">
      <button className="btn-icon" onClick={() => navigate('/')}>← Back to Feed</button>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="post-detail-header">
          <h1>{post.title}</h1>
          {isOwner && (
            <div style={{ display: 'flex', gap: 8 }}>
              <Link to={`/posts/${id}/edit`} className="btn-icon">✏️ Edit</Link>
              <button className="btn-icon danger" onClick={handleDeletePost}>🗑️ Delete</button>
            </div>
          )}
        </div>
        <div className="post-header" style={{ marginBottom: 20 }}>
          <div className="avatar" style={{ width: 36, height: 36 }}>{post.author?.name?.[0]}</div>
          <div>
            <div className="author-name">{post.author?.name}</div>
            <div className="post-date">{timeAgo(post.createdAt)}</div>
          </div>
        </div>
        <p className="post-content">{post.content}</p>
        {post.tags?.length > 0 && (
          <div className="tags">
            {post.tags.map(t => <span className="tag" key={t}>#{t}</span>)}
          </div>
        )}
        <hr />
        <button className="btn-icon like" onClick={handleLike}>❤️ {post.likes?.length || 0} Likes</button>
      </div>

      <div className="card">
        <h3>💬 Comments ({comments.length})</h3>
        {comments.map(c => (
          <div className="comment" key={c._id}>
            <div className="avatar small">{c.author?.name?.[0]}</div>
            <div style={{ flex: 1 }}>
              <div className="comment-meta">
                <strong>{c.author?.name}</strong> <span className="post-date">{timeAgo(c.createdAt)}</span>
              </div>
              <div className="comment-text">{c.text}</div>
            </div>
            {user && (user._id === c.author?._id || user._id === post.author?._id) && (
              <button className="btn-icon danger small" onClick={() => handleDeleteComment(c._id)}>🗑️</button>
            )}
          </div>
        ))}

        {user ? (
          <form onSubmit={submitComment} style={{ marginTop: 20 }}>
            <label>Add a comment</label>
            <textarea rows={3} value={newComment} onChange={e => setNewComment(e.target.value)}
              placeholder="Share your thoughts..." />
            <button type="submit" className="btn btn-primary btn-sm" style={{ marginTop: 8 }}>Post Comment</button>
          </form>
        ) : (
          <p className="post-date" style={{ marginTop: 16 }}><Link to="/login">Sign in</Link> to leave a comment.</p>
        )}
      </div>
    </div>
  );
}
