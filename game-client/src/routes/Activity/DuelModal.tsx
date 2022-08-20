import React, { useEffect } from 'react';
import { Box, Loader, Modal, Text } from '@mantine/core';
import { DuelState, Duel } from '../../qr-types'; //TODO: Figure out why we can't import an enum, this is horrible
import { useServerResource } from '../../hooks/useServerResource';

type Props = {
  opened: boolean,
  onClose: () => void;
}

export default function DuelModal({ opened, onClose }: Props) {
  const {
    data: duels,
    isLoading,
    loadError,
    load
  } = useServerResource<null, Duel[]>({
    load: `game/duels?state=${DuelState.Created}`,
  })

  useEffect(() => {
    load();
  }, [])

  const addToDuelContent = (duel: Duel) => {
    return <Text>Add this activity to your pending duel?</Text>
  }

  const newDuelContent = () => {
    return <Text>Start a new duel with this activity?</Text>
  }

  const content = () => {
    if( isLoading ) return <Loader />
    if( loadError ) return <Text color="red">{loadError?.message}</Text>
    if( !duels ) return null;
    return <Box>
      {duels[0] ? addToDuelContent(duels[0]) : newDuelContent()}
    </Box>
  }

  return <Modal opened={opened} onClose={onClose}>
    {content()}
  </Modal>
}