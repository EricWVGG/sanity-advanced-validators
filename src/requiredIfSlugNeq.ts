import { ValidationContext } from "sanity"

export const requiredIfSlugNeq = (
  slug: Array<string> | string, 
  slugKey: string = "slug", 
  message: string = `This is a required field.`
) =>
  (value: unknown | undefined, context: ValidationContext) => {
    const slugs = typeof slug === "string" ? [slug] : slug
    const slugValue = (context.parent as any)?.[slugKey]?.current
    if (!value && !slugs.includes(slugValue)) {
      return message
          .replace("{slugKey}", slugKey)
          .replace("{operand}", slugs.join(', or '))
          .replace("{siblingSlugValue}", slugValue)
      
    }
    return true
  }
