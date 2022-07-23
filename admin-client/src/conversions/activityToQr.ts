import { SavedActivityType } from "@qr-game/types";
import { toDataURL } from 'qrcode';

export default function activityToQr(activity: SavedActivityType) {
  return toDataURL(
    JSON.stringify({
      projectUuid: activity.projectUuid,
      uuid: activity.uuid,
      type: 'activity'
    }, null, 2)
  )
}