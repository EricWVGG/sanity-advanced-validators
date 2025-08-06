import { getImageDimensions } from "@sanity/asset-utils"
import { FileValue } from "sanity"

export const minDimensions =
  ({ x, y }: { x: number; y: number }) =>
  (value: FileValue | undefined) => {
    if (!value || !value.asset) {
      return true
    }
    const { width, height } = getImageDimensions(value.asset._ref)
    if (!!x && width < x) {
      return `Image must be at least ${x} pixels wide.`
    }
    if (!!y && height < y) {
      return `Image must be at least ${y} pixels tall.`
    }
    return true
  }

export const maxDimensions =
  ({ x, y }: { x: number; y: number }) =>
  (value: FileValue | undefined) => {
    if (!value || !value.asset) {
      return true
    }
    const { width, height } = getImageDimensions(value.asset._ref)
    if (!!x && width > x) {
      return `Image must be at most ${x} pixels wide.`
    }
    if (!!y && height > y) {
      return `Image must be at most ${y} pixels tall.`
    }
    return true
  }
