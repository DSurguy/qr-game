import { Box, useMantineTheme } from '@mantine/core';
import React from 'react';
import { GameDuel } from '../../qr-types';
import { ActivityBlock } from './blocks/ActivityBlock';
import { StateBlock } from './blocks/StateBlock';
import { VersusBlock } from './blocks/VersusBlock';

type Props = {
  duel: GameDuel;
}

export function CancelledDuel({ duel }: Props) {
  const theme = useMantineTheme();
  return (
    <Box sx={{
      backgroundColor: theme.colors.dark[4],
      opacity: '0.5',
      borderRadius: theme.radius.sm,
      margin: '0.25rem 0 0.5rem 0',
      padding: '0.5rem'
    }}>
      <StateBlock duel={duel} />
      <VersusBlock duel={duel} />
      <ActivityBlock duel={duel} />
    </Box>
  )
}