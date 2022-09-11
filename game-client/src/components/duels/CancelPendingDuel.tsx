import { Box, Button, Grid, Text, useMantineTheme } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import React from 'react';
import { useState } from 'react';
import { useServerResource } from '../../hooks/useServerResource';
import { ChangeType, GameDuel, UpdateDuelCancelConfirmPayload, UpdateDuelRecipientConfirmPayload } from '../../qr-types';
import AcceptRejectModal from '../AcceptRejectModal';

type Props = {
  duel: GameDuel;
  onUpdate: () => void;
}

export default function CancelPendingDuel ({ duel, onUpdate }: Props) {
  const [respondModalOpen, setRespondModalOpen] = useState(false);
  const [respondComplete, setRespondComplete] = useState(false);
  const theme = useMantineTheme();

  const {
    isSaving: isRespondingToDuel,
    saveError: respondToDuelError,
    update: respondToDuel
  } = useServerResource<UpdateDuelCancelConfirmPayload, GameDuel>({
    update: `game/duels/${duel.uuid}`
  })

  const onAcceptDuel = () => {
    respondToDuel({
      changeType: ChangeType.CancelConfirm,
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
      changeType: ChangeType.CancelConfirm,
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

  return (
    <Box sx={{
      backgroundColor: theme.colors.gray[1],
      borderRadius: theme.radius.sm,
      margin: '0.25rem 0',
      padding: '0.5rem'
    }}>
      <Grid>
        { respondToDuelError && <Grid.Col xs={12}><Text color="red">Error responding to duel: {respondToDuelError.message}</Text></Grid.Col> }
        <Grid.Col xs={9}>
          <Box sx={{ display: 'flex' }}>
            {duel.initiator.name} VS {duel.recipient.name}
          </Box>
          <Box>{duel.activity.name}</Box>
          <Box>{duel.state}</Box>
        </Grid.Col>
        <Grid.Col xs={3} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Button
            onClick={() => setRespondModalOpen(true)}
            loading={isRespondingToDuel}
            disabled={respondComplete}
          >Respond</Button>
        </Grid.Col>
      </Grid>
      <AcceptRejectModal
        opened={respondModalOpen}
        onClose={onCloseModal}
        title="Accept Duel Cancellation?"
        onAccept={onAcceptDuel}
        onReject={onRejectDuel}
      >
        <Text>Accept cancellation from {duel.initiator.name} for activity {duel.activity.name}?</Text>
      </AcceptRejectModal>
    </Box>
  )
}