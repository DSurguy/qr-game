import { SavedDuelActivityType } from "@qr-game/types";
import { toDataURL } from 'qrcode';

export default function duelActivityToQr(duelActivity: SavedDuelActivityType) {
  return toDataURL(
    JSON.stringify({
      projectUuid: duelActivity.projectUuid,
      uuid: duelActivity.uuid,
      type: 'duelActivity'
    }, null, 2)
  )
}