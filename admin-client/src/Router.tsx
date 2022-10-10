import React from 'react';
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { RoutedPageLayout } from './components/RoutedPageLayout';
import { ProjectsRoute } from './routes/Projects/Projects';
import { CreateProjectRoute } from './routes/Projects/Create';
import { Activities } from './routes/Projects/Project/Activities/Activities';
import Activity from './routes/Projects/Project/Activities/Activity';
import ActivityList from './routes/Projects/Project/Activities/ActivityList';
import CreateActivity from './routes/Projects/Project/Activities/CreateActivity';
import { ProjectRoute } from './routes/Projects/Project/Project';
import Players from './routes/Projects/Project/Players/Players';
import { Settings } from './routes/Projects/Project/Settings';
import Player from './routes/Projects/Project/Players/Player';
import PlayerList from './routes/Projects/Project/Players/PlayerList';
import { ProjectsList } from './routes/Projects/ProjectList';

export function Router(){
  return <BrowserRouter>
    <Routes>
      <Route path="/" element={<RoutedPageLayout />}>
        <Route path="/projects" element={<ProjectsRoute />}>
          <Route path="" element={<ProjectsList />} />
          <Route path="create" element={<CreateProjectRoute />} />
          <Route path=":projectUuid" element={<ProjectRoute />}>
            <Route path="activities" element={<Activities />}>
              <Route path="" element={<ActivityList />} />
              <Route path="create" element={<CreateActivity />} />
              <Route path=":activityUuid" element={<Activity />} />
            </Route>
            <Route path="settings" element={<Settings />} />
            <Route path="players" element={<Players />}>
              <Route path="" element={<PlayerList />} />
              <Route path=":playerUuid" element={<Player />} />
            </Route>
          </Route>
        </Route>
      </Route>
    </Routes>
  </BrowserRouter>
}