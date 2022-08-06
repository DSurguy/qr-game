import { Box } from '@mantine/core';
import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AuthLayout from './components/layouts/AuthLayout';
import CameraTestRoute from './routes/CameraTest';
import EntryPortalRoute from './routes/EntryPortal';
import ProfileRoute from './routes/ProfileRoute';

const MockRoute = () => <p className="font-bold text-teal-500">hi mom</p>
const QrTestRoute = () => <Box><CameraTestRoute onQrPayload={() => {}} /></Box>

export function Router(){
  return <BrowserRouter>
    <Routes>
      <Route path="/" element={<MockRoute />} />
      <Route path="/cam" element={<QrTestRoute />} />
      <Route path="/portal" element={<EntryPortalRoute />}/>
      <Route path="/game" element={<AuthLayout />}>
        <Route path="me" element={<ProfileRoute />} />
      </Route>
    </Routes>
  </BrowserRouter>
}