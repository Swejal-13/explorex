import { useSelector, useDispatch } from 'react-redux';
import { loginUser, registerUser, logoutUser, clearError } from '../redux/slices/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, isLoading, error, isInitialised } = useSelector((s) => s.auth);

  return {
    user,
    isLoading,
    error,
    isInitialised,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    login:    (creds) => dispatch(loginUser(creds)),
    register: (creds) => dispatch(registerUser(creds)),
    logout:   ()      => dispatch(logoutUser()),
    clearError: ()    => dispatch(clearError()),
  };
};
