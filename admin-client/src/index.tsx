import { MantineProvider } from "@mantine/core";
import "core-js/stable";
import React from 'react';
import { createRoot } from 'react-dom/client';
import { Router } from './Router';
import './normalize.css';
import favicon from './assets/favicon.png';

//<link rel="icon" href="favicon.ico" type="image/x-icon">
const linkTag = document.createElement('link');
linkTag.setAttribute('rel', 'icon')
linkTag.setAttribute('href', favicon)
linkTag.setAttribute('type', 'image/png')
document.querySelector('head')?.appendChild(linkTag)

const appRoot = createRoot(document.querySelector('#app-container'))
appRoot.render(<MantineProvider>
  <Router />
</MantineProvider>)