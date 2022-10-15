import { Box, Button, Modal, Text, TextInput } from '@mantine/core';
import React, { useState } from 'react';
import { useServerResource } from '../../hooks/useServerResource';
import { RedeemItemPayload } from '../../qr-types';

type Props = {
  opened: boolean;
  onClose: (success: boolean) => void;
  itemUuid: string;
}

export function RedemptionModal({ opened, onClose, itemUuid }: Props) {
  const [challengeInput, setChallengeInput] = useState("");
  const {
    isSaving: isRedeeming,
    saveError: redeemError,
    create: redeem,
  } = useServerResource<RedeemItemPayload, void>({
    create: `game/inventory/redeem`
  })

  const onSubmitChallenge = () => {
    redeem({ itemUuid, challenge: challengeInput }, wasSuccessful => {
      if( wasSuccessful ) onClose(true);
    })
  };

  return <Modal opened={opened} onClose={() => onClose(false)} title="Challenge">
    <Box>
      { redeemError && <Text color="red">{redeemError.message}</Text>}
      <TextInput value={challengeInput} onChange={e => setChallengeInput(e.target.value)} label="Challenge Input" />
    </Box>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
      <Button color="primary" onClick={onSubmitChallenge} loading={isRedeeming}>Submit Challenge</Button>
      <Button color="gray" onClick={() => onClose(false)}>Cancel</Button>
    </Box>
  </Modal>
}