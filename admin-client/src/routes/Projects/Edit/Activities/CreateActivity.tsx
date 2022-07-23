import { Box, Button, Text, Textarea, TextInput, useMantineTheme } from '@mantine/core';
import { UnsavedActivityType } from '@qr-game/types';
import { Field, Form, Formik, FormikHelpers } from 'formik';
import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft } from 'tabler-icons-react';
import FormikNumberInput from '../../../../components/inputs/FormikNumberInput';
import { ADMIN_API_BASE } from '../../../../constants';
import { ApiActionCallback } from '../../../../types';

const useSaveActivity = (projectUuid: string) => {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<null | Error>(null);

  /**
   * Save project settings to the server
   * @param values 
   * @param callback A function that can perform cleanup actions, such as telling Formik submission is complete. It will receive one argument, indicating if the API action was successful or not
   */
  const save = (values: UnsavedActivityType, callback?: ApiActionCallback) => {
    setIsSaving(true);
    (async () => {
      try {
        const result = await fetch(`${ADMIN_API_BASE}/projects/${projectUuid}/activities`, {
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
        setError(null);
        callback(true);
      } catch (e) {
        setError(e);
        callback(false)
      } finally {
        setIsSaving(false);
      }
    })()
  }

  return {
    isSaving,
    error,
    save
  } as const
}

export default function CreateActivity() {
  const { projectUuid } = useParams();
  const theme = useMantineTheme();
  const navigate = useNavigate()
  const {isSaving, error, save} = useSaveActivity(projectUuid);

  const handleSubmit = (values: UnsavedActivityType, helpers: FormikHelpers<UnsavedActivityType>) => {
    if( isSaving ) return;
    save(values, (saveSuccessful) => {
      helpers.setSubmitting(false)
      if( saveSuccessful ) navigate("..");
    });
  }

  const initialValues: UnsavedActivityType = {
    name: "New Activity",
    description: "",
    value: 1
  }

  return (<Box>
    <Button
      compact
      variant="subtle"
      component={Link}
      to=".."
      leftIcon={<ChevronLeft size={16} />}
    >Back</Button>
    <Text component="h2">Create New Activity</Text>
    <Formik initialValues={initialValues} onSubmit={handleSubmit}>
      <Form>
        {error && <Text color="red">{error.message}</Text>}
        <Field name="name" as={TextInput} label="Activity Name" />
        <Field name="description" as={Textarea} label="Description" sx={{ marginTop: theme.spacing['xs'] }} />
        <Field
            name="value"
            component={FormikNumberInput}
            mantineProps={{
              sx: { width: '8rem' },
              label: "Value"
            }}
          />
        <Button type="submit" disabled={isSaving} sx={{
          marginTop: theme.spacing['xs']
        }}>Save Activity</Button>
      </Form>
    </Formik>
  </Box>)
}