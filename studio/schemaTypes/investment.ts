import {defineType, defineField} from 'sanity'

export const investment = defineType({
  name: 'investment', // this is the internal type
  title: 'Investments', // this is what shows in Studio
  type: 'document',
  fields: [
    defineField({
      name: 'companyName',
      title: 'Company Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'website',
      title: 'Website',
      type: 'url',
    }),
    defineField({
      name: 'logo',
      title: 'Logo',
      type: 'image',
      options: {hotspot: true},
    }),
    defineField({
      name: 'logoExternalUrl',
      title: 'Logo URL (External)',
      type: 'url',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          {title: 'Active', value: 'active'},
          {title: 'Exited', value: 'exited'},
          {title: 'IPO', value: 'ipo'},
        ],
      },
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          {title: 'Enterprise', value: 'enterprise'},
          {title: 'Commerce', value: 'commerce'},
          {title: 'Healthcare', value: 'healthcare'},
        ],
      },
    }),
    defineField({
      name: 'isFeatured',
      title: 'Featured',
      type: 'boolean',
      initialValue: false,
    }),
  ],
})
