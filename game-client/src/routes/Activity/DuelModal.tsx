import React, { useEffect } from 'react';
import { Box, Button, Loader, Modal, Text } from '@mantine/core';
import { DuelState, Duel, UnsavedDuel, SavedActivity, GamePlayer } from '../../qr-types';
import { useServerResource } from '../../hooks/useServerResource';
import { showNotification } from '@mantine/notifications';

type Props = {
  opened: boolean,
  onClose: () => void;
  activity?: SavedActivity;
  recipient?: GamePlayer;
}

export default function DuelModal({
  opened,
  onClose,
  activity,
  recipient
}: Props) {
  const {
    data: duels,
    isLoading,
    loadError,
    load
  } = useServerResource<null, Duel[]>({
    load: `game/duels?state=${DuelState.Created}`
  })

  const {
    isSaving: isSavingAddActivity,
    saveError: addActivityError,
    update: addActivityToDuel
  } = useServerResource<{
    activityUuid: string
  }, Duel>({
    update: `game/duels/${duels[0]?.uuid}/activity`
  })

  const {
    isSaving: isSavingAddRecipient,
    saveError: addRecipientError,
    update: addRecipientToDuel
  } = useServerResource<{
    recipientUuid: string
  }, Duel>({
    update: `game/duels/${duels[0]?.uuid}/recipient`
  })

  const {
    data: savedDuel,
    isSaving: isSavingNewDuel,
    saveError: createDuelError,
    create: createNewDuel
  } = useServerResource<{
    recipientUuid?: string;
    activityUuid?: string;
  }, Duel>({
    create: `game/duels`
  })

  useEffect(() => {
    load();
  }, [])

  const onCreateNewDuelConfirm = () => {
    createNewDuel({
      recipientUuid: recipient?.uuid,
      activityUuid: activity?.uuid
    }, (success) => {
      if( success ) {
        showNotification({
          title: "Success",
          message: "Duel Created"
        })
        onClose();
      }
    })
  }
  const onAddRecipientConfirm = () => {
    if( !recipient ) return;
    addRecipientToDuel({
      recipientUuid: recipient.uuid
    }, (success) => {
      if( success ) {
        showNotification({
          title: "Success",
          message: "Added player to duel"
        })
        onClose();
      }
    })
  }
  const onAddActivityConfirm = () => {
    if( !activity ) return;
    addActivityToDuel({
      activityUuid: activity.uuid
    }, (success) => {
      if( success ) {
        showNotification({
          title: "Success",
          message: "Added activity to duel"
        })
        onClose();
      }
    })
  }

  const createDuelContent = () => {
    const activityContent = activity && <>
      <Text>Duel with this activity?</Text>
      <div>Activity Here</div>
    </>
    const recipientContent = recipient && <>
      <Text>Duel this player?</Text>
      <div>Recipient Here</div>
    </>
    return <>
      { createDuelError && <Text color="red">{createDuelError.message}</Text>}
      {activityContent}
      {recipientContent}
      <Button
        loading={isSavingNewDuel}
        onClick={onCreateNewDuelConfirm}
      >Confirm</Button>
    </>
  }
  const addRecipientContent = () => {
    return <>
      { addRecipientError && <Text color="red">{addRecipientError.message}</Text>}
      <Text>Duel this player?</Text>
      <div>Recipient Here</div>
      <Button
        loading={isSavingAddRecipient}
        onClick={onAddRecipientConfirm}
      >Confirm</Button>
    </>
  }
  const addActivityContent = () => {
    return <>
      { addActivityError && <Text color="red">{addActivityError.message}</Text>}
      <Text>Duel with this activity?</Text>
      <div>Activity Here</div>
      <Button
        loading={isSavingAddActivity}
        onClick={onAddActivityConfirm}
      >Confirm</Button>
    </>
  }

  const modalContent = () => {
    if( !duels[0] ) return createDuelContent()
    else if( activity ) return addActivityContent()
    else if( recipient ) return addRecipientContent();
    else return <Text color="red">Bad configuration</Text>
  }

  const content = () => {
    if( isLoading ) return <Loader />
    if( loadError ) return <Text color="red">{loadError?.message}</Text>
    if( !duels ) return null;
    return <Box>
      {modalContent()}
    </Box>
  }

  return <Modal opened={opened} onClose={onClose}>
    {content()}
  </Modal>
}