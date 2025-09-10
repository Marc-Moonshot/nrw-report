type data = {
  average_daily_flow: number
  billed_month: string
  billed_qty: number
  daily_nrws: {
    date: string
    est_billed: number
    est_nrw: number
    flowacc: number
    nrw_percent: number
  }[]
  is_estimate: boolean
  month: string
  nrw_percent: number
  nrw_volume: number
  total_flow: number
}

type Area = {
  billed_completed: string
  device_code: string | null
  nrw_m3: number
  nrw_percent: number
  billed_qty: number
  total_flow: number
}

type monthlyData = {
  areas: Record<string, Area>
  billed_complete: string
  device_code: string
  nrw_m3: number
  nrw_percent: number
  total_bill_qty: number
  total_flow: number
}

type YearlyNRWData = Record<string, monthlyData>
