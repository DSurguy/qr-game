import React from 'react';
import { Box, Grid, Text, UnstyledButton, useMantineTheme } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { GameDuel } from '../../../qr-types';
import { ChevronRight } from 'tabler-icons-react';

type Props = {
  duel: GameDuel;
}

export function ActivityBlock({ duel }: Props) {
  const navigate = useNavigate();
  const theme = useMantineTheme();

  const colorStyles = duel.activity.color ? {
    borderRight: `2px solid ${duel.activity.color}`
  } : {};

  return (
    <Grid.Col xs={12}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Text sx={{ marginRight: '0.5rem'}}>Activity:</Text>
        <UnstyledButton onClick={() => navigate(`/game/activity/${duel.activity.uuid}`)} sx={{ ...colorStyles, backgroundColor: theme.colors.dark[7], display: 'flex', padding: '0.5rem', borderRadius: theme.radius.sm}}>
          <Text sx={{ marginRight: '0.25rem' }}>{duel.activity.name}</Text>
          <ChevronRight />
        </UnstyledButton>
      </Box>
    </Grid.Col>
  )
}