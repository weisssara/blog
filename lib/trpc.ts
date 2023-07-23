import { AppRouter } from '@/server/routers/_app'
import { httpBatchLink, loggerLink } from '@trpc/client'
import { createTRPCNext } from '@trpc/next'
import {
  TRPCError,
  type inferRouterInputs,
  type inferRouterOutputs,
} from '@trpc/server'
import superjson from 'superjson'

const getBaseUrl = () => {
  if (typeof window !== 'undefined') return ''
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return `http://localhost:${process.env.PORT ?? 3000}`
}

export const trpc = createTRPCNext<AppRouter>({
  config: () => {
    return {
      url: `${getBaseUrl()}/api/trpc`,
      transformer: superjson,
      links: [
        loggerLink({
          enabled: (opts) =>
            process.env.NODE_ENV === 'development' ||
            (opts.direction === 'down' && opts.result instanceof Error),
        }),
        httpBatchLink({
          url: `${getBaseUrl()}/api/trpc`,
        }),
      ],
      queryClientConfig: {
        defaultOptions: {
          queries: {
            retry: (failureCount, error: any) => {
              const trcpErrorCode = error?.data?.code as TRPCError['code']
              if (trcpErrorCode === 'NOT_FOUND') {
                return false
              }
              if (failureCount < 3) {
                return true
              }
              return false
            },
          },
        },
      },
    }
  },
})

/**
 * Inference helper for inputs
 * @example type HelloInput = RouterInputs['example']['hello']
 **/
export type RouterInputs = inferRouterInputs<AppRouter>

/**
 * Inference helper for outputs
 * @example type HelloOutput = RouterOutputs['example']['hello']
 **/
export type RouterOutputs = inferRouterOutputs<AppRouter>
