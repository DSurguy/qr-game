import { Box, Button, Modal, Text, TextInput, useMantineTheme } from '@mantine/core';
import React, { useState } from 'react';
import { useServerResource } from '../../hooks/useServerResource';
import { PluginModifiedPayloadResponse, RedeemItemPayload } from '../../qr-types';

type Props = {
  opened: boolean;
  onClose: (success: boolean, data?: PluginModifiedPayloadResponse) => void;
  itemUuid: string;
}

export function RedemptionModal({ opened, onClose, itemUuid }: Props) {
  const [challengeInput, setChallengeInput] = useState("");
  const theme = useMantineTheme();
  const {
    isSaving: isRedeeming,
    saveError: redeemError,
    create: redeem,
  } = useServerResource<RedeemItemPayload, PluginModifiedPayloadResponse>({
    create: `game/inventory/redeem`
  })

  const onSubmitChallenge = () => {
    redeem({ itemUuid, challenge: challengeInput }, (wasSuccessful, data) => {
      if( wasSuccessful ) onClose(true, data);
    })
  };

  return <Modal opened={opened} onClose={() => onClose(false)} title="Challenge">
    <Box>
      { redeemError && <Text color={theme.colors['errorColor'][4]}>{redeemError.message}</Text>}
      <TextInput value={challengeInput} onChange={e => setChallengeInput(e.target.value)} label="Challenge Input" />
    </Box>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
      <Button onClick={onSubmitChallenge} loading={isRedeeming}>Submit Challenge</Button>
      <Button color="errorColor" onClick={() => onClose(false)}>Cancel</Button>
    </Box>
  </Modal>
}