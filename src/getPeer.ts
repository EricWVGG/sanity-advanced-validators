import {get} from 'lodash'
import {ValidationContext} from 'sanity'

export const getPeer = (key: string | number, context: ValidationContext) => {
  const pathToParentObject = context.path!.slice(0, -1) as Array<string | number>
  const peer = get(context.document, [...pathToParentObject, key])
  return peer
}

/*
TODO:
  There is an issue with finding a peer when in an array element.
  If the context document looks something like this…
    {
      someArray: [
        {
          _key: 'abc123',
          targetPeer: 'herpderp'
        }
      ]
    }
  … we wind up with a path of…
    [ 'someArray', { _key: 'ab123' }, 'targetPeer' ]
  lodash.get() is trying to do an exact match, it doesn't know how to get object by _key.
  
  Will probably have to replace get() with a gnarly recursive lookup function.
*/
