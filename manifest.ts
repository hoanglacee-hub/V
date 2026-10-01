import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Việc Nhà Trọ',
    short_name: 'Việc Nhà',
    description: 'Chấm công việc nhà cho 4 bạn ở ghép',
    start_url: '/cham-cong',
    display: 'standalone',
    background_color: '#020617', // slate-950
    theme_color: '#4f46e5', // indigo-600
    icons: [
      {
        src: '/icon',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
