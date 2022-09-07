import React, { useEffect } from 'react';
import { Box, Button, Loader, Text } from '@mantine/core';
import { ActivityCompletedEventPayload, GameDuel, GameEvent, SavedActivity } from '@qrTypes';
import { useParams, useSearchParams } from 'react-router-dom';
import { useServerResource } from '../../hooks/useServerResource';
import { showNotification } from '@mantine/notifications';

export default function ActivityRoute () {
  const { activityUuid } = useParams();
  const [searchParams] = useSearchParams();
  const eventThatClaimedActivity = searchParams.get('claimedByEvent');
  const isDuel = searchParams.get('duel') !== undefined;

  const {
    data: activity,
    isLoading: isLoadingActivity,
    loadError: loadActivityError,
    load: loadActivity
  } = useServerResource<null, SavedActivity>({
    load: `game/activities/${activityUuid}`,
  })

  const {
    data: claimEvent,
    isLoading: isLoadingClaimEvent,
    loadError: loadClaimEventError,
    load: loadClaimEvent
  } = useServerResource<null, GameEvent>({
    load: `game/event/${eventThatClaimedActivity}`,
  })

  const {
    data: duels,
    isLoading: isLoadingDuels,
    loadError: loadDuelsError,
    load: loadDuels
  } = useServerResource<undefined, GameDuel[]>({
    load: `game/duels?activity=${activityUuid}&active`,
  })

  const {
    isSaving: isCreatingDuel,
    saveError: createDuelError,
    create: createDuel
  } = useServerResource<{
    activityUuid: string;
  }, GameDuel>({
    create: `game/duels`,
  })

  useEffect(() => {
    loadActivity();
    loadDuels();
    if( eventThatClaimedActivity ) loadClaimEvent();
  }, [])

  const onSetUpDuelClick = () => {
    createDuel({
      activityUuid: activityUuid
    }, (success) => {
      loadDuels();
      if( success ) showNotification({
        title: 'Duel Created',
        message: 'Go find someone to challenge!',
        autoClose: 5000
      })
    })
  }

  const activitySection = () => {
    if( isLoadingActivity ) return <Loader />
    if( loadActivityError ) return <Text color="red">Error loading activity: {loadActivityError?.message}</Text>
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
    if( loadClaimEventError ) return <Text color="red">Error loading claim event: {loadClaimEventError?.message}</Text>
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
    if( isLoadingDuels ) return <Loader />
    if( loadDuelsError ) return <Text color="red">Error loading duels: {loadDuelsError?.message}</Text>
    if( !isDuel || !duels ) return null;
    const setUpDuelButton = (<>
      { createDuelError && <Text color="red">Error starting duel: {createDuelError.message}</Text> }
      <Button 
        onClick={() => onSetUpDuelClick()}
        loading={isCreatingDuel}
      >Set Up Duel</Button>
    </>);
    const alreadyDuelingButton = <Button disabled>Duel In Progress</Button>
    return duels.length ? alreadyDuelingButton : setUpDuelButton;
  }

  return <>
    {activitySection()}
    {claimEventSection()}
    {duelSection()}
  </>
}