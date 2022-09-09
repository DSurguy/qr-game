import React, { useState } from 'react';
import { Box, Button, Modal, Radio } from '@mantine/core';
import { GameDuel } from '../../qr-types';

type Props = {
  opened: boolean;
  onClose: () => void;
  onConfirm: (victorUuid: string) => void;
  duel: GameDuel;
}

export default function ReportVictorModal ({ opened, onClose, onConfirm, duel }: Props) {
  const [selectedVictor, setSelectedVictor] = useState(null);
  return <Modal opened={opened} onClose={onClose} title="Report Victor">
    <Radio.Group
      value={selectedVictor}
      onChange={setSelectedVictor}
      orientation="vertical"
      label="Which participant won?"
    >
      <Radio value={duel.initiator.uuid} label={`${duel.initiator.name} (Challenger)`} />
      <Radio value={duel.recipient.uuid} label={`${duel.recipient.name} (Recipient)`} />
    </Radio.Group>
    <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
      <Button color="green" onClick={() => onConfirm(selectedVictor)} disabled={!selectedVictor}>Confirm</Button>
    </Box>
  </Modal>
}