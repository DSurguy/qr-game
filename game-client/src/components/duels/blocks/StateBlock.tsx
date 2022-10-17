import { Badge, Grid } from '@mantine/core';
import React from 'react';
import { GameDuel } from '../../../qr-types';

type Props = {
  duel: GameDuel;
}

export function StateBlock({ duel }: Props) {
  return (
    <Grid.Col xs={12} sx={{ padding: '0.25rem 0.5rem '}}>
      <Badge color="dark">{duel.state}</Badge>
    </Grid.Col>
  )
}