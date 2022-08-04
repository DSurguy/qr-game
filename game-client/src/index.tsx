import { MantineProvider } from "@mantine/core";
import "core-js/stable";
import React from 'react';
import { createRoot } from 'react-dom/client';
import { Router } from './Router';
import './normalize.css';

const appRoot = createRoot(document.querySelector('#app-container'))
appRoot.render(<MantineProvider>
  <Router />
</MantineProvider>)