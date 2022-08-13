import React, { useState } from "react";
import { ADMIN_API_BASE, STORAGE_KEY_SESSION_ID } from "../constants";
import { ApiActionCallback } from "../types";
import { useLocalStoredState } from "./useLocalStoredState";

type ResourceEndpoints = {
  create?: string,
  update?: string,
  load?: string,
  // delete?: string,
  // restore?: string
}

export function useServerResource<UnsavedType, SavedType> (endpoints: ResourceEndpoints) {
  const [sessionId] = useLocalStoredState<string>(STORAGE_KEY_SESSION_ID)
  const [data, setData] = useState<null | SavedType>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [saveError, setSaveError] = useState<null | Error>(null);
  const [loadError, setLoadError] = useState<null | Error>(null);

  /**
   * Load resource from the server
   * @param callback A function that can perform cleanup actions, such as telling Formik loading is complete. It will receive one argument, indicating if the API action was successful or not
   */
  const load = (callback?: ApiActionCallback) => {
    if( typeof endpoints.load !== 'string' ) {
      setLoadError(new Error("No endpoint provided to load resource"));
      if( callback ) callback(false)
      return;
    }
    setIsLoading(true);
    (async () => {
      try {
        const result = await fetch(`${ADMIN_API_BASE}/${endpoints.load}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': sessionId
          }
        })
        if( result.status <= 299 && result.status >= 200 ) {
          if( result.headers.get('Content-Type')?.includes('application/json') )
            setData(await result.json());
          setLoadError(null);
          if( callback ) callback(true);
        }
        else {
          const message = (result.json() as any)['message'] || 'Internal Server Error'
          throw new Error(message)
        }
      } catch (e) {
        setLoadError(e);
        if( callback ) callback(false)
      } finally {
        setIsLoading(false);
      }
    })()
  }

  /**
   * Save resource to the server
   * @param values 
   * @param callback A function that can perform cleanup actions, such as telling Formik submission is complete. It will receive one argument, indicating if the API action was successful or not
   */
  const update = (values: SavedType, callback?: ApiActionCallback) => {
    if( typeof endpoints.update !== 'string' ) {
      setSaveError(new Error("No endpoint provided to update resource"));
      if( callback ) callback(false)
      return;
    }
    setIsSaving(true);
    (async () => {
      try {
        const result = await fetch(`${ADMIN_API_BASE}/${endpoints.update}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': sessionId
          },
          body: JSON.stringify(values)
        })
        if( result.status > 299 || result.status < 200 ) {
          const message = (result.json() as any)['message'] || 'Internal Server Error'
          throw new Error(message)
        }
        if( result.headers.get('Content-Type')?.includes('application/json') )
          setData(await result.json());
        setSaveError(null);
        if( callback ) callback(true);
      } catch (e) {
        setSaveError(e);
        if( callback ) callback(false)
      } finally {
        setIsSaving(false);
      }
    })()
  }

  /**
   * Save a new resource to the server
   * @param values 
   * @param callback A function that can perform cleanup actions, such as telling Formik submission is complete. It will receive one argument, indicating if the API action was successful or not
   */
  const create = (values: UnsavedType, callback?: ApiActionCallback) => {
    if( typeof endpoints.create !== 'string' ) {
      setSaveError(new Error("No endpoint provided to create resource"));
      if( callback ) callback(false)
      return;
    }
    setIsSaving(true);
    (async () => {
      try {
        const result = await fetch(`${ADMIN_API_BASE}/${endpoints.create}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': sessionId
          },
          body: JSON.stringify(values)
        })
        if( result.status > 299 || result.status < 200 ) {
          const message = (result.json() as any)['message'] || 'Internal Server Error'
          throw new Error(message)
        }
        if( result.headers.get('Content-Type')?.includes('application/json') )
          setData(await result.json());
        setSaveError(null);
        if( callback ) callback(true);
      } catch (e) {
        setSaveError(e);
        if( callback ) callback(false)
      } finally {
        setIsSaving(false);
      }
    })()
  }

  return {
    data,
    isSaving,
    isLoading,
    loadError,
    saveError,
    load,
    update,
    create
  } as const
}