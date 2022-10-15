import { ProjectItem, SavedPlayer } from "@qrTypes";
import { toDataURL } from 'qrcode';

export function itemToQrAsEntity(item: ProjectItem) {
  return toDataURL(
    JSON.stringify({
      projectUuid: item.projectUuid,
      uuid: item.uuid,
      type: 'item'
    }, null, 2)
  )
}

export function itemToQrAsUrl(item: ProjectItem) {
  return toDataURL(
    `${PROCESS_ENV_CLIENT_ORIGIN}/portal?type=item&projectUuid=${item.projectUuid}&uuid=${item.uuid}`
  )
}