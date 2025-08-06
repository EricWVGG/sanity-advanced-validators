import { ValidationContext } from "sanity"

export const referencedDocumentRequires = (documentType: string, field: string) => async (value: any | undefined, context: ValidationContext) => {
  if (!value?._ref) {
    return true
  }
  const client = context.getClient({ apiVersion: "2022-08-12" })
  // todo: use current API version, or test with no version at all

  const data = await client.fetch(`
    *[_type == "${documentType}" && _id == "${value._ref}"]{
      ${field}
    }[0]
  `) // TODO: why is typescript screaming about this? Fetch takes two parameters.
  return !data[field] ? `${documentType}’s ${field} must be filled.` : true
}
