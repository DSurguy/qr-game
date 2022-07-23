import React from 'react';
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { RoutedPageLayout } from './components/RoutedPageLayout';
import { ProjectsRoute } from './routes/Projects';
import { CreateProjectRoute } from './routes/Projects/Create';
import { Activities } from './routes/Projects/Edit/Activities/Activities';
import Activity from './routes/Projects/Edit/Activities/Activity';
import ActivityList from './routes/Projects/Edit/Activities/ActivityList';
import CreateActivity from './routes/Projects/Edit/Activities/CreateActivity';
import { DuelActivities } from './routes/Projects/Edit/DuelActivities';
import { EditProjectRoute } from './routes/Projects/Edit/EditProject';
import Players from './routes/Projects/Edit/Players';
import { Settings } from './routes/Projects/Edit/Settings';

export function Router(){
  return <BrowserRouter>
    <Routes>
      <Route path="/" element={<RoutedPageLayout />}>
        <Route path="/projects/create" element={<CreateProjectRoute />} />
        <Route path="/projects/:projectUuid" element={<EditProjectRoute />}>
          <Route path="activities" element={<Activities />}>
            <Route path="" element={<ActivityList />} />
            <Route path="create" element={<CreateActivity />} />
            <Route path=":activityUuid" element={<Activity />} />
          </Route>
          <Route path="duelActivities" element={<DuelActivities />} />
          <Route path="settings" element={<Settings />} />
          <Route path="players" element={<Players />} />
        </Route>
        <Route path="/projects" element={<ProjectsRoute />} />
      </Route>
    </Routes>
  </BrowserRouter>
}