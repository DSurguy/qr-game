import React from 'react';
import { Field, FieldAttributes, Form, Formik, FormikHelpers } from 'formik';
import { Box, Button, Checkbox, Text, Textarea, TextInput, useMantineTheme } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import FormikNumberInput from '../../components/inputs/FormikNumberInput';
import { SavedProjectType, UnsavedProjectType } from '@qr-game/types';
import { useServerResource } from '../../hooks/useServerResource';

const initialValues: UnsavedProjectType = {
  name: "Test Project Name",
  description: "",
  numPlayers: 50,
  settings: {
    duels: {
      allow: true,
      allowRematch: false
    },
    initialPlayerBalance: 0
  }
}

export function CreateProjectRoute() {
  const theme = useMantineTheme()
  const navigate = useNavigate();

  const {
    create,
    isSaving,
    saveError
  } = useServerResource<UnsavedProjectType, SavedProjectType>({
    create: 'projects'
  });
  const handleSubmit = (values: UnsavedProjectType, helpers: FormikHelpers<UnsavedProjectType>) => {
    if( isSaving ) return;
    create(values, (wasSuccessful) => {
      if( wasSuccessful ) navigate('/projects')
      helpers.setSubmitting(false)
    });
  }
  return <Box>
    <Formik initialValues={initialValues} onSubmit={handleSubmit} enableReinitialize>
      <Form>
        {saveError && <Text color="red">{saveError.message}</Text>}
        <Field name="name" as={TextInput} label="Project Name" />
        <Field name="description" as={Textarea} label="Project Description" sx={{ marginTop: theme.spacing['xs'] }} />
        <Field
          name="numPlayers"
          component={FormikNumberInput}
          mantineProps={{
            sx: { width: '8rem' },
            label: "Number of Players"
          }}
        />
        <Text component="h3">Settings</Text>
        <Field
          name="settings.duels.allow"
        >
          {({ field }: FieldAttributes<any>) => (
            <Checkbox
              {...field}
              checked={field.value}
              label="Allow Duels"
              sx={{ marginTop: '0.5rem' }}
            />
          )}
        </Field>
        <Field
          name="settings.duels.allowRematch"
        >
          {({ field, form }: FieldAttributes<any>) => (
            <Checkbox
              {...field}
              checked={field.value}
              label="Allow Duel Rematch"
              sx={{ marginTop: '0.5rem' }}
              disabled={(form.values?.settings?.duels?.allow !== true)}
            />
          )}
        </Field>
        <Field
          name="settings.initialPlayerBalance"
          component={FormikNumberInput}
          mantineProps={{
            sx: { width: '8rem', marginTop: '0.5rem' },
            label: "Initial Player Balance"
          }}
        />
        <Button type="submit" disabled={isSaving} sx={{
          marginTop: theme.spacing['xs']
        }}>Save Project</Button>
      </Form>
    </Formik>
  </Box>
}