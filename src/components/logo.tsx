import React from 'react'

export default function Logo() {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '6px 10px',
        borderRadius: '12px',
        background: '#ffffff',
        border: '1px solid var(--border-light)',
      }}
    >
      <img
        src="https://i.imgur.com/IxtPiRt.png"
        alt="Logo STOTOMAS"
        width="172"
        height="56"
        style={{ objectFit: 'contain' }}
      />
    </div>
  )
}
