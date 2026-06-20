const LockerGrid = ({ lockers, selectedLocker, onLockerSelect, selectable = false }) => {
  const getLockerStatus = (locker) => {
    if (locker.isOverdue) {
      return 'bg-red-700 hover:bg-red-800 ring-2 ring-red-400 animate-pulse'
    }
    if (locker.isOccupied) {
      return 'bg-red-500 hover:bg-red-600 cursor-not-allowed'
    }
    if (selectable && selectedLocker === locker.code) {
      return 'bg-blue-500 hover:bg-blue-600 ring-4 ring-blue-300'
    }
    if (selectable) {
      return 'bg-green-500 hover:bg-green-600 cursor-pointer'
    }
    return 'bg-green-500'
  }

  const getLockerLabel = (locker) => {
    if (locker.isOverdue) return '逾期'
    if (locker.isOccupied) return '已占用'
    return '空闲'
  }

  const handleClick = (locker) => {
    if (selectable && !locker.isOccupied && !locker.isOverdue) {
      onLockerSelect(locker.code)
    }
  }

  return (
    <div className="grid grid-cols-5 gap-3 p-4 bg-gray-100 rounded-xl">
      {lockers.map((locker) => (
        <div
          key={locker.code}
          onClick={() => handleClick(locker)}
          className={`
            aspect-square flex flex-col items-center justify-center
            rounded-lg text-white font-bold shadow-md
            transition-all duration-200 transform hover:scale-105
            ${getLockerStatus(locker)}
          `}
        >
          <div className="flex items-center">
            {locker.isOverdue && (
              <span className="text-xl mr-1">⚠️</span>
            )}
            <span className="text-2xl">{locker.code}</span>
          </div>
          <span className="text-xs mt-1 opacity-90">
            {getLockerLabel(locker)}
          </span>
          {locker.isOverdue && (
            <span className="text-[10px] mt-0.5 bg-yellow-400 text-red-800 px-1.5 py-0.5 rounded font-bold">
              ! 逾期
            </span>
          )}
        </div>
      ))}
    </div>
  )
}

export default LockerGrid
