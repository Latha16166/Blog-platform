import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createPost, getPost, updatePost } from '../api/client';

export default function PostForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [form, setForm] = useState({ title: '', content: '', tags: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isEdit) {
      getPost(id).then(({ data }) => {
        const p = data.post;
        setForm({ title: p.title, content: p.content, tags: (p.tags || []).join(', ') });
      });
    }
  }, [id, isEdit]);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.title.trim() || !form.content.trim()) {
      setError('Title and content are required.');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        title: form.title,
        content: form.content,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      };
      if (isEdit) {
        const { data } = await updatePost(id, payload);
        navigate(`/posts/${data.post._id}`);
      } else {
        const { data } = await createPost(payload);
        navigate(`/posts/${data.post._id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <button className="btn-icon" onClick={() => navigate(-1)}>← Back</button>
      <form className="card" onSubmit={submit} style={{ marginTop: 16 }}>
        <h2>{isEdit ? 'Edit Post' : 'New Post'}</h2>
        <label>Title</label>
        <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
          placeholder="Give your post a great title..." className="title-input" />
        <label>Content</label>
        <textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })}
          placeholder="Write your post here..." rows={12} />
        <label>Tags (comma separated)</label>
        <input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })}
          placeholder="react, webdev, tutorial" />
        {error && <div className="error">{error}</div>}
        <div className="form-actions">
          <button type="button" className="btn" onClick={() => navigate(-1)}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Publish Post'}
          </button>
        </div>
      </form>
    </div>
  );
}
