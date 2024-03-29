import React from 'react';
import { Box, Burger, Drawer, NavLink, useMantineTheme } from '@mantine/core';
import { Link } from 'react-router-dom';

type Props = {
  onClose: () => void;
  opened: boolean;
}

export default function AppNavbar({ onClose, opened }: Props) {
  const theme = useMantineTheme();
  return (
    <Drawer
      position="left"
      opened={opened}
      onClose={onClose}
      size={240}
      overlayColor="#fff"
      overlayOpacity={0.55}
      overlayBlur={3}
      withCloseButton={false}
    >
      <Box sx={{
        display: 'flex',
        height: 'var(--mantine-header-height)',
        alignItems: 'center',
        paddingLeft: '10px',
        borderBottom: `1px solid ${theme.colors.gray[3]}`
      }}>
        <Burger opened={opened} onClick={onClose}/>
      </Box>
      <nav>
        <NavLink label="Projects" component={Link} to="/projects" onClick={onClose}/>
      </nav>
    </Drawer>
  )
}