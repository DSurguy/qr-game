import { Box, Button, Modal, Text } from '@mantine/core';
import React from 'react';
import { Award, Crown, CrownOff, Swords } from 'tabler-icons-react';
import { PluginHookResponse } from '../qr-types';

const iconToComponent = (iconName: string): JSX.Element | null => {
  const iconMap: Record<string, JSX.Element | undefined> = {
    'crown': <Crown />,
    'crown-off': <CrownOff />,
    'swords': <Swords />,
    'award': <Award />
  };

  return iconMap[iconName] || null;
}

type Props = {
  opened: boolean;
  onClose: () => void;
  response: PluginHookResponse;
}

export function HookResponseModal({ opened, onClose, response }: Props) {
  return <Modal opened={opened} onClose={onClose}>
    { response.icon && <Box>
      {iconToComponent(response.icon)}
    </Box> }
    <Box>
      <Text sx={{ fontSize: '1.25rem'}}>{ response.message }</Text>
    </Box>
    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
      <Button color="green" onClick={onClose}>OK</Button>
    </Box>
  </Modal>
}