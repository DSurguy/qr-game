import React from 'react';
import { Box, Button, Checkbox, Text, Textarea, TextInput, useMantineTheme } from '@mantine/core';
import { CreateProjectItemPayload, ProjectItem } from '@qrTypes';
import { Field, FieldAttributes, Form, Formik, FormikHelpers } from 'formik';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft } from 'tabler-icons-react';
import FormikNumberInput from '../../../../components/inputs/FormikNumberInput';
import { useServerResource } from '../../../../hooks/useServerResource';

export default function CreateItem() {
  const { projectUuid } = useParams();
  const theme = useMantineTheme();
  const navigate = useNavigate()

  const {isSaving, saveError, create} = useServerResource<CreateProjectItemPayload, ProjectItem>({
    create: `projects/${projectUuid}/items`
  });

  const handleSubmit = (values: CreateProjectItemPayload, helpers: FormikHelpers<CreateProjectItemPayload>) => {
    if( isSaving ) return;
    create(values, (saveSuccessful) => {
      helpers.setSubmitting(false)
      if( saveSuccessful ) navigate("..");
    });
  }

  const initialValues: CreateProjectItemPayload = {
    name: "New Item",
    description: "",
    cost: 10,
    imageBase64: "",
    availableForPurchase: true,
    canPurchaseMultiple: false,
    redemptionChallenge: ""
  }

  return (<Box>
    <Button
      compact
      variant="subtle"
      component={Link}
      to=".."
      leftIcon={<ChevronLeft size={16} />}
    >Back</Button>
    <Text component="h2">Create New Item</Text>
    <Formik initialValues={initialValues} onSubmit={handleSubmit} enableReinitialize>
      <Form>
        {saveError && <Text color="red">{saveError.message}</Text>}
        <Field name="name" as={TextInput} label="Activity Name" />
        <Field name="description" as={Textarea} label="Description" sx={{ marginTop: theme.spacing['xs'] }} />
        <Field
          name="cost"
          component={FormikNumberInput}
          mantineProps={{
            sx: { width: '8rem' },
            label: "cost"
          }}
        />
        <Field
          name="availableForPurchase"
        >
          {({ field }: FieldAttributes<any>) => (
            <Checkbox
              {...field}
              checked={field.value}
              label="Is Available For Purchase?"
              sx={{ marginTop: '0.5rem' }}
            />
          )}
        </Field>
        <Field
          name="canPurchaseMultiple"
        >
          {({ field }: FieldAttributes<any>) => (
            <Checkbox
              {...field}
              checked={field.value}
              label="Can Purchase Multiple?"
              sx={{ marginTop: '0.5rem' }}
            />
          )}
        </Field>
        <Field name="redemptionChallenge" as={TextInput} label="Redemption Challenge" />
        <Button type="submit" disabled={isSaving} sx={{
          marginTop: theme.spacing['xs']
        }}>Save Item</Button>
      </Form>
    </Formik>
  </Box>)
}