import React from 'react';
import { NumberInput, NumberInputProps } from "@mantine/core";
import { Field, FieldAttributes } from 'formik';

interface Props extends FieldAttributes<any> {
  mantineProps: NumberInputProps
}

export default function FormikNumberInput({field, form: { setFieldValue }, mantineProps}: Props) {
  return (
    <NumberInput {...field} {...mantineProps} onChange={(value: number) => setFieldValue(field.name, value)} />
  )
}