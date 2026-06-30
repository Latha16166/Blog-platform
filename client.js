import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-logout on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ─── Auth ─────────────────────────────
export const registerUser = (data) => api.post('/auth/register', data);
export const loginUser     = (data) => api.post('/auth/login', data);
export const getMe         = ()     => api.get('/auth/me');
export const updateProfile = (data) => api.put('/auth/me', data);

// ─── Posts ────────────────────────────
export const getPosts    = (params) => api.get('/posts', { params });
export const getPost     = (id)     => api.get(`/posts/${id}`);
export const createPost  = (data)   => api.post('/posts', data);
export const updatePost  = (id, data) => api.put(`/posts/${id}`, data);
export const deletePost  = (id)     => api.delete(`/posts/${id}`);
export const likePost    = (id)     => api.post(`/posts/${id}/like`);

// ─── Comments ─────────────────────────
export const getComments    = (postId)        => api.get(`/comments/post/${postId}`);
export const addComment     = (postId, data)  => api.post(`/comments/post/${postId}`, data);
export const updateComment  = (id, data)      => api.put(`/comments/${id}`, data);
export const deleteComment  = (id)            => api.delete(`/comments/${id}`);

export default api;
