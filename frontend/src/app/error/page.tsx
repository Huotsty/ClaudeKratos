'use client'

import { useSearchParams } from 'next/navigation'

export default function ErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8">
        <div>
          <h1 className="text-3xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-lg mb-2">{error || 'An error occurred'}</p>
          {errorDescription && (
            <p className="text-sm text-gray-600">{errorDescription}</p>
          )}
        </div>
        <div className="mt-4">
          <a
            href="/"
            className="text-indigo-600 hover:text-indigo-500"
          >
            Go back home
          </a>
        </div>
      </div>
    </div>
  )
}
