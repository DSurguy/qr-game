import React, { useEffect } from 'react';
import { Box, Loader, Tabs, Text, } from '@mantine/core';
import { SavedProjectType } from '@qr-game/types';
import { matchPath, Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useServerResource } from '../../../hooks/useServerResource';

enum ProjectTab {
  activities = 0,
  duelActivities = 1,
  settings = 2
}

export function EditProjectRoute() {
  const { projectUuid } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const {
    isLoading,
    loadError,
    data: project,
    load
  } = useServerResource<SavedProjectType, SavedProjectType>({
    load: `projects/${projectUuid}`
  })

  const locationToTab = () => {
    if( matchPath({ path: "projects/:id/activities", end: false }, location.pathname) ) return ProjectTab.activities
    else if( matchPath({ path: "projects/:id/duelActivities", end: false }, location.pathname) ) return ProjectTab.duelActivities
    else if( matchPath({ path: "projects/:id/settings", end: false }, location.pathname) ) return ProjectTab.settings
  }

  const activeTab = locationToTab();

  useEffect(() => {
    load();
  }, [])

  useEffect(() => {
    if( project && activeTab === undefined ) navigate("activities");
  }, [project])

  const onTabChange = (tab: number) => {
    switch(tab){
      case ProjectTab.activities: navigate("activities"); break;
      case ProjectTab.duelActivities: navigate("duelActivities"); break;
      case ProjectTab.settings: navigate("settings"); break;
    }
  };
  
  if( isLoading ) return <Loader />
  if( loadError ) return <Text color="red">{loadError ? loadError.message : "Error loading project"}</Text>
  if( !project ) return null;
  return <Box style={{maxWidth: `700px`}}>
    <Text component="h1" size="xl">{project.name}</Text>
    <Text component="p">{project.description}</Text>
    <Tabs active={activeTab} onTabChange={onTabChange} sx={{ marginBottom: '0.5rem'}}>
      <Tabs.Tab label="Activities" />
      <Tabs.Tab label="Duel Activities" />
      <Tabs.Tab label="Settings" />
    </Tabs>
    <Outlet />
  </Box>
}