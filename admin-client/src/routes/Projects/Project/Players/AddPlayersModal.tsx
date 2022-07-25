import React from 'react';
import { Box, Button, Modal, Text } from '@mantine/core'
import { Field, Form, Formik, FormikHelpers } from 'formik';
import { useServerResource } from '../../../../hooks/useServerResource';
import FormikNumberInput from '../../../../components/inputs/FormikNumberInput';
import { useParams } from 'react-router-dom';

type Props = {
  opened: boolean,
  onClose: () => void
}

type FormValues = {
  numPlayers: number
}

export default function AddPlayersModal({ opened, onClose }: Props) {
  const { projectUuid } = useParams();
  const {
    isSaving,
    saveError,
    create
  } = useServerResource<FormValues, null>({
    create: `projects/${projectUuid}/players`
  })

  const handleSubmit = (values: FormValues, helpers: FormikHelpers<FormValues>) => {
    create(values, (wasSuccessful) => {
      helpers.setSubmitting(false);
      if( wasSuccessful ) onClose();
    })
  }

  const initialValues: FormValues = {
    numPlayers: 10
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Add More Players"
    >
      <Box>
        <Text component="p">How many players would you like to add?</Text>
        <Formik
          initialValues={initialValues}
          onSubmit={handleSubmit}
        >
          {({ errors }) => (
            <Form>
              <Field
                component={FormikNumberInput}
                name="numPlayers"
                mantineProps={{
                  min: 1
                }}
                validate={(value: number) => (value <= 0 || !value) ? 'Required' : null}
                error={errors.numPlayers}
              />
              { saveError && <Text color="red">{saveError.message}</Text> }
              <Box sx={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'flex-end'}}>
                <Button type="submit" disabled={isSaving}>Add</Button>
              </Box>
            </Form>
          )}
        </Formik>
      </Box>
    </Modal>
  )
}