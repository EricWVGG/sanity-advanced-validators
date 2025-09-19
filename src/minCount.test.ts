import { describe, it, expect, vi } from "vitest"
import { minCount } from "./minCount"

describe("minCount", () => {
  it("returns true if at least requested count", () => {
    expect(minCount(2)([1, 2, 3])).toBe(true)
  })

  it("returns true if equals requested count", () => {
    expect(minCount(2)([1, 2])).toBe(true)
  })

  it("returns false if under requested count", () => {
    expect(minCount(2)([1])).toBe("Array must contain at least 2 items.")
  })

  it("returns custom message with replacements", () => {
    const msg = "Requires at least {n} items in the array."
    expect(minCount(2, msg)([1])).toBe("Requires at least 2 items in the array.")
  })
})
