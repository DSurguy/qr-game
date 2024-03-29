import { Badge, Box, Button, Grid, Text, useMantineTheme } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import React from 'react';
import { useState } from 'react';
import { Swords } from 'tabler-icons-react';
import { useServerResource } from '../../hooks/useServerResource';
import { ChangeType, GameDuel, GamePlayer, PluginModifiedPayloadResponse, UpdateDuelCancelPayload, UpdateDuelVictorPayload } from '../../qr-types';
import ConfirmModal from '../ConfirmModal';
import ReportVictorModal from './ReportVictorModal';
import { VersusBlock } from './blocks/VersusBlock';
import { StateBlock } from './blocks/StateBlock';
import { ActivityBlock } from './blocks/ActivityBlock';

type Props = {
  duel: GameDuel;
  onUpdate: () => void;
  currentPlayer: GamePlayer;
}

export default function AcceptedDuel ({ duel, onUpdate, currentPlayer }: Props) {
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

  const isInitator = currentPlayer.uuid === duel.initiatorUuid;

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
      backgroundColor: theme.colors.dark[4],
      borderRadius: theme.radius.sm,
      
      padding: '0.5rem'
    }}>
      <Grid>
        <StateBlock duel={duel} />
        <VersusBlock duel={duel} />
        <ActivityBlock duel={duel} />
        { reportVictorError && <Grid.Col xs={12}><Text color={theme.colors['errorColor'][6]}>Error reporting victor: {reportVictorError.message}</Text></Grid.Col> }
        <Grid.Col xs={12} sx={{ display: 'flex', justifyContent: 'space-evenly', alignItems: 'center' }}>
          <Box>
            <Button
              onClick={() => setReportVictorModalOpen(true)}
              loading={isReportingVictor || isCancellingDuel}
              disabled={actionComplete}
            >Report Victor</Button>
          </Box>
          { isInitator && <Box>
            <Button
              color="dark"
              onClick={() => setCancelModalOpen(true)}
              loading={isReportingVictor || isCancellingDuel}
              disabled={actionComplete}
            >Cancel Duel</Button>
          </Box> }
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