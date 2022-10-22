import { PluginHookResponse, PluginPreHookResponse } from "../qr-types";
import { ClaimPlayerHookHandler, ClaimPlayerHookPayload, DuelCancelledHookHandler, DuelCancelledHookPayload, DuelCompleteHookHandler, DuelCompleteHookPayload, ItemPreRedemptionHookHandler, ItemPreRedemptionHookPayload, ItemRedemptionHookHandler, ItemRedemptionHookPayload, PluginPayload, PortalActivityHookHandler, PortalActivityHookPayload, QrGamePlugin } from "./pluginTypes"

export interface PluginManager {
  applyPlugin: (plugin: QrGamePlugin) => void;
  runItemRedemptionHook: (payload: ItemRedemptionHookPayload) => PluginHookResponse[];
  runItemPreRedemptionHook: (payload: ItemPreRedemptionHookPayload) => PluginPreHookResponse[];
  runDuelCompleteHook: (payload: DuelCompleteHookPayload) => PluginHookResponse[];
  runDuelCancelledHook: (payload: DuelCancelledHookPayload) => PluginHookResponse[];
  runPortalActivityHook: (payload: PortalActivityHookPayload) => PluginHookResponse[];
  runClaimPlayerHook: (payload: ClaimPlayerHookPayload) => PluginHookResponse[];
}

export function createPluginManager(): PluginManager {
  const handlers = {
    itemRedemption: [] as ItemRedemptionHookHandler[],
    preItemRedemption: [] as ItemPreRedemptionHookHandler[],
    duelComplete: [] as DuelCompleteHookHandler[],
    duelCancelled: [] as DuelCancelledHookHandler[],
    claimActivity: [] as PortalActivityHookHandler[],
    claimPlayer: [] as ClaimPlayerHookHandler[]
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

  const addPortalActivityHook: PluginPayload['addPortalActivityHook'] = (handler) => {
    if( !handlers.claimActivity.includes(handler) )
      handlers.claimActivity.push(handler)
  }

  const removePortalActivityHook: PluginPayload['removePortalActivityHook'] = (handlerToRemove) => {
    handlers.claimActivity = handlers.claimActivity.filter(handler => handler !== handlerToRemove );
  }

  const runPortalActivityHook = (payload: PortalActivityHookPayload): PluginHookResponse[] => {
    const responses: PluginHookResponse[] = [];
    for( let handler of handlers.claimActivity ){
      const response = handler(payload);
      if( response ) responses.push(response);
    }
    return responses;
  }

  const addClaimPlayerHook: PluginPayload['addClaimPlayerHook'] = (handler) => {
    if( !handlers.claimPlayer.includes(handler) )
      handlers.claimPlayer.push(handler)
  }

  const removeClaimPlayerHook: PluginPayload['removeClaimPlayerHook'] = (handlerToRemove) => {
    handlers.claimPlayer = handlers.claimPlayer.filter(handler => handler !== handlerToRemove );
  }

  const runClaimPlayerHook = (payload: ClaimPlayerHookPayload): PluginHookResponse[] => {
    const responses: PluginHookResponse[] = [];
    for( let handler of handlers.claimPlayer ){
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
    removeDuelCancelledHook,
    addPortalActivityHook,
    removePortalActivityHook,
    addClaimPlayerHook,
    removeClaimPlayerHook
  })

  return {
    applyPlugin,
    runItemRedemptionHook,
    runItemPreRedemptionHook,
    runDuelCompleteHook,
    runDuelCancelledHook,
    runPortalActivityHook,
    runClaimPlayerHook
  }
}