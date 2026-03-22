import { useSelector } from 'react-redux';

export const useAuth = () => {
  const { user, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  );

  return {
    user,
    isLoading,
    isError,
    isSuccess,
    message,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
  };
};

export default useAuth;
