import React, { useEffect } from 'react';
import { Box, Button, Grid, Loader, Text, UnstyledButton, useMantineTheme} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { Link } from 'react-router-dom';
import { SquarePlus } from 'tabler-icons-react';
import { useServerResource } from '../../hooks/useServerResource';
import { SavedProjectType } from '@qr-game/types';

export function ProjectsList() {
  const theme = useMantineTheme();
  const isSmallScreen = useMediaQuery(`(max-width: ${theme.breakpoints.sm}px)`)
  const {
    data: projects,
    isLoading,
    loadError,
    load
  } = useServerResource<null, SavedProjectType[]>({
    load: `projects`
  });

  useEffect(() => {
    load();
  }, [])

  const renderProject = (project: SavedProjectType) => (
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

  if( isLoading ) return <Loader />
  if( loadError ) return <Text color="red">{loadError ? loadError.message : "Error loading activities"}</Text>
  if( !projects ) return null;
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