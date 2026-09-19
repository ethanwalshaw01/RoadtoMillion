import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../state/AuthContext'
import { useSettings } from '../state/SettingsContext'
import { useJobs } from '../state/JobsContext'
import { useDriverProfile } from '../state/DriverProfileContext'
import { useToast } from '../state/ToastContext'
import PageHeader from '../components/ui/PageHeader'
import Segmented from '../components/ui/Segmented'
import Toggle from '../components/ui/Toggle'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import { Input, Label, Help } from '../components/ui/Field'
import Icon from '../components/ui/Icon'
import { chime } from '../lib/sound'

export default function Settings() {
  const { user, updateUser, logout } = useAuth()
  const { settings, update } = useSettings()
  const { resetAll, jobs } = useJobs()
  const { resetProfile } = useDriverProfile()
  const { push } = useToast()
  const navigate = useNavigate()
  const [confirm, setConfirm] = useState<null | 'data' | 'everything'>(null)

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <PageHeader eyebrow="Preferences" title="Settings" subtitle="Everything here is stored in this browser only." />

      <Section title="Profile" icon="user">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="s-name">Display name</Label>
            <Input id="s-name" value={user?.name ?? ''} onChange={(e) => updateUser({ name: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="s-phone" hint="Shared with your driver once a bid is accepted">Phone</Label>
            <Input id="s-phone" icon="phone" inputMode="tel" placeholder="07700 900000" value={user?.phone ?? ''} onChange={(e) => updateUser({ phone: e.target.value })} />
          </div>
        </div>
      </Section>

      <Section title="Appearance" icon="sun">
        <Row label="Theme" description="Night is easier on the eyes at the roadside. Day is better in sunlight.">
          <Segmented
            layoutId="theme-seg"
            value={settings.theme}
            onChange={(theme) => update({ theme })}
            options={[
              { value: 'night', label: <span className="flex items-center gap-1.5"><Icon name="moon" size={13} /> Night</span> },
              { value: 'day', label: <span className="flex items-center gap-1.5"><Icon name="sun" size={13} /> Day</span> },
            ]}
          />
        </Row>
        <Row label="Motion" description="Reduce animations if they distract or make you queasy.">
          <Segmented
            layoutId="motion-seg"
            size="sm"
            value={settings.motion}
            onChange={(motion) => update({ motion })}
            options={[
              { value: 'system', label: 'System' },
              { value: 'full', label: 'Full' },
              { value: 'reduced', label: 'Reduced' },
            ]}
          />
        </Row>
        <Toggle
          on={settings.compactCards}
          onChange={(compactCards) => update({ compactCards })}
          label="Compact bid cards"
          description="Hide driver messages and inclusions on bid cards until you open a profile."
        />
      </Section>

      <Section title="Alerts" icon="bell">
        <Toggle
          on={settings.sound}
          onChange={(sound) => {
            update({ sound })
            if (sound) chime('bid')
          }}
          label="Sound on new activity"
          description="A short chime when a bid lands, your bid is accepted, or a message arrives."
        />
        <Row label="Default bid sort" description="How bids are ordered when you open a job.">
          <Segmented
            layoutId="sort-seg"
            size="sm"
            value={settings.autoSort}
            onChange={(autoSort) => update({ autoSort })}
            options={[
              { value: 'smart', label: 'Smart' },
              { value: 'price', label: 'Price' },
              { value: 'eta', label: 'ETA' },
              { value: 'rating', label: 'Rating' },
            ]}
          />
        </Row>
      </Section>

      <Section title="Demo data" icon="trash" tone="danger">
        <p className="text-sm text-ink-2">
          You have <span className="font-mono font-semibold text-ink">{jobs.length}</span> job{jobs.length === 1 ? '' : 's'} stored locally, plus bids, messages and notifications.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="danger" icon="refresh" onClick={() => setConfirm('data')}>
            Clear jobs & bids
          </Button>
          <Button variant="outline" icon="trash" onClick={() => setConfirm('everything')}>
            Reset everything
          </Button>
        </div>
        <Help>Resetting everything also clears your driver profile and documents and signs you out.</Help>
      </Section>

      <AnimatePresence>
        {confirm && (
          <Modal
            onClose={() => setConfirm(null)}
            size="sm"
            eyebrow="Are you sure?"
            title={confirm === 'data' ? 'Clear jobs & bids' : 'Reset everything'}
            footer={
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" onClick={() => setConfirm(null)}>Keep it</Button>
                <Button
                  variant="danger"
                  onClick={() => {
                    resetAll()
                    if (confirm === 'everything') {
                      resetProfile()
                      logout()
                      navigate('/')
                    }
                    push({ title: confirm === 'data' ? 'Jobs and bids cleared' : 'Everything reset', tone: 'ok' })
                    setConfirm(null)
                  }}
                >
                  Yes, {confirm === 'data' ? 'clear' : 'reset'}
                </Button>
              </div>
            }
          >
            <p className="text-sm text-ink-2">
              {confirm === 'data'
                ? 'Every job, bid, message and notification in this browser will be removed. Your profile and preferences stay.'
                : 'Jobs, bids, messages, your driver profile, documents and sign-in will all be wiped. Theme and preferences stay.'}
            </p>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  )
}

function Section({ title, icon, tone, children }: { title: string; icon: Parameters<typeof Icon>[0]['name']; tone?: 'danger'; children: React.ReactNode }) {
  return (
    <section className={`mt-8 rounded-card border bg-surface p-5 shadow-card sm:p-6 ${tone === 'danger' ? 'border-danger/25' : 'border-line'}`}>
      <h2 className={`mb-4 flex items-center gap-2 font-display text-lg font-bold uppercase tracking-wider ${tone === 'danger' ? 'text-danger' : 'text-ink'}`}>
        <Icon name={icon} size={16} /> {title}
      </h2>
      <div className="divide-y divide-line">{children}</div>
    </section>
  )
}

function Row({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-semibold text-ink">{label}</p>
        {description && <p className="mt-0.5 text-xs text-ink-3">{description}</p>}
      </div>
      {children}
    </div>
  )
}
