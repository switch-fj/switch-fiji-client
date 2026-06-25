export type ResourceStats = {
  clients: number
  sites: number
  devices: number
}

export type EngineeringDashboardDevice = {
  uid: string
  created_at: string
  updated_at: string
  site_uid: string
  device_type: string
  meter_role: string | null
  is_dual_tariff: boolean | null
  last_seen_at: string | null
  is_online: boolean
}

export type EngineeringDashboardSite = {
  uid: string
  created_at: string
  updated_at: string
  client_uid: string
  site_name: string | null
  gateway_id: string
  firmware: string | null
  first_seen_at: string | null
  devices: EngineeringDashboardDevice[]
}

export type EngineeringDashboardClient = {
  uid: string
  created_at: string
  updated_at: string
  client_id: string | null
  client_name: string
  client_email: string
  sites: EngineeringDashboardSite[]
}

export type PaginatedEngineerClients = {
  items: EngineeringDashboardClient[]
  pagination: {
    limit: number
    next_cursor: string | null
    prev_cursor: string | null
  }
}

export type UpdateClientInput = {
  client_id?: string | null
  client_name?: string | null
}

export type UpdateSiteInput = {
  site_id?: string | null
  site_name?: string | null
  gateway_id?: string | null
  firmware?: string | null
}
