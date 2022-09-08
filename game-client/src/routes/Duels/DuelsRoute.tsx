import React, { useEffect } from 'react';
import { Box, Loader, Text } from '@mantine/core';
import { useServerResource } from '../../hooks/useServerResource';
import { GameDuel } from '../../qr-types';

export default function DuelsRoute() {
  const {
    data: duels,
    isLoading: isLoadingDuels,
    loadError: loadDuelsError,
    load: loadDuels
  } = useServerResource<undefined, GameDuel[]>({
    load: `game/duels`,
  })

  useEffect(() => {
    loadDuels();
  }, [])
  
  if( isLoadingDuels ) return <Loader />
  if( loadDuelsError ) return <Text color="red">Error loading player {loadDuelsError?.message}</Text>
  if( !duels ) return null;
  return (
    <Box>
      {duels.map(duel => (
        <Box key={duel.uuid} sx={{ display: 'flex' }}>
          {duel.activity.name}
          {duel.state}
        </Box>
      ))}
    </Box>
  )
}