import React from 'react';
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { HomeRoute } from './routes/Home';
import { ProjectsRoute } from './routes/Projects';
import { CreateProjectRoute } from './routes/Projects/Create';

const MockRoute = () => <p className="font-bold text-teal-500">hi mom</p>

export function Router(){
  return <BrowserRouter>
    <Routes>
      <Route path="/" element={<HomeRoute />} />
      <Route path="/projects" element={<ProjectsRoute />} />
      <Route path="/projects/create" element={<CreateProjectRoute />} />
    </Routes>
  </BrowserRouter>
}