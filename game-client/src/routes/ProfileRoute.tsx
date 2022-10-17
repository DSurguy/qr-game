import { Box, Loader, Text, useMantineTheme } from '@mantine/core';
import { GamePlayer, GameProject } from '../qr-types';
import React, { useEffect } from 'react';
import { useServerResource } from '../hooks/useServerResource';

export default function ProfileRoute() {
  const theme = useMantineTheme();
  const {
    data: player,
    isLoading: isLoadingPlayer,
    loadError: loadPlayerError,
    load: loadPlayer
  } = useServerResource<GamePlayer, GamePlayer>({
    load: 'game/me',
  })

  const {
    data: playerBalance,
    isLoading: isLoadingPlayerBalance,
    loadError: loadPlayerBalanceError,
    load: loadPlayerBalance
  } = useServerResource<null, number>({
    load: 'game/me/balance',
  })

  useEffect(() => {
    loadPlayer();
    loadPlayerBalance();
  }, [])

  const playerChunk = () => {
    if( isLoadingPlayer ) return <Loader />
    if( loadPlayerError ) return <Text color={theme.colors['errorColor'][4]}>Error loading player {loadPlayerError?.message}</Text>
    if( !player ) return null;
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Text sx={{ fontSize: '2.5rem'}}>{player.name}</Text>
      </Box>
    )
  }

  const balanceChunk = () => {
    if( isLoadingPlayerBalance ) return <Loader />
    if( loadPlayerBalanceError ) return <Text color={theme.colors['errorColor'][4]}>Error loading balance {loadPlayerError?.message}</Text>
    if( typeof playerBalance !== "number" ) return null;
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', fontSize: '2rem', backgroundColor: theme.colors[theme.primaryColor][5] }}>
        <Text sx={{ marginRight: '0.5rem'}}>{playerBalance}</Text><Text>Points</Text>
      </Box>
    )
  }

  return <Box>
    {playerChunk()}
    {balanceChunk()}
  </Box>
}