import { ValidationContext } from "sanity"

export const maxDepth = (
  maxDepth: number, 
  nestedValueName: string,
  message: string = `Error: You can only nest {nestedValueName} {maxDepth} levels deep.`
) => (_: any, context: ValidationContext) => {
  let regex = new RegExp(String.raw`topLevelItems|${nestedValueName}`)
  const paths = (context.path as Array<any>).filter((e) => typeof e === "string" && e.match(regex))
  if (paths.length > maxDepth) {
    return message.replace("{nestedValueName}", nestedValueName).replace("{maxDepth}", maxDepth.toString())
  }
  return true
}
