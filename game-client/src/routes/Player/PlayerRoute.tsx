import React, { useEffect, useState } from 'react';
import { Box, Button, Loader, Text, useMantineTheme } from '@mantine/core';
import { GameDuel, GamePlayer } from '../../qr-types';
import { useParams } from 'react-router-dom';
import { useServerResource } from '../../hooks/useServerResource';
import RecipientToDuelModal from '../../components/RecipientToDuelModal';

export default function PlayerRoute () {
  const { playerUuid } = useParams();
  const [duelModalOpen, setDuelModalOpen] = useState(false);
  const theme = useMantineTheme();

  const {
    data: player,
    isLoading: isLoadingPlayer,
    loadError: loadPlayerError,
    load: loadPlayer
  } = useServerResource<null, GamePlayer>({
    load: `game/players/${playerUuid}`,
  })

  const {
    data: duels,
    isLoading: isLoadingDuels,
    loadError: loadDuelsError,
    load: loadDuels
  } = useServerResource<undefined, GameDuel[]>({
    load: `game/duels?recipient=${playerUuid}&active`,
  })

  useEffect(() => {
    loadPlayer();
    loadDuels();
  }, [])

  const playerSection = () => {
    if( isLoadingPlayer ) return <Loader />
    if( loadPlayerError ) return <Text color={theme.colors['errorColor'][7]}>Error loading player {loadPlayerError?.message}</Text>
    if( !player ) return null;
    return (
      <Box>
        You are viewing player <Text component="span" sx={{ color: "#fff", backgroundColor: "blue", borderRadius: '4px', padding: '0 4px' }}>{player.name}</Text>
      </Box>
    )
  }

  const duelSection = () => {
    if( isLoadingDuels ) return <Loader />
    if( loadDuelsError ) return <Text color={theme.colors['errorColor'][7]}>Error loading duels: {loadDuelsError?.message}</Text>
    if( !duels ) return null;
    const setUpDuelButton = (<Button onClick={() => setDuelModalOpen(true)}>Start Duel</Button>);
    const alreadyDuelingButton = <Button disabled>Duel In Progress</Button>
    return <>
      {duels.length ? alreadyDuelingButton : setUpDuelButton}
      {(duelModalOpen && player)
        ? <RecipientToDuelModal recipient={player} opened={duelModalOpen} onClose={() => setDuelModalOpen(false)} />
        : null
      }
    </>
  }

  return <>
    {playerSection()}
    {duelSection()}
  </>
}