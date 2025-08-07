import { getPeer } from "./"
import { ValidationContext } from "sanity"

/*
For a given object that has multiple fields, mark a field as `required` if another is truthy (true or not-null).

```
defineType({
  name: 'ifAlphaAlsoBeta',
  type: 'object',
  fields: [
    defineField({
      name: 'alpha',
      type: 'string',
    }),
    defineField({
      name: 'beta',
      type: 'string',
      placeholder: 'If alpha is filled in, I’m also required',
      validation: (rule) => rule.custom(requiredIfPeerIsTruthy('alpha')),
    })
  ],
})
```

Incidentally, context.path is technically Array<sanity.PathSegment>.

That shouldn't matter, but dealing with that and remapping peerKey as a PathSegment could be a possible future enhancement.
*/

export const requiredIfPeerIsTruthy = (
  key: string | number, 
  message: string = `This is a required field.`
) => (value: Array<unknown> | string | undefined, context: ValidationContext) => {
  const peer = getPeer(key, context)
  if (!value && !!peer) {
    return message 
  }
  return true
}

export const requiredIfPeerIsFalsey = (
  key: string | number, 
  message: string = `This is a required field.`
) => (value: Array<unknown> | string | undefined, context: ValidationContext) => {
  const peer = getPeer(key, context)
  if (!value && !peer) {
    return message
  }
  return true
}
