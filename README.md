_🚓 Never trust a user! 👮_

# Sanity Advanced Validators

This package includes a set of Sanity validators for aggressive and weird edge cases. _Maintain sanity with micro-managed validation._

## Tools

- [fileExtension](#fileExtension)
- [minDimensions](#minDimensions)
- [maxDimensions](#maxDimensions)
- [minCount](#minCount)
- [maxCount](#maxCount)
- [requiredIfSiblingEq](#requiredIfSiblingEq) 🆕
- [requiredIfSiblingNeq](#requiredIfSiblingNeq) 🆕
- [requiredIfSlugEq](#requiredIfSlugEq)
- [requiredIfSlugNeq](#requiredIfSlugNeq)
- [regex](#regex)
- [referencedDocumentRequires](#referencedDocumentRequires)
- [maxDepth](#maxDepth)

## Mega-example

Imagine that you’ve got a document that has an optional video file, but…

- if the video exists, it must be either **MP4** or **MOV**
- and there must be a poster image that's between **1250x800** and **2500x1600** pixels in size
- and it’s _always_ required on the `/home` page

```typescript
import { defineType, defineField } from 'sanity'
import {
  requiredIfSlugEq,
  requiredIfSiblingNeq,
  minDimensions,
  maxDimensions
} from 'sanity-advanced-validators'

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
        rule.custom(
          requiredIfSlugEq('home', 'A video is required on the home page.')
        ).custom(
          fileExtension(['mp4', 'mov'])
        )
    }),
    defineField({
      name: "posterImage",
      type: "image",
      hidden: ({ parent }) => parent.someVideoFile === null,
      validation: (rule) =>
        rule.custom(
          requiredIfSiblingNeq('someVideoFile', null)
        ).custom(
          minDimensions({ x: 1250, y: 800 })
        ).custom(
          maxDimensions({ x: 2500, y: 1600 })
        ),
    })
  ]
})
```

## Examples

### fileExtension

Enforces that an uploaded file asset is of a certain format.

```typescript
fileType: string | Array<string>,
message?: string // optional custom error message; replaces {validFileExtension} with fileType (flattened)
```

```typescript
import { fileExtension } from "sanity-advanced-validators"

const Page = defineType({
  name: "page",
  type: "document",
  fields: [
    defineField({
      name: "catalog",
      type: "file",
      validation: (rule) => 
        rule.custom(
          fileExtension("pdf")
        ),
    }),
    defineField({
      name: "video",
      type: "file",
      validation: (rule) => 
        rule.custom(
          fileExtension(["mp4", "mov", "webm"])
        ),
    }),
  ],
})
```

---

### minDimensions

Enforces that an uploaded image asset is at minimum certain dimensions. You can test on both, just x, or just y.

```typescript
dimensions: {x?: number, y?: number},
message?: string // optional custom error message; replaces {x} and {y} with your dimension requirements, and {width} and {height} with submitted image dimensions
```

```typescript
import { minDimensions } from "sanity-advanced-validators"

const ImageWithCaption = defineType({
  name: "article",
  type: "object",
  fields: [
    // …
    defineField({
      name: "heroImage",
      type: "image",
      validation: (rule) => 
        rule.custom(
          minDimensions({ x: 1200, y: 800 })
        ),
    }),
  ],
})
```

---

### maxDimensions

Enforces that an uploaded image asset is at most certain dimensions. You can test on both, just x, or just y.

```typescript
dimensions: {x?: number, y?: number},
message?: string // optional custom error message; replaces {x} and {y} with your dimension requirements, and {width} and {height} with submitted image dimensions
```

```typescript
defineField({
  name: "heroImage",
  type: "image",
  validation: (rule) => 
    rule.custom(
      maxDimensions({ x: 2400, y: 1600 })
    ),
}),
```

Chain for min and max dimensions:

```typescript
defineField({
  name: "heroImage",
  type: "image",
  description: "Min: 1200x800, max: 2400x1600.",
  validation: (rule) =>
    rule.required()
      .custom(
        minDimensions({ x: 1200, y: 800 })
      ).custom(
        maxDimensions({ x: 2400, y: 1600 })
      ),
})
```

---

### minCount

Enforces that an array contains at least _n_ items. 

Note that null values are fine; use `rule.required()` to enforce non-nulls.

```typescript
n: number,
message?: string // optional custom error message; replaces {n} with your minimum count
```

```typescript
defineField({
  name: "thumbnails",
  type: "array",
  of: [ {type: 'image'} ],
  validation: (rule) => 
    rule.required()
      .custom(
        minCount(3, "At least {n} thumbnails are required.")
      ),
}),
```

---

### maxCount

Enforces that an array contains at most _n_ items. 

```typescript
n: number,
message?: string // optional custom error message; replaces {n} with your maximum count
```

```typescript
defineField({
  name: "thumbnails",
  type: "array",
  of: [ {type: 'image'} ],
  validation: (rule) => 
    rule.custom(
      maxCount(3, "No more than {n} thumbnails.")
    ),
}),
```

And of course it can be chained.

```typescript
defineField({
  name: "thumbnails",
  type: "array",
  of: [ {type: 'image'} ],
  validation: (rule) => 
    rule.required()
      .custom(
        minCount(1, "At least one thumbnail is required.")
      ),
      .custom(
        maxCount(3, "1-3 thumbnails are required.")
      ),
}),
```

---

### requiredIfSiblingEq

Mark a field as `required` if a sibling field has a particular value. This is the validator we use most. _It’s super effective!_

This is handy if you have a field that is hidden under some circumstances, but is `required()` when it’s visible.

🆕 Previously, this would not work for objects that were members of an array. That is fixed now.

_note:_ This does not work for slugs, because they have to match a nested `.current` value. Use the [requiredIfSlugEq validator](#requiredIfSlugEq) instead.

```typescript
key: string, // name of sibling
operand: string | number | boolean | null | Array<string, number> // value that you’re testing for (i.e. if 'name' === operand)
message?: string // optional custom error message; replaces {key} and {operand} with your input, and {siblingValue} with the value of the sibling you’re testing against.
```

```typescript
import {requiredIfSiblingEq} from 'sanity-advanced-validators'

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
          'typescript', 'rust', 'python', 'swift'
        ]
      },
      validation: rule => 
        rule.custom(
          requiredIfSiblingEq('occupation', 'software engineer')
        ),
      hidden: ({parent}) => parent.occuption !== 'software engineer',
    }),
  ],
})
```

And it also works for arrays.

```typescript
defineType({
  name: "person",
  type: "object",
  fields: [
    // ...
    defineField({
      name: "occupation",
      type: "string",
      options: {
        list: ["doctor", "lawyer", "software engineer", "linguist"],
      },
    }),
    defineField({
      name: "favoriteLanguage",
      type: "string",
      options: {
        list: ["typescript", "rust", "python", "swift", "latin", "urdu", "klingon"],
      },
      validation: (rule) => 
        rule.custom(
          requiredIfSiblingEq("occupation", ["software engineer", "linguist"])
        ),
      hidden: ({ parent }) => !["software engineer", "linguist"].includes(parent.occupation),
    }),
  ],
})
```

It even works for null.

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
      validation: rule => 
        rule.custom(
          requiredIfSiblingEq(
            'email',
            null,
            "If you don’t have an email address, a phone number is required."
          )
        )
    })
  ],
})
```

---

### requiredIfSiblingNeq

For a given object that has multiple fields, mark a field as `required` if a sibling does _not_ have a particular value (or member of an array of values).

🆕 Previously, this would not work for objects that were members of an array. That is fixed now.

_note:_ This does not work for slugs, because they have to match a nested `.current` value. Use the [requiredIfSlugNeq validator](#requiredIfSlugNeq) instead.

```typescript
key: string, // name of sibling
operand: string | number | boolean | null | Array<string, number> // value that you’re testing for (i.e. if 'name' === operand)
message?: string // optional custom error message; replaces {key} and {operand} with your input, and {siblingValue} with the value of the sibling you’re testing against.
```

```typescript
import {requiredIfSiblingNeq} from 'sanity-advanced-validators'

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
      name: "explanation",
      description: "Why are you wasting your life this way?",
      type: "text",
      validation: (rule) => 
        rule.custom(
          requiredIfSiblingNeq("occupation", "software engineer")
        ),
      hidden: ({ parent }) => parent.occuption === "software engineer",
    }),  ],
})
```

---

### requiredIfSlugEq

Mark a field as `required` for documents with matching slugs.

```typescript
operand: string | number | null | Array<string, number> // possible slug or slugs you’re testing
key?: string, // name of sibling if not "slug"
message?: string // optional custom error message; replaces {slugKey} and {operand} with your input, and {siblingSlugValue} with the value of the sibling you’re testing against.
```

```typescript
import { requiredIfSlugEq } from "sanity-advanced-validators"

defineType({
  name: "page",
  type: "document",
  fields: [
    defineField({
      name: "slug",
      type: "slug",
    }),
    defineField({
      name: "questionsAndAnswers",
      type: "array",
      of: [{ type: "qaItem" }],
      validation: (rule) => 
        rule.custom(
          requiredIfSlugEq("faq")
        ),
      hidden: ({ parent }) => parent.slug.current !== "faq",
    }),
  ],
})
```

And this can apply to multiple slugs…

```typescript
defineField({
  name: "questionsAndAnswers",
  validation: (rule) => 
    rule.custom(
      requiredIfSlugEq(["faq", "about"])
    ),
}),
```

---

### requiredIfSlugNeq

Require fields on pages that don't match one or more slugs.

```typescript
operand: string | number | null | Array<string, number> // possible slug or slugs you’re testing
key?: string, // name of sibling if not "slug"
message?: string // optional custom error message; replaces {slugKey} and {operand} with your input, and {siblingSlugValue} with the value of the sibling you’re testing against.
```

```typescript
import { requiredIfSlugNeq } from "sanity-advanced-validators"

defineType({
  name: "page",
  type: "document",
  fields: [
    defineField({
      name: "slug",
      type: "slug",
    }),
    defineField({
      name: "subnav",
      description: `Subnav is required on documents that aren’t '/home'`,
      type: "array",
      of: [{ type: "navLink" }],
      validation: (rule) => 
        rule.custom(
          requiredIfSlugNeq("home")
        ),
      hidden: ({ parent }) => parent.slug.current !== "home",
    }),
  ],
})
```

---

### regex

Easily test any value against a regular expression.

Values can be of type string, number, boolean… even objects!

```typescript
pattern: RegExp // regular expression
message?: string // optional custom error message; replaces {pattern} with your input and {value} as submitted field value
```

```typescript
defineField({
  name: 'email',
  type: 'string',
  validation: (rule) => 
    rule.custom(
      regex(
        /^([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6})*$/,
        "“{value}” is not a valid email address."
      )
    ),
}),
```

**Custom error messages are highly recommended here.** Without the custom message above, the default response would be:

```
“me@googlecom” does not match the pattern /^([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6})*$/.
```

---

### referencedDocumentRequires

You might want to enforce some validation on a referenced document. This validator enforces that a given value is not null in the referenced document.

```typescript
documentType: string // type of document you’re referring to
field: string, // name of document field that is required
message?: string // optional custom error message; replaces {documentType} and {field} with your input
```

```typescript
defineField({
  name: 'referredArticle',
  description: 'An article (must include a valid poster image)',
  type: 'reference',
  to: [{type: 'article'}],
  validation: (rule) => 
    rule.custom(
      referencedDocumentRequires('article', 'poster')
    ),
}),
```

---

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
maxDepth: number // maximum "depth" of embedding (including parent)
key: string, // name of the field that includes the recursive value (i.e. the field’s own name)
message?: string // optional custom error message; replaces {maxDepth} and {key} with your input
```

```typescript
import { maxDepth } from "sanity-advanced-validators"

const navLink = defineType({
  // …
  fields: [
    // …
    defineField({
      name: "subnav",
      type: "array",
      of: [{ type: navigation }],
      validation: (rule) => 
        rule.custom(
          maxDepth(3, "subnav")
        ),
    }),
  ],
})
```

This will enforce that a subnav list can embed in a subnav, which can also be embedded in a subnav — but no further.

---

#### Note to any Sanity dev who looks at this

I’d love to include similar logic on my `hidden:` attribute, but I don’t think that’t possible without a `path` array in `hidden`’s `ConditionalPropertyCallbackContext` that’s similar to the one fed to the `ValidationContext` (todo: type this correctly). Wouldn’t this be cool?

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

---

## Roadmap

### Nested pathfinders

Since building these validator, I took to putting my slugs in a metadata object. I need to update `requiredIfSlugEq` to accept a path, like `requiredIfSlugEq('metadata.slug', 'some-values')`.

This pathfinding should be added to any validator that takes a sibling, like `requiredIfSiblingEq('metadata.slug.current', 'home')`. It can probably be snapped into `getSibling`.

While I’m at it, there’s a possibility that `getSibling` could detect the target type. If that type is `slug`, then it could add `current` to the path, and then I can deprecate `requiredIfSlugEq` altogether.

On a related note, `requiredIfSlugEq` does not work in an object nested inside an array. If we can deprecate `requiredIfSlugEq`, then this would be automatically resolved.

### Image and File checks

`minDimensions`, `maxDimensions`, and `fileExtension` should check to see if the field is of type `image` or `file`.

Some of the other checks should probably make sure the field is _not_ `image` or `file`.

An `aspectRatio(n)` might be nice (ex. `aspectRatio(1.6)` or `aspectRatio(1.6/1)`).

### new referencedDocumentFieldEq validator

```
// only articles by Jimmy Olsen
rule => rule.custom(referencedDocumentFieldEq('article', 'author', 'Jimmy Olsen'))
// only articles whose authors are not null. replaces  `referencedDocumentRequires`.
rule => rule.custom(referencedDocumentFieldNeq('article', 'author', null))
```

## MOAR

Do you have any ideas or edge cases that these validators don’t cover? Leave an issue, maybe I can hack it out.
