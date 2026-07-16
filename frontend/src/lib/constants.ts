export const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  active: 'bg-green-100 text-green-700',
  completed: 'bg-blue-100 text-blue-700',
  cancelled: 'bg-red-100 text-red-700',
}

export const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  draft: 'secondary',
  active: 'default',
  completed: 'outline',
  cancelled: 'destructive',
}

export const ROLE_VARIANT: Record<string, 'default' | 'secondary' | 'destructive'> = {
  admin: 'default',
  talent: 'secondary',
  superadmin: 'destructive',
}

export const STEP_LABELS: Record<string, string> = {
  absen: 'Absen',
  draft_storyline: 'Draft Storyline',
  input_link: 'Input Link',
  insight: 'Insight',
}
