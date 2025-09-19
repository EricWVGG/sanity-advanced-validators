import { get } from "lodash-es"
import { ValidationContext } from "sanity"

export const getSibling = (key: string | number, context: ValidationContext) => {
  if(!context.path) return undefined
  const pathToParentObject = context.path.slice(0, -1) as Array<string | number>
  const sibling = get(context.document, [...pathToParentObject, key])
  return sibling
}

/*
TODO:
  There is an issue with finding a sibling when in an array element.
  If the context document looks something like this…
    {
      someArray: [
        {
          _key: 'abc123',
          targetSibling: 'herpderp'
        }
      ]
    }
  … we wind up with a path of…
    [ 'someArray', { _key: 'ab123' }, 'targetSibling' ]
  lodash.get() is trying to do an exact match, it doesn't know how to get object by _key.
  
  Will probably have to replace get() with a gnarly recursive lookup function.
*/
