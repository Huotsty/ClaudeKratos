'use client'

import { FlowComponent } from '@/components/FlowComponent'
import { kratos } from '@/lib/kratos'
import axios from 'axios'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function VerificationPage() {
  const [flow, setFlow] = useState<any>(null)
  const [error, setError] = useState<string>('')
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const flowId = searchParams.get('flow')

    if (flowId) {
      kratos
        .getVerificationFlow({ id: flowId })
        .then(({ data }) => setFlow(data))
        .catch((err) => {
          setError('Failed to load verification flow')
          console.error(err)
        })
    } else {
      kratos
        .createBrowserVerificationFlow()
        .then(({ data }) => {
          setFlow(data)
          window.history.replaceState({}, '', `?flow=${data.id}`)
        })
        .catch((err) => {
          setError('Failed to create verification flow')
          console.error(err)
        })
    }
  }, [searchParams])

  const handleSubmit = async (values: any) => {
    if (!flow) return

    try {
      const response = await axios.post(
        flow.ui.action,
        {
          ...values,
          method: 'code',
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          withCredentials: true,
        }
      )

      if (response.data.state === 'passed_challenge') {
        router.push('/settings')
      } else {
        setFlow(response.data)
      }
    } catch (err: any) {
      if (err.response?.status === 400) {
        setFlow(err.response.data)
      } else if (err.response?.status === 422) {
        window.location.href = err.response.data.redirect_browser_to
      } else {
        setError('An error occurred during verification')
        console.error(err)
      }
    }
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">{error}</div>
      </div>
    )
  }

  return (
    <div>
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold mb-8">Verify Email</h1>
        {flow && <FlowComponent flow={flow} onSubmit={handleSubmit} />}
      </div>
    </div>
  )
}
