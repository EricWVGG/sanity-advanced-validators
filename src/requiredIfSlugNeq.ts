import { getSibling } from "./"
import { ValidationContext } from "sanity"

export const requiredIfSlugNeq =
  (operand: Array<string> | string, slugKey: string = "slug", message: string = `This is a required field.`) =>
  (value: unknown | undefined, context: ValidationContext) => {
    const operands = typeof operand === "string" ? [operand] : operand
    const slugValue = getSibling(slugKey, context)?.current
    if (!value && !operands.includes(slugValue)) {
      return message.replace("{slugKey}", slugKey).replace("{operand}", operands.join(", or ")).replace("{siblingSlugValue}", slugValue)
    }
    return true
  }
