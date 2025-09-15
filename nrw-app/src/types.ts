// type data = {
//   average_daily_flow: number
//   billed_month: string
//   billed_qty: number
//   daily_nrws: {
//     date: string
//     est_billed: number
//     est_nrw: number
//     flowacc: number
//     nrw_percent: number
//   }[]
//   is_estimate: boolean
//   month: string
//   nrw_percent: number
//   nrw_volume: number
//   total_flow: number
// }

type area = {
  billed_completed: string
  device_code: string | null
  nrw_m3: number
  nrw_percent: number
  billed_qty: number
  total_flow: number
}

type device = {
  date_registered: number
  device_code: string
  device_number: number
  device_type: string
  last_contact: number
  last_status: string
  nickname: string
  rtu_assigned: number
}

type monthlyData = Record<
  string,
  {
    billed_completed: string
    billed_qty: number
    nrw_m3: number
    nrw_percent: number
    total_flow: number
  }
>

type yearlyData = Record<string, monthlyData>

type dailyData = Record<
  string,
  {
    billed_completed: number
    billed_est: number
    daily_flow: number
    date: string
    device_code: string
    nrw_m3: number
    nrw_percent: number
  }
>
type yearlyNRWData = Record<string, monthlyData>
