import { describe, it, expect, vi, beforeEach } from "vitest"
import { referencedDocumentRequires } from "./referencedDocumentRequires"
import { ValidationContext } from "sanity"

const mockFetch = vi.fn()
const mockSanityClient = { fetch: mockFetch } as unknown as import("sanity").SanityClient
const mockGetClient = vi.fn((_options: { apiVersion: string }) => mockSanityClient)

const makeContext = (fieldValue: any): ValidationContext => ({
  getClient: mockGetClient,
  schema: {} as any,
  environment: {} as any,
  i18n: {} as any
})

// todo: I'd like to try this with a real world context dump instead of a mocked one.

describe("referencedDocumentRequires", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("returns true if value is undefined", async () => {
    const fn = referencedDocumentRequires("fooType", "barField")
    const result = await fn(undefined, makeContext(undefined))
    expect(result).toBe(true)
  })

  it("returns true if value._ref is missing", async () => {
    const fn = referencedDocumentRequires("fooType", "barField")
    const result = await fn({}, makeContext(undefined))
    expect(result).toBe(true)
  })

  it("returns true if referenced field is present", async () => {
    mockFetch.mockResolvedValueOnce({ barField: "exists" })
    const fn = referencedDocumentRequires("fooType", "barField")
    const result = await fn({ _ref: "doc123" }, makeContext("exists"))
    expect(result).toBe(true)
    expect(mockFetch).toHaveBeenCalled()
  })

  it("returns error message if referenced field is missing", async () => {
    mockFetch.mockResolvedValueOnce({ barField: null })
    const fn = referencedDocumentRequires("fooType", "barField")
    const result = await fn({ _ref: "doc123" }, makeContext(null))
    expect(result).toBe("fooType’s barField must be filled.")
    expect(mockFetch).toHaveBeenCalled()
  })

  it("supports custom message", async () => {
    mockFetch.mockResolvedValueOnce({ barField: null })
    const fn = referencedDocumentRequires("fooType", "barField", "Custom: {documentType} {field}")
    const result = await fn({ _ref: "doc123" }, makeContext(null))
    expect(result).toBe("Custom: fooType barField")
  })
})