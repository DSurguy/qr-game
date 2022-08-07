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

const appContainer = document.querySelector('#app-container');
if( appContainer ) {
  const appRoot = createRoot(appContainer)
  appRoot.render(<MantineProvider>
    <Router />
  </MantineProvider>)
}
else console.error("Unable to find #app-container in document")