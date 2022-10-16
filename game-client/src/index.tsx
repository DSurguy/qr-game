import React from 'react';
import "core-js/stable";
import { createRoot } from 'react-dom/client';
import { MantineProvider } from "@mantine/core";
import { NotificationsProvider } from '@mantine/notifications';
import { Router } from './Router';
import favicon from './assets/favicon.png';
import { HookResponseHandler } from './components/HookResponseHandler';

import './normalize.css';

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
    <NotificationsProvider>
      <HookResponseHandler>
        <Router />
      </HookResponseHandler>
    </NotificationsProvider>
  </MantineProvider>)
}
else console.error("Unable to find #app-container in document")