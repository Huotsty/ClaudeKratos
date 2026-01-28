'use client'

import { FlowComponent } from '@/components/FlowComponent'
import { kratos } from '@/lib/kratos'
import axios from 'axios'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function RegistrationPage() {
  const [flow, setFlow] = useState<any>(null)
  const [error, setError] = useState<string>('')
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const flowId = searchParams.get('flow')

    if (flowId) {
      kratos
        .getRegistrationFlow({ id: flowId })
        .then(({ data }) => setFlow(data))
        .catch((err) => {
          setError('Failed to load registration flow')
          console.error(err)
        })
    } else {
      kratos
        .createBrowserRegistrationFlow()
        .then(({ data }) => {
          setFlow(data)
          window.history.replaceState({}, '', `?flow=${data.id}`)
        })
        .catch((err) => {
          setError('Failed to create registration flow')
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
          method: 'password',
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          withCredentials: true,
        }
      )

      if (response.data.session) {
        router.push('/settings')
      } else if (response.data.continue_with) {
        // Handle verification flow
        router.push('/verification')
      }
    } catch (err: any) {
      if (err.response?.status === 400) {
        setFlow(err.response.data)
      } else if (err.response?.status === 422) {
        window.location.href = err.response.data.redirect_browser_to
      } else {
        setError('An error occurred during registration')
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
        <h1 className="text-3xl font-bold mb-8">Create Account</h1>
        {flow && <FlowComponent flow={flow} onSubmit={handleSubmit} />}
        <div className="mt-4 text-center">
          <a href="/login" className="text-indigo-600 hover:text-indigo-500">
            Already have an account? Sign in
          </a>
        </div>
      </div>
    </div>
  )
}
