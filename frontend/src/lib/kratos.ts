import { Configuration, FrontendApi } from '@ory/client'

export const kratosConfig = new Configuration({
  basePath: process.env.NEXT_PUBLIC_KRATOS_PUBLIC_URL || 'http://localhost:4433',
  baseOptions: {
    withCredentials: true,
  },
})

export const kratos = new FrontendApi(kratosConfig)

export const getKratosUrl = () => {
  return process.env.NEXT_PUBLIC_KRATOS_PUBLIC_URL || 'http://localhost:4433'
}

export const getAppUrl = () => {
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
}
