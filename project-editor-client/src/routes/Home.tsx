import React, { useEffect, useState } from 'react';
import { Button, Loader, Paper, Text } from '@mantine/core';

const useApiHealthy = () => {
  const [checkComplete, setCheckComplete] = useState(false);
  const [isHealthy, setIsHealthy] = useState(true);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if( !checkComplete) checkHealth();
  }, [checkComplete])

  const checkHealth = async () => {
    setIsLoading(true);
    try {
      const { status } = await fetch('http://localhost:8011/api/health')
      setError("");
      setIsHealthy(status === 200);
    } catch (e) {
      console.log(e);
      setError(e.message);
      setIsHealthy(false);
      setIsLoading(false);
    }
    setIsLoading(false);
    setCheckComplete(true);
  }

  return [
    {isHealthy, error, isLoading}, 
    () => setCheckComplete(false)
  ] as const;
}

export function HomeRoute () {
  const [{isHealthy, isLoading, error}, checkHealth] = useApiHealthy();
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
    return <Text component="span" color={color} weight={700} className='ml-1'>{text}</Text>
  }
  return (
    <Paper>
      <Text component="span">API is</Text>{apiStatus()}
      {error && <Text color="red">{error}</Text>}
      <Button onClick={checkHealth} disabled={isLoading} className="ml-1">
        Check API Health { isLoading && <Loader size="sm" className="ml-1" />}
      </Button>
    </Paper>
  );
}