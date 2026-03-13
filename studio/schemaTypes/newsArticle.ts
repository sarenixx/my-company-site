import {defineType, defineField} from 'sanity'

export const newsArticle = defineType({
  name: 'newsArticle',
  title: 'News',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'title', maxLength: 96},
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: 'publishedAt', title: 'Published at', type: 'datetime' }),
    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      of: [{type: 'block'}],
    }),
    defineField({
      name: 'relatedInvestment',
      title: 'Related investment',
      type: 'reference',
      to: [{type: 'investment'}],
    }),
    defineField({
      name: 'externalUrl',
      title: 'External URL',
      type: 'url',
    }),
  ],
  preview: {
    select: {title: 'title', subtitle: 'publishedAt'},
  },
})