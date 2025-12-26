import express from 'express'
import { requireAuth, requireAdmin } from '../../middlewares/requireAuth.middleware.js'
import { addReview, getReviews } from './review.controller.js'

export const reviewRoutes = express.Router()


reviewRoutes.get('/', getReviews)
reviewRoutes.post('/:toyId', requireAuth, addReview)