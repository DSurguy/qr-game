import { ClaimPlayerHookHandler, QrGamePlugin } from './pluginTypes';

const message = `# Welcome!

Now that you've claimed a player, you can start scanning activities to earn points!

Search high and low for QR Codes, and try scanning other players!

Open the menu and take a look at the store to see what you can spend your hard-earned points on.

## Good luck!
`

const handle: ClaimPlayerHookHandler = () => {
  return {
    message,
    icon: 'mood-happy'
  }
}

export const createClaimPlayerPlugin = (): QrGamePlugin => ({ addClaimPlayerHook }) => {
  addClaimPlayerHook(handle);
}