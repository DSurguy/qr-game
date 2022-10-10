import React from 'react';
import { Link } from 'react-router-dom';
import { UnstyledButton, Group, Navbar, Text, ThemeIcon, useMantineTheme } from '@mantine/core';
import { LayoutGrid } from 'tabler-icons-react';

export function SidebarNav() {
  const theme = useMantineTheme()
  return (
    <Navbar width={{ base: 300 }}>
      <Navbar.Section grow sx={{ padding: theme.spacing['md'] }}>
        <UnstyledButton component={Link} to='/projects' sx={{ 
          display: 'block',
          padding: theme.spacing['xs'],
          boxSizing: 'border-box',
          textAlign: 'left',
          width: '100%',
          borderRadius: theme.radius['sm'],
          '&:hover': {
            backgroundColor: theme.colors[theme.primaryColor]['1'],
            color: theme.colors[theme.primaryColor]['9']
          }
        }}>
          <Group sx={{ alignItems: 'center' }}>
            <ThemeIcon variant="light">
              <LayoutGrid size={theme.fontSizes['md']} />
            </ThemeIcon>
            <Text component='span'>Projects</Text>
          </Group>
        </UnstyledButton>
      </Navbar.Section>
    </Navbar>
  )
}