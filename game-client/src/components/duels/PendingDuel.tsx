import { Box, Button, Grid, Text, useMantineTheme } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import React from 'react';
import { useState } from 'react';
import { useServerResource } from '../../hooks/useServerResource';
import { ChangeType, GameDuel, GamePlayer, UpdateDuelRecipientConfirmPayload } from '../../qr-types';
import AcceptRejectModal from '../AcceptRejectModal';
import { ActivityBlock } from './blocks/ActivityBlock';
import { StateBlock } from './blocks/StateBlock';
import { VersusBlock } from './blocks/VersusBlock';

type Props = {
  duel: GameDuel;
  onUpdate: () => void;
  currentPlayer: GamePlayer;
}

export default function PendingDuel ({ duel, onUpdate, currentPlayer }: Props) {
  const [respondModalOpen, setRespondModalOpen] = useState(false);
  const [respondComplete, setRespondComplete] = useState(false);
  const theme = useMantineTheme();

  const {
    isSaving: isRespondingToDuel,
    saveError: respondToDuelError,
    update: respondToDuel
  } = useServerResource<UpdateDuelRecipientConfirmPayload, { duel: GameDuel }>({
    update: `game/duels/${duel.uuid}`
  })

  const onAcceptDuel = () => {
    respondToDuel({
      changeType: ChangeType.RecipientConfirm,
      payload: {
        accepted: true
      }
    }, success => {
      if( success ){
        showNotification({
          message: 'Duel Accepted'
        })
        setRespondComplete(true);
        onUpdate();
      }
    })
    setRespondModalOpen(false)
  };
  const onRejectDuel = () => {
    respondToDuel({
      changeType: ChangeType.RecipientConfirm,
      payload: {
        accepted: false
      }
    }, success => {
      if( success ) {
        showNotification({
          message: 'Duel Rejected'
        })
        setRespondComplete(true);
        onUpdate();
      }
    })
    setRespondModalOpen(false)
  };
  const onCloseModal = () => setRespondModalOpen(false);

  const isRecipient = currentPlayer.uuid === duel.recipientUuid;

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
        <ActivityBlock duel={duel} />
        { respondToDuelError && <Grid.Col xs={12}><Text color={theme.colors['errorColor'][6]}>Error responding to duel: {respondToDuelError.message}</Text></Grid.Col> }
        { isRecipient && <Grid.Col xs={3} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Button
            onClick={() => setRespondModalOpen(true)}
            loading={isRespondingToDuel}
            disabled={respondComplete}
          >Respond</Button>
        </Grid.Col> }
      </Grid>
      <AcceptRejectModal
        opened={respondModalOpen}
        onClose={onCloseModal}
        title="Accept Duel?"
        onAccept={onAcceptDuel}
        onReject={onRejectDuel}
      >
        <Text>Accept a duel from {duel.initiator.name} for activity {duel.activity.name}?</Text>
      </AcceptRejectModal>
    </Box>
  )
}