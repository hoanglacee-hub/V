import { ImageResponse } from 'next/og'

export const size = {
  width: 512,
  height: 512,
}

export const contentType = 'image/png'

// Apple requires opaque background for icons (no transparency)
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 280,
          background: 'linear-gradient(to bottom right, #4f46e5, #9333ea)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        🏠
      </div>
    ),
    { ...size }
  )
}
