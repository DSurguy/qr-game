import React, { useContext, useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { format } from 'date-fns';
import { Box, Button, Loader, Text, useMantineTheme } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { GameActivity, GameDuel, PluginModifiedPayloadResponse } from '../../qr-types';
import { useServerResource } from '../../hooks/useServerResource';
import { TablerIconFromString } from '../../components/icons/TablerIconFromString';
import { AddActivityToDuelModal } from './AddActivityToDuelModal';
import { Plus, Swords } from 'tabler-icons-react';
import { HookResponseContext } from '../../context/hookResponse';
import { PlayerContext } from '../../context/player';

export default function ActivityRoute () {
  const theme = useMantineTheme();
  const { activityUuid } = useParams();
  const [searchParams] = useSearchParams();
  const isDuel = searchParams.get('duel') !== undefined;
  const { addResponses } = useContext(HookResponseContext);
  const { updateBalance } = useContext(PlayerContext);

  const [addToDuelModalOpen, setAddToDuelModalOpen] = useState(false);

  const {
    data: activity,
    isLoading: isLoadingActivity,
    loadError: loadActivityError,
    load: loadActivity
  } = useServerResource<null, GameActivity>({
    load: `game/activities/${activityUuid}`,
  })

  const {
    isSaving: isClaimingActivity,
    loadError: claimActivityError,
    create: claimActivity
  } = useServerResource<null, PluginModifiedPayloadResponse>({
    create: `game/activities/${activityUuid}/claim`,
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
  }, [])

  if( isLoadingActivity ) return <Loader />
  if( loadActivityError ) return <Text color={theme.colors['errorColor'][4]}>Error loading activity: {loadActivityError?.message}</Text>
  if( !activity ) return null;

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

  const onClaimActivityClick = () => {
    claimActivity(undefined, (success, data) => {
      if( data?.hooks?.claimActivity?.length ) addResponses(data?.hooks?.claimActivity);
      if( success ) {
        loadActivity();
        updateBalance();
      }
    })
  }

  const descriptionSection = () => {
    const descriptionColorBar = (
      <Box sx={{ backgroundColor: activity.color, height: theme.radius.md, width: '100%' }}></Box>
    )

    return <Box sx={{
      margin: '1rem 0',
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.dark,
      boxSizing: 'border-box',
      overflow: 'hidden'
    }}>
      {activity.color && descriptionColorBar }
      <Text sx={{ margin: '1rem' }}><ReactMarkdown children={activity.description} /></Text>
    </Box>
  }

  const activitySection = () => {
    let colorHeaderStyles = activity.color ? {
      borderBottom: `2px solid ${activity.color}`
    } : {};

    return (<Box>
      <Box sx={{ display: 'flex', padding: '0.25rem 0', justifyContent: 'center' }}>
        <Text sx={{ fontSize: '1.5rem', ...colorHeaderStyles }}>{activity.name}</Text>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', paddingBottom: '1rem' }}>
        <TablerIconFromString icon={activity.icon || 'confetti' } size={80} />
      </Box>
    </Box>)
  }

  const claimSection = () => {
    return <Box>
      { activity.claimedAt && <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.dark[5], margin: '1rem -1rem' }}>
        <Box sx={{ display: 'flex' }}>
          <Text sx={{ marginRight: '0.25rem', color: theme.colors.dark[2] }}>{activity.isRepeatable ? 'Last claimed on' : 'Claimed on' }</Text>
          <Text sx={{ marginRight: '0.25rem', color: theme.colors.dark[2], fontStyle: 'italic' }}>{format(new Date(activity.claimedAt), 'MMM do @ hh:mm aa')}</Text>
          <Text sx={{ marginRight: '0.25rem', color: theme.colors.dark[2] }}>for</Text>
          <Text>{activity.claimedFor} point{activity.claimedFor === 1 ? '' : 's'}</Text>
        </Box>
      </Box>}
      { loadActivityError && <Text color={theme.colors['errorColor'][4]}>Error claiming activity: {loadActivityError?.message}</Text>}
      { (!activity.claimedAt || activity.isRepeatable) && <Box>
        <Button loading={isClaimingActivity} fullWidth onClick={onClaimActivityClick}>Claim Activity</Button>
      </Box>}
    </Box>
  }

  const duelSection = (activity: GameActivity) => {
    if( isLoadingDuels ) return <Loader />
    if( loadDuelsError ) return <Text color={theme.colors['errorColor'][4]}>Error loading duels: {loadDuelsError?.message}</Text>
    if( !isDuel || !duels ) return null;

    return (<Box sx={{ marginBottom: '1rem'}}>
      { createDuelError && <Text color={theme.colors['errorColor'][4]}>Error starting duel: {createDuelError.message}</Text> }
      <Button 
        type="button"
        onClick={onSetUpDuelClick}
        loading={isCreatingDuel}
        fullWidth
      >
        <Swords />
        <Text sx={{ marginLeft: '0.5rem' }}>Create Duel</Text>
      </Button>
      <Button 
        type="button"
        onClick={() => setAddToDuelModalOpen(true)}
        fullWidth
        sx={{ marginTop: '1rem' }}
      >
        <Plus />
        <Text sx={{ marginLeft: '0.5rem' }}>Add To Existing Duel</Text>
      </Button>
      <AddActivityToDuelModal
        opened={addToDuelModalOpen}
        onClose={() => setAddToDuelModalOpen(false)}
        activity={activity}
      />
    </Box>);
  }

  return <>
    {activitySection()}
    {claimSection()}
    {activity?.isDuel && duelSection(activity)}
    {activity?.description && descriptionSection()}
  </>
}