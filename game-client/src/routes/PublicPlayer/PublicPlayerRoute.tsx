import { Box, Button, Loader, Text, UnstyledButton, useMantineTheme } from '@mantine/core';
import { GamePlayer } from '../../qr-types';
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useServerResource } from '../../hooks/useServerResource';
import ClaimPlayerModal from './ClaimPlayerModal';
import { UserPlus } from 'tabler-icons-react';

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
  if( loadPlayerError ) return <Text color={theme.colors['errorColor'][4]}>Error loading player {loadPlayerError?.message}</Text>
  if( !player ) return null;
  return (
    <Box>
      <Text sx={{ fontSize: '1.5rem', textAlign: 'center', marginBottom: '1rem' }}>Unclaimed Player</Text>
      <Box sx={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
        <Text sx={{ padding: '0.25rem 1rem', borderRadius: theme.radius.md, backgroundColor: theme.colors.dark[5] }}>{player.uuid}</Text>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
        <Text sx={{ padding: '0.25rem 1rem', borderRadius: theme.radius.md, backgroundColor: theme.colors.dark[5] }}>{player.wordId}</Text>
      </Box>
      <Box sx={{
        borderRadius: theme.radius.md,
        backgroundColor: theme.colors.dark,
        textAlign: 'center',
        padding: '1rem',
        boxSizing: 'border-box'
      }}>
        <Text sx={{ marginBottom: '1rem'}}>To join the game, claim this player and choose a display name!</Text>
        <Text>Once claimed, you can use your player QR Code to log in!</Text>
      </Box>
      <UnstyledButton onClick={() => setModalOpen(true)} sx={{
        backgroundColor: theme.colors[theme.primaryColor][8],
        borderRadius: theme.radius.md,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '1rem 2rem',
        margin: '1rem auto'
      }}>
        <UserPlus />
        <Text>Claim Player</Text>
      </UnstyledButton>
      <ClaimPlayerModal opened={modalOpen} onClose={() => setModalOpen(false)} projectUuid={projectUuid} playerUuid={playerUuid} />
    </Box>
  )
}