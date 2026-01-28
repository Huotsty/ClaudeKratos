'use client'

import { FlowComponent } from '@/components/FlowComponent'
import { kratos } from '@/lib/kratos'
import axios from 'axios'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function SettingsPage() {
  const [flow, setFlow] = useState<any>(null)
  const [session, setSession] = useState<any>(null)
  const [error, setError] = useState<string>('')
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Check if user is logged in
    kratos
      .toSession()
      .then(({ data }) => {
        setSession(data)
      })
      .catch(() => {
        router.push('/login')
      })

    const flowId = searchParams.get('flow')

    if (flowId) {
      kratos
        .getSettingsFlow({ id: flowId })
        .then(({ data }) => setFlow(data))
        .catch((err) => {
          setError('Failed to load settings flow')
          console.error(err)
        })
    } else {
      kratos
        .createBrowserSettingsFlow()
        .then(({ data }) => {
          setFlow(data)
          window.history.replaceState({}, '', `?flow=${data.id}`)
        })
        .catch((err) => {
          setError('Failed to create settings flow')
          console.error(err)
        })
    }
  }, [searchParams, router])

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

      setFlow(response.data)
    } catch (err: any) {
      if (err.response?.status === 400) {
        setFlow(err.response.data)
      } else if (err.response?.status === 422) {
        window.location.href = err.response.data.redirect_browser_to
      } else {
        setError('An error occurred while updating settings')
        console.error(err)
      }
    }
  }

  const handleLogout = async () => {
    try {
      const { data } = await kratos.createBrowserLogoutFlow()
      await axios.get(data.logout_url, { withCredentials: true })
      router.push('/login')
    } catch (err) {
      console.error('Logout failed', err)
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
        <div className="w-full max-w-md">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Account Settings</h1>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm text-red-600 hover:text-red-800"
            >
              Logout
            </button>
          </div>

          {session && (
            <div className="mb-8 p-4 bg-gray-100 rounded-md">
              <h2 className="text-lg font-semibold mb-2">Current User</h2>
              <p className="text-sm">
                <strong>Email:</strong> {session.identity?.traits?.email}
              </p>
              <p className="text-sm">
                <strong>ID:</strong> {session.identity?.id}
              </p>
            </div>
          )}

          {flow && <FlowComponent flow={flow} onSubmit={handleSubmit} />}
        </div>
      </div>
    </div>
  )
}
