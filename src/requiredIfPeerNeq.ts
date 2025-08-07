import {getPeer} from './'
import {ValidationContext} from 'sanity'

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









