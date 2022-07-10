import React from 'react';
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { HomeRoute } from './routes/Home';

const MockRoute = () => <p className="font-bold text-teal-500">hi mom</p>

export function Router(){
  return <BrowserRouter>
    <Routes>
      <Route path="/" element={<HomeRoute />} />
    </Routes>
  </BrowserRouter>
}