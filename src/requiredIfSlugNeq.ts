import { ValidationContext } from "sanity"

export const requiredIfSlugNeq = (
  slug: Array<string> | string, 
  slugKey: string = "slug", 
  message: string = `This is a required field.`
) =>
  (value: unknown | undefined, context: ValidationContext) => {
    const slugs = typeof slug === "string" ? [slug] : slug
    const currentSlugValue = (context.parent as any)?.[slugKey]?.current
    if (!value && !slugs.includes(currentSlugValue)) {
      return message.replace("{slugKey}", slugKey).replace("{slug}", slugs.join(', or '))
    }
    return true
  }
