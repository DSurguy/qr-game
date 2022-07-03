import "core-js/stable";
import React from 'react';
import { createRoot } from 'react-dom/client';
import { Router } from './Router';
import './main.css';

const appRoot = createRoot(document.querySelector('#app-container'))
appRoot.render(<Router />)