import React, { useEffect } from 'react';
import { Button, Box, Text, useMantineTheme } from '@mantine/core';
import { useServerResource } from '../hooks/useServerResource';

export function ApiHealth () {
  const theme = useMantineTheme();

  const {
    data: healthCheck,
    isLoading,
    loadError,
    load
  } = useServerResource<null,any>({
    load: 'health'
  })

  useEffect(() => {
    load();
  }, [])

  useEffect(() => {
    if( loadError ) console.error(loadError);
  }, [loadError])

  const apiStatus = () => {
    let color, text;
    if( isLoading ) {
      color = "gray"
      text = "LOADING"
    }
    else if( healthCheck ) {
      color = "green"
      text = "HEALTHY"
    }
    else {
      color = "red"
      text = "UNHEALTHY"
    }
    return <Text component="span" color={color} weight={700} sx={{ marginLeft: theme.spacing['xs']}}>{text}</Text>
  }
  return (
    <Box>
      <Text component="span">API is</Text>{apiStatus()}
      <Button onClick={() => load()} loading={isLoading} sx={{ marginLeft: theme.spacing['xs']}}>
        Check API Health
      </Button>
    </Box>
  );
}