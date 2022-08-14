import { SavedDuelActivityType } from "@qr-game/types";
import { toDataURL } from 'qrcode';

export function duelActivityToQr(duelActivity: SavedDuelActivityType) {
  return toDataURL(
    JSON.stringify({
      projectUuid: duelActivity.projectUuid,
      uuid: duelActivity.uuid,
      type: 'duelActivity'
    }, null, 2)
  )
}

export function duelActivityToQrAsUrl(duelActivity: SavedDuelActivityType, origin: string) {
  const otherAppOrigin = origin.includes(":8080")
    ? origin.replace(":8080", ":8081")
    : origin.replace(":8081", ":8080")
  return toDataURL(
    `${otherAppOrigin}/portal?type=duelActivity&projectUuid=${duelActivity.projectUuid}&uuid=${duelActivity.uuid}`
  )
}