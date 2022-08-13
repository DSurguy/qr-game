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
  const otherAppOrigin = origin.includes(":8080")
    ? origin.replace(":8080", ":8081")
    : origin.replace(":8081", ":8080")
  return toDataURL(
    `${otherAppOrigin}/portal?type=player&projectUuid=${player.projectUuid}&uuid=${player.uuid}`
  )
}