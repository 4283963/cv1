import { useState, useEffect, useCallback } from 'react'
import DepositPanel from './components/DepositPanel'
import PickupPanel from './components/PickupPanel'
import { lockerApi } from './services/api'

function App() {
  const [activeTab, setActiveTab] = useState('deposit')
  const [lockers, setLockers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchLockers = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await lockerApi.getLockers()
      setLockers(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLockers()
  }, [fetchLockers])

  const availableCount = lockers.filter(l => !l.isOccupied).length
  const occupiedCount = lockers.filter(l => l.isOccupied).length

  if (loading && lockers.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">正在加载格子数据...</p>
        </div>
      </div>
    )
  }

  if (error && lockers.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">加载失败</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchLockers}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            重新加载
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            📦 快递柜管理系统
          </h1>
          <p className="text-gray-600">智能快递柜，便捷存取</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('deposit')}
              className={`flex-1 py-4 px-6 font-semibold text-lg transition-all duration-200 ${
                activeTab === 'deposit'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              📤 快递员存件
            </button>
            <button
              onClick={() => setActiveTab('pickup')}
              className={`flex-1 py-4 px-6 font-semibold text-lg transition-all duration-200 ${
                activeTab === 'pickup'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              📥 业主取件
            </button>
          </div>

          <div className="flex justify-around py-4 bg-gray-50 border-b border-gray-200">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-800">{lockers.length}</div>
              <div className="text-sm text-gray-500">总格数</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{availableCount}</div>
              <div className="text-sm text-gray-500">空闲</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">{occupiedCount}</div>
              <div className="text-sm text-gray-500">已占用</div>
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'deposit' ? (
              <DepositPanel lockers={lockers} onRefresh={fetchLockers} />
            ) : (
              <PickupPanel lockers={lockers} onRefresh={fetchLockers} />
            )}
          </div>
        </div>

        <div className="mt-6 text-center text-gray-500 text-sm">
          <p>如有问题，请联系管理员</p>
        </div>
      </div>
    </div>
  )
}

export default App
