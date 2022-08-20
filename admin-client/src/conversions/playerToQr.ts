import { SavedPlayer } from "@qrTypes";
import { toDataURL } from 'qrcode';

export function playerToQrAsEntity(player: SavedPlayer) {
  return toDataURL(
    JSON.stringify({
      projectUuid: player.projectUuid,
      uuid: player.uuid,
      type: 'player'
    }, null, 2)
  )
}

export function playerToQrAsUrl(player: SavedPlayer, origin: string) {
  const otherAppOrigin = origin.includes(":8080")
    ? origin.replace(":8080", ":8081")
    : origin.replace(":8081", ":8080")
  return toDataURL(
    `${otherAppOrigin}/portal?type=player&projectUuid=${player.projectUuid}&uuid=${player.uuid}`
  )
}