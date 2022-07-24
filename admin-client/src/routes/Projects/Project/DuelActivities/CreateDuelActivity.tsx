import React from 'react';
import { Box, Button, Text, Textarea, TextInput, useMantineTheme } from '@mantine/core';
import { SavedDuelActivityType, UnsavedDuelActivityType } from '@qr-game/types';
import { Field, Form, Formik, FormikHelpers } from 'formik';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft } from 'tabler-icons-react';
import FormikNumberInput from '../../../../components/inputs/FormikNumberInput';
import { useServerResource } from '../../../../hooks/useServerResource';

export default function CreateDuelActivity() {
  const { projectUuid } = useParams();
  const theme = useMantineTheme();
  const navigate = useNavigate()
  const {isSaving, saveError, create} = useServerResource<UnsavedDuelActivityType, SavedDuelActivityType>({
    create: `projects/${projectUuid}/duelActivities`
  });

  const handleSubmit = (values: UnsavedDuelActivityType, helpers: FormikHelpers<UnsavedDuelActivityType>) => {
    if( isSaving ) return;
    create(values, (saveSuccessful) => {
      helpers.setSubmitting(false)
      if( saveSuccessful ) navigate("..");
    });
  }

  const initialValues: UnsavedDuelActivityType = {
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
    <Text component="h2">Create New Duel Activity</Text>
    <Formik initialValues={initialValues} onSubmit={handleSubmit} enableReinitialize>
      <Form>
        {saveError && <Text color="red">{saveError.message}</Text>}
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