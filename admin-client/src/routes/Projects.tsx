import React, { useEffect, useState } from 'react';
import { Box, Button, Divider, Grid, Loader, Text, UnstyledButton, useMantineTheme} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { showNotification } from '@mantine/notifications';
import { Link } from 'react-router-dom';
import { SquarePlus } from 'tabler-icons-react';
import { ADMIN_API_BASE } from '../constants';
import { ProjectMeta } from '../types';

function useProjects(loadImmediately: boolean = false) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<null | Error>(null);
  const [projects, setProjects] = useState<ProjectMeta[]>([]);

  useEffect(() => {
    if( loadImmediately ) loadProjects()
  }, [])

  const loadProjects = () => {
    if( isLoading ) return;
    (async () => {
      try {
        setIsLoading(true);
        const result = await fetch(`${ADMIN_API_BASE}/projects`)
        const data = await result.json();
        setProjects(data as ProjectMeta[]);
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
    projects,
    loadProjects
  ] as const;
}

export function ProjectsRoute() {
  const theme = useMantineTheme();
  const isSmallScreen = useMediaQuery(`(max-width: ${theme.breakpoints.sm}px)`)
  const [
    isLoading,
    error,
    projects
  ] = useProjects(true);

  useEffect(() => {
    if( error ) {
      showNotification({
        id: 'load-projects-error-notification',
        title: 'Error loading projects',
        message: error.message,
        color: 'red'
      })
    }
  }, [error])

  const renderProject = (project: ProjectMeta) => (
    <UnstyledButton key={project.uuid} component={Link} to={`/projects/${project.uuid}`} sx={{ 
      display: 'block',
      padding: theme.spacing['xs'],
      boxSizing: 'border-box',
      textAlign: 'left',
      width: '100%',
      borderRadius: theme.radius['sm'],
      border: `1px solid ${theme.colors.gray[1]}`,
      '&:hover': {
        backgroundColor: theme.colors[theme.primaryColor]['1'],
        color: theme.colors[theme.primaryColor]['9']
      },
      marginTop: theme.spacing['xs']
    }}>
      <Grid>
        <Grid.Col xs={12}>
          <Text size="lg" weight={600}>{project.name || 'Unknown Project'}</Text>
          <Text size="sm">{project.description}</Text>
        </Grid.Col>
        <Grid.Col xs={12} sm={6}>
          <Text size="xs" color={theme.colors.gray[6]}>{project.uuid}</Text>
        </Grid.Col>
        <Grid.Col xs={12} sm={6} sx={{
          display: 'flex',
          justifyContent: isSmallScreen ? 'flex-start' : 'flex-end',
          paddingTop: isSmallScreen ? 0 : undefined
        }}>
          <Text size="xs" color={theme.colors.gray[6]}>{project.wordId}</Text>
        </Grid.Col>
      </Grid>
    </UnstyledButton>
  )

  return <Box>
    <Text>Project List</Text>
    <Button
      compact
      leftIcon={<SquarePlus size={theme.fontSizes['xl']} />}
      component={Link}
      to='/projects/create'
    >New Project</Button>
    { isLoading && <Loader size={20} />}
    <Box sx={{
      maxWidth: `700px`
    }}>
      {projects.map(renderProject)}
    </Box>
  </Box>
}