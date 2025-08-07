import {getPeer} from './'
import {ValidationContext} from 'sanity'

/*
For a given object that has multiple fields, mark a field as `required` if a peer has a particular value.

```
defineType({
  name: 'ifAlphaAlsoBeta',
  type: 'object',
  fields: [
    defineField({
      name: 'alpha',
      type: 'string',
      options: {
        list: ['left', 'right'],
        layout: 'radio',
        direction: 'horizontal',
      },
    }),
    defineField({
      name: 'beta',
      type: 'string',
      placeholder: 'If alpha is “left”, I’m also required',
      validation: (rule) => rule.custom(requiredIfPeerEq('alpha', 'left')),
    })
  ],
})
```

Incidentally, context.path is technically Array<sanity.PathSegment>.

That shouldn't matter, but dealing with that and remapping peerKey as a PathSegment could be a possible future enhancement.
*/

export const requiredIfPeerEq = (
  key: string, 
  comparison: string | number | null | Array<string | number | null>, 
  message: string = 'Required if {key} equals {value}.'
) =>
  (value: unknown | undefined, context: ValidationContext) => {
    const peer = getPeer(key, context)
    const comparisons = Array.isArray(comparison) ? comparison : [comparison]
    if (!value && comparisons.includes(peer)) {
      return message.replace('{key}', key).replace('{value}', comparisons.join(', or ') ?? 'null')
    }
    return true
  }

export const requiredIfPeerNeq = (
  key: string, 
  comparison: string | number | null | Array<string | number | null>, 
  message: string = 'Required if {key} does not equal {value}.'
) =>
  (value: unknown | undefined, context: ValidationContext) => {
    const peer = getPeer(key, context)
    const comparisons = Array.isArray(comparison) ? comparison : [comparison]
    if(!value && !comparisons.includes(peer)) {
      return message.replace('{key}', key).replace('{value}', comparisons.join(', or ') ?? 'null' )
    }
    return true
  }









