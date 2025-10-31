import { ValidationContext } from "sanity"

export const getSibling = (key: string | number, context: ValidationContext) => {
  const path = context.path ? (context.path.slice(0, -1) as Array<string | number>) : []
  const sibling = [...path, key].reduce((acc: any, step: string | number | Record<"_key", string>) => {
    if (typeof step === "string" && acc.hasOwnProperty(step)) {
      return acc[step]
    } else if (typeof step === "object" && step.hasOwnProperty("_key") && Array.isArray(acc)) {
      return acc.find((i) => i._key === step._key)
    } else {
      // should never arrive here
      console.error("sanity-advanced-validators: Unreachable point reached!")
      return acc
    }
  }, context.document)
  return sibling
}
