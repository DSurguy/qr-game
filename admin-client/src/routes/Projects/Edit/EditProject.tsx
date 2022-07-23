import React, { useEffect, useState } from 'react';
import { Box, Divider, Grid, Loader, Tabs, Text, UnstyledButton, useMantineTheme } from '@mantine/core';
import { SavedProjectType } from '@qr-game/types';
import { ADMIN_API_BASE } from '../../../constants';
import { useParams } from 'react-router-dom';
import { faker } from '@faker-js/faker';
import { Activities } from './Activities/Activities';
import { DuelActivities } from './DuelActivities';
import { Settings } from './Settings';

function useProject(projectUuid: string, loadImmediately: boolean = false) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<null | Error>(null);
  const [project, setProject] = useState<null | SavedProjectType>(null);

  useEffect(() => {
    if( loadImmediately ) load()
  }, [projectUuid])

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

export function EditProjectRoute() {
  const { projectUuid } = useParams();
  const theme = useMantineTheme();
  const [ isLoading, error, project, load ] = useProject(projectUuid, true);

  if( isLoading ) return <Loader />
  if( error || !project ) return <Text color="red">{error ? error.message : "Error loading project"}</Text>
  return <Box style={{maxWidth: `700px`}}>
    <Text component="h1" size="xl">{project.name}</Text>
    <Text component="p">{project.description}</Text>
    <Tabs>
      <Tabs.Tab label="Activities"><Activities /></Tabs.Tab>
      <Tabs.Tab label="Duel Activities"><DuelActivities /></Tabs.Tab>
      <Tabs.Tab label="Settings"><Settings /></Tabs.Tab>
    </Tabs>
  </Box>
}