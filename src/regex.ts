export const regex =
  (pattern: RegExp, message: string = `“{value}” does not match the pattern {pattern}.`) =>
  (value: unknown) => {
    if (!value) {
      return true
    }
    const valueAsString = typeof value !== "string" ? value.toString() : value
    return pattern.test(valueAsString) ? true : message.replace("{value}", valueAsString).replace("{pattern}", pattern.toString())
  }
