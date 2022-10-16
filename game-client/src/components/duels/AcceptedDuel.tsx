import { Box, Button, Grid, Text, useMantineTheme } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import React from 'react';
import { useState } from 'react';
import { useServerResource } from '../../hooks/useServerResource';
import { ChangeType, GameDuel, PluginModifiedPayloadResponse, UpdateDuelCancelPayload, UpdateDuelVictorPayload } from '../../qr-types';
import ConfirmModal from '../ConfirmModal';
import ReportVictorModal from './ReportVictorModal';

type Props = {
  duel: GameDuel;
  onUpdate: () => void;
}

export default function AcceptedDuel ({ duel, onUpdate }: Props) {
  const [reportVictorModalOpen, setReportVictorModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [actionComplete, setActionComplete] = useState(false);
  const theme = useMantineTheme();

  type UpdateResponse = { duel: GameDuel } & PluginModifiedPayloadResponse;
  const {
    isSaving: isReportingVictor,
    saveError: reportVictorError,
    update: reportVictor
  } = useServerResource<UpdateDuelVictorPayload, UpdateResponse>({
    update: `game/duels/${duel.uuid}`
  })

  type CancelResponse = { duel: GameDuel } & PluginModifiedPayloadResponse;
  const {
    isSaving: isCancellingDuel,
    saveError: cancelDuelError,
    update: cancelDuel
  } = useServerResource<UpdateDuelCancelPayload, CancelResponse>({
    update: `game/duels/${duel.uuid}`
  })

  const onReportVictor = (victorUuid: string) => {
    reportVictor({
      changeType: ChangeType.Victor,
      payload: {
        initiatorVictory: duel.initiatorUuid === victorUuid
      }
    }, success => {
      if( success ){
        showNotification({
          message: 'Duel Victor Reported'
        })
        setActionComplete(true);
        onUpdate();
      }
    })
    setReportVictorModalOpen(false)
  };
  const onCloseReportVictorModal = () => setReportVictorModalOpen(false);

  const onCancel = () => {
    cancelDuel({
      changeType: ChangeType.Cancel,
      payload: {}
    }, success => {
      if( success ){
        showNotification({
          message: 'Duel Cancelled'
        })
        setActionComplete(true);
        onUpdate();
      }
    })
    setReportVictorModalOpen(false)
  };
  const onCloseCancelModal = () => setCancelModalOpen(false);

  return (
    <Box sx={{
      backgroundColor: theme.colors.gray[1],
      borderRadius: theme.radius.sm,
      margin: '0.25rem 0',
      padding: '0.5rem'
    }}>
      <Grid>
        <Grid.Col xs={12}>{duel.state}</Grid.Col>
        { reportVictorError && <Grid.Col xs={12}><Text color="red">Error reporting victor: {reportVictorError.message}</Text></Grid.Col> }
        <Grid.Col xs={12}>
          <Box sx={{ display: 'flex' }}>
            {duel.initiator.name} VS {duel.recipient.name}
          </Box>
          <Box>{duel.activity.name}</Box>
        </Grid.Col>
        <Grid.Col xs={12} sx={{ display: 'flex', justifyContent: 'space-evenly', alignItems: 'center' }}>
          <Box>
            <Button
              onClick={() => setReportVictorModalOpen(true)}
              loading={isReportingVictor || isCancellingDuel}
              disabled={actionComplete}
            >Report Victor</Button>
          </Box>
          <Box>
            <Button
              onClick={() => setCancelModalOpen(true)}
              loading={isReportingVictor || isCancellingDuel}
              disabled={actionComplete}
            >Cancel Duel</Button>
          </Box>
        </Grid.Col>
      </Grid>
      <ReportVictorModal
        duel={duel}
        opened={reportVictorModalOpen}
        onClose={onCloseReportVictorModal}
        onConfirm={onReportVictor}
      />
      <ConfirmModal
        title="Cancel Duel"
        opened={cancelModalOpen}
        onClose={onCloseCancelModal}
        onConfirm={onCancel}
      >
        <Text component="p">{duel.initiator.name} VS {duel.recipient.name} will be cancelled.</Text>
        <Text component='p'>{duel.recipient.name} will be asked to confirm the cancellation.</Text>
      </ConfirmModal>
    </Box>
  )
}