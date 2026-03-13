import {defineType, defineField} from 'sanity'

export const jobPosting = defineType({
  name: 'jobPosting',
  title: 'Jobs',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({ name: 'department', title: 'Department', type: 'string' }),
    defineField({ name: 'location', title: 'Location', type: 'string' }),
    defineField({ name: 'applyUrl', title: 'Apply URL', type: 'url' }),
    defineField({ name: 'description', title: 'Description', type: 'array', of: [{type: 'block'}] }),
    defineField({ name: 'isActive', title: 'Active', type: 'boolean', initialValue: true }),
  ],
})
