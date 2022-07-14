import React, { useState } from 'react';
import { Field, Form, Formik } from 'formik';
import { Box, Textarea, TextInput, useMantineTheme } from '@mantine/core';

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
  return <Box>
    <Formik initialValues={initialValues} onSubmit={handleSubmit}>
      <Form>
        <Field name="projectName" as={TextInput} label="Project Name" />
        <Field name="projectDescription" as={Textarea} label="Project Description" sx={{ marginTop: theme.spacing['xs'] }} />
      </Form>
    </Formik>
  </Box>
}