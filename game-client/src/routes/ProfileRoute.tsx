import { Box, Button, Grid, Loader, Text, useMantineTheme } from '@mantine/core';
import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { PremiumRights, Stack2, Swords } from 'tabler-icons-react';
import { PlayerContext } from '../context/player';

export default function ProfileRoute() {
  const { player } = useContext(PlayerContext);
  const navigate = useNavigate();

  const playerChunk = () => {
    if( !player ) return <Loader />;
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Text sx={{ fontSize: '2.5rem'}}>{player.name}</Text>
      </Box>
    )
  }

  const navigationChunk = () => (
    <Grid sx={{ paddingTop: '1rem' }}>
      <Grid.Col span={6}>
        <Button color="dark" fullWidth onClick={() => navigate('/game/store')}><PremiumRights /><Text sx={{ marginLeft: '0.5rem' }}>Store</Text></Button>
        <Button color="dark" fullWidth onClick={() => navigate('/game/inventory')} sx={{ marginTop: '1rem'}}><Stack2 /><Text sx={{ marginLeft: '0.5rem' }}>Inventory</Text></Button>
      </Grid.Col>
      <Grid.Col span={6}>
        <Button color="dark" fullWidth onClick={() => navigate('/game/duels')}><Swords /><Text sx={{ marginLeft: '0.5rem' }}>Duels</Text></Button>
      </Grid.Col>
    </Grid>
  )

  return <Box>
    {playerChunk()}
    {navigationChunk()}
  </Box>
}