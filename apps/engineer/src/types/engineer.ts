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

export type SitePvSummary = {
  uid: string
  created_at: string
  updated_at: string
  site_uid: string
  user_uid: string
  commissioned_at: string
  expected_production_kwh: string
  system_size_kwp: string
  year1_degradation: number
  year2plus_degradation: number
}

export type SitePvSummaryInput = {
  commissioned_at: string
  expected_production_kwh: number | string
  system_size_kwp: number | string
  year1_degradation: number
  year2plus_degradation: number
}

export type UpdateSitePvSummaryInput = SitePvSummaryInput & { uid: string }

export type SitePvDegradation = {
  uid: string
  created_at: string
  updated_at: string
  site_uid: string
  user_uid: string
  /** JSON-encoded degradation table */
  degradation: string
}

export type SiteDegradationInput = {
  monthly_kwh_values: number[]
}

export type SitePanelRef = {
  uid: string
  created_at: string
  updated_at: string
  site_uid: string
  user_uid: string
  panel_type: string
  watt: number
  vmp: number
  voc: number
  imp: number
}

export type PanelRefItemInput = {
  panel_type: string
  watt: number
  vmp: number
  voc: number
  imp: number
}

export type UpdatePanelRefItemInput = PanelRefItemInput & { uid: string }

export type StringWiringItemInput = {
  inverter: number
  mppt: number
  string_id: number
  panel_ref_uid: string
  panel_qty: number
}

export type SiteStringWiring = {
  uid: string
  created_at: string
  updated_at: string
  site_uid: string
  user_uid: string
  /** JSON-encoded array of the raw StringWiringItemInput rows — used to
   * prefill the edit form. */
  string_input: string
  /** JSON-encoded array of server-computed per-string rows — used to
   * render the String Summary table. */
  wring_schematics: string | null
  mppt_fn_table: string | null
  expected_mppt_a_table: string | null
}

export type StringWiringSchematicItem = {
  inverter: number
  mppt: number
  string_id: number
  panel_ref_uid: string
  panel_watt: number
  panel_qty: number
  panel_voc: number
  panel_vmp: number
  ip: number
  string_identity: string
  watt: number
  voc: number
  vmp: number
  mppt_key: string
}

export type MpptFunctionRow = {
  inverter: number
  mppt: number
  mppt_key: string
  mppt_p_kw: number
  mppt_ip: number
  mppt_vp: number
}

export type ExpectedMpptARow = {
  ir_wm2: number
  mppt_key: string
  expected_ip: number
}

export type SiteDeviceModel = {
  uid: string
  created_at: string
  updated_at: string
  site_uid: string
  slave_id: number
  device_type: string
  meter_role: string | null
  is_dual_tariff: boolean | null
  /** JSON-encoded snapshot of the device's latest telemetry, e.g.
   * `{"pv1_v":0,"pv1_w":0,"pv1_i":0,"pv2_v":22.1,...}` — the highest
   * `pvN_*` index present indicates how many MPPT inputs the inverter has. */
  recent_telemetry_reading: string | null
  last_seen_at: string | null
}

export type SiteMpptFunctionCheck = {
  uid: string
  created_at: string
  updated_at: string
  site_uid: string
  user_uid: string
  date_at: string
  from_: string
  to: string
  interval_in_minutes: number
  is_completed: boolean
  /** JSON-encoded array of per-time-slot readings. */
  mppt_fn_check_table_str: string | null
  telemetry_reading_str: string | null
}

export type MpptFnCheckReading = {
  mppt_key: string
  pvn_ip: number
  pct: number
}

export type MpptFnCheckTimeSlot = {
  time_at: string
  ir_w_per_m2: number
  irradiance_source: string
  mppt_keys: MpptFnCheckReading[]
}

export type SiteBatterySoc = {
  uid: string
  created_at: string
  updated_at: string
  site_uid: string
  battery_soc_config_uid: string
  date_at: string
  from_: string
  to: string
  interval_in_minutes: number
  is_completed: boolean
  /** JSON-encoded array of per-time-slot readings — exact shape unconfirmed
   * against a live response; parsed defensively, mirroring the
   * `mppt_fn_check_table_str` convention (nested per-key readings). */
  battery_soc_table_str: string | null
  telemetry_reading_str: string | null
}

export type BatterySocReading = {
  battery_key: string
  soc: number
}

export type BatterySocTimeSlot = {
  time_at: string
  battery_keys: BatterySocReading[]
}
