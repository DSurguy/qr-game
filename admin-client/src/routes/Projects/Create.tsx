import React, { useState } from 'react';
import { Field, Form, Formik } from 'formik';
import { Box, Button, Text, Textarea, TextInput, useMantineTheme } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { ADMIN_API_BASE } from '../../constants';

type FormValues = {
  projectName: string;
  projectDescription: string;
}

const initialValues: FormValues = {
  projectName: "Test Project Name",
  projectDescription: ""
}

const formToApi = (values: FormValues) => {
  return {
    name: values.projectName,
    description: values.projectDescription
  }
}

function useSaveForm (onSave: Function) {
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<null | Error>(null)
  const save = (values: FormValues) => {
    setIsSaving(true);
    (async () => {
      try {
        const result = await fetch(`${ADMIN_API_BASE}/projects`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formToApi(values))
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
  const handleSubmit = (values: FormValues) => {
    if( isSaving ) return;
    save(values);
  }
  return <Box>
    <Formik initialValues={initialValues} onSubmit={handleSubmit}>
      <Form>
        {error && <Text color="red">{error.message}</Text>}
        <Field name="projectName" as={TextInput} label="Project Name" />
        <Field name="projectDescription" as={Textarea} label="Project Description" sx={{ marginTop: theme.spacing['xs'] }} />
        <Button type="submit" disabled={isSaving} sx={{
          marginTop: theme.spacing['xs']
        }}>Save Project</Button>
      </Form>
    </Formik>
  </Box>
}