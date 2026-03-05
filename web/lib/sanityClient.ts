import { createClient } from '@sanity/client'

export const sanity = createClient({
  projectId: 'lv33ldxk',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
})

