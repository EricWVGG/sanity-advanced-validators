import { getImageDimensions } from "@sanity/asset-utils"
import { FileValue } from "sanity"

export const minDimensions =
  ({ x, y }: { x: number; y: number }, message?: string) =>
  (value: FileValue | undefined) => {
    if (!value || !value.asset) {
      return true
    }
    const { width, height } = getImageDimensions(value.asset._ref)
    if (!!x && width < x) {
      return message 
        ? message.replace("{width}", width.toString())
          .replace("{height}", height.toString())
          .replace("{x}", x.toString())
          .replace("{y}", !y ? "(any)" : y.toString()) 
        : `Image must be at least ${x} pixels wide.`
    }
    if (!!y && height < y) {
      return message 
        ? message.replace("{width}", width.toString())
          .replace("{height}", height.toString())
          .replace("{x}", !x ? "(any)" : x.toString())
          .replace("{y}", y.toString())
        : `Image must be at least ${y} pixels tall.`
    }
    return true
  }

// todo: this should fail if its attached to a field that is not of type "image"