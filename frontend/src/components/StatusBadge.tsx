import Badge from '../ui/Badge'
import { STATUS_LABEL, type JobStatus } from '../types'

const COLOR: Record<JobStatus, string> = {
  queued: '#6b7191',
  expanding: '#8a7bff',
  generating: '#6d5efc',
  postprocessing: '#15c2e8',
  tagging: '#b15efc',
  done: '#15bd8e',
  failed: '#ff5470',
}

export default function StatusBadge({ status }: { status: JobStatus }) {
  return <Badge color={COLOR[status]}>{STATUS_LABEL[status]}</Badge>
}
