import React, { useEffect, useState } from 'react';
import { Box, Button, Loader, Text } from '@mantine/core';
import { ActivityCompletedEventPayload, GameEvent, SavedActivity } from '@qrTypes';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useServerResource } from '../../hooks/useServerResource';
import DuelModal from './DuelModal';

export default function ActivityRoute () {
  const { activityUuid } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const eventThatClaimedActivity = searchParams.get('claimedByEvent');
  const isDuel = searchParams.get('duel') !== undefined;
  const [duelModalOpen, setDuelModalOpen] = useState(false);

  const {
    data: activity,
    isLoading: isLoadingActivity,
    loadError: loadActivityError,
    load: loadActivity
  } = useServerResource<null, SavedActivity>({
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
    if( !eventThatClaimedActivity ) return null;
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

  const duelSection = () => {
    if( !isDuel ) return null;
    return <>
      <Button onClick={() => setDuelModalOpen(true)}>Start Duel</Button>
      {(duelModalOpen && activity)
        ? <DuelModal activity={activity} opened={duelModalOpen} onClose={() => setDuelModalOpen(false)} />
        : null
      }
    </>
  }

  return <>
    {activitySection()}
    {claimEventSection()}
    {duelSection()}
  </>
}