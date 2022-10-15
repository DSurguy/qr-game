import { Box, Button, Modal, Text } from '@mantine/core';
import React from 'react';
import { useParams } from 'react-router-dom';
import { useServerResource } from '../../../../hooks/useServerResource';
import { ProjectItem } from '../../../../qr-types';

type Props = {
  opened: boolean;
  onClose: (didDelete: boolean) => void;
  item: ProjectItem;
}

export function DeleteItemModal ({ opened, onClose, item }: Props) {
  const { projectUuid, itemUuid } = useParams();

  const {
    isRemoving,
    removeError,
    remove
  } = useServerResource<void, void>({
    remove: `projects/${projectUuid}/items/${itemUuid}`
  })

  const handleRemoveConfirm = () => {
    remove(wasSuccessful => {
      if( wasSuccessful ) onClose(true);
    })
  }

  return <Modal opened={opened} onClose={() => onClose(false)} title="Delete Item">
    <Text component="p">
      Are you sure you want to delete {item.name}? ({item.uuid})
    </Text>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
      <Button color="red" onClick={handleRemoveConfirm}>Remove Item</Button>
      <Button color="gray" onClick={() => onClose(false)}>Cancel</Button>
    </Box>
  </Modal>
}