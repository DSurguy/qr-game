import React, { useEffect, useState } from 'react';
import { Box, Button, Loader, Text } from '@mantine/core';
import { useParams } from 'react-router-dom';
import { ProjectKey } from '@qrTypes';
import { useServerResource } from '../../../../hooks/useServerResource';
import { KeyListItem } from './KeyListItem';
import { CreateKeyModal } from './CreateKeyModal';

export function ProjectKeysRoute() {
  const { projectUuid } = useParams();
  const [keyModalOpen, setKeyModalOpen] = useState(false);
  const {
    data: keys,
    isLoading: isLoadingKeys,
    loadError: loadKeysError,
    load: loadProjectKeys,
  } = useServerResource<null, ProjectKey[]>({
    load: `projects/${projectUuid}/keys`
  })

  useEffect(() => {
    loadProjectKeys();
  }, [])

  const onKeyModalClose = () => {
    loadProjectKeys();
    setKeyModalOpen(false);
  }

  if( isLoadingKeys ) return <Loader />
  if( loadKeysError ) return <Text color="red">{loadKeysError.message}</Text>
  if( !keys ) return null;

  return <Box>
    <Box>
      <Button onClick={() => setKeyModalOpen(true)}>Create New Key</Button>
    </Box>
    {keys.map(key => {
      return <KeyListItem projectKey={key} projectUuid={projectUuid} key={key.uuid} onKeyChange={loadProjectKeys} />
    })}
    <CreateKeyModal opened={keyModalOpen} onClose={onKeyModalClose} />
  </Box>
}