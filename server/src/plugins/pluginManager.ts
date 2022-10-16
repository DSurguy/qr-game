import { PluginHookResponse } from "../types";
import { ItemRedemptionHookHandler, ItemRedemptionHookPayload, PluginPayload, QrGamePlugin } from "./pluginTypes"

export interface PluginManager {
  applyPlugin: (plugin: QrGamePlugin) => void;
  runItemRedemptionHook: (payload: ItemRedemptionHookPayload) => PluginHookResponse[];
}

export function createPluginManager(): PluginManager {
  const handlers = {
    itemRedemption: [] as ItemRedemptionHookHandler[]
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

  const applyPlugin = (plugin: QrGamePlugin) => plugin({
    addItemRedemptionHook,
    removeItemRedemptionHook
  })

  return {
    applyPlugin,
    runItemRedemptionHook
  }
}