import client from './client'

const paymentApi = {
  getPlans: () => client.get('/api/payment/plans'),

  recharge: (planId) => client.post('/api/payment/recharge', { planId }),
}

export default paymentApi
