import { describe, it, expect, vi } from "vitest"
import { requiredIfSiblingEq } from "./"
import { ValidationContext } from "sanity"

function makeContext(key: string, value: string): ValidationContext {
  return {
    document: {
      [key]: value,
    },
  } as ValidationContext
}

function makeContextForArrayDocument(key: string, value: string): ValidationContext {
  return {
    path: ["arrayField", { _key: "test-key" }, "beta"],
    document: {
      arrayField: [
        {
          _key: "test-key",
          [key]: value,
        },
      ],
    },
  } as any as ValidationContext
}

describe("requiredIfSiblingEq", () => {
  it("returns true if value is present regardless of sibling", () => {
    const fn = requiredIfSiblingEq("alpha", "left")
    expect(fn("some value", makeContext("alpha", "left"))).toBe(true)
    expect(fn("some value", makeContext("alpha", "right"))).toBe(true)
    expect(fn("some value", makeContextForArrayDocument("alpha", "left"))).toBe(true)
    expect(fn("some value", makeContextForArrayDocument("alpha", "right"))).toBe(true)
  })

  it("returns true if sibling does not match comparison", () => {
    const fn = requiredIfSiblingEq("alpha", "left")
    expect(fn(undefined, makeContext("alpha", "right"))).toBe(true)
    expect(fn(undefined, makeContextForArrayDocument("alpha", "right"))).toBe(true)
  })

  it("returns error message if value is missing and sibling matches comparison", () => {
    const fn = requiredIfSiblingEq("alpha", "left")
    expect(fn(undefined, makeContext("alpha", "left"))).toBe("Required if alpha equals left.")
    expect(fn(undefined, makeContextForArrayDocument("alpha", "left"))).toBe("Required if alpha equals left.")
  })

  it("supports array of comparisons", () => {
    const fn = requiredIfSiblingEq("alpha", ["left", "center"])
    expect(fn(undefined, makeContext("alpha", "center"))).toBe("Required if alpha equals left, or center.")
    expect(fn(undefined, makeContext("alpha", "right"))).toBe(true)
    expect(fn(undefined, makeContextForArrayDocument("alpha", "center"))).toBe("Required if alpha equals left, or center.")
    expect(fn(undefined, makeContextForArrayDocument("alpha", "right"))).toBe(true)
  })

  it("supports custom message", () => {
    const fn = requiredIfSiblingEq("alpha", "left", "Custom: {key}={operand}")
    expect(fn(undefined, makeContext("alpha", "left"))).toBe("Custom: alpha=left")
    expect(fn(undefined, makeContextForArrayDocument("alpha", "left"))).toBe("Custom: alpha=left")
  })
})
