import { defineField, defineType } from 'sanity'

export const homepageType = defineType({
  name: 'homepage',
  title: 'Homepage',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string'
    }),
    defineField({
      name: 'subtitle',
      title: 'Subtitle',
      type: 'text'
    }),
    defineField({
      name: 'buttonText',
      title: 'Button Text',
      type: 'string'
    }),
    defineField({
      name: 'buttonLink',
      title: 'Button Link',
      type: 'string'
    }),
    defineField({
      name: 'heroImage',
      title: 'Hero Image',
      type: 'image'
    }),
    defineField({
      name: 'aboutHeadline',
      title: 'About Headline',
      type: 'string'
    }),
    defineField({
      name: 'aboutParagraph',
      title: 'About Paragraph',
      type: 'text'
    }),
    defineField({
      name: 'aboutPoints',
      title: 'About Bullet Points',
      type: 'array',
      of: [{ type: 'string' }]
    })
  ]
})
