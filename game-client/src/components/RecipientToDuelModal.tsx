import React, { useEffect, useState } from 'react';
import { Box, Button, Loader, Modal, Text, useMantineTheme } from '@mantine/core';
import { DuelState, GamePlayer, UpdateDuelAddRecipientPayload, ChangeType, GameDuel } from '../qr-types';
import { useServerResource } from '../hooks/useServerResource';
import { showNotification } from '@mantine/notifications';
import { Circle, CircleCheck, Crown } from 'tabler-icons-react';

type NewDuelItemProps = {
  isSelected: boolean;
  onSelect: () => void;
}

const NewDuelItem = ({ isSelected, onSelect }: NewDuelItemProps) => {
  const theme = useMantineTheme();

  const lightBlue = theme.colors[theme.primaryColor][1];
  const fullBlue = theme.colors[theme.primaryColor][5];
  const darkBlue = theme.colors[theme.primaryColor][9];
  return (
    <Box sx={{
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
    }} onClick={onSelect}>
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '2rem',
        flexGrow: 0
      }}>
        { isSelected
          ? <CircleCheck />
          : <Circle />
        }
      </Box>
      <Box sx={{ flexGrow: 1 }}>
        <Text>Create a new duel</Text>
      </Box>
    </Box>
  )
}

type DuelItemProps = {
  duel: GameDuel;
  isSelected: boolean;
  onSelect: (duelUuid: string) => void;
}

const DuelItem = ({ duel, isSelected, onSelect }: DuelItemProps) => {
  const theme = useMantineTheme();
  const isQueenDuel = duel.tags.some(tag => tag.tag === 'queen');

  const lightBlue = theme.colors[theme.primaryColor][1];
  const fullBlue = theme.colors[theme.primaryColor][5];
  const darkBlue = theme.colors[theme.primaryColor][9];
  return (
    <Box sx={{
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
    }} onClick={() => onSelect(duel.uuid)}>
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '2rem',
        flexGrow: 0
      }}>
        { isSelected
          ? <CircleCheck />
          : <Circle />
        }
      </Box>
      <Box sx={{ flexGrow: 1 }}>
        <Text>{duel.recipient.name}</Text>
      </Box>
      {isQueenDuel && <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '2rem',
        flexGrow: 0
      }}>
        <Crown />
      </Box>}
    </Box>
  )
}

type Props = {
  opened: boolean,
  onClose: (shouldReload?: boolean) => void;
  recipient?: GamePlayer;
}

export default function RecipientToDuelModal({
  opened,
  onClose,
  recipient
}: Props) {
  const [selectedDuel, setSelectedDuel] = useState(null);
  const [saveError, setSaveError] = useState<Error | null>(null);
  const theme = useMantineTheme();

  const {
    data: duels,
    isLoading,
    loadError,
    load
  } = useServerResource<null, GameDuel[]>({
    load: `game/duels?missingRecipient`
  })

  const {
    isSaving: isSavingAddRecipient,
    saveError: addRecipientError,
    update: addRecipientToDuel
  } = useServerResource<UpdateDuelAddRecipientPayload, {duel: GameDuel }>({
    update: `game/duels/${selectedDuel}`
  })

  const {
    isSaving: isCreating,
    saveError: createDuelError,
    create: createDuel
  } = useServerResource<{
    recipientUuid?: string;
    activityUuid?: string;
  }, {duel: GameDuel }>({
    create: `game/duels`
  })

  useEffect(() => {
    load();
  }, [])

  useEffect(() => {
    if( addRecipientError ) setSaveError(addRecipientError);
    else if( createDuelError ) setSaveError(createDuelError);
    else setSaveError(null);
  }, [addRecipientError, createDuelError])

  const onConfirm = () => {
    setSaveError(null);
    if( selectedDuel ) {
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
          onClose(true);
        }
      })
    } else {
      createDuel({
        recipientUuid: recipient.uuid
      }, wasSuccessful => {
        if( wasSuccessful ) {
          showNotification({
            title: "Success",
            message: "Created a new duel"
          })
          onClose(true);
        }
      })
    }
  }

  const modalContent = () => {
    return <Box>
      { saveError && <Text color={theme.colors['errorColor'][4]}>{saveError.message}</Text>}
      <NewDuelItem isSelected={!selectedDuel} onSelect={() => setSelectedDuel(null)} />
      {!!duels.length && <Box>
        <Text component="p">OR add this player to a duel activity</Text>
        {duels.map(duel => <DuelItem key={duel.uuid} duel={duel} isSelected={duel.uuid === selectedDuel} onSelect={() => setSelectedDuel(duel.uuid)} />)}
      </Box>}
      <Box sx={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between'}}>
        <Button
          loading={isSavingAddRecipient || isCreating}
          onClick={onConfirm}
        >Confirm</Button>
        <Button
          onClick={() => onClose()}
          color="dark"
        >Cancel</Button>
      </Box>
    </Box>
  }

  const content = () => {
    if( isLoading ) return <Loader />
    if( loadError ) return <Text color={theme.colors['errorColor'][4]}>{loadError?.message}</Text>
    if( !duels ) return null;

    return modalContent()
  }

  return <Modal title={`Duel ${recipient.name}?`} opened={opened} onClose={onClose}>
    {content()}
  </Modal>
}