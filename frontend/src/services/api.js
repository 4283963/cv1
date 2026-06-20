const BASE_URL = 'http://localhost:8080/api'

const fetchJson = async (url, options = {}) => {
  const response = await fetch(url, {
    ...options,
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      ...options.headers,
    },
  })
  const result = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(result.message || '请求失败')
  }
  return result
}

export const lockerApi = {
  getLockers: async () => {
    const result = await fetchJson(`${BASE_URL}/lockers`)
    if (!result.data || !Array.isArray(result.data)) {
      throw new Error('数据格式错误')
    }
    return result.data.map(locker => ({
      id: locker.id,
      code: locker.code,
      status: locker.status,
      isOccupied: locker.status === 'occupied',
      isOverdue: locker.status === 'overdue',
      trackingNumber: locker.tracking_number || null,
      phone: locker.phone || null,
      pickupCode: locker.pickup_code || null,
      depositedAt: locker.deposited_at || null,
      createdAt: locker.created_at,
      updatedAt: locker.updated_at,
    }))
  },

  deposit: async (code, trackingNumber, phone) => {
    const result = await fetchJson(`${BASE_URL}/lockers/${code}/deposit`, {
      method: 'POST',
      body: JSON.stringify({
        tracking_number: trackingNumber,
        phone: phone,
      }),
    })
    return {
      code: result.data?.code,
      pickupCode: result.data?.pickup_code,
      trackingNumber: result.data?.tracking_number,
      phone: result.data?.phone,
      status: result.data?.status,
      message: result.message,
    }
  },

  pickup: async (pickupCode) => {
    const result = await fetchJson(`${BASE_URL}/lockers/pickup`, {
      method: 'POST',
      body: JSON.stringify({
        pickup_code: pickupCode,
      }),
    })
    return {
      code: result.data?.code,
      status: result.data?.status,
      message: result.message,
    }
  },

  markOverdueForTesting: async (code) => {
    const result = await fetchJson(`${BASE_URL}/lockers/${code}/mark-overdue`, {
      method: 'POST',
    })
    return result
  },
}
