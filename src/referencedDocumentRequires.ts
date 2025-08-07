import { ValidationContext } from "sanity"

export const referencedDocumentRequires = (
  documentType: string, 
  field: string, 
  message: string = `{documentType}’s {field} must be filled.`
) => async (value: any | undefined, context: ValidationContext) => {
  if (!value?._ref) {
    return true
  }
  const client = context.getClient({ apiVersion: "2022-08-12" })
  // todo: use current API version, or test with no version at all

  // todo: if there's a value._type or value.referenced._type or something, we get rid of document.type from inputs
  // todo: why is typescript complaining about this? client.fetch takes a query parameter.
  const data = await client.fetch(`
    *[_type == "${documentType}" && _id == "${value._ref}"]{
      ${field}
    }[0]
  `) // TODO: why is typescript screaming about this? Fetch takes two parameters.
  if (!data[field]) {
    return message.replace("{documentType}", documentType).replace("{field}", field)
  }
  return true
}
