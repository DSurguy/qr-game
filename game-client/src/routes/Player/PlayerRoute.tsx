import React, { useEffect, useState } from 'react';
import { Box, Button, Loader, Text, useMantineTheme } from '@mantine/core';
import { GameDuel, GamePlayer } from '../../qr-types';
import { useNavigate, useParams } from 'react-router-dom';
import { useServerResource } from '../../hooks/useServerResource';
import RecipientToDuelModal from '../../components/RecipientToDuelModal';
import { CaretRight, Swords } from 'tabler-icons-react';

export default function PlayerRoute () {
  const { playerUuid } = useParams();
  const navigate = useNavigate();
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

  const onModalClose = (shouldReload: boolean = false) => {
    if( shouldReload ) loadDuels();
    setDuelModalOpen(false);
  }

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

  const duelSection = () => {
    if( isLoadingDuels ) return <Loader />
    if( loadDuelsError ) return <Text color={theme.colors['errorColor'][4]}>Error loading duels: {loadDuelsError?.message}</Text>
    if( !duels ) return null;
    const setUpDuelButton = (<Button onClick={() => setDuelModalOpen(true)}><Swords /><Text sx={{ marginLeft: '0.5rem'}}>Duel</Text></Button>);
    const alreadyDuelingSection = <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <Swords /> <Text sx={{ marginLeft: '0.5rem' }}>Duel In Progress</Text>
      <Button variant="subtle" onClick={() => navigate('/game/duels')}>Go To Duels <CaretRight /></Button>
    </Box>
    return <>
      {duels.length ? alreadyDuelingSection : setUpDuelButton}
      {(duelModalOpen && player)
        ? <RecipientToDuelModal recipient={player} opened={duelModalOpen} onClose={onModalClose} />
        : null
      }
    </>
  }

  return <>
    {playerChunk()}
    {duelSection()}
  </>
}