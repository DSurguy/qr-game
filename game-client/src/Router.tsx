import { Box } from '@mantine/core';
import React from 'react';
import { BrowserRouter, Route, Routes } from "react-router-dom";
import AuthLayout from './components/layout/AuthLayout';
import PublicLayout from './components/layout/PublicLayout';
import CameraTestRoute from './routes/CameraTest';
import EntryPortalRoute from './routes/EntryPortal';
import LoginRoute from './routes/LoginRoute';
import ProfileRoute from './routes/ProfileRoute';
import RedirectRoute from './routes/RedirectRoute';

const MockRoute = () => <p className="font-bold text-teal-500">hi mom</p>
const QrTestRoute = () => <Box><CameraTestRoute onQrPayload={() => {}} /></Box>

export function Router(){
  return <BrowserRouter>
    <Routes>
      <Route path="/game" element={<AuthLayout />}>
        <Route path="me" element={<ProfileRoute />} />
      </Route>
      <Route path="/" element={<PublicLayout />}>
        <Route path="" element={<RedirectRoute />} />
        <Route path="/cam" element={<QrTestRoute />} />
        <Route path="/login" element={<LoginRoute />}/>
        <Route path="/portal" element={<EntryPortalRoute />}/>
      </Route>
    </Routes>
  </BrowserRouter>
}