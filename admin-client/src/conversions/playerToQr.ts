import { SavedPlayerType } from "@qr-game/types";
import { toDataURL } from 'qrcode';

export function playerToQrAsEntity(player: SavedPlayerType) {
  return toDataURL(
    JSON.stringify({
      projectUuid: player.projectUuid,
      uuid: player.uuid,
      type: 'player'
    }, null, 2)
  )
}

export function playerToQrAsUrl(player: SavedPlayerType, origin: string) {
  return toDataURL(
    `${origin}/portal?type=player&projectUuid=${player.projectUuid}&uuid=${player.uuid}`
  )
}