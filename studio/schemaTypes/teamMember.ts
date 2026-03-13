import {defineType, defineField} from 'sanity'

export const teamMember = defineType({
  name: 'teamMember',
  title: 'Team',
  type: 'document',
  fields: [
    defineField({name: 'name', title: 'Name', type: 'string', validation: (Rule) => Rule.required()}),
    defineField({name: 'role', title: 'Role', type: 'string'}),
    defineField({name: 'photo', title: 'Photo', type: 'image', options: {hotspot: true}}),
    defineField({name: 'bio', title: 'Bio', type: 'array', of: [{type: 'block'}]}),
  ],
})
