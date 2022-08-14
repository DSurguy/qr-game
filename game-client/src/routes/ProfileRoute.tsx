import { Box, Loader, Text } from '@mantine/core';
import { GamePlayerType, GameProjectType } from '@qr-game/types';
import React, { useEffect } from 'react';
import { useServerResource } from '../hooks/useServerResource';

export default function ProfileRoute() {
  const {
    data: project,
    isLoading: isLoadingProject,
    loadError: loadProjectError,
    load: loadProject
  } = useServerResource<GameProjectType, GameProjectType>({
    load: 'game',
  })

  const {
    data: player,
    isLoading: isLoadingPlayer,
    loadError: loadPlayerError,
    load: loadPlayer
  } = useServerResource<GamePlayerType, GamePlayerType>({
    load: 'game/me',
  })

  useEffect(() => {
    loadProject();
    loadPlayer();
  }, [])

  const projectChunk = () => {
    if( isLoadingProject ) return <Loader />
    if( loadProjectError ) return <Text color="red">Error loading project {loadProjectError?.message}</Text>
    if( !project ) return null;
    return (
      <Box>
        You are playing <Text component="span" sx={{ color: "#fff", backgroundColor: "green", borderRadius: '4px', padding: '0 4px' }}>{project.name}</Text>
      </Box>
    )
  }

  const playerChunk = () => {
    if( isLoadingPlayer ) return <Loader />
    if( loadPlayerError ) return <Text color="red">Error loading player {loadPlayerError?.message}</Text>
    if( !player ) return null;
    return (
      <Box>
        As <Text component="span" sx={{ color: "#fff", backgroundColor: "blue", borderRadius: '4px', padding: '0 4px' }}>{player.name}</Text>
      </Box>
    )
  }

  return <Box>
    {projectChunk()}
    {playerChunk()}
  </Box>
}