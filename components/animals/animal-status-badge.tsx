import { cn } from '@/lib/utils'

interface AnimalStatusBadgeProps {
  status: 'online' | 'offline' | 'alert'
  showLabel?: boolean
  className?: string
}

export function AnimalStatusBadge({ status, showLabel = false, className }: AnimalStatusBadgeProps) {
  const statusConfig = {
    online: {
      color: 'bg-green-500',
      label: 'Онлайн',
      ping: true
    },
    offline: {
      color: 'bg-zinc-500',
      label: 'Оффлайн',
      ping: false
    },
    alert: {
      color: 'bg-red-500',
      label: 'Тревога',
      ping: true
    }
  }

  const config = statusConfig[status]

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className="relative flex h-2.5 w-2.5">
        {config.ping && (
          <span className={cn(
            'absolute inline-flex h-full w-full animate-ping rounded-full opacity-75',
            config.color
          )} />
        )}
        <span className={cn(
          'relative inline-flex h-2.5 w-2.5 rounded-full',
          config.color
        )} />
      </span>
      {showLabel && (
        <span className="text-xs text-muted-foreground">{config.label}</span>
      )}
    </div>
  )
}
