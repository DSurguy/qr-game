import React from 'react';
import { Box, Burger, Drawer, NavLink, useMantineTheme } from '@mantine/core';
import { Link } from 'react-router-dom';
import useLogout from '../../hooks/useLogout';

type Props = {
  onClose: () => void;
  opened: boolean;
}

export default function AuthNavbar({ onClose, opened }: Props) {
  const theme = useMantineTheme();
  const logout = useLogout();
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
        <NavLink label="My Profile" component={Link} to="/game/me" onClick={onClose}/>
        <NavLink label="Duels" component={Link} to="/game/duels" onClick={onClose}/>
        <NavLink label="Log Out" onClick={logout} sx={{ marginTop: '10px', borderTop: `1px solid ${theme.colors.gray[3]}`}} />
      </nav>
    </Drawer>
  )
}