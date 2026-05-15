'use client'

interface Avatar {
  id: string
  name: string
  image?: string
  color?: string
}

interface AvatarClusterProps {
  avatars: Avatar[]
  max?: number
  size?: 'sm' | 'md'
  className?: string
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export function AvatarCluster({ avatars, max = 4, size = 'sm', className = '' }: AvatarClusterProps) {
  const visible = avatars.slice(0, max)
  const overflow = avatars.length - max
  const dim = size === 'sm' ? 'w-6 h-6 text-[9px]' : 'w-8 h-8 text-[10px]'

  return (
    <div className={`flex items-center ${className}`}>
      {visible.map((avatar, i) => (
        <div
          key={avatar.id}
          title={avatar.name}
          className={`${dim} rounded-full ring-2 ring-card flex items-center justify-center font-black shrink-0 overflow-hidden ${i > 0 ? '-ml-2' : ''}`}
          style={{
            backgroundColor: avatar.color ?? 'var(--accent)',
            color: avatar.color ? '#FFFFFF' : 'var(--accent-foreground)',
          }}
        >
          {avatar.image ? (
            <img src={avatar.image} alt={avatar.name} className="w-full h-full object-cover" />
          ) : (
            getInitials(avatar.name)
          )}
        </div>
      ))}
      {overflow > 0 && (
        <div
          className={`${dim} rounded-full ring-2 ring-card -ml-2 flex items-center justify-center font-black bg-foreground/10 text-muted shrink-0`}
        >
          +{overflow}
        </div>
      )}
    </div>
  )
}
