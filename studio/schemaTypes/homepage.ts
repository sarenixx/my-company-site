import { defineArrayMember, defineField, defineType } from 'sanity'

export const homepage = defineType({
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
      name: 'heroImageUrl',
      title: 'Hero Image URL (External)',
      type: 'url'
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
    }),
    defineField({
      name: 'heroHeadline',
      title: 'Hero Headline',
      type: 'string'
    }),
    defineField({
      name: 'heroHeadlineEmphasis',
      title: 'Hero Headline Emphasis',
      description: 'Styled in italic serif in the hero heading.',
      type: 'string'
    }),
    defineField({
      name: 'heroSubheadline',
      title: 'Hero Subheadline',
      type: 'text'
    }),
    defineField({
      name: 'heroBackgroundLogoUrl',
      title: 'Hero Background Logo URL (External)',
      type: 'url'
    }),
    defineField({
      name: 'portfolioTickerItems',
      title: 'Portfolio Ticker Items (Manual)',
      description:
        'Legacy manual ticker list. Prefer "Portfolio Ticker Companies" above for easier logo management.',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({
              name: 'label',
              title: 'Label',
              type: 'string'
            }),
            defineField({
              name: 'logoUrl',
              title: 'Logo URL / Path (Optional)',
              description: 'Accepts full URL or local /public path from web app.',
              type: 'string'
            }),
            defineField({
              name: 'logoAlt',
              title: 'Logo Alt Text',
              type: 'string'
            })
          ],
          preview: {
            select: {
              title: 'label',
              subtitle: 'logoUrl'
            }
          }
        })
      ]
    }),
    defineField({
      name: 'portfolioTickerCompanies',
      title: 'Portfolio Ticker Companies',
      description:
        'Recommended: select and reorder investment companies to drive ticker logos automatically.',
      type: 'array',
      validation: (rule) => rule.max(12),
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{ type: 'investment' }]
        })
      ]
    }),
    defineField({
      name: 'portfolioCtaText',
      title: 'Portfolio CTA Text',
      type: 'string'
    }),
    defineField({
      name: 'portfolioCtaLink',
      title: 'Portfolio CTA Link',
      type: 'string'
    }),
    defineField({
      name: 'aboutSectionTitle',
      title: 'About Section Title',
      type: 'string'
    }),
    defineField({
      name: 'aboutParagraphs',
      title: 'About Section Paragraphs',
      type: 'array',
      of: [{ type: 'text' }]
    }),
    defineField({
      name: 'aboutStats',
      title: 'About Section Stats',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({
              name: 'value',
              title: 'Value',
              type: 'string'
            }),
            defineField({
              name: 'label',
              title: 'Label',
              type: 'string'
            })
          ],
          preview: {
            select: {
              title: 'value',
              subtitle: 'label'
            }
          }
        })
      ]
    }),
    defineField({
      name: 'teamSectionTitle',
      title: 'Team Section Title',
      type: 'string'
    }),
    defineField({
      name: 'teamSectionSubtitle',
      title: 'Team Section Subtitle',
      type: 'text'
    }),
    defineField({
      name: 'teamSectionDescription',
      title: 'Team Section Description',
      type: 'text'
    }),
    defineField({
      name: 'teamPrimaryCtaText',
      title: 'Team Primary CTA Text',
      type: 'string'
    }),
    defineField({
      name: 'teamPrimaryCtaLink',
      title: 'Team Primary CTA Link',
      type: 'string'
    }),
    defineField({
      name: 'teamSecondaryCtaText',
      title: 'Team Secondary CTA Text',
      type: 'string'
    }),
    defineField({
      name: 'teamSecondaryCtaLink',
      title: 'Team Secondary CTA Link',
      type: 'string'
    }),
    defineField({
      name: 'platformSectionTitle',
      title: 'Platform Section Title',
      type: 'string'
    }),
    defineField({
      name: 'platformSectionSubtitle',
      title: 'Platform Section Subtitle',
      type: 'text'
    }),
    defineField({
      name: 'resourcesSectionTitle',
      title: 'Resources Section Title',
      type: 'string'
    }),
    defineField({
      name: 'resourcesSectionSubtitle',
      title: 'Resources Section Subtitle',
      type: 'text'
    }),
    defineField({
      name: 'resourcesCtaText',
      title: 'Resources CTA Text',
      type: 'string'
    }),
    defineField({
      name: 'resourcesCtaLink',
      title: 'Resources CTA Link',
      type: 'string'
    }),
    defineField({
      name: 'footerBrand',
      title: 'Footer Brand Label',
      type: 'string'
    }),
    defineField({
      name: 'footerBrandLogoUrl',
      title: 'Footer Brand Logo URL / Path',
      description: 'Accepts full URL or local /public path from web app.',
      type: 'string'
    }),
    defineField({
      name: 'footerBrandLogoAlt',
      title: 'Footer Brand Logo Alt Text',
      type: 'string'
    }),
    defineField({
      name: 'footerEmail',
      title: 'Footer Email',
      type: 'string'
    }),
    defineField({
      name: 'footerLocations',
      title: 'Footer Locations',
      type: 'array',
      of: [{ type: 'string' }]
    }),
    defineField({
      name: 'footerCopyright',
      title: 'Footer Copyright',
      type: 'string'
    }),
    defineField({
      name: 'footerSocialLinks',
      title: 'Footer Social Links',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({
              name: 'label',
              title: 'Label',
              type: 'string'
            }),
            defineField({
              name: 'url',
              title: 'URL',
              type: 'url'
            }),
            defineField({
              name: 'logoUrl',
              title: 'Logo URL / Path (Optional)',
              description: 'Accepts full URL or local /public path from web app.',
              type: 'string'
            }),
            defineField({
              name: 'logoAlt',
              title: 'Logo Alt Text',
              type: 'string'
            })
          ],
          preview: {
            select: {
              title: 'label',
              subtitle: 'url'
            }
          }
        })
      ]
    }),
    defineField({
      name: 'footerLinks',
      title: 'Footer Links',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({
              name: 'label',
              title: 'Label',
              type: 'string'
            }),
            defineField({
              name: 'url',
              title: 'URL',
              type: 'string'
            })
          ],
          preview: {
            select: {
              title: 'label',
              subtitle: 'url'
            }
          }
        })
      ]
    })
  ]
})
