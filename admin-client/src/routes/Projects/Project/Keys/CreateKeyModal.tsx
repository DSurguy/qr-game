import { Box, Button, Modal, Text, TextInput } from '@mantine/core';
import { CreateProjectKeyPayload } from '@qrTypes';
import { Field, Form, Formik, FormikHelpers } from 'formik';
import React from 'react';
import { useParams } from 'react-router-dom';
import { useServerResource } from '../../../../hooks/useServerResource';

type Props = {
  opened: boolean;
  onClose: () => void;
}

type FormValues = {
  name: string;
}

export function CreateKeyModal({ opened, onClose }: Props) {
  const { projectUuid } = useParams();
  
  const {
    isSaving: isCreatingKey,
    saveError: createKeyError,
    create: createProjectKey,
  } = useServerResource<CreateProjectKeyPayload, null>({
    create: `projects/${projectUuid}/keys`,
  })

  const handleSubmit = (values: FormValues, helpers: FormikHelpers<FormValues>) => {
    createProjectKey({
      projectUuid,
      name: values.name
    }, (wasSuccessful) => {
      helpers.setSubmitting(false);
      if( wasSuccessful ) onClose();
    })
  }

  const initialValues: FormValues = {
    name: "New Key"
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Add More Players"
    >
      <Box>
        <Formik
          initialValues={initialValues}
          onSubmit={handleSubmit}
        >
          {({ errors }) => (
            <Form>
              <Field
                as={TextInput}
                name="name"
                label="Key Name"
                validate={(value: string) => !value ? 'Required' : null}
                error={errors.name}
              />
              { createKeyError && <Text color="red">{createKeyError.message}</Text> }
              <Box sx={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'flex-end'}}>
                <Button type="submit" disabled={isCreatingKey}>Claim</Button>
              </Box>
            </Form>
          )}
        </Formik>
      </Box>
    </Modal>
  )
}