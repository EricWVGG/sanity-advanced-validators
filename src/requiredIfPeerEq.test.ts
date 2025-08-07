import { describe, it, expect, vi } from "vitest"
import { requiredIfPeerEq, requiredIfPeerNeq } from "./requiredIfPeerEq"
import { ValidationContext } from 'sanity'

// Mock getPeer to control peer value in tests
vi.mock("./", () => ({
  getPeer: (key: string, context: any) => context?.document?.[key]
}))

function makeContext(key: string, value: string): ValidationContext {
    return {
        document: {
            [key]: value
        }
    } as ValidationContext
}

describe("requiredIfPeerEq", () => {
  it("returns true if value is present regardless of peer", () => {
    const fn = requiredIfPeerEq("alpha", "left")
    expect(fn("some value", makeContext("alpha", "left"))).toBe(true)
    expect(fn("some value", makeContext("alpha", "right"))).toBe(true)
  })

  it("returns true if peer does not match comparison", () => {
    const fn = requiredIfPeerEq("alpha", "left")
    expect(fn(undefined, makeContext("alpha", "right"))).toBe(true)
  })

  it("returns error message if value is missing and peer matches comparison", () => {
    const fn = requiredIfPeerEq("alpha", "left")
    expect(fn(undefined, makeContext("alpha", "left"))).toBe("Required if alpha equals left.")
  })

  it("supports array of comparisons", () => {
    const fn = requiredIfPeerEq("alpha", ["left", "center"])
    expect(fn(undefined, makeContext("alpha", "center"))).toBe("Required if alpha equals left, or center.")
    expect(fn(undefined, makeContext("alpha", "right"))).toBe(true)
  })

  it("supports custom message", () => {
    const fn = requiredIfPeerEq("alpha", "left", "Custom: {key}={value}")
    expect(fn(undefined, makeContext("alpha", "left"))).toBe("Custom: alpha=left")
  })
})

describe("requiredIfPeerNeq", () => {
  it("returns true if value is present regardless of peer", () => {
    const fn = requiredIfPeerNeq("alpha", "left")
    expect(fn("some value", makeContext("alpha", "left"))).toBe(true)
    expect(fn("some value", makeContext("alpha", "right"))).toBe(true)
  })

  it("returns true if peer matches comparison", () => {
    const fn = requiredIfPeerNeq("alpha", "left")
    expect(fn(undefined, makeContext("alpha", "left"))).toBe(true)
  })

  it("returns error message if value is missing and peer does not match comparison", () => {
    const fn = requiredIfPeerNeq("alpha", "left")
    expect(fn(undefined, makeContext("alpha", "right"))).toBe("Required if alpha does not equal left.")
  })

  it("supports array of comparisons", () => {
    const fn = requiredIfPeerNeq("alpha", ["left", "center"])
    expect(fn(undefined, makeContext("alpha", "right"))).toBe("Required if alpha does not equal left, or center.")
    expect(fn(undefined, makeContext("alpha", "center"))).toBe(true)
  })

  it("supports custom message", () => {
    const fn = requiredIfPeerNeq("alpha", "left", "Custom: {key}!={value}")
    expect(fn(undefined, makeContext("alpha", "right"))).toBe("Custom: alpha!=left")
  })
})
