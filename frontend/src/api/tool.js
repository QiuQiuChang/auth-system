import client from './client'

const toolApi = {
  list: () => client.get('/api/tools'),

  categories: () => client.get('/api/tools/categories'),

  getBySlug: (slug) => client.get(`/api/tools/${slug}`),

  execute: (slug, inputs) => client.post(`/api/tools/${slug}/execute`, { slug, inputs }, { timeout: 360000 }),
}

export default toolApi
