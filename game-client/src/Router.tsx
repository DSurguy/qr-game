import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AuthLayout from './components/layout/AuthLayout';
import PublicLayout from './components/layout/PublicLayout';
import ActivityRoute from './routes/Activity/ActivityRoute';
import DuelsRoute from './routes/Duels/DuelsRoute';
import EntryPortalRoute from './routes/EntryPortal';
import LoginRoute from './routes/LoginRoute';
import PlayerRoute from './routes/Player/PlayerRoute';
import ProfileRoute from './routes/ProfileRoute';
import PublicActivityRoute from './routes/PublicActivity';
import PublicPlayerRoute from './routes/PublicPlayer/PublicPlayerRoute';
import RedirectRoute from './routes/RedirectRoute';

export function Router(){
  return <BrowserRouter>
    <Routes>
      <Route path="/game" element={<AuthLayout />}>
        <Route path="me" element={<ProfileRoute />} />
        <Route path="activity">
          <Route path="" element={<Navigate to="/game/me" />} />
          <Route path=":activityUuid" element={<ActivityRoute />} />
        </Route>
        <Route path="player">
          <Route path="" element={<Navigate to="/game/me" />} />
          <Route path=":playerUuid" element={<PlayerRoute />} />
        </Route>
        <Route path="duels">
          <Route path="" element={<DuelsRoute />} />
        </Route>
      </Route>
      <Route path="/" element={<PublicLayout />}>
        <Route path="" element={<RedirectRoute />} />
        <Route path="login" element={<LoginRoute />} />
        <Route path="portal" element={<EntryPortalRoute />} />
        <Route path="player" element={<PublicPlayerRoute />} />
        <Route path="activity" element={<PublicActivityRoute />} />
      </Route>
    </Routes>
  </BrowserRouter>
}