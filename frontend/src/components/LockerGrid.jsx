const LockerGrid = ({ lockers, selectedLocker, onLockerSelect, selectable = false }) => {
  const getLockerStatus = (locker) => {
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

  const handleClick = (locker) => {
    if (selectable && !locker.isOccupied) {
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
          <span className="text-2xl">{locker.code}</span>
          <span className="text-xs mt-1 opacity-80">
            {locker.isOccupied ? '已占用' : '空闲'}
          </span>
        </div>
      ))}
    </div>
  )
}

export default LockerGrid
