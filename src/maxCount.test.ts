import { describe, it, expect, vi } from "vitest"
import { maxCount } from "./"

describe("maxCount", () => {
  it("returns true if under requested count", () => {
    expect(maxCount(2)([1])).toBe(true)
  })

  it("returns true if equals requested count", () => {
    expect(maxCount(2)([1, 2])).toBe(true)
  })

  it("returns false if over requested count", () => {
    expect(maxCount(2)([1, 2, 3])).toBe("Array must contain at most 2 items.")
  })

  it("returns custom message with replacements", () => {
    const msg = "Requires at most {n} items in the array."
    expect(maxCount(2, msg)([1, 2, 3])).toBe("Requires at most 2 items in the array.")
  })
})
