import React, { useEffect } from 'react';
import { Button, Box, Text, useMantineTheme } from '@mantine/core';
import { useServerResource } from 'src/hooks/useServerResource';

export function ApiHealth () {
  const theme = useMantineTheme();

  const {
    data: healthCheck,
    isLoading,
    loadError,
    load
  } = useServerResource<null,any>({
    load: '/api/admin/health'
  })

  useEffect(() => {
    load();
  }, [])

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
      {loadError && <Text color="red">{loadError?.message || ''}</Text>}
      <Button onClick={() => load()} loading={isLoading} sx={{ marginLeft: theme.spacing['xs']}}>
        Check API Health
      </Button>
    </Box>
  );
}