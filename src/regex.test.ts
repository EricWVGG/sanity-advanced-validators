import { describe, it, expect } from "vitest"
import { regex } from "./"

describe("regex", () => {
  it("returns true if value is undefined", () => {
    const fn = regex(/abc/)
    expect(fn(undefined as any)).toBe(true)
  })

  it("returns true if value matches pattern", () => {
    const fn = regex(/^abc/)
    expect(fn("abcde")).toBe(true)
  })

  it("returns error message if value does not match pattern", () => {
    const fn = regex(/^abc/)
    expect(fn("def")).toBe("“def” does not match the pattern /^abc/.")
  })

  it("works with numbers", () => {
    const fn = regex(/^\d+$/)
    expect(fn(123)).toBe(true)
    expect(fn(12.3)).toBe("“12.3” does not match the pattern /^\\d+$/.")
  })

  it("works with URL objects", () => {
    const fn = regex(/^https?:\/\//, "invalid URL")
    expect(fn(new URL("https://example.com"))).toBe(true)
    expect(fn(new URL("ftp://example.com"))).toBe("invalid URL")
  })

  it("supports custom message", () => {
    const fn = regex(/^abc/, "Custom: {value} - {pattern}")
    expect(fn("def")).toBe("Custom: def - /^abc/")
  })

  it("supports a stringified object", () => {
    const fn = regex(/{"name":"([a-zA-Z]+)"}/, "invalid name")
    expect(fn(JSON.stringify({ name: "Eric" }))).toBe(true)
    expect(fn(JSON.stringify({ name: "Eric_1" }))).toBe("invalid name")
  })
})
