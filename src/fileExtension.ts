import { getExtension } from "@sanity/asset-utils"
import { FileValue } from "sanity"

export const fileExtension = (input: string | Array<string>) => (value: FileValue | undefined) => {
  if (!value || !value.asset) {
    return true
  }
  const validExtensions = typeof input === "string" ? [input] : input
  const filetype = getExtension(value.asset._ref)
  if (!validExtensions.includes(filetype)) {
    return `Image must be of type ${validExtensions.join(", or ")}`
  }
  return true
}
