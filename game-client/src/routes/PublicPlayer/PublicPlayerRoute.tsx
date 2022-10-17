import { Box, Button, Loader, Text, useMantineTheme } from '@mantine/core';
import { GamePlayer } from '../../qr-types';
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useServerResource } from '../../hooks/useServerResource';
import ClaimPlayerModal from './ClaimPlayerModal';

export default function PublicPlayerRoute() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const theme = useMantineTheme();
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
  } = useServerResource<GamePlayer, GamePlayer>({
    load: `public/player/${playerUuid}?projectUuid=${projectUuid}`,
  })
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    loadPlayer();
  }, [])

  if( isLoadingPlayer ) return <Loader />
  if( loadPlayerError ) return <Text color={theme.colors['errorColor'][7]}>Error loading player {loadPlayerError?.message}</Text>
  if( !player ) return null;
  return (
    <Box>
      <Text>{player.uuid}</Text>
      <Text>{player.wordId}</Text>
      <Button onClick={() => setModalOpen(true)}>Claim Player</Button>
      <ClaimPlayerModal opened={modalOpen} onClose={() => setModalOpen(false)} projectUuid={projectUuid} playerUuid={playerUuid} />
    </Box>
  )
}