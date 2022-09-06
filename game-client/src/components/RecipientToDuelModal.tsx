import React, { useEffect, useState } from 'react';
import { Box, Button, Grid, Loader, Modal, Text, useMantineTheme } from '@mantine/core';
import { DuelState, Duel, UnsavedDuel, SavedActivity, GamePlayer, UpdateDuelAddActivityPayload, UpdateDuelAddRecipientPayload, ChangeType, GameDuel } from '../qr-types';
import { useServerResource } from '../hooks/useServerResource';
import { showNotification } from '@mantine/notifications';
import { Circle, CircleCheck } from 'tabler-icons-react';

type Props = {
  opened: boolean,
  onClose: () => void;
  recipient?: GamePlayer;
}

export default function RecipientToDuelModal({
  opened,
  onClose,
  recipient
}: Props) {
  const [selectedDuel, setSelectedDuel] = useState(null);
  const theme = useMantineTheme();

  const {
    data: duels,
    isLoading,
    loadError,
    load
  } = useServerResource<null, GameDuel[]>({
    load: `game/duels?state=${DuelState.Created}`
  })

  const {
    isSaving: isSavingAddRecipient,
    saveError: addRecipientError,
    update: addRecipientToDuel
  } = useServerResource<UpdateDuelAddRecipientPayload, Duel>({
    update: `game/duels/${selectedDuel}`
  })

  useEffect(() => {
    load();
  }, [])

  const onAddRecipientConfirm = () => {
    if( !recipient ) return;
    addRecipientToDuel({
      changeType: ChangeType.AddRecipient,
      payload: {
        recipientUuid: recipient.uuid
      }
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

  const duelsContent = () => {
    const duelListItems = duels.map(duel => {
      const isSelected = selectedDuel === duel.uuid;
      const lightBlue = theme.colors[theme.primaryColor][1];
      const fullBlue = theme.colors[theme.primaryColor][5];
      const darkBlue = theme.colors[theme.primaryColor][9];
      return (
        <Box key={duel.uuid} sx={{
          display: 'flex',
          backgroundColor: isSelected ? fullBlue : null,
          color: isSelected ? '#fff' : null,
          '&:hover': isSelected ? null : {
            backgroundColor: lightBlue,
            color: darkBlue,
          },
          cursor: 'pointer',
          padding: '0.5rem 0',
          margin: '0.5rem 0'
        }} onClick={() => setSelectedDuel(duel.uuid)}>
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '2rem'
          }}>
            { isSelected
              ? <CircleCheck />
              : <Circle />
            }
          </Box>
          <Box sx={{ flexGrow: 1 }}>
            <Text>{duel.activity.name}</Text>
          </Box>
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '4rem'
          }}>
            {/* TODO: Display repeat Value */}
            <Text sx={{
              backgroundColor: lightBlue,
              color: darkBlue,
              fontSize: '1.2rem',
              padding: '0 0.5rem',
              borderRadius: theme.radius.sm
            }}>{duel.activity.value}</Text>
          </Box>
        </Box>
      )
    })

    return <Box>
      <Text>Select which challenge to send</Text>
      {duelListItems}
    </Box>
  }

  const modalContent = () => {
    return <Box>
      { addRecipientError && <Text color="red">{addRecipientError.message}</Text>}
      {duelsContent()}
      <Button
        sx={{ marginTop: '1rem'}}
        loading={isSavingAddRecipient}
        onClick={onAddRecipientConfirm}
      >Confirm</Button>
    </Box>
  }

  const content = () => {
    if( isLoading ) return <Loader />
    if( loadError ) return <Text color="red">{loadError?.message}</Text>
    if( !duels ) return null;
    else if( !duels.length ) return <Text color="red">You have no duels set up, go scan an activity first!</Text>
    return modalContent()
  }

  return <Modal title={`Duel ${recipient.name}?`} opened={opened} onClose={onClose}>
    {content()}
  </Modal>
}