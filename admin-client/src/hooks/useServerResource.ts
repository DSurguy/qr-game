import React, { useState } from "react";
import { ADMIN_API_BASE } from "../constants";
import { ApiActionCallback } from "../types";

type ResourceEndpoints = {
  create?: string,
  update?: string,
  load?: string,
  remove?: string
}

export function useServerResource<UnsavedType, SavedType> (endpoints: ResourceEndpoints) {
  const [data, setData] = useState<null | SavedType>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [saveError, setSaveError] = useState<null | Error>(null);
  const [loadError, setLoadError] = useState<null | Error>(null);
  const [removeError, setRemoveError] = useState<null | Error>(null);

  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Api-Key': PROCESS_ENV_API_KEY
  })

  const getEmptyBodyHeaders = () => ({
    'Api-Key': PROCESS_ENV_API_KEY
  })

  /**
   * Load resource from the server
   * @param callback A function that can perform cleanup actions, such as telling Formik loading is complete. It will receive one argument, indicating if the API action was successful or not
   */
  const load = (callback?: ApiActionCallback) => {
    if( !endpoints.load ) {
      setLoadError(new Error("No endpoint provided to load resource"));
      if( callback ) callback(false)
      return;
    }
    setIsLoading(true);
    (async () => {
      try {
        const result = await fetch(`${ADMIN_API_BASE}/${endpoints.load}`, {
          method: 'GET',
          headers: getHeaders()
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
    if( !endpoints.update ) {
      setSaveError(new Error("No endpoint provided to update resource"));
      if( callback ) callback(false)
      return;
    }
    setIsSaving(true);
    (async () => {
      try {
        const result = await fetch(`${ADMIN_API_BASE}/${endpoints.update}`, {
          method: 'PUT',
          headers: getHeaders(),
          body: JSON.stringify(values)
        })
        if( result.status > 299 || result.status < 200 ) {
          const message = (result.json() as any)['message'] || 'Internal Server Error'
          throw new Error(message)
        }
        if( result.headers.get('Content-Type')?.includes('application/json') )
          setData(await result.json());
        setSaveError(null);
        callback(true);
      } catch (e) {
        setSaveError(e);
        callback(false)
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
    if( !endpoints.create ) {
      setSaveError(new Error("No endpoint provided to create resource"));
      if( callback ) callback(false)
      return;
    }
    setIsSaving(true);
    (async () => {
      try {
        const result = await fetch(`${ADMIN_API_BASE}/${endpoints.create}`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify(values)
        })
        if( result.status > 299 || result.status < 200 ) {
          const message = (result.json() as any)['message'] || 'Internal Server Error'
          throw new Error(message)
        }
        if( result.headers.get('Content-Type')?.includes('application/json') )
          setData(await result.json());
        setSaveError(null);
        callback(true);
      } catch (e) {
        setSaveError(e);
        callback(false)
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
   const remove = (callback?: ApiActionCallback) => {
    if( !endpoints.remove ) {
      setRemoveError(new Error("No endpoint provided to remove resource"));
      if( callback ) callback(false)
      return;
    }
    setIsRemoving(true);
    (async () => {
      try {
        const result = await fetch(`${ADMIN_API_BASE}/${endpoints.remove}`, {
          method: 'DELETE',
          headers: getEmptyBodyHeaders()
        })
        if( result.status > 299 || result.status < 200 ) {
          const message = (result.json() as any)['message'] || 'Internal Server Error'
          throw new Error(message)
        }
        setRemoveError(null);
        callback(true);
      } catch (e) {
        setRemoveError(e);
        callback(false)
      } finally {
        setIsRemoving(false);
      }
    })()
  }

  return {
    data,
    isSaving,
    isLoading,
    isRemoving,
    loadError,
    saveError,
    removeError,
    load,
    update,
    create,
    remove
  } as const
}