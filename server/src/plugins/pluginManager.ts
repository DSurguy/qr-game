import { PluginHookResponse, PluginPreHookResponse } from "../qr-types";
import { DuelCancelledHookHandler, DuelCancelledHookPayload, DuelCompleteHookHandler, DuelCompleteHookPayload, ItemPreRedemptionHookHandler, ItemPreRedemptionHookPayload, ItemRedemptionHookHandler, ItemRedemptionHookPayload, PluginPayload, QrGamePlugin } from "./pluginTypes"

export interface PluginManager {
  applyPlugin: (plugin: QrGamePlugin) => void;
  runItemRedemptionHook: (payload: ItemRedemptionHookPayload) => PluginHookResponse[];
  runItemPreRedemptionHook: (payload: ItemPreRedemptionHookPayload) => PluginPreHookResponse[];
  runDuelCompleteHook: (payload: DuelCompleteHookPayload) => PluginHookResponse[];
  runDuelCancelledHook: (payload: DuelCancelledHookPayload) => PluginHookResponse[];
}

export function createPluginManager(): PluginManager {
  const handlers = {
    itemRedemption: [] as ItemRedemptionHookHandler[],
    preItemRedemption: [] as ItemPreRedemptionHookHandler[],
    duelComplete: [] as DuelCompleteHookHandler[],
    duelCancelled: [] as DuelCancelledHookHandler[]
  }

  const addItemRedemptionHook: PluginPayload['addItemRedemptionHook'] = (handler) => {
    if( !handlers.itemRedemption.includes(handler) )
      handlers.itemRedemption.push(handler)
  }

  const removeItemRedemptionHook: PluginPayload['removeItemRedemptionHook'] = (handlerToRemove) => {
    handlers.itemRedemption = handlers.itemRedemption.filter(handler => handler !== handlerToRemove );
  }

  const runItemRedemptionHook = (payload: ItemRedemptionHookPayload): PluginHookResponse[] => {
    const responses: PluginHookResponse[] = [];
    for( let handler of handlers.itemRedemption ){
      const response = handler(payload);
      if( response ) responses.push(response);
    }
    return responses;
  }

  const addItemPreRedemptionHook: PluginPayload['addItemPreRedemptionHook'] = (handler) => {
    if( !handlers.preItemRedemption.includes(handler) )
      handlers.preItemRedemption.push(handler)
  }

  const removeItemPreRedemptionHook: PluginPayload['removeItemPreRedemptionHook'] = (handlerToRemove) => {
    handlers.preItemRedemption = handlers.preItemRedemption.filter(handler => handler !== handlerToRemove );
  }

  const runItemPreRedemptionHook = (payload: ItemPreRedemptionHookPayload): PluginPreHookResponse[] => {
    const responses: PluginPreHookResponse[] = [];
    for( let handler of handlers.preItemRedemption ){
      const response = handler(payload);
      if( response ) responses.push(response);
    }
    return responses;
  }

  const addDuelCompleteHook: PluginPayload['addDuelCompleteHook'] = (handler) => {
    if( !handlers.duelComplete.includes(handler) )
      handlers.duelComplete.push(handler)
  }

  const removeDuelCompleteHook: PluginPayload['removeDuelCompleteHook'] = (handlerToRemove) => {
    handlers.duelComplete = handlers.duelComplete.filter(handler => handler !== handlerToRemove );
  }

  const runDuelCompleteHook = (payload: DuelCompleteHookPayload): PluginHookResponse[] => {
    const responses: PluginHookResponse[] = [];
    for( let handler of handlers.duelComplete ){
      const response = handler(payload);
      if( response ) responses.push(response);
    }
    return responses;
  }

  const addDuelCancelledHook: PluginPayload['addDuelCancelledHook'] = (handler) => {
    if( !handlers.duelCancelled.includes(handler) )
      handlers.duelCancelled.push(handler)
  }

  const removeDuelCancelledHook: PluginPayload['removeDuelCancelledHook'] = (handlerToRemove) => {
    handlers.duelCancelled = handlers.duelCancelled.filter(handler => handler !== handlerToRemove );
  }

  const runDuelCancelledHook = (payload: DuelCancelledHookPayload): PluginHookResponse[] => {
    const responses: PluginHookResponse[] = [];
    for( let handler of handlers.duelCancelled ){
      const response = handler(payload);
      if( response ) responses.push(response);
    }
    return responses;
  }

  const applyPlugin = (plugin: QrGamePlugin) => plugin({
    addItemRedemptionHook,
    removeItemRedemptionHook,
    addItemPreRedemptionHook,
    removeItemPreRedemptionHook,
    addDuelCompleteHook,
    removeDuelCompleteHook,
    addDuelCancelledHook,
    removeDuelCancelledHook
  })

  return {
    applyPlugin,
    runItemRedemptionHook,
    runItemPreRedemptionHook,
    runDuelCompleteHook,
    runDuelCancelledHook
  }
}