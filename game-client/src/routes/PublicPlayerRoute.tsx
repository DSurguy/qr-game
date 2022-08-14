import { Box, Button, Loader, Text } from '@mantine/core';
import { GamePlayerType } from '@qr-game/types';
import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useServerResource } from '../hooks/useServerResource';

export default function PublicPlayerRoute() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const projectUuid = searchParams.get('game')
  const playerUuid = searchParams.get('player')
  
  if( !projectUuid || !playerUuid ) {
    navigate('/login')
    return null;
  }

  const {
    data: player,
    isLoading: isLoadingPlayer,
    loadError: loadPlayerError,
    load: loadPlayer
  } = useServerResource<GamePlayerType, GamePlayerType>({
    load: `public/player/${playerUuid}?projectUuid=${projectUuid}`,
  })

  useEffect(() => {
    loadPlayer();
  }, [])

  if( isLoadingPlayer ) return <Loader />
  if( loadPlayerError ) return <Text color="red">Error loading player {loadPlayerError?.message}</Text>
  if( !player ) return null;
  return (
    <Box>
      <Text>{player.uuid}</Text>
      <Text>{player.wordId}</Text>
      <Button>Claim Player</Button>
    </Box>
  )
}