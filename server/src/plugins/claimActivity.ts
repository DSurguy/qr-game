import { QrGamePlugin } from './pluginTypes';

//TODO: Look up events to determine if repeat claim, then send correct message. It's hacked for now in POST endpoint
export const createClaimActivityPlugin = (): QrGamePlugin => () => {}