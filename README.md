# Sanity Advanced Validators

This package includes a set of Sanity validators for aggressive and weird edge cases. Please let me know if you find these helpful!

Note that every validator can accept an optional custom error message as its last parameter. `minDimensions` lists one example; all the others work the same way.

## Tools

- [fileExtension](#fileExtension)
- [minDimensions](#minDimensions)
- [maxDimensions](#maxDimensions)
- [requiredIfSiblingEq](#requiredIfSiblingEq)
- [requiredIfSiblingNeq](#requiredIfSiblingNeq)
- [requiredIfSlugEq](#requiredIfSlugEq)
- [requiredIfSlugNeq](#requiredIfSlugNeq)
- [referencedDocumentRequires](#referencedDocumentRequires)
- [maxDepth](#maxDepth)

## Mega-example

Imagine that you’ve got a document that has an optional video file — but it's required on the `/about` page. If the video exists, it must be either MP4 or MOV, and have a poster image that's between 1250x800 and 2500x1600 pixels in size.

```typescript
const Page = defineType({
  name: "page",
  type: "document",
  fields: [
    defineField({
      name: 'slug',
      type: 'slug'
    }),
    defineField({
      name: "someVideoFile",
      type: "file",
      validation: (rule) =>
        rule.custom(requiredIfSlugEq('about'))
          .custom(fileExtension(['mp4', 'mov']))
    })
    defineField({
      name: "posterImage",
      type: "image",
      hidden: ({ parent }) => parent.someVideoFile === null,
      validation: (rule) =>
        rule.custom(requiredIfSiblingNeq('someVideoFile', null))
          .custom(minDimensions({ x: 1250, y: 800 }))
          .custom(maxDimensions({ x: 2500, y: 1600 })),
    })
  ]
})
```

## Examples

### fileExtension

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
      validation: (rule) => rule.custom(fileExtension("pdf")),
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
  name: "article",
  type: "object",
  fields: [
    // …
    defineField({
      name: "heroImage",
      type: "image",
      validation: (rule) => rule.custom(minDimensions({ x: 1200, y: 800 })),
    }),
  ],
})
```

You can also enforce on only one dimension, or feed a custom error message:

```typescript
defineField({
  name: "heroImage",
  type: "image",
  description: "At least 1200px wide; as tall as you like.",
  validation: (rule) => rule.custom(
    minDimensions(
      { x: 1200 }, 
      "Uh oh, your image is {width} pixels wide. That’s less than {x}!"
    )
  ),
})
```

### maxDimensions

Enforces that an uploaded image asset is at most certain dimensions.

```typescript
defineField({
  name: "heroImage",
  type: "image",
  validation: (rule) => rule.custom(maxDimensions({ x: 2400, y: 1600 })),
}),
```

Chain for min and max dimensions:

```typescript
defineField({
  name: "heroImage",
  type: "image",
  description: "Min: 1200x800, max: 2400x1600.",
  validation: (rule) =>
    rule
      .required()
      .custom(minDimensions({ x: 1200, y: 800 }))
      .custom(maxDimensions({ x: 2400, y: 1600 })),
})
```

### requiredIfSiblingEq

For a given object that has multiple fields, mark a field as `required` if a sibling has a particular value.

This is really handy if you have a field that is hidden circumstances, but need to make it `required()` when it’s visible! This is probably the validator I use most.

_note:_ This does not work for slugs, because they have to match a nested `.current` value. Use the [requiredIfSlugEq validator](#requiredIfSlugEq) instead.

```typescript
import {requiredIfSiblingEq} from 'sanity-advanced-validation'

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
      },
      validation: rule => rule.custom(requiredIfSiblingEq('occupation', 'software engineer')),
      hidden: ({parent}) => parent.occuption !== 'software engineer',
    }),
  ],
})
```

This also works for null. It’s very effective!

```typescript
defineType({
  name: 'person',
  type: 'object',
  fields: [
    defineField({
      name: 'name',
      type: 'string'
    }),
    defineField({
      name: 'email',
      type: 'string',
    })
    defineField({
      name: 'phone',
      type: 'string',
      validation: rule => rule.custom(requiredIfSiblingEq(
        'email', 
        null, 
        "If you don’t have an email address, a phone number is required."
      ))
    })
  ],
})
```

And it even works for arrays.

```typescript
defineType({
  name: 'person',
  type: 'object',
  fields: [
    defineField({
      name: 'name',
      type: 'string'
    }),
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
    }),
    defineField({
      name: 'explanation',
      description: 'Why are you wasting your life this way?',
      type: 'text',
      validation: rule => rule.custom(requiredIfSiblingEq('occupation', ['doctor', 'lawyer'])),
      hidden: ({parent}) => parent.occuption === 'software engineer',
    })
  ],
})
```

### requiredIfSiblingNeq

For a given object that has multiple fields, mark a field as `required` if a sibling does _not_ have a particular value.

_note:_ This does not work for slugs, because they have to match a nested `.current` value. Use the [requiredIfSlugNeq validator](#requiredIfSlugNeq) instead.

```typescript
import {requiredIfSiblingNeq} from 'sanity-advanced-validation'

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
      description: 'How many years will you spend paying off your degree?',
      type: 'number',
      validation: rule => rule.custom(requiredIfSiblingNeq('occupation', 'software engineer'))
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
      validation: rule => rule.custom(requiredIfSlugEq('faq')),
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
      description: `Subnav is required on documents that aren’t '/home'`,
      type: 'array',
      of: [
        {type: 'navLink'}
      ],
      validation: rule => rule.custom(requiredIfSlugNeq('home')),
      hidden: ({parent}) => parent.slug.current !== 'home'
    })
  ]
})
```

### referencedDocumentRequires

You might want to enforce some validation on a referenced document. This validator enforces that a given value is not null in the referenced document.

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

_Note to any Sanity dev who looks at this_: I’d love to include similar logic on my `hidden:` attribute, but I don’t think that’t possible without a `path` array in `hidden`’s `ConditionalPropertyCallbackContext` that’s similar to the one fed to the `ValidationContext` (todo: type this correctly). Wouldn’t this be cool?

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

Most of these validators rely on a function called `getSibling()`. If you’re thinking about picking this apart and writing your own custom validator, take a close look at how these validators use it.

## Upcoming

### Nested pathfinders

Since building these validator, I took to putting my slugs in a metadata object. I need to update `requiredIfSlugEq` to accept a path, like `requiredIfSlugEq('metadata.slug', 'some-values')`.

This pathfinding should be added to any validator that takes a sibling, like `requiredIfSiblingEq`. It can probably be snapped into `getSibling`.

While I’m at it, there’s a possibility that `getSibling` could detect the target type. If that type is `slug`, then it could add `current` to the path, and then I can deprecate `requiredIfSlugEq` altogether.

### Image and File checks

`minDimensions`, `maxDimensions`, and `fileExtension` should check to see if the field is of type `image` or `file`.

Some of the other checks should probably make sure the field is _not_ `image` or `file`.

### new referencedDocumentFieldEq validator

```
// only articles by Jimmy Olsen
rule => rule.custom(referencedDocumentFieldEq('article', 'author', 'Jimmy Olsen'))
// only articles whose authors are not null. replaces  `referencedDocumentRequires`.
rule => rule.custom(referencedDocumentFieldNeq('article', 'author', null))
```

## MOAR

Do you have any ideas or edge cases that these validators don’t cover? Leave an issue, maybe I can hack it out.
