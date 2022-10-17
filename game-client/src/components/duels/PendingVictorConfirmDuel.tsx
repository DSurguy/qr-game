import { Box, Button, Grid, Text, useMantineTheme } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import React, { useContext, useState } from 'react';
import { HookResponseContext } from '../../context/hookResponse';
import { useServerResource } from '../../hooks/useServerResource';
import { ChangeType, GameDuel, PluginModifiedPayloadResponse, UpdateDuelRecipientConfirmPayload, UpdateDuelVictorConfirmPayload } from '../../qr-types';
import AcceptRejectModal from '../AcceptRejectModal';
import { ActivityBlock } from './blocks/ActivityBlock';
import { StateBlock } from './blocks/StateBlock';
import { VersusBlock } from './blocks/VersusBlock';

type Props = {
  duel: GameDuel;
  onUpdate: () => void;
}

export default function PendingVictorConfirmDuel ({ duel, onUpdate }: Props) {
  const [respondModalOpen, setRespondModalOpen] = useState(false);
  const [respondComplete, setRespondComplete] = useState(false);
  const { addResponses } = useContext(HookResponseContext)
  const theme = useMantineTheme();
  
  type ConfirmVictorResponse = { duel: GameDuel } & PluginModifiedPayloadResponse;
  const {
    isSaving: isConfirmingDuel,
    saveError: confirmVictorError,
    update: confirmVictor
  } = useServerResource<UpdateDuelRecipientConfirmPayload | UpdateDuelVictorConfirmPayload, ConfirmVictorResponse>({
    update: `game/duels/${duel.uuid}`
  })

  const onAccept = () => {
    confirmVictor({
      changeType: ChangeType.VictorConfirm,
      payload: {
        accepted: true
      }
    }, (success, data) => {
      if( success ){
        if( data?.hooks?.duelComplete ) addResponses(data.hooks.duelComplete);
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
      backgroundColor: theme.colors.dark[4],
      borderRadius: theme.radius.sm,
      margin: '0.25rem 0',
      padding: '0.5rem'
    }}>
      <Grid>
        <StateBlock duel={duel} />
        <VersusBlock duel={duel} />
        <ActivityBlock duel={duel} />
        { confirmVictorError && <Grid.Col xs={12}><Text color={theme.colors['errorColor'][6]}>Error confirming victor: {confirmVictorError.message}</Text></Grid.Col> }
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