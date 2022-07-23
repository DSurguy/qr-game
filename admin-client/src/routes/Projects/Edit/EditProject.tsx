import React, { useEffect, useState } from 'react';
import { Box, Loader, Tabs, Text, } from '@mantine/core';
import { SavedProjectType } from '@qr-game/types';
import { ADMIN_API_BASE } from '../../../constants';
import { matchPath, Outlet, useLocation, useMatch, useNavigate, useParams } from 'react-router-dom';

function useProject(projectUuid: string) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<null | Error>(null);
  const [project, setProject] = useState<null | SavedProjectType>(null);

  const load = () => {
    if( isLoading ) return;
    (async () => {
      try {
        setIsLoading(true);
        const result = await fetch(`${ADMIN_API_BASE}/projects/${projectUuid}`)
        const data = await result.json();
        setProject(data as SavedProjectType);
        setError(null);
      } catch (e) {
        setError(e);
      } finally {
        setIsLoading(false);
      }
    })()
  }
  return [
    isLoading,
    error,
    project,
    load
  ] as const;
}

enum ProjectTab {
  activities = 0,
  duelActivities = 1,
  settings = 2
}

export function EditProjectRoute() {
  const { projectUuid } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [ isLoading, error, project, load ] = useProject(projectUuid);

  const locationToTab = () => {
    if( matchPath({ path: "projects/:id/activities" }, location.pathname) ) return ProjectTab.activities
    else if( matchPath({ path: "projects/:id/duelActivities" }, location.pathname) ) return ProjectTab.duelActivities
    else if( matchPath({ path: "projects/:id/settings" }, location.pathname) ) return ProjectTab.settings
  }

  const activeTab = locationToTab();

  useEffect(() => {
    load();
  }, [])

  useEffect(() => {
    if( project ) navigate("activities");
  }, [project])

  const onTabChange = (tab: number) => {
    switch(tab){
      case ProjectTab.activities: navigate("activities"); break;
      case ProjectTab.duelActivities: navigate("duelActivities"); break;
      case ProjectTab.settings: navigate("settings"); break;
    }
  };
  
  if( isLoading ) return <Loader />
  if( error ) return <Text color="red">{error ? error.message : "Error loading project"}</Text>
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