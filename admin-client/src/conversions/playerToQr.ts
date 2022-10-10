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

export function playerToQrAsUrl(player: SavedPlayer) {
  return toDataURL(
    `${PROCESS_ENV_CLIENT_ORIGIN}/portal?type=player&projectUuid=${player.projectUuid}&uuid=${player.uuid}`
  )
}