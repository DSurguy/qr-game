import { Box, Loader, Text } from '@mantine/core';
import { ActivityCompletedEventPayload, GameEvent, SavedActivityType } from '@qr-game/types';
import React, { useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useServerResource } from '../hooks/useServerResource';

export default function ActivityRoute () {
  const { activityUuid } = useParams();
  const [searchParams] = useSearchParams();
  const eventThatClaimedActivity = searchParams.get('claimedByEvent');

  const {
    data: activity,
    isLoading: isLoadingActivity,
    loadError: loadActivityError,
    load: loadActivity
  } = useServerResource<null, SavedActivityType>({
    load: `game/activity/${activityUuid}`,
  })

  const {
    data: claimEvent,
    isLoading: isLoadingClaimEvent,
    loadError: loadClaimEventError,
    load: loadClaimEvent
  } = useServerResource<null, GameEvent>({
    load: `game/event/${eventThatClaimedActivity}`,
  })

  useEffect(() => {
    loadActivity();
    if( eventThatClaimedActivity ) loadClaimEvent();
  }, [])

  const activitySection = () => {
    if( isLoadingActivity ) return <Loader />
    if( loadActivityError ) return <Text color="red">Error loading activity {loadActivityError?.message}</Text>
    if( !activity ) return null;
    return (
      <Box>
        You are viewing activity <Text component="span" sx={{ color: "#fff", backgroundColor: "blue", borderRadius: '4px', padding: '0 4px' }}>{activity.name}</Text>
      </Box>
    )
  }

  const claimEventSection = () => {
    if( isLoadingClaimEvent ) return <Loader />
    if( loadClaimEventError ) return <Text color="red">Error loading claim event {loadClaimEventError?.message}</Text>
    if( !claimEvent || !activity ) return null;
    const isRepeat = (claimEvent.payload as ActivityCompletedEventPayload).isRepeat;
    return (
      <Box>
        You have claimed this activity for 
        <Text component="span" sx={{ color: "#fff", backgroundColor: "green", borderRadius: '4px', padding: '0 4px', margin: '0 0.2rem' }}>{isRepeat ? activity.repeatValue : activity.value}</Text>
        Points {isRepeat ? '(Repeat)' : ''}
      </Box>
    )
  }

  return <>
    {activitySection()}
    {claimEventSection()}
  </>
}