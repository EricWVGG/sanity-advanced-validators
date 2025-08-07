import { describe, it, expect, vi } from "vitest"
import { requiredIfSiblingEq } from "./requiredIfSiblingEq"
import { ValidationContext } from 'sanity'

// Mock getSibling to control sibling value in tests
vi.mock("./", () => ({
  getSibling: (key: string, context: any) => context?.document?.[key]
}))

function makeContext(key: string, value: string): ValidationContext {
    return {
        document: {
            [key]: value
        }
    } as ValidationContext
}

describe("requiredIfSiblingEq", () => {
  it("returns true if value is present regardless of sibling", () => {
    const fn = requiredIfSiblingEq("alpha", "left")
    expect(fn("some value", makeContext("alpha", "left"))).toBe(true)
    expect(fn("some value", makeContext("alpha", "right"))).toBe(true)
  })

  it("returns true if sibling does not match comparison", () => {
    const fn = requiredIfSiblingEq("alpha", "left")
    expect(fn(undefined, makeContext("alpha", "right"))).toBe(true)
  })

  it("returns error message if value is missing and sibling matches comparison", () => {
    const fn = requiredIfSiblingEq("alpha", "left")
    expect(fn(undefined, makeContext("alpha", "left"))).toBe("Required if alpha equals left.")
  })

  it("supports array of comparisons", () => {
    const fn = requiredIfSiblingEq("alpha", ["left", "center"])
    expect(fn(undefined, makeContext("alpha", "center"))).toBe("Required if alpha equals left, or center.")
    expect(fn(undefined, makeContext("alpha", "right"))).toBe(true)
  })

  it("supports custom message", () => {
    const fn = requiredIfSiblingEq("alpha", "left", "Custom: {key}={value}")
    expect(fn(undefined, makeContext("alpha", "left"))).toBe("Custom: alpha=left")
  })
})
