import React, { useEffect, useState } from 'react';
import { Field, FieldAttributes, Form, Formik, FormikHelpers, useFormikContext } from 'formik';
import { createStyles, keyframes, Box, Button, Checkbox, NumberInput, Text, Textarea, useMantineTheme } from '@mantine/core';
import { useNavigate, useParams } from 'react-router-dom';
import { ProjectSettings } from '@qr-game/types';
import { CircleDotted, CircleDashed, AlertCircle, CircleCheck } from 'tabler-icons-react'
import { ADMIN_API_BASE } from '../../../constants';
import FormikNumberInput from '../../../components/inputs/FormikNumberInput';

const spin = keyframes({
  from: {
    transform: 'rotate(0deg)'
  },
  to: {
    transform: 'rotate(360deg)'
  }
})

const useSpinStyles = createStyles((theme) => ({
  spinningIcon: {
    animation: `${spin} 2s linear infinite`,
    width: '24px',
    height: '24px'
  }
}))

function useSaveForm (projectUuid: string) {
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<null | Error>(null)
  const save = (values: ProjectSettings, callback?: Function) => {
    setIsSaving(true);
    (async () => {
      try {
        const result = await fetch(`${ADMIN_API_BASE}/projects/${projectUuid}/settings`, {
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
        callback(true)
      } catch (e) {
        setError(e);
        callback(false)
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

const AutoSave = ({ duration = 1000 }: { duration?: number }) => {
  const { classes: { spinningIcon } } = useSpinStyles()
  const formik = useFormikContext();
  const [timeoutId, setTimeoutId] = useState(0);
  const [initial, setInitial] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => () => {
    if( timeoutId ) clearTimeout(timeoutId);
  }, [])

  useEffect(() => {
    if( initial ) {
      setInitial(false);
      return;
    }
    if( timeoutId ) clearTimeout(timeoutId)
    setTimeoutId(setTimeout(() => {
      formik.submitForm()
      setSaved(true);
      setTimeoutId(0)
    }, duration))
  }, [formik.values])

  let content = null;
  if( timeoutId ) content = <Box className={spinningIcon}><CircleDotted /></Box>
  else if( formik.isSubmitting ) content = <Box className={spinningIcon}><CircleDashed /></Box>;
  else if( Object.keys(formik.errors || {}).length ) content = <AlertCircle />;
  else if( saved ) content = <CircleCheck />;
  return content;
}

export function Settings() {
  const initialValues: ProjectSettings = {
    numPlayers: 50,
    duels: {
      allow: true,
      allowRematch: false
    }
  }
  const { projectUuid } = useParams();
  const [save, isSaving, error] = useSaveForm(projectUuid);

  const handleSubmit = (values: ProjectSettings, helpers: FormikHelpers<ProjectSettings>) => {
    if( isSaving ) return;
    save(values, () => helpers.setSubmitting(false));
  }

  return <Box>
    <Formik
      initialValues={initialValues}
      onSubmit={handleSubmit}
    >
      <Form>
        <AutoSave />
        {error && <Text color="red">{error.message}</Text>}
        <Text component="h3" sx={{ fontSize: '1.5rem', margin: 0 }}>Players</Text>
        <Field
          name="numPlayers"
          component={FormikNumberInput}
          mantineProps={{
            sx: { width: '8rem' },
            label: "Number of Players"
          }}
        />
        <Text component="h3" sx={{ fontSize: '1.5rem', margin: 0, marginTop: '1rem' }}>Duels</Text>
        <Field
          name="duels.allow"
        >
          {({ field, form }: FieldAttributes<any>) => (
            <Checkbox
              {...field}
              checked={field.value}
              label="Allow Duels"
              sx={{ marginTop: '0.5rem' }}
            />
          )}
        </Field>
        <Field
          name="duels.allowRematch"
        >
          {({ field, form }: FieldAttributes<any>) => (
            <Checkbox
              {...field}
              checked={field.value}
              label="Allow Duel Rematch"
              sx={{ marginTop: '0.5rem' }}
              disabled={(form.values?.duels?.allow !== true)}
            />
          )}
        </Field>
      </Form>
    </Formik>
  </Box>
}