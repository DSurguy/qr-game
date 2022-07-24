import React from 'react';
import { Box, Button, Modal, Text, TextInput } from '@mantine/core'
import { Field, Form, Formik, FormikHelpers } from 'formik';
import { SavedPlayerType } from '@qr-game/types';
import { useServerResource } from '../../../../hooks/useServerResource';

type Props = {
  opened: boolean,
  onClose: () => void,
  player: SavedPlayerType
}

type FormValues = {
  name: string;
}

export default function ClaimPlayerModal({ opened, onClose, player }: Props) {
  const {
    isSaving,
    saveError,
    update
  } = useServerResource<SavedPlayerType, SavedPlayerType>({
    update: `projects/${player.projectUuid}/players/${player.uuid}`
  })

  const handleSubmit = (values: FormValues, helpers: FormikHelpers<FormValues>) => {
    update({
      ...player,
      claimed: 1,
      name: values.name
    }, (wasSuccessful) => {
      helpers.setSubmitting(false);
      if( wasSuccessful ) onClose();
    })
  }

  const initialValues: FormValues = {
    name: ""
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Claim Player"
    >
      <Box>
        <Text component="p">Enter your desired display name below to claim this player.</Text>
        <Formik
          initialValues={initialValues}
          onSubmit={handleSubmit}
        >
          {({ errors }) => (
            <Form>
              <Field
                as={TextInput}
                name="name"
                label="Player Name"
                validate={(value: string) => !value ? 'Required' : null}
                error={errors.name}
              />
              { saveError && <Text color="red">{saveError.message}</Text> }
              <Box sx={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'flex-end'}}>
                <Button type="submit" disabled={isSaving}>Claim</Button>
              </Box>
            </Form>
          )}
        </Formik>
      </Box>
    </Modal>
  )
}