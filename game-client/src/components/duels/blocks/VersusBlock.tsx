import { Box, Grid, Text } from '@mantine/core';
import React from 'react';
import { Swords } from 'tabler-icons-react';
import { GameDuel } from '../../../qr-types';

type Props = {
  duel: GameDuel;
}

export function VersusBlock({ duel }: Props) {
  return (<Grid.Col>
    <Box sx={{ display: 'flex' }}>
      <Text sx={{ flexBasis: '45%', display: 'flex', justifyContent: 'center' }}>{duel.initiator?.name || '???'}</Text>
      <Box sx={{ flexBasis: '10%', display: 'flex', justifyContent: 'center' }}><Swords /></Box>
      <Text sx={{ flexBasis: '45%', display: 'flex', justifyContent: 'center' }}>{duel.recipient?.name || '???'}</Text>
    </Box>
  </Grid.Col>)
}