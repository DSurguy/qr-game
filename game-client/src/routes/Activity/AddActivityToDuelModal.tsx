import { Box, Button, Loader, Modal, Text, useMantineTheme } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import React, { useEffect, useState } from 'react';
import { Check, Circle, CircleCheck, Crown } from 'tabler-icons-react';
import { useServerResource } from '../../hooks/useServerResource';
import { ChangeType, GameDuel, SavedActivity, UpdateDuelAddActivityPayload, UpdateDuelPayload } from '../../qr-types';

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
  opened: boolean;
  onClose: () => void;
  activity: SavedActivity;
}

export function AddActivityToDuelModal({ opened, onClose, activity }: Props) {
  const [selectedDuel, setSelectedDuel] = useState<null | string>(null);

  const {
    data: duels,
    isLoading,
    loadError,
    load
  } = useServerResource<void, GameDuel[]>({
    load: `game/duels?missingActivity`
  })

  const {
    isSaving,
    saveError,
    update
  } = useServerResource<UpdateDuelAddActivityPayload, GameDuel[]>({
    update: `game/duels/${selectedDuel}`
  })

  useEffect(() => {
    load();
  }, [])

  const onConfirmClick = () => {
    update({
      changeType: ChangeType.AddActivity,
      payload: {
        activityUuid: activity.uuid
      }
    }, wasSuccessful => {
      if( wasSuccessful ) {
        showNotification({
          message: "Activity added to duel",
          icon: <Check />,
          color: 'green',
          autoClose: 2000
        })
        onClose();
      }
    })
  }

  if( isLoading ) return <Loader />
  if( loadError ) return <Text color="red">Error loading duels: {loadError?.message}</Text>
  if( !duels ) return null;

  return <Modal opened={opened} onClose={onClose} title="Add Activity To Duel">
    <Text>Activity</Text><Text sx={{ fontWeight: 'bold'}}>{activity.name}</Text>
    <Text sx={{marginTop: '1rem'}}>Select an opponent</Text>
    {duels.map(duel => (
      <DuelItem
        key={duel.uuid}
        duel={duel}
        onSelect={(duelUuid: string) => setSelectedDuel(duelUuid)}
        isSelected={duel.uuid === selectedDuel}
      />
    ))}
    { saveError && <Box><Text color="red">{saveError.message}</Text></Box> }
    <Box sx={{display: 'flex', marginTop: '2rem', justifyContent: 'space-between'}}>
      <Button loading={isSaving} disabled={!selectedDuel} onClick={onConfirmClick}>Confirm</Button>
      <Button disabled={isSaving} color="gray" onClick={onClose}>Cancel</Button>
    </Box>
  </Modal>
}