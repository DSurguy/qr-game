import { Box, Button, Modal, Text, useMantineTheme } from '@mantine/core';
import React from 'react';
import { Award, Crown, CrownOff, IconProps, Swords } from 'tabler-icons-react';
import { PluginHookResponse } from '../qr-types';
import ReactMarkdown from 'react-markdown';
import { StarburstIcon } from './icons/Starburst';

interface IconToComponentProps extends IconProps {
  iconName: string;
}

const IconToComponent = ({ iconName, ...other }: IconToComponentProps) => {
  const iconMap: Record<string, JSX.Element | undefined> = {
    'crown': <Crown {...other} />,
    'crown-off': <CrownOff {...other} />,
    'swords': <Swords {...other} />,
    'award': <Award {...other} />
  };

  return iconMap[iconName] || null;
}

type Props = {
  opened: boolean;
  onClose: () => void;
  response: PluginHookResponse;
}

export function HookResponseModal({ opened, onClose, response }: Props) {
  const theme = useMantineTheme();
  
  return <Modal opened={opened} onClose={onClose} withCloseButton={false}>
    { response.icon && <Box sx={{ height: '200px', width: '200px', position: 'relative', margin: '0 auto' }}>
      <StarburstIcon
        style={{ display: 'absolute', zIndex: 1, width: '200px', height: '200px', fill: theme.colors[theme.primaryColor][5] }}
      />
      <IconToComponent iconName={response.icon} size={100} style={{ position: 'absolute', zIndex: 2, top: '50px', left: '50px'}} />
    </Box> }
    <Box>
      <Text sx={{ fontSize: '1.25rem'}}><ReactMarkdown children={response.message} /></Text>
    </Box>
    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
      <Button onClick={onClose}>OK</Button>
    </Box>
  </Modal>
}