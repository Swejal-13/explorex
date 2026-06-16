import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor — attach access token ─────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor — handle 401 & token refresh ─────────────────────
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      error.response?.data?.code === 'TOKEN_EXPIRED' &&
      !originalRequest._retry
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch(Promise.reject);
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const { data } = await axios.post(`${api.defaults.baseURL}/auth/refresh`, { refreshToken });
        localStorage.setItem('accessToken', data.accessToken);
        api.defaults.headers.common.Authorization = `Bearer ${data.accessToken}`;
        processQueue(null, data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;

// ── Named service helpers ──────────────────────────────────────────────────

export const authService = {
  login:          (d) => api.post('/auth/login', d),
  register:       (d) => api.post('/auth/register', d),
  googleAuth:     (d) => api.post('/auth/google', d),
  logout:         ()  => api.post('/auth/logout'),
  getMe:          ()  => api.get('/auth/me'),
  updateProfile:  (d) => api.put('/auth/me', d),
  forgotPassword: (e) => api.post('/auth/forgot-password', { email: e }),
  resetPassword:  (token, password) => api.post(`/auth/reset-password/${token}`, { password }),
};

export const destinationService = {
  getAll:  (params) => api.get('/destinations', { params }),
  getOne:  (id)     => api.get(`/destinations/${id}`),
  getNearby: (params) => api.get('/destinations/nearby', { params }),
  create:  (d)      => api.post('/destinations', d),
  update:  (id, d)  => api.put(`/destinations/${id}`, d),
  delete:  (id)     => api.delete(`/destinations/${id}`),
};

export const hotelService = {
  getAll:  (params) => api.get('/hotels', { params }),
  getOne:  (id)     => api.get(`/hotels/${id}`),
  create:  (d)      => api.post('/hotels', d),
  update:  (id, d)  => api.put(`/hotels/${id}`, d),
};

export const bookingService = {
  create:        (d)   => api.post('/bookings', d),
  verifyPayment: (d)   => api.post('/bookings/verify-payment', d),
  getMy:         (p)   => api.get('/bookings/my', { params: p }),
  getOne:        (id)  => api.get(`/bookings/${id}`),
  cancel:        (id, reason) => api.put(`/bookings/${id}/cancel`, { reason }),
};

export const blogService = {
  getAll:        (params) => api.get('/blogs', { params }),
  getOne:        (slug)   => api.get(`/blogs/${slug}`),
  create:        (d)      => api.post('/blogs', d),
  update:        (id, d)  => api.put(`/blogs/${id}`, d),
  delete:        (id)     => api.delete(`/blogs/${id}`),
  toggleLike:    (id)     => api.post(`/blogs/${id}/like`),
  getComments:   (id)     => api.get(`/blogs/${id}/comments`),
  addComment:    (id, d)  => api.post(`/blogs/${id}/comments`, d),
};

export const aiService = {
  generateItinerary: (d) => api.post('/ai/itinerary', d),
  getRecommendations: () => api.get('/ai/recommendations'),
  getMyPlans:         () => api.get('/ai/my-plans'),
  deletePlan:         (id) => api.delete(`/ai/plans/${id}`),
};

export const wishlistService = {
  get:    ()   => api.get('/wishlist'),
  add:    (id) => api.post('/wishlist', { destinationId: id }),
  remove: (id) => api.delete(`/wishlist/${id}`),
};

export const reviewService = {
  get:    (params) => api.get('/reviews', { params }),
  create: (d)      => api.post('/reviews', d),
};

export const notificationService = {
  get:         () => api.get('/notifications'),
  readAll:     () => api.put('/notifications/read-all'),
  readOne:     (id) => api.put(`/notifications/${id}/read`),
};

export const adminService = {
  getStats:    () => api.get('/admin/stats'),
  getUsers:    (p) => api.get('/admin/users', { params: p }),
  updateUser:  (id, d) => api.put(`/admin/users/${id}`, d),
  getBookings: (p) => api.get('/admin/bookings', { params: p }),
  getRevenue:  () => api.get('/admin/analytics/revenue'),
};

export const uploadService = {
  uploadImage: (file) => {
    const fd = new FormData(); fd.append('image', file);
    return api.post('/upload/image', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  uploadBlogImage: (file) => {
    const fd = new FormData(); fd.append('image', file);
    return api.post('/upload/blog-image', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
};
