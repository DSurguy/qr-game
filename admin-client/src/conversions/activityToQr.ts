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

export function activityToQrAsUrl(activity: SavedActivity, origin: string) {
  const otherAppOrigin = origin.includes(":8080")
    ? origin.replace(":8080", ":8081")
    : origin.replace(":8081", ":8080")
  return toDataURL(
    `${otherAppOrigin}/portal?type=activity&projectUuid=${activity.projectUuid}&uuid=${activity.uuid}`
  )
}