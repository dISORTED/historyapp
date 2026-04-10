import Image from 'next/image'

interface LogoProps {
  compact?: boolean
}

export default function Logo({ compact = false }: LogoProps) {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: compact ? '100%' : '220px',
        maxWidth: '100%',
        padding: compact ? '2px' : '6px 10px',
        borderRadius: '12px',
        background: compact ? 'transparent' : '#ffffff',
        border: compact ? 'none' : '1px solid var(--border-light)',
      }}
    >
      <Image
        src="/brand/logo.png"
        alt="Logo STOTOMAS"
        width={compact ? 150 : 196}
        height={compact ? 50 : 64}
        priority
        style={{ width: '100%', height: 'auto', objectFit: 'contain', display: 'block' }}
      />
    </div>
  )
}
