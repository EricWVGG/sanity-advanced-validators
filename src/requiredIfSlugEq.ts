import { ValidationContext } from "sanity"

/*
Sanity has a funny idea of conditional fields. Every field is _always_ present, but it might be hidden.
ex. hidden: (node) => node.parent.slug === 'hideMe'
This works really well — unless a field marked as required gets hidden. 

This validator conditionally marks a field as required only for specific slugs. It accepts a string or array of strings.
```
validation: (rule) => rule.custom(requiredIfSlugEq('alpha'))
validation: (rule) => rule.custom(requiredIfSlugEq(['alpha', 'beta']))
validation: (rule) => rule.custom(requiredIfSlugNotEq(['beta']))
```

If the key of your slug is not simply "slug", fill that in the optional second parameter.
```
validation: (rule) => rule.custom(requiredIfSlugEq('alpha', 'id'))
```

"Could this method be simpler if it just checked for the self.hidden state?"
Not possible, since the hidden state is not exposed to the context.

But even if it were, you wouldn't want to. There are valid reasons to make a component required but hidden.
ex. an admin- or developer-level identifier that you don't want civilians to see or edit.

Possible future enhancement:
All of this presumes that the unique identifier is of type "slug." In theory you could check a string, like…   
```
validation: (rule) => rule.custom(requiredIfPeerEquals(['vanilla'], 'favoriteIceCream'))
```
… that would require checking against the node instead of node.current. 

Sounds neat, but I have no need for that right now.
*/

export const requiredIfSlugEq = (
  slug: Array<string> | string, 
  slugKey: string = "slug", 
  message: string = `This is a required field.`
) =>
  (value: unknown | undefined, context: ValidationContext) => {
    const slugs = typeof slug === "string" ? [slug] : slug
    if (!value && slugs.includes((context.parent as any)[slugKey]?.current)) {
      return message.replace("{slugKey}", slugKey).replace("slug", slugs.join(', or '))
    }
    return true
  }

export const requiredIfSlugNeq = (
  slug: Array<string> | string, 
  slugKey: string = "slug", 
  message: string = `This is a required field.`
) =>
  (value: unknown | undefined, context: ValidationContext) => {
    const slugs = typeof slug === "string" ? [slug] : slug
    if (!value && !slugs.includes((context.parent as any)[slugKey]?.current)) {
      return message.replace("{slugKey}", slugKey).replace("slug", slugs.join(', or '))
    }
    return true
  }
