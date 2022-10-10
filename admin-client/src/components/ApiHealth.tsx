import React, { useEffect, useState } from 'react';
import { Button, Box, Text, useMantineTheme } from '@mantine/core';
import { useServerResource } from '../hooks/useServerResource';

export function ApiHealth () {
  const [isHealthy, setIsHealthy] = useState(true);
  const theme = useMantineTheme();

  const {
    isLoading,
    loadError,
    load
  } = useServerResource<null, null>({
    load: 'health'
  })

  const loadAndUpdateStatus = () => {
    load(wasSuccessful => {
      setIsHealthy(wasSuccessful);
    })
  }

  useEffect(() => {
    loadAndUpdateStatus();
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
    else if( isHealthy ) {
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
      <Button onClick={() => loadAndUpdateStatus()} loading={isLoading} sx={{ marginLeft: theme.spacing['xs']}}>
        Check API Health
      </Button>
    </Box>
  );
}