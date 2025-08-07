# Sanity Advanced Validators

(note: this is a WIP, I don’t know a lot about publishing NPM packages, hopefully coming soon)

This package includes a set of Sanity validators for aggressive and weird edge cases. Please let me know if you find these helpful!

Note that every validator can accept an optional custom error message as its last parameter. `minDimensions` lists one example; all the others work the same way.

## Tools

- [fileExtension](#fileExtension)
- [minDimensions](#minDimensions)
- [maxDimensions](#maxDimensions)
- [requiredIfPeerEq](#requiredIfPeerEq)
- [requiredIfPeerNeq](#requiredIfPeerNeq)
- [requiredIfPeerIsTruthy](#requiredIfPeerIsTruthy)
- [requiredIfPeerIsFalsey](#requiredIfPeerIsFalsey)
- [requiredIfSlugEq](#requiredIfSlugEq)
- [requiredIfSlugNeq](#requiredIfSlugNeq)
- [referencedDocumentRequires](#referencedDocumentRequires)
- [maxDepth](#maxDepth)

## Examples

### fileType

Enforces that an uploaded file asset is of a certain format.

```typescript
import { fileExtension } from "sanity-advanced-validation"

const Page = defineType({
  name: "page",
  type: "document",
  fields: [
    defineField({
      name: "catalog",
      type: "file",
      validation: (rule) => rule.custom(fileType("pdf")),
    }),
    defineField({
      name: "video",
      type: "file",
      validation: (rule) => rule.custom(fileExtension(["mp4", "mov", "webm"])),
    }),
  ],
})
```

### minDimensions

Enforces that an uploaded image asset is at minimum certain dimensions.

```typescript
import { minDimensions } from "sanity-advanced-validation"

const ImageWithCaption = defineType({
  name: "imageWithCaption",
  type: "object",
  fields: [
    defineField({
      name: "caption",
      type: "string",
    }),
    defineField({
      name: "image",
      type: "image",
      validation: (rule) => rule.custom(minDimensions({ x: 100, y: 100 })),
    }),
  ],
})
```

You can also enforce on only one dimension, or feed a custom error message:

```typescript
defineField({
  name: "image",
  type: "image",
  description: "At least 100px wide; as tall as you like.",
  validation: (rule) => rule.custom(minDimensions({ x: 100 }, "Uh oh! Your image is smaller than {x} pixels wide!")),
})
```

### maxDimensions

Enforces that an uploaded image asset is at most certain dimensions.

```typescript
import { maxDimensions } from "sanity-advanced-validation"

const ImageWithCaption = defineType({
  name: "imageWithCaption",
  type: "object",
  fields: [
    defineField({
      name: "caption",
      type: "string",
    }),
    defineField({
      name: "image",
      type: "image",
      validation: (rule) => rule.custom(maxDimensions({ x: 2000, y: 2000 })),
    }),
  ],
})
```

Note that all validators can be chained!

```typescript
defineField({
  name: "image",
  type: "image",
  description: "Min: 100x100, max: 2000x2000.",
  validation: (rule) =>
    rule
      .required()
      .custom(minDimensions({ x: 100, y: 100 }))
      .custom(maxDimensions({ x: 2000, y: 2000 })),
})
```

### requiredIfPeerEq

For a given object that has multiple fields, mark a field as `required` if a peer has a particular value.

```typescript
import {requiredIfPeerEq} from 'sanity-advanced-validation'

defineType({
  name: 'person',
  type: 'object',
  fields: [
    defineField({
      name: 'name',
      type: 'string'
    }),
    defineField({
      name: 'occupation',
      type: 'string',
      options: {
        list: ['doctor', 'lawyer', 'software engineer']
      }
    })
    defineField({
      name: 'favoriteLanguage',
      type: 'string',
      options: {
        list: [
          'javascript', 'rust', 'python', 'swift'
        ]
      }
      hidden: ({parent}) => parent.occuption !== 'software engineer',
      validation: rule => rule.custom(requiredIfPeerEq('occupation', 'software engineer'))
    }),
  ],
})
```

### requiredIfPeerNeq

For a given object that has multiple fields, mark a field as `required` if a peer does _not_ have a particular value.

```typescript
import {requiredIfPeerNeq} from 'sanity-advanced-validation'

defineType({
  name: 'person',
  type: 'object',
  fields: [
    defineField({
      name: 'name',
      type: 'string'
    }),
    defineField({
      name: 'occupation',
      type: 'string',
      options: {
        list: ['doctor', 'lawyer', 'software engineer']
      }
    })
    defineField({
      name: 'why',
      description: 'Why are you wasting your life this way?',
      type: 'text',
      hidden: ({parent}) => parent.occuption === 'software engineer',
      validation: rule => rule.custom(requiredIfPeerNeq('occupation', 'software engineer'))
    }),
  ],
})
```

### requiredIfPeerIsTruthy

For a given object that has multiple fields, mark a field as `required` if another has any value at all (i.e. not-null).

```typescript
import { requiredIfPeerIsTruthy } from "sanity-advanced-validation"

defineType({
  name: "possiblyAnonymousPerson",
  type: "object",
  fields: [
    defineField({
      name: "firstName",
      type: "string",
    }),
    defineField({
      name: "lastName",
      type: "string",
      placeholder: "If first name is filled in, last name is also required",
      validation: (rule) => rule.custom(requiredIfPeerIsTruthy("firstName")),
    }),
  ],
})
```

Since a rule like this necessarily comes in pairs, you may want to enforce it on both sides:

```typescript
…
defineField({
  name: 'firstName',
  type: 'string',
  placeholder: 'If last name is filled in, first name is also required',
  validation: (rule) => rule.custom(requiredIfPeerIsTruthy('lastName')),
}),
…
```

### requiredIfPeerIsFalsey

For a given object that has multiple fields, mark a field as `required` if another has no value (i.e. false or null).

```typescript
import { requiredIfPeerIsFalsey } from "sanity-advanced-validation"

defineType({
  name: "possiblyAnonymousPerson",
  type: "object",
  fields: [
    defineField({
      name: "firstName",
      type: "string",
    }),
    defineField({
      name: "pseudonym",
      type: "string",
      placeholder: "If first name is not filled in, a pseudonym is required.",
      validation: (rule) => rule.custom(requiredIfPeerIsFalsey("firstName")),
    }),
  ],
})
```

### requiredIfSlugEq

Require for matching slugs.

```typescript
import {requiredIfSlugEq} from 'sanity-advanced-validation'

defineType({
  name: 'page',
  type: 'document',
  fields: [
    defineField({
      name: 'slug',
      type: 'slug'
    }),
    defineField({
      name: 'questionsAndAnswers',
      type: 'array',
      of: [
        {type: 'qaItem'}
      ],
      validation: rule => rule.custom(requiredIfSlugEq('faq'))
      hidden: ({parent}) => parent.slug.current !== 'faq'
    })
  ]
})
```

And this can apply to multiple slugs…

```typescript
defineField({
  name: "questionsAndAnswers",
  validation: (rule) => rule.custom(requiredIfSlugEq(["faq", "about"])),
}),
```

### requiredIfSlugNeq

Require fields on pages that don't match one or more slugs.

```typescript
import {requiredIfSlugNeq} from 'sanity-advanced-validation'

defineType({
  name: 'page',
  type: 'document',
  fields: [
    defineField({
      name: 'slug',
      type: 'slug'
    }),
    defineField({
      name: 'subnav',
      description: 'Subnav is required on documents that aren't '/home'`,
      type: 'array',
      of: [
        {type: 'navLink'}
      ],
      validation: rule => rule.custom(requiredIfSlugNeq('home'))
      hidden: ({parent}) => parent.slug.current !== 'home'
    })
  ]
})
```

### referencedDocumentRequires

You might want to enforce some validation on a referred document. This validator enforces that a given value is not null in the referenced document.

```typescript
defineField({
  name: 'refferedArticle',
  description: 'An article (must include a valid poster image)',
  type: 'reference',
  to: [{type: 'article'}],
  validation: (rule) => rule.custom(referencedDocumentRequires('article', 'poster')),
}),
```

### maxDepth

It can be useful to have a nested type. This often comes up when making some kind of navigation tree, like…

```
- Home
- About
- Articles
  - First Article
  - Second Article
  - Articles about Trees
    - Article about Elm Trees
    - Article about Willow Trees
```

Sanity can handle this without breaking a sweat:

```typescript
const navigation = defineType({
  name: "navigation",
  type: "document",
  fields: [
    defineField({
      name: "links",
      type: "array",
      of: [{ type: navLink }],
    }),
  ],
})

const navLink = defineType({
  name: "navLink",
  type: "object",
  fields: [
    defineField({
      name: "link",
      type: "url",
    }),
    defineField({
      name: "label",
      type: "string",
    }),
    defineField({
      name: "subnav",
      type: "array",
      of: [{ type: navigation }], // < circular reference
    }),
  ],
})
```

… but your users might get a little stupid with this, and you may want to enforce navigations only going _n_ layers deep.

```typescript
import { maxDepth } from "sanity-advanced-validation"

const navLink = defineType({
  // …
  fields: [
    // …
    defineField({
      name: "subnav",
      type: "array",
      of: [{ type: navigation }],
      validation: (rule) => rule.custom(maxDepth(3, "subnav")),
    }),
  ],
})
```

This will enforce that a subnav list can embed in a subnav, which can also be embedded in a subnav — but no further.

_Note to any Sanity dev who looks at this_: I’d love to include similar logic on my `hidden:` attribute, but I don’t think that’t possible without a `path` array in the `hidden` context that’s similar to the one fed to the `ValidationContext` (todo: type this correctly). Wouldn’t this be cool?

```typescript
defineField({
  name: "subnav",
  type: "array",
  of: [{ type: navigation }],
  hidden: ({ path }) => {
    let regex = new RegExp(String.raw`topLevelItems|subNav`)
    const paths = context.path.filter((e) => e.match(/topLevelItems|subnav/))
    return paths.length > 3
  },
})
```

## Extending these and writing your own

Most of these validators rely on a function called `getPeer()`. If you’re thinking about picking this apart and writing your own custom validator, take a close look at how these validators use it.

## MOAR

Do you have any ideas or edge cases that these validators don’t cover? Leave an issue, maybe I can hack it out.
