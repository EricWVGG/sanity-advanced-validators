import { describe, it, expect, vi } from "vitest"
import { requiredIfSiblingNeq } from "./requiredIfSiblingNeq"
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

describe("requiredIfSiblingNeq", () => {
  it("returns true if value is present regardless of sibling", () => {
    const fn = requiredIfSiblingNeq("alpha", "left")
    expect(fn("some value", makeContext("alpha", "left"))).toBe(true)
    expect(fn("some value", makeContext("alpha", "right"))).toBe(true)
  })

  it("returns true if sibling matches comparison", () => {
    const fn = requiredIfSiblingNeq("alpha", "left")
    expect(fn(undefined, makeContext("alpha", "left"))).toBe(true)
  })

  it("returns error message if value is missing and sibling does not match comparison", () => {
    const fn = requiredIfSiblingNeq("alpha", "left")
    expect(fn(undefined, makeContext("alpha", "right"))).toBe("Required if alpha does not equal left.")
  })

  it("supports array of comparisons", () => {
    const fn = requiredIfSiblingNeq("alpha", ["left", "center"])
    expect(fn(undefined, makeContext("alpha", "right"))).toBe("Required if alpha does not equal left, or center.")
    expect(fn(undefined, makeContext("alpha", "center"))).toBe(true)
  })

  it("supports custom message", () => {
    const fn = requiredIfSiblingNeq("alpha", "left", "Custom: {key}!={value}")
    expect(fn(undefined, makeContext("alpha", "right"))).toBe("Custom: alpha!=left")
  })
})
