import {getSibling} from './'
import {ValidationContext} from 'sanity'

export const requiredIfSiblingNeq = (
  key: string, 
  comparison: string | number | null | Array<string | number | null>, 
  message: string = 'Required if {key} does not equal {value}.'
) =>
  (value: unknown | undefined, context: ValidationContext) => {
    const sibling = getSibling(key, context)
    const comparisons = Array.isArray(comparison) ? comparison : [comparison]
    if(!value && !comparisons.includes(sibling)) {
      return message.replace('{key}', key).replace('{value}', comparisons.join(', or ') ?? 'null' )
    }
    return true
  }









