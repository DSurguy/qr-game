import React, { useState } from 'react';
import { Field, FieldAttributes, Form, Formik } from 'formik';
import { Box, Button, Checkbox, Text, Textarea, TextInput, useMantineTheme } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { ADMIN_API_BASE } from '../../constants';
import FormikNumberInput from '../../components/inputs/FormikNumberInput';
import { UnsavedProjectType } from '@qr-game/types';

const initialValues: UnsavedProjectType = {
  name: "Test Project Name",
  description: "",
  numPlayers: 50,
  settings: {
    duels: {
      allow: true,
      allowRematch: false
    }
  }
}

function useSaveForm (onSave: Function) {
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<null | Error>(null)
  const save = (values: UnsavedProjectType) => {
    setIsSaving(true);
    (async () => {
      try {
        const result = await fetch(`${ADMIN_API_BASE}/projects`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(values)
        })
        if( result.status > 299 || result.status < 200 ) {
          const message = (result.json() as any)['message'] || 'Internal Server Error'
          throw new Error(message)
        }
        onSave()
      } catch (e) {
        setError(e);
      } finally {
        setIsSaving(false);
      }
    })()
  }
  return [
    save,
    isSaving,
    error,
  ] as const;
}

export function CreateProjectRoute() {
  const theme = useMantineTheme()
  const navigate = useNavigate();
  const [save, isSaving, error] = useSaveForm(() => {
    navigate('/projects')
  });
  const handleSubmit = (values: UnsavedProjectType) => {
    if( isSaving ) return;
    save(values);
  }
  return <Box>
    <Formik initialValues={initialValues} onSubmit={handleSubmit}>
      <Form>
        {error && <Text color="red">{error.message}</Text>}
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
        <Button type="submit" disabled={isSaving} sx={{
          marginTop: theme.spacing['xs']
        }}>Save Project</Button>
      </Form>
    </Formik>
  </Box>
}