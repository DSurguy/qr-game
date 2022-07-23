import React, { useEffect, useState } from 'react';
import { useFormikContext } from 'formik';
import { createStyles, keyframes, Box } from '@mantine/core';
import { CircleDotted, CircleDashed, AlertCircle, CircleCheck } from 'tabler-icons-react'

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

export const AutoSave = ({ duration = 500 }: { duration?: number }) => {
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