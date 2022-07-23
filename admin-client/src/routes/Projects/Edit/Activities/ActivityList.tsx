import React, { useEffect, useState } from 'react';
import { Box, Button, Grid, Loader, Text, UnstyledButton, useMantineTheme } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { SquarePlus } from 'tabler-icons-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { SavedActivityType } from '@qr-game/types';
import { ApiActionCallback } from '../../../../types';
import { ADMIN_API_BASE } from '../../../../constants';

const useActivities = (projectUuid: string) => {
  const [activities, setActivities] = useState<null | SavedActivityType[]>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<null | Error>(null);

  /**
   * Load project settings from
   * @param callback A function that can perform cleanup actions, such as telling Formik loading is complete. It will receive one argument, indicating if the API action was successful or not
   */
  const load = (callback?: ApiActionCallback) => {
    setIsLoading(true);
    (async () => {
      try {
        const result = await fetch(`${ADMIN_API_BASE}/projects/${projectUuid}/activities`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        })
        if( result.status <= 299 && result.status >= 200 ) {
          setActivities(await result.json());
          setError(null);
          if( callback ) callback(true);
        }
        else {
          const message = (result.json() as any)['message'] || 'Internal Server Error'
          throw new Error(message)
        }
      } catch (e) {
        setError(e);
        if( callback ) callback(false)
      } finally {
        setIsLoading(false);
      }
    })()
  }

  return {
    activities,
    isLoading,
    error,
    load
  } as const
}

export default function ActivityList () {
  const theme = useMantineTheme();
  const { projectUuid } = useParams();
  const navigate = useNavigate();
  const {activities, isLoading, error, load} = useActivities(projectUuid);
  const isExtraSmallScreen = useMediaQuery(`(max-width: ${theme.breakpoints.sm}px)`);

  useEffect(() => {
    load();
  }, [])

  const renderActivity = (activity: SavedActivityType) => (
    <UnstyledButton sx={{ 
      display: 'block',
      padding: theme.spacing['xs'],
      boxSizing: 'border-box',
      textAlign: 'left',
      width: '100%',
      borderRadius: theme.radius['sm'],
      '&:hover': {
        backgroundColor: theme.colors[theme.primaryColor]['1'],
        color: theme.colors[theme.primaryColor]['9'],
        '&:nth-of-type(odd)': {
          backgroundColor: theme.colors[theme.primaryColor]['1'],
        }
      },
      marginTop: theme.spacing['xs'],
      '&:nth-of-type(odd)': {
        backgroundColor: theme.colors.gray[1]
      }
    }} key={activity.uuid} onClick={() => navigate(`./${activity.uuid}`)}>
      <Grid>
        <Grid.Col xs={12} sm={9}>
          <Text component="h3" sx={{ margin: 0, fontSize: '1.4rem' }}>{activity.name}</Text>
          <Text size="xs" color={theme.colors.gray[6]}>{activity.uuid}</Text>
          <Text size="xs" color={theme.colors.gray[6]}>{activity.wordId}</Text>
        </Grid.Col>
        <Grid.Col xs={12} sm={3} sx={{ display: 'flex', justifyContent: 'center'}}>
          <Box sx={{
            borderRadius: theme.radius.md,
            backgroundColor: theme.colors[theme.primaryColor][1],
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: isExtraSmallScreen ? '80%' : '5rem',
            height: '4rem'
          }}>
            <Text style={{fontSize: '2rem'}} color="blue">{activity.value}</Text>
          </Box>
        </Grid.Col>
        <Grid.Col xs={12} sx={{paddingTop: 0 }}>
          <Text>{activity.description}</Text>
        </Grid.Col>
      </Grid>
    </UnstyledButton>
  )

  const activityContent = () => activities.map((activity: SavedActivityType) => renderActivity(activity)) 
  if( isLoading ) return <Loader />
  if( error ) return <Text color="red">{error ? error.message : "Error loading activities"}</Text>
  if( !activities ) return null;
  return (<Box>
    <Button
      compact
      leftIcon={<SquarePlus size={theme.fontSizes['xl']} />}
      component={Link}
      to="create"
    >New Activity</Button>
    <Box>{activityContent()}</Box>
  </Box>)
}