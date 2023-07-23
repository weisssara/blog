import { type inferAsyncReturnType } from '@trpc/server'
import { type CreateNextContextOptions } from '@trpc/server/adapters/next'
import { authOptions } from '@/lib/auth'
import { getServerSession } from 'next-auth/next'
import { prisma } from '@/lib/prisma'

/**
 * This is the actual context you'll use in your router
 * @link https://trpc.io/docs/context
 **/
export const createContext = async (opts: CreateNextContextOptions) => {
  const { req, res } = opts

  const session = await getServerSession({ req, res }, authOptions)

  const user = await prisma.user.findUnique({
    where: {
      id: session?.user?.id,
    },
    include: {
      membership: {
        include: {
          team: {
            include: {
              subscription: true,
            },
          },
        },
      },
    },
  })

  return {
    req,
    res,
    session,
    prisma,
  }
}

export type Context = inferAsyncReturnType<typeof createContext>
