"use client";

import React from 'react';
import { MantineProvider } from '@mantine/core';
import RedirectToLogin from './redirigir';

const LoginPage = () => {
  return (
    <MantineProvider>
      <div>
        <RedirectToLogin />
        {/* Other components */}
      </div>
    </MantineProvider>
  );
};

export default LoginPage;
