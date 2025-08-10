import { ValidationContext } from "sanity"

export const maxDepth = (
  maxDepth: number, 
  key: string,
  message: string = `Error: You can only nest {key} {maxDepth} levels deep.`
) => (_: any, context: ValidationContext) => {
  let regex = new RegExp(String.raw`topLevelItems|${key}`)
  const paths = (context.path as Array<any>).filter((e) => typeof e === "string" && e.match(regex))
  if (paths.length > maxDepth) {
    return message
      .replace("{key}", key)
      .replace("{maxDepth}", maxDepth.toString())
  }
  return true
}
