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
        padding: compact ? '4px 8px' : '6px 10px',
        borderRadius: '12px',
        background: '#ffffff',
        border: '1px solid var(--border-light)',
      }}
    >
      <Image
        src="/brand/logo.png"
        alt="Logo STOTOMAS"
        width={compact ? 132 : 172}
        height={compact ? 44 : 56}
        priority
        style={{ width: 'auto', height: 'auto', objectFit: 'contain' }}
      />
    </div>
  )
}
