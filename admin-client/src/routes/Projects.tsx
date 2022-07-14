import React from 'react';
import { Button, Text, useMantineTheme} from '@mantine/core';
import { Link } from 'react-router-dom';
import { SquarePlus } from 'tabler-icons-react';

import { PageLayout } from '../components/PageLayout';

export function ProjectsRoute() {
  const theme = useMantineTheme();
  return <PageLayout>
    <Text>Project List</Text>
    <Button
      compact
      leftIcon={<SquarePlus size={theme.fontSizes['xl']} />}
      component={Link}
      to='/projects/create'
    >New Project</Button>
  </PageLayout>
}