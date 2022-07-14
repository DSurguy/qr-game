import React from 'react';
import { Box, Button, Text, useMantineTheme} from '@mantine/core';
import { Link } from 'react-router-dom';
import { SquarePlus } from 'tabler-icons-react';

export function ProjectsRoute() {
  const theme = useMantineTheme();
  return <Box>
    <Text>Project List</Text>
    <Button
      compact
      leftIcon={<SquarePlus size={theme.fontSizes['xl']} />}
      component={Link}
      to='/projects/create'
    >New Project</Button>
  </Box>
}