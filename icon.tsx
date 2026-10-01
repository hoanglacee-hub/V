import { ImageResponse } from 'next/og'

export const size = {
  width: 512,
  height: 512,
}

export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 280,
          background: 'linear-gradient(to bottom right, #4f46e5, #9333ea)', // indigo-600 to purple-600
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '128px',
        }}
      >
        🏠
      </div>
    ),
    { ...size }
  )
}
