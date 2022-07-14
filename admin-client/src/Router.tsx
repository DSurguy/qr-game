import React from 'react';
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { RoutedPageLayout } from './components/RoutedPageLayout';
import { ProjectsRoute } from './routes/Projects';
import { CreateProjectRoute } from './routes/Projects/Create';

export function Router(){
  return <BrowserRouter>
    <Routes>
      <Route path="/" element={<RoutedPageLayout />}>
        <Route path="/projects/create" element={<CreateProjectRoute />} />
        <Route path="/projects" element={<ProjectsRoute />} />
      </Route>
    </Routes>
  </BrowserRouter>
}