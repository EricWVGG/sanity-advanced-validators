import { ValidationContext } from "sanity"

export const maxDepth = (maxDepth: number, nestedValueName: string) => (_: any, context: ValidationContext) => {
  let regex = new RegExp(String.raw`topLevelItems|${nestedValueName}`)
  const paths = (context.path as Array<any>).filter((e) => typeof e === "string" && e.match(regex))
  return paths.length > maxDepth ? `Error: You can only nest ${nestedValueName} ${maxDepth} levels deep.` : true
}
