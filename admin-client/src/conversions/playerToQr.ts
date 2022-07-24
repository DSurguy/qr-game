import { SavedPlayerType } from "@qr-game/types";
import { toDataURL } from 'qrcode';

export default function playerToQr(player: SavedPlayerType) {
  return toDataURL(
    JSON.stringify({
      projectUuid: player.projectUuid,
      uuid: player.uuid,
      type: 'player'
    }, null, 2)
  )
}