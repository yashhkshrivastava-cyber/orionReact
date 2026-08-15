import { useEffect, useState } from 'react'
import { Database, Layers, Plus, Pencil, Trash2, RefreshCw, Server } from 'lucide-react'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { EntityForm } from '../components/EntityForm'
import type { EntityMeta } from '../types'
import { PageHeader } from '../components/ui/PageHeader'
import { Card, CardHeader } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Alert } from '../components/ui/Alert'
import { Tabs, SegmentedControl } from '../components/ui/Tabs'
import { Field, Select } from '../components/ui/Field'
import { Checkbox } from '../components/ui/Field'
import { DataTable } from '../components/ui/DataTable'
import { Badge } from '../components/ui/Alert'

type Action = 'Create' | 'Update' | 'Delete'
type Layer = 'ods' | 'dw'

export function DataManagementPage() {
  const { user } = useAuth()
  const [layer, setLayer] = useState<Layer>(user?.can_ods ? 'ods' : 'dw')
  const [entities, setEntities] = useState<EntityMeta[]>([])
  const [selectedEntity, setSelectedEntity] = useState('')
  const [action, setAction] = useState<Action>('Create')
  const [preview, setPreview] = useState<{ columns: string[]; rows: Record<string, unknown>[] } | null>(null)
  const [formValues, setFormValues] = useState<Record<string, unknown>>({})
  const [recordOptions, setRecordOptions] = useState<{ id: string; label: string }[]>([])
  const [selectedRecordId, setSelectedRecordId] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [dwDimensions, setDwDimensions] = useState<string[]>([])
  const [dwDimension, setDwDimension] = useState('')
  const [dwPreview, setDwPreview] = useState<{ columns: string[]; rows: Record<string, unknown>[] } | null>(null)
  const [loadStats, setLoadStats] = useState('')
  const [loadingDw, setLoadingDw] = useState(false)

  const layers: { id: Layer; label: string; icon: typeof Database }[] = []
  if (user?.can_ods) layers.push({ id: 'ods', label: 'Operational (ODS)', icon: Database })
  if (user?.can_dw) layers.push({ id: 'dw', label: 'Warehouse (DW)', icon: Server })

  useEffect(() => {
    if (user?.can_ods) {
      api.entities().then((r) => {
        setEntities(r.entities)
        if (r.entities.length) setSelectedEntity(r.entities[0].name)
      })
    }
    if (user?.can_dw) {
      api.dwDimensions().then((r) => {
        setDwDimensions(r.dimensions)
        if (r.dimensions.length) setDwDimension(r.dimensions[0])
      })
    }
  }, [user])

  const refreshOdsPreview = () => {
    if (!selectedEntity) return
    api.entityPreview(selectedEntity).then(setPreview).catch((e) => setError(e.message))
  }

  const refreshDwPreview = () => {
    if (!dwDimension) return
    api.dwPreview(dwDimension).then(setDwPreview).catch((e) => setError(e.message))
  }

  useEffect(() => {
    if (layer === 'ods') refreshOdsPreview()
  }, [selectedEntity, layer])

  useEffect(() => {
    if (layer === 'dw') refreshDwPreview()
  }, [dwDimension, layer])

  useEffect(() => {
    if (layer !== 'ods' || !selectedEntity || action === 'Create') {
      setRecordOptions([])
      setFormValues({})
      return
    }
    api.entityOptions(selectedEntity).then(setRecordOptions)
  }, [selectedEntity, action, layer])

  useEffect(() => {
    if (!selectedRecordId || action === 'Create') return
    api
      .getRecord(selectedEntity, selectedRecordId)
      .then((r) => setFormValues(r))
      .catch((e) => setError(e.message))
  }, [selectedRecordId, selectedEntity, action])

  const currentMeta = entities.find((e) => e.name === selectedEntity)

  const handleSubmit = async () => {
    setError('')
    setMessage('')
    setSubmitting(true)
    try {
      if (action === 'Create') {
        await api.createRecord(selectedEntity, formValues)
        setMessage('Record created successfully.')
        setFormValues({})
      } else if (action === 'Update') {
        await api.updateRecord(selectedEntity, selectedRecordId, formValues)
        setMessage('Record updated successfully.')
      } else {
        if (!confirmDelete) {
          setError('Please confirm deletion first.')
          return
        }
        await api.deleteRecord(selectedEntity, selectedRecordId)
        setMessage('Record deleted.')
        setSelectedRecordId('')
        setConfirmDelete(false)
      }
      refreshOdsPreview()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Operation failed')
    } finally {
      setSubmitting(false)
    }
  }

  const runDwLoad = async () => {
    setError('')
    setLoadStats('')
    setLoadingDw(true)
    try {
      const result = await api.dwLoad(dwDimension)
      const s = result.stats
      setLoadStats(`${s.inserted} new · ${s.versioned} versioned · ${s.expired} expired · ${s.unchanged} unchanged`)
      refreshDwPreview()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Load failed')
    } finally {
      setLoadingDw(false)
    }
  }

  const actionTabs: { id: Action; label: string; icon: typeof Plus }[] = [
    { id: 'Create', label: 'Create', icon: Plus },
    { id: 'Update', label: 'Update', icon: Pencil },
    { id: 'Delete', label: 'Delete', icon: Trash2 },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        eyebrow="Operations"
        title="Data Studio"
        subtitle="Manage operational records or run SCD Type 2 warehouse loads."
      />

      {/* Layer selector */}
      {layers.length > 1 && (
        <Card padding="sm">
          <div className="flex items-center gap-3 px-1">
            <Layers className="h-4 w-4 text-[color:var(--color-text-faint)]" />
            <SegmentedControl options={layers} value={layer} onChange={setLayer} />
          </div>
        </Card>
      )}

      {error && <Alert variant="error" onDismiss={() => setError('')}>{error}</Alert>}
      {message && <Alert variant="success" onDismiss={() => setMessage('')}>{message}</Alert>}

      {layer === 'ods' && currentMeta && (
        <>
          {/* Entity selector + preview */}
          <div className="grid gap-5 lg:grid-cols-3">
            <Card className="lg:col-span-1">
              <CardHeader title="Entity" subtitle="Select dataset in orion_ods" />
              <Field label="Dataset">
                <Select
                  value={selectedEntity}
                  onChange={(e) => {
                    setSelectedEntity(e.target.value)
                    setAction('Create')
                    setFormValues({})
                  }}
                >
                  {entities.map((e) => (
                    <option key={e.name} value={e.name}>
                      {e.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <div className="mt-4">
                <Badge variant="cyan">{entities.length} entities</Badge>
              </div>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader
                title="Live preview"
                subtitle="Latest 10 records"
                action={
                  <button
                    type="button"
                    onClick={refreshOdsPreview}
                    className="rounded-lg p-2 text-[color:var(--color-text-faint)] transition-colors hover:bg-white/5 hover:text-cyan-400"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                }
              />
              {preview && <DataTable columns={preview.columns} rows={preview.rows} />}
            </Card>
          </div>

          {/* Action tabs */}
          <div className="flex flex-wrap items-center gap-4">
            <Tabs
              tabs={actionTabs.map((a) => ({ id: a.id, label: a.label }))}
              active={action}
              onChange={(a) => {
                setAction(a)
                setFormValues({})
                setSelectedRecordId('')
              }}
            />
          </div>

          {/* Form card */}
          <Card glow={action === 'Create'}>
            <CardHeader
              title={`${action} record`}
              subtitle={`${action === 'Delete' ? 'Permanent removal from' : 'Modify'} ${selectedEntity}`}
            />

            {(action === 'Update' || action === 'Delete') && (
              <Field label="Select record" className="mb-5 max-w-md">
                <Select
                  value={selectedRecordId}
                  onChange={(e) => setSelectedRecordId(e.target.value)}
                >
                  <option value="">— Choose a record —</option>
                  {recordOptions.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.label}
                    </option>
                  ))}
                </Select>
              </Field>
            )}

            {action !== 'Delete' && (
              <EntityForm
                entityName={selectedEntity}
                fields={currentMeta.form_fields}
                values={formValues}
                onChange={(k, v) => setFormValues((prev) => ({ ...prev, [k]: v }))}
              />
            )}

            {action === 'Delete' && selectedRecordId && (
              <div className="mt-4 rounded-xl border border-rose-500/20 bg-rose-500/5 p-4">
                <Checkbox
                  label="I understand this deletion is permanent and cannot be undone"
                  checked={confirmDelete}
                  onChange={setConfirmDelete}
                />
              </div>
            )}

            <div className="mt-6 flex gap-3">
              <Button
                variant={action === 'Delete' ? 'danger' : 'primary'}
                loading={submitting}
                disabled={(action !== 'Create' && !selectedRecordId) || (action === 'Delete' && !confirmDelete)}
                onClick={handleSubmit}
              >
                {action === 'Create' ? 'Create record' : action === 'Update' ? 'Save changes' : 'Delete record'}
              </Button>
            </div>
          </Card>
        </>
      )}

      {layer === 'dw' && (
        <>
          <div className="grid gap-5 lg:grid-cols-3">
            <Card>
              <CardHeader title="Dimension" subtitle="SCD Type 2 target" />
              <Field label="Dimension table">
                <Select value={dwDimension} onChange={(e) => setDwDimension(e.target.value)}>
                  {dwDimensions.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </Select>
              </Field>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader
                title="Warehouse preview"
                subtitle="Version history in orion_dw"
                action={
                  <button
                    type="button"
                    onClick={refreshDwPreview}
                    className="rounded-lg p-2 text-[color:var(--color-text-faint)] transition-colors hover:bg-white/5 hover:text-violet-400"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                }
              />
              {dwPreview && (
                <DataTable
                  columns={dwPreview.columns}
                  rows={dwPreview.rows}
                  emptyMessage="No DW rows yet — run a load from ODS."
                />
              )}
            </Card>
          </div>

          <Card glow>
            <CardHeader
              title="Run warehouse load"
              subtitle="Compare ODS source and apply SCD Type 2 changes"
            />
            <Button variant="gold" loading={loadingDw} onClick={runDwLoad}>
              <RefreshCw className="h-4 w-4" />
              Run DW load
            </Button>
            {loadStats && (
              <p className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-300">
                Load complete — {loadStats}
              </p>
            )}
          </Card>
        </>
      )}
    </div>
  )
}
