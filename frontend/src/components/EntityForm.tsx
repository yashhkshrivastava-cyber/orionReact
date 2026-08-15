import type { FormField } from '../types'
import { useEffect, useState } from 'react'
import { api } from '../api/client'
import { Field, Input, Select, Checkbox } from './ui/Field'

interface Props {
  entityName: string
  fields: Record<string, FormField>
  values: Record<string, unknown>
  onChange: (key: string, value: unknown) => void
}

export function EntityForm({ entityName, fields, values, onChange }: Props) {
  const [optionsCache, setOptionsCache] = useState<Record<string, { id: string; label: string }[]>>({})
  const [states, setStates] = useState<string[]>([])
  const [cities, setCities] = useState<string[]>([])

  useEffect(() => {
    const needsStates = Object.values(fields).some((f) => f.type === 'state' || f.type === 'dependent_select')
    if (needsStates) api.states().then((r) => setStates(r.states))
  }, [fields])

  useEffect(() => {
    const stateField = Object.entries(fields).find(([, f]) => f.type === 'dependent_select')
    if (!stateField) return
    const [, config] = stateField
    const parent = config.depends_on
    if (!parent) return
    const stateVal = values[parent] as string
    if (stateVal) api.cities(stateVal).then((r) => setCities(r.cities))
    else setCities([])
  }, [fields, values])

  useEffect(() => {
    Object.entries(fields).forEach(([name, config]) => {
      if (config.source_table && !optionsCache[name]) {
        api.fieldOptions(entityName, name).then((opts) => {
          setOptionsCache((c) => ({ ...c, [name]: opts }))
        })
      }
    })
  }, [entityName, fields])

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {Object.entries(fields).map(([name, config]) => {
        const val = values[name]

        if (config.type === 'boolean') {
          return (
            <div key={name} className="sm:col-span-2">
              <Checkbox
                label={config.label}
                checked={Boolean(val)}
                onChange={(v) => onChange(name, v)}
              />
            </div>
          )
        }

        if (config.type === 'select' || (config.source_table && config.type !== 'dependent_select')) {
          const opts = config.options
            ? config.options.map((o) => ({ id: o, label: o }))
            : optionsCache[name] || []
          return (
            <Field key={name} label={config.label}>
              <Select
                value={(val as string) ?? ''}
                onChange={(e) => onChange(name, e.target.value || null)}
              >
                {config.optional && <option value="">— Select —</option>}
                {opts.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </Select>
            </Field>
          )
        }

        if (config.type === 'state') {
          return (
            <Field key={name} label={config.label}>
              <Select
                value={(val as string) ?? ''}
                onChange={(e) => onChange(name, e.target.value || null)}
              >
                <option value="">— Select state —</option>
                {states.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
            </Field>
          )
        }

        if (config.type === 'dependent_select') {
          return (
            <Field key={name} label={config.label}>
              <Select
                value={(val as string) ?? ''}
                onChange={(e) => onChange(name, e.target.value || null)}
                disabled={!values[config.depends_on || '']}
              >
                <option value="">— Select city —</option>
                {cities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </Field>
          )
        }

        const inputType =
          config.type === 'date' ? 'date' : config.type === 'number' || config.type === 'integer' ? 'number' : 'text'

        return (
          <Field key={name} label={config.label}>
            <Input
              type={inputType}
              value={
                val == null
                  ? ''
                  : config.type === 'date'
                    ? String(val).slice(0, 10)
                    : String(val)
              }
              onChange={(e) =>
                onChange(
                  name,
                  e.target.value === ''
                    ? null
                    : config.type === 'integer'
                      ? Number(e.target.value)
                      : config.type === 'number'
                        ? Number(e.target.value)
                        : e.target.value,
                )
              }
            />
          </Field>
        )
      })}
    </div>
  )
}
