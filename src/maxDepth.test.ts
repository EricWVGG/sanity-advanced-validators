import { describe, it, expect } from "vitest"
import { maxDepth } from "./maxDepth"
import { ValidationContext } from 'sanity'

const makeContext = (path: Array<any>): ValidationContext => ({
  path,
  getClient: () => ({} as any),
  schema: {} as any,
  environment: {} as any,
  i18n: {} as any,
})

// todo: I'd like to try this with a real world context dump instead of a mocked one.

describe("maxDepth", () => {
  it("returns true if nesting is within maxDepth", () => {
    const fn = maxDepth(2, "children")
    const context = makeContext(["topLevelItems", "children"])
    expect(fn(undefined, context)).toBe(true)
  })

  it("returns error if nesting exceeds maxDepth", () => {
    const fn = maxDepth(2, "children")
    const context = makeContext(["topLevelItems", "children", "children"])
    expect(fn(undefined, context)).toBe("Error: You can only nest children 2 levels deep.")
  })

  it("counts only matching path segments", () => {
    const fn = maxDepth(1, "foo")
    const context = makeContext(["topLevelItems", "foo", "bar", "foo"])
    expect(fn(undefined, context)).toBe("Error: You can only nest foo 1 levels deep.")
  })

  it("supports custom message", () => {
    const fn = maxDepth(1, "children", "Custom: {key} max {maxDepth}")
    const context = makeContext(["topLevelItems", "children", "children"])
    expect(fn(undefined, context)).toBe("Custom: children max 1")
  })

  it("returns true if no matching segments", () => {
    const fn = maxDepth(1, "foo")
    const context = makeContext(["topLevelItems", "bar", "baz"])
    expect(fn(undefined, context)).toBe(true)
  })
})