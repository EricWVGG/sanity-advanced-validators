import { describe, it, expect, vi } from "vitest"
import { fileExtension } from "./fileExtension"
import { FileValue } from "sanity"

// Mock getExtension from @sanity/asset-utils
vi.mock("@sanity/asset-utils", () => ({
  getExtension: (ref: string) => {
    // Simulate extension based on ref string
    if (ref.endsWith(".jpg")) return "jpg"
    if (ref.endsWith(".png")) return "png"
    if (ref.endsWith(".pdf")) return "pdf"
    return "unknown"
  }
}))

const asset = (ref: string): FileValue => ({ asset: { _ref: ref } } as FileValue)

describe("fileExtension", () => {
  it("returns true if value is undefined", () => {
    expect(fileExtension("jpg")(undefined)).toBe(true)
  })

  it("returns true if asset is missing", () => {
    expect(fileExtension("jpg")({} as FileValue)).toBe(true)
  })

  it("returns true if extension matches string", () => {
    expect(fileExtension("jpg")(asset("file.jpg"))).toBe(true)
  })

  it("returns true if extension matches array", () => {
    expect(fileExtension(["jpg", "png"])(asset("file.png"))).toBe(true)
  })

  it("returns error if extension does not match", () => {
    expect(fileExtension("jpg")(asset("file.pdf"))).toBe("Image must be of type jpg")
  })

  it("returns error with array in message", () => {
    expect(fileExtension(["jpg", "png"])(asset("file.pdf"))).toBe("Image must be of type jpg, or png")
  })

  it("supports custom message", () => {
    expect(fileExtension("pdf", "Only {validFileExtension} allowed")(asset("file.jpg"))).toBe("Only pdf allowed")
  })
})