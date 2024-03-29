import { Box, Button, Grid, Loader, Text, TextInput, UnstyledButton, useMantineTheme } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { SavedPlayer } from '@qrTypes';
import fuzzysort from 'fuzzysort';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Alien, UserCheck } from 'tabler-icons-react';
import useDebouncedState from '../../../../hooks/useDebouncedState';
import { useServerResource } from '../../../../hooks/useServerResource';
import AddPlayersModal from './AddPlayersModal';

export default function PlayerList() {
  const { projectUuid } = useParams();
  const {
    data: players,
    isLoading,
    loadError,
    load
  } = useServerResource<SavedPlayer[], SavedPlayer[]>({
    load: `projects/${projectUuid}/players`
  })
  const theme = useMantineTheme();
  const isExtraSmallScreen = useMediaQuery(`(max-width: ${theme.breakpoints.sm}px)`);
  const navigate = useNavigate();
  const [search, setSearch, isDebouncingSearch] = useDebouncedState("");
  const [filteredPlayers, setFilteredPlayers] = useState<typeof players>([]);
  const [addPlayerModalOpen, setAddPlayerModalOpen] = useState(false);

  useEffect(() => {
    load();
  }, [])

  useEffect(() => {
    if( players && search ) {
      const results = fuzzysort.go(search, players, {
        limit: 50,
        keys: ['name', 'uuid', 'wordId'],
        threshold: -10000
      })
      setFilteredPlayers(results.map(result => result.obj));
    }
    else setFilteredPlayers(players)
  }, [players, search])

  const renderPlayer = (player: SavedPlayer) => (
    <UnstyledButton sx={{ 
      display: 'block',
      padding: theme.spacing['xs'],
      boxSizing: 'border-box',
      textAlign: 'left',
      width: '100%',
      borderRadius: theme.radius['sm'],
      '&:hover': {
        backgroundColor: theme.colors[theme.primaryColor]['1'],
        color: theme.colors[theme.primaryColor]['9'],
        '&:nth-of-type(odd)': {
          backgroundColor: theme.colors[theme.primaryColor]['1'],
        }
      },
      marginTop: theme.spacing['xs'],
      '&:nth-of-type(odd)': {
        backgroundColor: theme.colors.gray[1]
      }
    }} key={player.uuid} onClick={() => navigate(`./${player.uuid}`)}>
      <Grid>
        <Grid.Col xs={12} sm={9}>
          <Text component="h3" sx={{ margin: 0, fontSize: '1.4rem' }}>{player.name || 'UNCLAIMED'}</Text>
          <Text size="xs" color={theme.colors.gray[6]}>{player.uuid}</Text>
          <Text size="xs" color={theme.colors.gray[6]}>{player.wordId}</Text>
        </Grid.Col>
        <Grid.Col xs={12} sm={3} sx={{ display: 'flex', justifyContent: 'center'}}>
          <Box sx={{
            borderRadius: theme.radius.md,
            backgroundColor: (player.claimed ? theme.colors.green : theme.colors[theme.primaryColor])[1],
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: isExtraSmallScreen ? '80%' : '5rem',
            height: '4rem'
          }}>
            <Box color="blue">
              { player.claimed ? <UserCheck /> : <Alien /> }
            </Box>
          </Box>
        </Grid.Col>
      </Grid>
    </UnstyledButton>
  );

  const playerContent = () => filteredPlayers.map(player => renderPlayer(player)) 

  if( isLoading ) return <Loader />
  if( loadError ) return <Text color="red">{loadError ? loadError.message : "Error loading activities"}</Text>
  if( !filteredPlayers ) return null;
  return (<Box>
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
          onClick={() => setAddPlayerModalOpen(true)}
        >Add More Players</Button>
      </Grid.Col>
      <Grid.Col xs={12}>
        {playerContent()}
      </Grid.Col>
    </Grid>
    <AddPlayersModal
      opened={addPlayerModalOpen}
      onClose={() => {
        setAddPlayerModalOpen(false);
        load();
      }}
    />
  </Box>)
}