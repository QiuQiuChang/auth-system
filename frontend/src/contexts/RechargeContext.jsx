import { createContext, useContext, useState } from 'react'
import RechargeModal from '../components/RechargeModal'

const RechargeCtx = createContext(null)

export const RechargeProvider = ({ children }) => {
  const [open, setOpen] = useState(false)
  return (
    <RechargeCtx.Provider value={{ openRecharge: () => setOpen(true) }}>
      {children}
      <RechargeModal open={open} onClose={() => setOpen(false)} />
    </RechargeCtx.Provider>
  )
}

export const useRecharge = () => useContext(RechargeCtx)
