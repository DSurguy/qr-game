import { Box, Loader, Text } from '@mantine/core';
import React, { useContext} from 'react';
import { PlayerContext } from '../context/player';

export default function ProfileRoute() {
  const { player } = useContext(PlayerContext);

  const playerChunk = () => {
    if( !player ) return <Loader />;
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Text sx={{ fontSize: '2.5rem'}}>{player.name}</Text>
      </Box>
    )
  }

  return <Box>
    {playerChunk()}
  </Box>
}