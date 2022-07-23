import { Box, Button } from '@mantine/core';
import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronLeft } from 'tabler-icons-react';

export default function CreateActivity() {
  const { projectUuid } = useParams();
  return (<Box>
    <Button
      compact
      variant="subtle"
      component={Link}
      to=".."
      leftIcon={<ChevronLeft size={16} />}
    >Back</Button>
    <Box>{projectUuid}</Box>
  </Box>)
}