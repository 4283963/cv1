const BASE_URL = 'http://localhost:8080/api'

export const lockerApi = {
  getLockers: async () => {
    const response = await fetch(`${BASE_URL}/lockers`)
    if (!response.ok) {
      throw new Error('获取格子列表失败')
    }
    const result = await response.json()
    return result.data.map(locker => ({
      ...locker,
      isOccupied: locker.status === 'occupied'
    }))
  },

  deposit: async (code, trackingNumber, phone) => {
    const response = await fetch(`${BASE_URL}/lockers/${code}/deposit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tracking_number: trackingNumber,
        phone: phone,
      }),
    })
    const result = await response.json().catch(() => ({ message: '存件失败' }))
    if (!response.ok) {
      throw new Error(result.message || '存件失败')
    }
    return {
      pickupCode: result.data.pickup_code,
      ...result
    }
  },

  pickup: async (pickupCode) => {
    const response = await fetch(`${BASE_URL}/lockers/pickup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pickup_code: pickupCode,
      }),
    })
    const result = await response.json().catch(() => ({ message: '取件失败' }))
    if (!response.ok) {
      throw new Error(result.message || '取件失败')
    }
    return result
  },
}
