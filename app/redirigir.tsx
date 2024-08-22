import React from 'react';

const RedirectToLogin = () => {
  const redirectToLogin = () => {
    window.location.href = '/login';
  };

  React.useEffect(() => {
    redirectToLogin();
  }, []);

  return null; 
};

export default RedirectToLogin;
