import { Box, Grid } from '@mantine/core';
import React from 'react';
import { GameDuel } from '../../../qr-types';

type Props = {
  duel: GameDuel;
}

export function ActivityBlock({ duel }: Props) {
  return (
    <Grid.Col xs={12}>
      <Box>{duel.activity.name}</Box>
    </Grid.Col>
  )
}