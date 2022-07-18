import React, { useEffect, useState } from 'react';
import { Box } from '@mantine/core';
import { SavedProjectType } from '@qr-game/types';
import { ADMIN_API_BASE } from '../../constants';
import { useParams } from 'react-router-dom';

function useProject(projectUuid: string, loadImmediately: boolean = false) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<null | Error>(null);
  const [project, setProject] = useState<null | SavedProjectType>(null);

  useEffect(() => {
    if( loadImmediately ) load()
  }, [])

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
  const [ isLoading, error, project, load ] = useProject(projectUuid, true);
  return <Box>
    {project && project.name}
  </Box>
}