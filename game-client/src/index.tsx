import React from 'react';
import "core-js/stable";
import { createRoot } from 'react-dom/client';
import { MantineProvider, MantineTheme } from "@mantine/core";
import { NotificationsProvider } from '@mantine/notifications';
import { Router } from './Router';
import favicon from './assets/favicon.png';
import { HookResponseHandler } from './components/HookResponseHandler';

//<link rel="icon" href="favicon.ico" type="image/x-icon">
const linkTag = document.createElement('link');
linkTag.setAttribute('rel', 'icon')
linkTag.setAttribute('href', favicon)
linkTag.setAttribute('type', 'image/png')
document.querySelector('head')?.appendChild(linkTag)

const appContainer = document.querySelector('#app-container');
if( appContainer ) {
  const appRoot = createRoot(appContainer)
  appRoot.render(<MantineProvider theme={{
    colorScheme: 'dark',
    colors: {
      dark: [
        '#181F25',
        '#1F2A2E',
        '#253637',
        '#2B403D',
        '#324941',
        '#576A5F',
        '#7B8B7F',
        '#A0ACA0',
        '#C7CDC5',
        '#ECEDEA',
      ].reverse() as any,
      brandPrimary: [
        '#DCF4F0',
        '#C0E6EA',
        '#A6CDDF',
        '#8BADD4',
        '#7287C8',
        '#595BBC',
        '#5E4CA6',
        '#604090',
        '#5F3479',
        '#582962'
      ],
      errorColor: [
        '#443108',
        '#532D0B',
        '#63250F',
        '#721713',
        '#801728',
        '#923455',
        '#A4527E',
        '#B671A3',
        '#C790C2',
        '#D4AFD8',
        '#E1CFE8'
      ].reverse() as any
    },
    primaryColor: 'brandPrimary',
  }} withGlobalStyles withNormalizeCSS>
    <NotificationsProvider>
      <HookResponseHandler>
        <Router />
      </HookResponseHandler>
    </NotificationsProvider>
  </MantineProvider>)
}
else console.error("Unable to find #app-container in document")