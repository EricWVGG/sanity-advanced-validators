import { getExtension } from "@sanity/asset-utils"
import { FileValue } from "sanity"

export const fileExtension = (
  validFileExtension: string | Array<string>, 
  message: string = `Image must be of type {validFileExtension}`
) => (value: FileValue | undefined) => {
  if (!value || !value.asset) {
    return true
  }
  const validExtensions = typeof validFileExtension === "string" ? [validFileExtension] : validFileExtension
  const filetype = getExtension(value.asset._ref)
  if (!validExtensions.includes(filetype)) {
    return message.replace("{validFileExtension}", validExtensions.join(", or "))
  }
  return true
}

// todo: this should fail if its attached to a field that is not of type "file"