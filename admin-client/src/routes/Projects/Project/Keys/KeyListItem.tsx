import { Box, Button, Text, TextInput } from '@mantine/core';
import { ProjectKey } from '@qrTypes';
import React, { useEffect, useState } from 'react';
import { useServerResource } from 'src/hooks/useServerResource';
import { DeviceFloppy, Trash } from 'tabler-icons-react';

type Props = {
  projectUuid: string;
  projectKey: ProjectKey;
  onKeyChange: () => void;
}

export function KeyListItem({ projectUuid, projectKey, onKeyChange }: Props) {
  const [keyName, setKeyName] = useState(projectKey.name);

  useEffect(() => {
    setKeyName(projectKey.name);
  }, [projectKey])

  const {
    isSaving: isUpdatingKey,
    saveError: updateKeyError,
    update: updateProjectKey
  } = useServerResource<ProjectKey, ProjectKey>({
    update: `projects/${projectUuid}/keys`
  })

  const {
    isRemoving: isDeletingKey,
    removeError: deleteKeyError,
    remove: deleteProjectKey
  } = useServerResource<ProjectKey, null>({
    remove: `projects/${projectUuid}/keys`
  })

  const onSaveClick = () => {
    updateProjectKey({
      ...projectKey,
      name: keyName
    }, wasSuccessful => {
      if( wasSuccessful ) onKeyChange();
    })
  }

  const onDeleteClick = () => {
    deleteProjectKey(projectKey, wasSuccessful => {
      if( wasSuccessful ) onKeyChange();
    })
  }

  return (
    <Box>
      { updateKeyError && <Text color="red">{updateKeyError.message || 'Error Updating Key'}</Text> }
      { deleteKeyError && <Text color="red">{deleteKeyError.message || 'Error Deleting Key'}</Text> }
      <Box sx={{display: 'flex'}}>
        <TextInput label="Key Name" onChange={e => setKeyName(e.target.value)} value={keyName} />
        { keyName === projectKey.name &&
          <Button loading={isUpdatingKey} disabled={isDeletingKey} onClick={onSaveClick}>
            <DeviceFloppy size={14} />
          </Button>
        }
        <Button color="red" loading={isDeletingKey} disabled={isUpdatingKey} onClick={onDeleteClick}>
          <Trash size={14} />
        </Button>
      </Box>
    </Box>
  )
}