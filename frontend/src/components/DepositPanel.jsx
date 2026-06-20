import { useState } from 'react'
import LockerGrid from './LockerGrid'
import { lockerApi } from '../services/api'

const DepositPanel = ({ lockers, onRefresh }) => {
  const [trackingNumber, setTrackingNumber] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [selectedLocker, setSelectedLocker] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const [pickupCode, setPickupCode] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!trackingNumber.trim()) {
      setMessage({ type: 'error', text: '请输入快递单号' })
      return
    }
    if (!phoneNumber.trim()) {
      setMessage({ type: 'error', text: '请输入手机号' })
      return
    }
    if (!selectedLocker) {
      setMessage({ type: 'error', text: '请选择一个格子' })
      return
    }

    setLoading(true)
    setMessage(null)
    setPickupCode(null)

    try {
      const result = await lockerApi.deposit(selectedLocker, trackingNumber, phoneNumber)
      setMessage({ type: 'success', text: '存件成功！' })
      setPickupCode(result.pickupCode)
      setTrackingNumber('')
      setPhoneNumber('')
      setSelectedLocker(null)
      onRefresh()
    } catch (error) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">快递员存件</h2>
        <p className="text-gray-600">请填写快递信息并选择空闲格子</p>
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

      {pickupCode && (
        <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-6 text-center">
          <p className="text-gray-700 mb-2">请将以下取件码发送给收件人：</p>
          <div className="text-4xl font-bold text-blue-600 tracking-widest font-mono">
            {pickupCode}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            快递单号
          </label>
          <input
            type="text"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            placeholder="请输入快递单号"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            收件人手机号
          </label>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="请输入收件人手机号"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            选择格子
            {selectedLocker && (
              <span className="ml-2 text-blue-600">
                已选择: {selectedLocker}
              </span>
            )}
          </label>
          <LockerGrid
            lockers={lockers}
            selectedLocker={selectedLocker}
            onLockerSelect={setSelectedLocker}
            selectable={true}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-4 px-6 text-white font-bold rounded-lg text-lg transition-all duration-200 ${
            loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 active:scale-98 shadow-lg hover:shadow-xl'
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
            '确认存件'
          )}
        </button>
      </form>
    </div>
  )
}

export default DepositPanel
