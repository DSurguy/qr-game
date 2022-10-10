import { SavedActivity } from "@qrTypes";
import { toDataURL } from 'qrcode';

export function activityToQr(activity: SavedActivity) {
  return toDataURL(
    JSON.stringify({
      projectUuid: activity.projectUuid,
      uuid: activity.uuid,
      type: 'activity'
    }, null, 2)
  )
}

export function activityToQrAsUrl(activity: SavedActivity) {
  return toDataURL(
    `${PROCESS_ENV_CLIENT_ORIGIN}/portal?type=activity&projectUuid=${activity.projectUuid}&uuid=${activity.uuid}`
  )
}