import React, { useEffect, useState } from 'react';
import { Box, Button, Loader, Text } from '@mantine/core';
import { GameDuel, GamePlayer } from '@qrTypes';
import { useParams, useSearchParams } from 'react-router-dom';
import { useServerResource } from '../../hooks/useServerResource';
import RecipientToDuelModal from '../../components/RecipientToDuelModal';

export default function PlayerRoute () {
  const { playerUuid } = useParams();
  const [searchParams] = useSearchParams();
  const isDuel = searchParams.get('duel') !== undefined;
  const [duelModalOpen, setDuelModalOpen] = useState(false);

  const {
    data: player,
    isLoading: isLoadingActivity,
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
    if( isLoadingActivity ) return <Loader />
    if( loadPlayerError ) return <Text color="red">Error loading player {loadPlayerError?.message}</Text>
    if( !player ) return null;
    return (
      <Box>
        You are viewing player <Text component="span" sx={{ color: "#fff", backgroundColor: "blue", borderRadius: '4px', padding: '0 4px' }}>{player.name}</Text>
      </Box>
    )
  }

  const duelSection = () => {
    if( isLoadingDuels ) return <Loader />
    if( loadDuelsError ) return <Text color="red">Error loading duels: {loadDuelsError?.message}</Text>
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