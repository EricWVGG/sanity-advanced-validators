import { describe, it, expect, vi } from "vitest"
import { maxDimensions } from "./maxDimensions"
import { FileValue } from "sanity"

// Mock getImageDimensions from @sanity/asset-utils
// This is necessary because otherwise we’d have to connect to a real Sanity instance and upload real files.
vi.mock("@sanity/asset-utils", () => ({
  getImageDimensions: (ref: string) => {
    // Simulate different dimensions based on ref string
    if (ref === "image-100x200") return { width: 100, height: 200 }
    if (ref === "image-300x400") return { width: 300, height: 400 }
    return { width: 0, height: 0 }
  }
}))

describe("maxDimensions", () => {
  const asset = (ref: string): FileValue => ({ asset: { _ref: ref } } as FileValue)

  it("returns true if value is undefined", () => {
    expect(maxDimensions({ x: 100, y: 200 })(undefined)).toBe(true)
  })

  it("returns true if asset is missing", () => {
    expect(maxDimensions({ x: 100, y: 200 })({} as FileValue)).toBe(true)
  })

  it("returns true if dimensions are equal to maximum", () => {
    expect(maxDimensions({ x: 300, y: 400 })(asset("image-300x400"))).toBe(true)
  })

  it("returns error if width is greater than maximum", () => {
    expect(maxDimensions({ x: 200, y: 400 })(asset("image-300x400"))).toMatch(/at most 200 pixels wide/)
  })

  it("returns error if height is greater than maximum", () => {
    expect(maxDimensions({ x: 300, y: 350 })(asset("image-300x400"))).toMatch(/at most 350 pixels tall/)
  })

  it("returns custom message with replacements", () => {
    const msg = "Image must be at most {x}x{y} pixels"
    expect(maxDimensions({ x: 200, y: 350 }, msg)(asset("image-300x400"))).toBe("Image must be at most 200x350 pixels")
  })
})