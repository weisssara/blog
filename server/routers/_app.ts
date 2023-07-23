import { router } from '../trpc'

import { commentRouter } from './comment'
import { postRouter } from './post'
import { userRouter } from './user'

export const appRouter = router({
  user: userRouter,
  post: postRouter,
  comment: commentRouter,
})

export type AppRouter = typeof appRouter
