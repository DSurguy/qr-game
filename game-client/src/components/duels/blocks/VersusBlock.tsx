import { Box, Grid, Text, useMantineTheme } from '@mantine/core';
import React from 'react';
import { Swords } from 'tabler-icons-react';
import { GameDuel } from '../../../qr-types';

type Props = {
  duel: GameDuel;
}

export function VersusBlock({ duel }: Props) {
  const theme = useMantineTheme();
  const victorStyle = {
    fontWeight: 'bold',
    textDecoration: 'underline',
    fontSize: '1.1rem'
  }
  const loserStyle = {
    opacity: 0.5
  }

  const participantBaseStyle = { flexBasis: '45%', display: 'flex', justifyContent: 'center' };

  let initiatorStyle = { ...participantBaseStyle };
  let recipientStyle = { ...participantBaseStyle };
  if( duel.victorUuid ) {
    if( duel.victorUuid === duel.initiatorUuid ) {
      initiatorStyle = { ...initiatorStyle, ...victorStyle };
      recipientStyle = { ...recipientStyle, ...loserStyle };
    }
    else {
      initiatorStyle = { ...initiatorStyle, ...loserStyle };
      recipientStyle = { ...recipientStyle, ...victorStyle };
    }
  } 

  return (<Grid.Col>
    <Box sx={{
      display: 'flex',
      alignItems: 'center',
      borderRadius: theme.radius.md,
      borderColor: theme.colors.dark[5],
      borderStyle: 'solid',
      padding: '0.5rem 0'
    }}>
      <Text sx={initiatorStyle}>{duel.initiator?.name || '???'}</Text>
      <Box sx={{ flexBasis: '10%', display: 'flex', justifyContent: 'center' }}><Swords style={{ marginTop: '2px'}} /></Box>
      <Text sx={recipientStyle}>{duel.recipient?.name || '???'}</Text>
    </Box>
  </Grid.Col>)
}