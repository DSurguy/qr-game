import React from 'react';
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { RoutedPageLayout } from './components/RoutedPageLayout';
import { ProjectsRoute } from './routes/Projects';
import { CreateProjectRoute } from './routes/Projects/Create';
import { Activities } from './routes/Projects/Project/Activities/Activities';
import Activity from './routes/Projects/Project/Activities/Activity';
import ActivityList from './routes/Projects/Project/Activities/ActivityList';
import CreateActivity from './routes/Projects/Project/Activities/CreateActivity';
import DuelActivities from './routes/Projects/Project/DuelActivities/DuelActivities';
import { ProjectRoute } from './routes/Projects/Project/Project';
import Players from './routes/Projects/Project/Players/Players';
import { Settings } from './routes/Projects/Project/Settings';
import Player from './routes/Projects/Project/Players/Player';
import PlayerList from './routes/Projects/Project/Players/PlayerList';
import DuelActivityList from './routes/Projects/Project/DuelActivities/DuelActivityList';
import CreateDuelActivity from './routes/Projects/Project/DuelActivities/CreateDuelActivity';
import DuelActivity from './routes/Projects/Project/DuelActivities/DuelActivity';

export function Router(){
  return <BrowserRouter>
    <Routes>
      <Route path="/" element={<RoutedPageLayout />}>
        <Route path="/projects/create" element={<CreateProjectRoute />} />
        <Route path="/projects/:projectUuid" element={<ProjectRoute />}>
          <Route path="activities" element={<Activities />}>
            <Route path="" element={<ActivityList />} />
            <Route path="create" element={<CreateActivity />} />
            <Route path=":activityUuid" element={<Activity />} />
          </Route>
          <Route path="duelActivities" element={<DuelActivities />}>
            <Route path="" element={<DuelActivityList />} />
            <Route path="create" element={<CreateDuelActivity />} />
            <Route path=":duelActivityUuid" element={<DuelActivity />} />
          </Route>
          <Route path="settings" element={<Settings />} />
          <Route path="players" element={<Players />}>
            <Route path="" element={<PlayerList />} />
            <Route path=":playerUuid" element={<Player />} />
          </Route>
        </Route>
        <Route path="/projects" element={<ProjectsRoute />} />
      </Route>
    </Routes>
  </BrowserRouter>
}