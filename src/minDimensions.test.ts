import { describe, it, expect, vi } from "vitest"
import { minDimensions, maxDimensions } from "./minDimensions"
import { FileValue } from "sanity"

// Mock getImageDimensions from @sanity/asset-utils
vi.mock("@sanity/asset-utils", () => ({
  getImageDimensions: (ref: string) => {
    // Simulate different dimensions based on ref string
    if (ref === "image-100x200") return { width: 100, height: 200 }
    if (ref === "image-300x400") return { width: 300, height: 400 }
    return { width: 0, height: 0 }
  }
}))

describe("minDimensions", () => {
  const asset = (ref: string): FileValue => ({ asset: { _ref: ref } } as FileValue)

  it("returns true if value is undefined", () => {
    expect(minDimensions({ x: 100, y: 200 })(undefined)).toBe(true)
  })

  it("returns true if asset is missing", () => {
    expect(minDimensions({ x: 100, y: 200 })({} as FileValue)).toBe(true)
  })

  it("returns true if dimensions are equal to minimum", () => {
    expect(minDimensions({ x: 100, y: 200 })(asset("image-100x200"))).toBe(true)
  })

  it("returns error if width is less than minimum", () => {
    expect(minDimensions({ x: 150, y: 100 })(asset("image-100x200"))).toMatch(/at least 150 pixels wide/)
  })

  it("returns error if height is less than minimum", () => {
    expect(minDimensions({ x: 100, y: 250 })(asset("image-100x200"))).toMatch(/at least 250 pixels tall/)
  })

  it("returns custom message with replacements", () => {
    const msg = "Image must be at least {x}x{y} pixels"
    expect(minDimensions({ x: 150, y: 250 }, msg)(asset("image-100x200"))).toBe("Image must be at least 150x250 pixels")
  })
})

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
}
)