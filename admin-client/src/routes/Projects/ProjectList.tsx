import React, { useEffect, useState } from 'react';
import { Box, Button, Grid, Loader, Text, TextInput, UnstyledButton, useMantineTheme} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { Link, useNavigate } from 'react-router-dom';
import { SquarePlus } from 'tabler-icons-react';
import { useServerResource } from '../../hooks/useServerResource';
import { SavedProjectType } from '@qr-game/types';
import fuzzysort from 'fuzzysort';
import useDebouncedState from '../../hooks/useDebouncedState';

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
  const navigate = useNavigate();
  const [search, setSearch, isDebouncingSearch] = useDebouncedState("");
  const [filteredProjects, setFilteredProjects] = useState<typeof projects>([]);

  useEffect(() => {
    load();
  }, [])

  useEffect(() => {
    if( projects && search ) {
      const results = fuzzysort.go(search, projects, {
        limit: 50,
        keys: ['name', 'uuid', 'wordId'],
        threshold: -10000
      })
      setFilteredProjects(results.map(result => result.obj));
    }
    else setFilteredProjects(projects)
  }, [projects, search])

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

  const projectContent = () => filteredProjects.map(project => renderProject(project))

  if( isLoading ) return <Loader />
  if( loadError ) return <Text color="red">{loadError ? loadError.message : "Error loading activities"}</Text>
  if( !filteredProjects ) return null;
  return <Box>
    <Grid>
      <Grid.Col xs={12} sm={6}>
        <TextInput
          placeholder="Search"
          onChange={({ currentTarget: { value }}) => setSearch(value)}
          rightSection={isDebouncingSearch ? <Loader size="xs" /> : null}
        />
      </Grid.Col>
      <Grid.Col xs={12} sm={6}>
        <Button
          onClick={() => navigate('./create')}
        >Create New Project</Button>
      </Grid.Col>
      <Grid.Col xs={12}>
        {projectContent()}
      </Grid.Col>
    </Grid>
  </Box>
}