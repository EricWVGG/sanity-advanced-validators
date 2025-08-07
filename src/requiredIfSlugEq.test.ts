import { describe, it, expect } from "vitest"
import { requiredIfSlugEq } from "./requiredIfSlugEq"
import { ValidationContext } from 'sanity'

function makeContext(slugValue?: string, slugKey: string = "slug"): ValidationContext {
    // todo: requiredIfSiblingEq uses context.document, while requiredIfSlugEq uses context.parent
    return {
        parent: {
            [slugKey]: {
                current: slugValue
            }
        }
    } as ValidationContext
}

describe("requiredIfSlugEq", () => {
  it("returns true if value is present regardless of slug", () => {
    const fn = requiredIfSlugEq("alpha")
    expect(fn("some value", makeContext("alpha"))).toBe(true)
    expect(fn("some value", makeContext("beta"))).toBe(true)
  })

  it("returns true if slug does not match comparison", () => {
    const fn = requiredIfSlugEq("alpha")
    expect(fn(undefined, makeContext("beta"))).toBe(true)
  })

  it("returns true if slug is undefined", () => {
    const fn = requiredIfSlugEq("alpha")
    expect(fn(undefined, makeContext(undefined))).toBe(true)
  })

  it("supports array of slugs", () => {
    const fn = requiredIfSlugEq(["alpha", "beta"])
    expect(fn(undefined, makeContext("alpha"))).toBe("This is a required field.")
    expect(fn("bonk", makeContext("alpha"))).toBe(true)
    expect(fn(undefined, makeContext("gamma"))).toBe(true)
  })

  it("supports custom slugKey", () => {
    const fn = requiredIfSlugEq("foo", "id")
    expect(fn(undefined, makeContext("foo", "id"))).toBe("This is a required field.")
    expect(fn(undefined, makeContext("bar", "id"))).toBe(true)
  })

  it("supports custom message", () => {
    const fn = requiredIfSlugEq("alpha", "slug", "Custom required for {slugKey}")
    expect(fn(undefined, makeContext("alpha"))).toBe("Custom required for slug")
  })
})
