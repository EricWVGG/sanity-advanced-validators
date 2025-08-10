import {getSibling} from './'
import {ValidationContext} from 'sanity'

export const requiredIfSiblingNeq = (
  key: string, 
  operand: string | number | null | Array<string | number | null>, 
  message: string = 'Required if {key} does not equal {operand}.'
) =>
  (value: unknown | undefined, context: ValidationContext) => {
    const siblingValue = getSibling(key, context)
    const operands = Array.isArray(operand) ? operand : [operand]
    if(!value && !operands.includes(siblingValue)) {
      return message
        .replace('{key}', key)
        .replace('{operand}', operands.join(', or ') ?? 'null')
        .replace('{value}', operands.join(', or ') ?? 'null') // backward compatibility
        .replace('{siblingValue}', siblingValue)
    }
    return true
  }









