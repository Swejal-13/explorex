import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import store from './redux/store';
import { fetchMe } from './redux/slices/authSlice';
import { fetchWishlist } from './redux/slices/wishlistSlice';
import { fetchNotifications } from './redux/slices/notificationSlice';
import { connectSocket, disconnectSocket } from './services/socket';
import { addNotification } from './redux/slices/notificationSlice';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import PageLoader from './components/common/PageLoader';
import ChatWidget from './components/common/ChatWidget';

// Lazy-loaded pages
const HomePage        = lazy(() => import('./pages/HomePage'));
const DestinationsPage= lazy(() => import('./pages/DestinationsPage'));
const DestinationDetailPage = lazy(() => import('./pages/DestinationDetailPage'));
const HotelsPage      = lazy(() => import('./pages/HotelsPage'));
const HotelDetailPage = lazy(() => import('./pages/HotelDetailPage'));
const PlannerPage     = lazy(() => import('./pages/PlannerPage'));
const BlogsPage       = lazy(() => import('./pages/BlogsPage'));
const BlogDetailPage  = lazy(() => import('./pages/BlogDetailPage'));
const CreateBlogPage  = lazy(() => import('./pages/CreateBlogPage'));
const WishlistPage    = lazy(() => import('./pages/WishlistPage'));
const BookingsPage    = lazy(() => import('./pages/BookingsPage'));
const ProfilePage     = lazy(() => import('./pages/ProfilePage'));
const LoginPage       = lazy(() => import('./pages/LoginPage'));
const RegisterPage    = lazy(() => import('./pages/RegisterPage'));
const AdminDashboard  = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminUsers      = lazy(() => import('./pages/admin/AdminUsers'));
const AdminBookings   = lazy(() => import('./pages/admin/AdminBookings'));
const NotFoundPage    = lazy(() => import('./pages/NotFoundPage'));

// Protected route wrapper
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, isInitialised } = useSelector((s) => s.auth);
  if (!isInitialised) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
};

const AppContent = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const { darkMode } = useSelector((s) => s.ui);

  // Init dark mode
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  // Bootstrap auth
  useEffect(() => {
    if (localStorage.getItem('accessToken')) {
      dispatch(fetchMe());
    } else {
      // Still mark as initialised so routes render
      dispatch({ type: 'auth/fetchMe/rejected' });
    }
  }, []);

  // Socket + user-specific data when logged in
  useEffect(() => {
    if (user) {
      dispatch(fetchWishlist());
      dispatch(fetchNotifications());

      const token = localStorage.getItem('accessToken');
      const socket = connectSocket(token);

      socket.on('notification', (notif) => {
        dispatch(addNotification(notif));
      });

      return () => {
        socket.off('notification');
        disconnectSocket();
      };
    }
  }, [user]);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-paper dark:bg-ink flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public */}
              <Route path="/"              element={<HomePage />} />
              <Route path="/destinations"  element={<DestinationsPage />} />
              <Route path="/destinations/:id" element={<DestinationDetailPage />} />
              <Route path="/hotels"        element={<HotelsPage />} />
              <Route path="/hotels/:id"    element={<HotelDetailPage />} />
              <Route path="/plan"          element={<PlannerPage />} />
              <Route path="/blog"          element={<BlogsPage />} />
              <Route path="/blog/:slug"    element={<BlogDetailPage />} />
              <Route path="/login"         element={<LoginPage />} />
              <Route path="/register"      element={<RegisterPage />} />

              {/* Protected */}
              <Route path="/blog/create" element={
                <ProtectedRoute><CreateBlogPage /></ProtectedRoute>
              } />
              <Route path="/wishlist" element={
                <ProtectedRoute><WishlistPage /></ProtectedRoute>
              } />
              <Route path="/bookings" element={
                <ProtectedRoute><BookingsPage /></ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute><ProfilePage /></ProtectedRoute>
              } />

              {/* Admin */}
              <Route path="/admin" element={
                <ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>
              } />
              <Route path="/admin/users" element={
                <ProtectedRoute adminOnly><AdminUsers /></ProtectedRoute>
              } />
              <Route path="/admin/bookings" element={
                <ProtectedRoute adminOnly><AdminBookings /></ProtectedRoute>
              } />

              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
        <ChatWidget />
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: { background: '#1A1614', color: '#fff', border: '1px solid rgba(201,168,76,0.3)', fontSize: '13px' },
            success: { iconTheme: { primary: '#C9A84C', secondary: '#1A1614' } },
          }}
        />
      </div>
    </BrowserRouter>
  );
};

export default function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}
