import { Badge, Box, Grid, Text, useMantineTheme } from '@mantine/core';
import React from 'react';
import { AlertTriangle, Swords } from 'tabler-icons-react';
import { GameDuel} from '../../qr-types';
import { ActivityBlock } from './blocks/ActivityBlock';
import { StateBlock } from './blocks/StateBlock';
import { VersusBlock } from './blocks/VersusBlock';

type Props = {
  duel: GameDuel;
}

export default function CreatedDuel ({ duel }: Props) {
  const theme = useMantineTheme();

  return (
    <Box sx={{
      backgroundColor: theme.colors.dark[4],
      borderRadius: theme.radius.sm,
      margin: '0.25rem 0 0.5rem 0',
      padding: '0.5rem'
    }}>
      <Grid>
        <StateBlock duel={duel} />
        <VersusBlock duel={duel} />
        { !!duel.activity && <ActivityBlock duel={duel} /> }
        {!duel.activityUuid && <Grid.Col xs={12} sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: theme.colors['errorColor'][8],
            padding: '0.25rem 0.5rem',
            borderRadius: theme.radius.md
          }}>
            <AlertTriangle style={{ marginBottom: '-2px' }} /> <Text sx={{ marginLeft: '0.5rem'}}>Missing activity</Text>
          </Box>
        </Grid.Col>}
        {!duel.recipientUuid && <Grid.Col xs={12} sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: theme.colors['errorColor'][8],
            padding: '0.25rem 0.5rem',
            borderRadius: theme.radius.md
          }}>
            <AlertTriangle style={{ marginBottom: '-2px' }} /> <Text sx={{ marginLeft: '0.5rem'}}>Missing recipient</Text>
          </Box>
        </Grid.Col>}
      </Grid>
    </Box>
  )
}