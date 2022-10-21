import React, { useState } from "react";
import { ADMIN_API_BASE } from "../constants";
import { ApiActionCallback } from "../types";

export function useDownloadFile<PayloadType> (endpoint: string, method: string) {
  const [blob, setBlob] = useState<null | Blob>(null);
  const [filename, setFilename] = useState<null | string>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<null | Error>(null);

  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Api-Key': PROCESS_ENV_API_KEY
  })

  const getEmptyBodyHeaders = () => ({
    'Api-Key': PROCESS_ENV_API_KEY
  })

  const performClientSideDownloadAction = (blob: Blob, filename: string) => {
    var url = window.URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  /**
   * Save a new resource to the server
   * @param values 
   * @param callback A function that can perform cleanup actions, such as telling Formik submission is complete. It will receive one argument, indicating if the API action was successful or not
   */
  const download = (payload: PayloadType, callback?: ApiActionCallback) => {
    setIsLoading(true);
    (async () => {
      try {
        const result = await fetch(`${ADMIN_API_BASE}/${endpoint}`, {
          method,
          headers: payload ? getHeaders() : getEmptyBodyHeaders(),
          body: payload ? JSON.stringify(payload) : undefined
        })
        if( result.status > 299 || result.status < 200 ) {
          const message = (result.json() as any)['message'] || 'Internal Server Error'
          throw new Error(message)
        }
        const blob = await result.blob();
        let filename: string;
        const header = result.headers.get('Content-Disposition');
        console.log(header);
        if( header ) {
          const namePart = header.split(/;\s*/g).find(part => part.split('=')[0] === 'filename')
          filename = namePart?.split('=')[1].replace(/"/g, "") || "download";
        }
        else filename = "download";
        setBlob(blob);
        setFilename(filename);
        performClientSideDownloadAction(blob, filename);
        setLoadError(null);
        callback(true);
      } catch (e) {
        console.error(e);
        setLoadError(e);
        callback(false)
      } finally {
        setIsLoading(false);
      }
    })()
  }

  return {
    blob,
    filename,
    isLoading,
    loadError,
    download
  } as const
}