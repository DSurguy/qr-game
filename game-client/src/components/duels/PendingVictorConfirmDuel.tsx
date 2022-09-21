import { Box, Button, Grid, Text, useMantineTheme } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import React from 'react';
import { useState } from 'react';
import { useServerResource } from '../../hooks/useServerResource';
import { ChangeType, GameDuel, UpdateDuelRecipientConfirmPayload, UpdateDuelVictorConfirmPayload } from '../../qr-types';
import AcceptRejectModal from '../AcceptRejectModal';

type Props = {
  duel: GameDuel;
  onUpdate: () => void;
}

export default function PendingVictorConfirmDuel ({ duel, onUpdate }: Props) {
  const [respondModalOpen, setRespondModalOpen] = useState(false);
  const [respondComplete, setRespondComplete] = useState(false);
  const theme = useMantineTheme();

  const {
    isSaving: isConfirmingDuel,
    saveError: confirmVictorError,
    update: confirmVictor
  } = useServerResource<UpdateDuelRecipientConfirmPayload | UpdateDuelVictorConfirmPayload, GameDuel>({
    update: `game/duels/${duel.uuid}`
  })

  const onAccept = () => {
    confirmVictor({
      changeType: ChangeType.VictorConfirm,
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
  const onReject = () => {
    confirmVictor({
      changeType: ChangeType.VictorConfirm,
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
        { confirmVictorError && <Grid.Col xs={12}><Text color="red">Error confirming victor: {confirmVictorError.message}</Text></Grid.Col> }
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
            loading={isConfirmingDuel}
            disabled={respondComplete}
          >Respond</Button>
        </Grid.Col>
      </Grid>
      <AcceptRejectModal
        opened={respondModalOpen}
        onClose={onCloseModal}
        title="Confirm Victor"
        onAccept={onAccept}
        onReject={onReject}
      >
        <Text>Confirm that {duel.victorUuid === duel.initiatorUuid ? duel.initiator.name : duel.recipient.name} has won this duel?</Text>
      </AcceptRejectModal>
    </Box>
  )
}