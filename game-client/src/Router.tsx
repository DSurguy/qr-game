import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AuthLayout from './components/layout/AuthLayout';
import PublicLayout from './components/layout/PublicLayout';
import EntryPortalRoute from './routes/EntryPortal';
import LoginRoute from './routes/LoginRoute';
import ProfileRoute from './routes/ProfileRoute';
import PublicPlayerRoute from './routes/PublicPlayerRoute';
import RedirectRoute from './routes/RedirectRoute';

export function Router(){
  return <BrowserRouter>
    <Routes>
      <Route path="/game" element={<AuthLayout />}>
        <Route path="me" element={<ProfileRoute />} />
      </Route>
      <Route path="/" element={<PublicLayout />}>
        <Route path="" element={<RedirectRoute />} />
        <Route path="/login" element={<LoginRoute />} />
        <Route path="/portal" element={<EntryPortalRoute />} />
        <Route path="/player" element={<PublicPlayerRoute />} />
      </Route>
    </Routes>
  </BrowserRouter>
}