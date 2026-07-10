import { DEFAULT_LOCATION } from '../lib/dates.js'

/** Thin data layer over Supabase. All calls assume an admin session (RLS enforces). */
export function makeApi(supabase) {
  return {
    // ── reference data ──────────────────────────────────────────────────
    async loadPeople() {
      const { data, error } = await supabase.from('ws_people').select('*').order('display_name')
      if (error) throw error
      return data
    },
    async loadRoles() {
      const { data, error } = await supabase.from('ws_roles').select('*').order('sort_order')
      if (error) throw error
      return data
    },
    async loadTeams() {
      const { data, error } = await supabase
        .from('ws_teams')
        .select('*, members:ws_team_members(person_id, role_id)')
        .order('name')
      if (error) throw error
      return data
    },

    // ── roster window ───────────────────────────────────────────────────
    async ensureServices(dates) {
      if (!dates.length) return
      const rows = dates.map((d) => ({ service_date: d, time_label: 'AM', location: DEFAULT_LOCATION }))
      const { error } = await supabase
        .from('ws_services')
        .upsert(rows, { onConflict: 'service_date,time_label,location', ignoreDuplicates: true })
      if (error) throw error
    },
    async loadServices(fromDate, toDate) {
      const { data, error } = await supabase
        .from('ws_services')
        .select('*, assignments:ws_assignments(*)')
        .eq('location', DEFAULT_LOCATION)
        .gte('service_date', fromDate)
        .lte('service_date', toDate)
        .order('service_date')
      if (error) throw error
      return data
    },
    async loadService(serviceId) {
      const { data, error } = await supabase
        .from('ws_services')
        .select('*, assignments:ws_assignments(*)')
        .eq('id', serviceId)
        .single()
      if (error) throw error
      return data
    },
    async updateService(id, patch) {
      const { error } = await supabase.from('ws_services').update(patch).eq('id', id)
      if (error) throw error
    },

    // ── assignments ─────────────────────────────────────────────────────
    async setAssignment(serviceId, personId, { roleId = null, status, note = null }) {
      const { error } = await supabase.from('ws_assignments').upsert(
        { service_id: serviceId, person_id: personId, role_id: roleId, status, note },
        { onConflict: 'service_id,person_id' }
      )
      if (error) throw error
    },
    async clearAssignment(serviceId, personId) {
      const { error } = await supabase
        .from('ws_assignments')
        .delete()
        .eq('service_id', serviceId)
        .eq('person_id', personId)
      if (error) throw error
    },
    async applyTeam(service, team, existingAssignments) {
      // Slots in every team member who isn't already marked unavailable/tentative.
      const byPerson = new Map(existingAssignments.map((a) => [a.person_id, a]))
      const rows = []
      for (const m of team.members) {
        const existing = byPerson.get(m.person_id)
        if (existing && existing.status !== 'available' && existing.status !== 'assigned') continue
        rows.push({
          service_id: service.id,
          person_id: m.person_id,
          role_id: m.role_id,
          status: 'assigned',
          note: null,
        })
      }
      if (rows.length) {
        const { error } = await supabase
          .from('ws_assignments')
          .upsert(rows, { onConflict: 'service_id,person_id' })
        if (error) throw error
      }
      await this.updateService(service.id, { applied_team_id: team.id })
      return rows.length
    },

    // ── songs ───────────────────────────────────────────────────────────
    async loadSongs() {
      const { data, error } = await supabase
        .from('ws_songs')
        .select('*, links:ws_song_links(*), tags:ws_song_tags(tag_id)')
        .order('title')
      if (error) throw error
      return data
    },
    async loadTags() {
      const { data, error } = await supabase.from('ws_tags').select('*').order('name')
      if (error) throw error
      return data
    },
    /** song_id → latest service_date it was sung (for "last sung" hints) */
    async loadLastSung() {
      const { data, error } = await supabase
        .from('ws_service_songs')
        .select('song_id, service:ws_services(service_date)')
      if (error) throw error
      const map = new Map()
      for (const row of data) {
        const d = row.service?.service_date
        if (!d) continue
        if (!map.has(row.song_id) || map.get(row.song_id) < d) map.set(row.song_id, d)
      }
      return map
    },
    async saveSong(song) {
      const { data, error } = await supabase
        .from('ws_songs')
        .upsert(song, { onConflict: 'id' })
        .select()
        .single()
      if (error) throw error
      return data
    },
    async deleteSong(id) {
      const { error } = await supabase.from('ws_songs').delete().eq('id', id)
      if (error) throw error
    },
    async saveSongLinks(songId, links) {
      const { error: delErr } = await supabase.from('ws_song_links').delete().eq('song_id', songId)
      if (delErr) throw delErr
      if (links.length) {
        const rows = links.map((l, i) => ({ song_id: songId, url: l.url, label: l.label || 'Chords', sort_order: i }))
        const { error } = await supabase.from('ws_song_links').insert(rows)
        if (error) throw error
      }
    },
    async saveSongTags(songId, tagIds) {
      const { error: delErr } = await supabase.from('ws_song_tags').delete().eq('song_id', songId)
      if (delErr) throw delErr
      if (tagIds.length) {
        const { error } = await supabase
          .from('ws_song_tags')
          .insert(tagIds.map((tag_id) => ({ song_id: songId, tag_id })))
        if (error) throw error
      }
    },

    // ── service songs (the plan) ────────────────────────────────────────
    async loadServiceSongs(serviceId) {
      const { data, error } = await supabase
        .from('ws_service_songs')
        .select('*, song:ws_songs(id, title, main_key, links:ws_song_links(url, label, sort_order))')
        .eq('service_id', serviceId)
        .order('sort_order')
      if (error) throw error
      return data.map((r) => ({ ...r, links: r.song?.links || [] }))
    },
    async addServiceSong(serviceId, songId, sortOrder) {
      const { error } = await supabase
        .from('ws_service_songs')
        .insert({ service_id: serviceId, song_id: songId, sort_order: sortOrder })
      if (error) throw error
    },
    async updateServiceSong(id, patch) {
      const { error } = await supabase.from('ws_service_songs').update(patch).eq('id', id)
      if (error) throw error
    },
    async removeServiceSong(id) {
      const { error } = await supabase.from('ws_service_songs').delete().eq('id', id)
      if (error) throw error
    },

    // ── people ──────────────────────────────────────────────────────────
    async savePerson(person) {
      const { data, error } = await supabase
        .from('ws_people')
        .upsert(person, { onConflict: 'id' })
        .select()
        .single()
      if (error) throw error
      return data
    },

    // ── teams ───────────────────────────────────────────────────────────
    async saveTeam(team) {
      const { data, error } = await supabase
        .from('ws_teams')
        .upsert(team, { onConflict: 'id' })
        .select()
        .single()
      if (error) throw error
      return data
    },
    async deleteTeam(id) {
      const { error } = await supabase.from('ws_teams').delete().eq('id', id)
      if (error) throw error
    },
    async setTeamMember(teamId, personId, roleId) {
      const { error } = await supabase
        .from('ws_team_members')
        .upsert({ team_id: teamId, person_id: personId, role_id: roleId }, { onConflict: 'team_id,person_id' })
      if (error) throw error
    },
    async removeTeamMember(teamId, personId) {
      const { error } = await supabase
        .from('ws_team_members')
        .delete()
        .eq('team_id', teamId)
        .eq('person_id', personId)
      if (error) throw error
    },

    // ── reminders ───────────────────────────────────────────────────────
    async logReminder(serviceId, channel, recipients) {
      const { error } = await supabase
        .from('ws_reminder_log')
        .insert({ service_id: serviceId, channel, recipients })
      if (error) throw error
    },
    async loadReminderLog() {
      const { data, error } = await supabase
        .from('ws_reminder_log')
        .select('*, service:ws_services(service_date)')
        .order('sent_at', { ascending: false })
        .limit(25)
      if (error) throw error
      return data
    },
    async sendReminderNow(date, dryRun) {
      const { data, error } = await supabase.functions.invoke('worship-reminder', {
        body: { date, dry_run: dryRun },
      })
      if (error) throw error
      return data
    },
  }
}
