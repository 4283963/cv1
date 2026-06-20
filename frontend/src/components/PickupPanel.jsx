import { useState } from 'react'
import LockerGrid from './LockerGrid'
import { lockerApi } from '../services/api'

const PickupPanel = ({ lockers, onRefresh }) => {
  const [pickupCode, setPickupCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!pickupCode.trim()) {
      setMessage({ type: 'error', text: '请输入取件码' })
      return
    }
    if (!/^\d{6}$/.test(pickupCode)) {
      setMessage({ type: 'error', text: '请输入6位数字取件码' })
      return
    }

    setLoading(true)
    setMessage(null)
    setSuccess(false)

    try {
      await lockerApi.pickup(pickupCode)
      setSuccess(true)
      setMessage({ type: 'success', text: '柜门已打开，请取走您的快递！' })
      setPickupCode('')
      onRefresh()
    } catch (error) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6)
    setPickupCode(value)
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">业主取件</h2>
        <p className="text-gray-600">请输入6位取件码取件</p>
      </div>

      {message && (
        <div className={`p-4 rounded-lg text-center font-medium ${
          message.type === 'success' 
            ? 'bg-green-100 text-green-700 border border-green-200' 
            : 'bg-red-100 text-red-700 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border-2 border-green-400 rounded-xl p-8 text-center">
          <div className="text-6xl mb-4">✅</div>
          <p className="text-2xl font-bold text-green-700">柜门已打开</p>
          <p className="text-gray-600 mt-2">请取走您的快递</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
            请输入6位取件码
          </label>
          <div className="flex justify-center gap-2 mb-4">
            {[0, 1, 2, 3, 4, 5].map((index) => (
              <div
                key={index}
                className={`w-12 h-14 flex items-center justify-center text-2xl font-bold border-2 rounded-lg transition-all ${
                  pickupCode[index]
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 bg-gray-50 text-gray-400'
                }`}
              >
                {pickupCode[index] || ''}
              </div>
            ))}
          </div>
          <input
            type="text"
            value={pickupCode}
            onChange={handleInputChange}
            placeholder="在此输入6位取件码"
            maxLength={6}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all text-center text-lg tracking-widest font-mono"
            autoFocus
          />
        </div>

        <button
          type="submit"
          disabled={loading || pickupCode.length !== 6}
          className={`w-full py-4 px-6 text-white font-bold rounded-lg text-lg transition-all duration-200 ${
            loading || pickupCode.length !== 6
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700 active:scale-98 shadow-lg hover:shadow-xl'
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              提交中...
            </span>
          ) : (
            '确认取件'
          )}
        </button>
      </form>

      <div className="mt-8">
        <h3 className="text-sm font-medium text-gray-700 mb-3 text-center">
          格子状态
        </h3>
        <LockerGrid
          lockers={lockers}
          selectedLocker={null}
          onLockerSelect={() => {}}
          selectable={false}
        />
      </div>
    </div>
  )
}

export default PickupPanel
