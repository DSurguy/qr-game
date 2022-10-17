import React from 'react';
import { Button, Modal, Text, TextInput, useMantineTheme } from '@mantine/core';
import { Field, Form, Formik, FormikHelpers } from 'formik';
import { GamePlayer } from '../../qr-types';
import { useServerResource } from '../../hooks/useServerResource';
import { showNotification } from '@mantine/notifications';
import { Check } from 'tabler-icons-react';
import { useNavigate } from 'react-router-dom';

type Props = {
  opened: boolean;
  onClose: () => void;
  playerUuid: string;
  projectUuid: string;
}

type ClaimPayload = {
  projectUuid: string;
  displayName: string;
  realName: string;
}

export default function ClaimPlayerModal ({ opened, onClose, playerUuid, projectUuid }: Props) {
  const navigate = useNavigate();
  const {
    isSaving: isClaiming,
    saveError: claimError,
    create: claim
  } = useServerResource<ClaimPayload, GamePlayer>({
    create: `public/player/${playerUuid}/claim`,
  })
  const theme = useMantineTheme();

  const handleSubmit = (values: ClaimPayload, helpers: FormikHelpers<ClaimPayload>) => {
    if( isClaiming ) return;
    claim(values, wasSuccessful => {
      helpers.setSubmitting(false)
      if( wasSuccessful ) {
        showNotification({
          title: "Player Claimed",
          message: "Logging in...",
          icon: <Check />,
          autoClose: 2000
        })
        //TODO: Perhaps handle this more gracefully...
        navigate(`/portal?projectUuid=${projectUuid}&type=player&uuid=${playerUuid}&suppressNotifications`)
        onClose();
      }
    });
  }

  return <Modal opened={opened} onClose={onClose} title="Claim Player">
    <Formik initialValues={{
      projectUuid,
      displayName: "",
      realName: ""
    }} onSubmit={handleSubmit} enableReinitialize>
      {({ dirty }) => (
        <Form>
          {claimError && <Text color={theme.colors['errorColor'][7]}>{claimError.message}</Text>}
          <Field name="displayName" as={TextInput} label="Display Name" />
          <Field name="realName" as={TextInput} label="Your Real Name" />
          {<Button type="submit" disabled={!dirty || isClaiming} sx={{
            marginTop: theme.spacing['xs']
          }}>Claim</Button>}
        </Form>
      )}
    </Formik>
  </Modal>
}