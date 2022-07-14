import React from 'react';
import { PageLayout } from '../../components/PageLayout';
import { Field, Form, Formik } from 'formik';
import { Textarea, TextInput, useMantineTheme } from '@mantine/core';

type FormValues = {
  projectName: string;
  projectDescription: string;
}

const initialValues: FormValues = {
  projectName: "Test Project Name",
  projectDescription: ""
}

export function CreateProjectRoute() {
  const theme = useMantineTheme()
  const handleSubmit = (values: FormValues) => {
    console.log(values);
  }
  return <PageLayout>
    <Formik initialValues={initialValues} onSubmit={handleSubmit}>
      <Form>
        <Field name="projectName" as={TextInput} label="Project Name" />
        <Field name="projectDescription" as={Textarea} label="Project Description" sx={{ marginTop: theme.spacing['xs'] }} />
      </Form>
    </Formik>
  </PageLayout>
}