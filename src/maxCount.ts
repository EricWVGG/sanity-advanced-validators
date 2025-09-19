export const maxCount = (n: number, message?: string) => (value: Array<unknown> | undefined) => {
  if (!value) {
    return true
  }
  if (value.length > n) {
    return message ? message.replace("{n}", n.toString()) : `Array must contain at most ${n} items.`
  }
  return true
}
