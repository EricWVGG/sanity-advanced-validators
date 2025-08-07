import { describe, it, expect } from "vitest"
import { requiredIfSlugNeq } from "./requiredIfSlugNeq"
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
describe("requiredIfSlugNeq", () => {
  it("returns true if value is present regardless of slug", () => {
    const fn = requiredIfSlugNeq("alpha")
    expect(fn("some value", makeContext("alpha"))).toBe(true)
    expect(fn("some value", makeContext("beta"))).toBe(true)
  })

  it("returns true if slug matches comparison", () => {
    const fn = requiredIfSlugNeq("alpha")
    expect(fn(undefined, makeContext("alpha"))).toBe(true)
  })
  
  it("returns error message if slug is undefined", () => {
    const fn = requiredIfSlugNeq("alpha")
    expect(fn(undefined, makeContext(undefined))).toBe("This is a required field.")
  })
  
  it("returns error message if value is missing and slug does not match comparison", () => {
    const fn = requiredIfSlugNeq("alpha")
    expect(fn(undefined, makeContext("beta"))).toBe("This is a required field.")
  })

  it("supports array of slugs", () => {
    const fn = requiredIfSlugNeq(["alpha", "beta"])
    expect(fn(undefined, makeContext("gamma"))).toBe("This is a required field.")
    expect(fn(undefined, makeContext("beta"))).toBe(true)
  })

  it("supports custom slugKey", () => {
    const fn = requiredIfSlugNeq("foo", "id")
    expect(fn(undefined, makeContext("bar", "id"))).toBe("This is a required field.")
    expect(fn(undefined, makeContext("foo", "id"))).toBe(true)
  })

  it("supports custom message", () => {
    const fn = requiredIfSlugNeq("alpha", "slug", "Custom required for {slugKey}")
    expect(fn(undefined, makeContext("beta"))).toBe("Custom required for slug")
  })
})
