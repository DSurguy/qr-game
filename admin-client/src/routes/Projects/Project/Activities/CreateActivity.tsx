import React from 'react';
import { Box, Button, Card, Checkbox, Text, Textarea, TextInput, useMantineTheme } from '@mantine/core';
import { SavedActivity, UnsavedActivity } from '@qrTypes';
import { Field, FieldAttributes, Form, Formik, FormikHelpers } from 'formik';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft } from 'tabler-icons-react';
import FormikNumberInput from '../../../../components/inputs/FormikNumberInput';
import { useServerResource } from '../../../../hooks/useServerResource';

export default function CreateActivity() {
  const { projectUuid } = useParams();
  const theme = useMantineTheme();
  const navigate = useNavigate()
  const {isSaving, saveError, create} = useServerResource<UnsavedActivity, SavedActivity>({
    create: `projects/${projectUuid}/activities`
  });

  const handleSubmit = (values: UnsavedActivity, helpers: FormikHelpers<UnsavedActivity>) => {
    if( isSaving ) return;
    create(values, (saveSuccessful) => {
      helpers.setSubmitting(false)
      if( saveSuccessful ) navigate("..");
    });
  }

  const initialValues: UnsavedActivity = {
    name: "New Activity",
    description: "",
    value: 1,
    isRepeatable: false,
    repeatValue: 0,
    isDuel: false
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
        <Field
          name="isRepeatable"
        >
          {({ field }: FieldAttributes<any>) => (
            <Checkbox
              {...field}
              checked={field.value}
              label="Is Repeatable?"
              sx={{ marginTop: '0.5rem' }}
            />
          )}
        </Field>
        <Field
          name="repeatValue"
        >
          {({ field, form }: FieldAttributes<any>) => (
            <FormikNumberInput
              field={field}
              form={form}
              mantineProps={{
                disabled: form.values?.isRepeatable !== true,
                sx: { width: '8rem' },
                label: "Repeat Value"
              }}
            />
          )}
        </Field>
        <Card shadow="sm" radius="md" sx={{ margin: '1rem' }} withBorder>
          <Card.Section sx={{ borderBottom: `1px solid ${theme.colors.gray[3]}`, marginBottom: '1rem'}}>
            <Text weight="bold" sx={{ margin: '0.25rem 1rem'}}>Duel Settings</Text>
          </Card.Section>
          <Box>
            <Field
              name="isDuel"
            >
              {({ field }: FieldAttributes<any>) => (
                <Checkbox
                  {...field}
                  checked={field.value}
                  label="Is Duel?"
                  sx={{ marginTop: '0.5rem' }}
                />
              )}
            </Field>
          </Box>
        </Card>
        <Button type="submit" disabled={isSaving} sx={{
          marginTop: theme.spacing['xs']
        }}>Save Activity</Button>
      </Form>
    </Formik>
  </Box>)
}