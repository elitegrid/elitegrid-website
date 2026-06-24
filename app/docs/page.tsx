import { redirect } from 'next/navigation'
import { frameworks } from '@/lib/docs'

export default function DocsPage() {
  const first = frameworks[0]?.framework ?? 'react'
  redirect(`/docs/${first}`)
}
