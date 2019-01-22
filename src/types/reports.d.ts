type Activity = 'run' | 'pool' | 'crunches' | 'bike' | string
type Unit = 'session' | 'm' | 'km' | string
interface Goal {
  activity: Activity
  startDate: string
  dueDate: string
  target: number
  unit?: Unit
  archived: boolean
  meet?: boolean
}

interface ProgressItem {
  date: string
  increment: number
  total: number
}

interface GoalReport extends Goal {
  progress: ProgressItem[]
}
