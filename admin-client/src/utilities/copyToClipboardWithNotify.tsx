import React from 'react';
import { showNotification } from "@mantine/notifications";
import { AlertTriangle, Check } from "tabler-icons-react";

export default function copyToClipboardWithNotify (text: string) {
  navigator.clipboard.writeText(text).then(() => {
    showNotification({
      title: 'Portal Link Copied',
      icon: <Check />,
      message: text,
      color: 'green',
      autoClose: 2000
    })
  }, () => {
    showNotification({
      title: 'Portal Link Failed To Copy',
      icon: <AlertTriangle />,
      message: text,
      color: 'red',
      autoClose: 2000
    })
  });
}