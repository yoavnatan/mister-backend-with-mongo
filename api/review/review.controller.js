import { logger } from "../../services/logger.service.js"
import { reviewService } from "./review.service.js"


export async function getReviews(req, res) {

    try {
        const filterBy = {
            txt: req.query.txt || '',
        }
        console.log(filterBy)
        const reviews = await reviewService.query(filterBy)
        res.json(reviews)
    } catch (err) {
        logger.error('Failed to get reviews', err)
        res.status(500).send({ err: 'Failed to get reviews' })
    }
}

export async function addReview(req, res) {
    const { loggedinUser } = req

    try {
        const review = {
            txt: req.body.txt,
            byUserId: loggedinUser._id,
            toyId: req.params.toyId,
        }
        const savedReview = await reviewService.addReview(review)
        res.json(savedReview)
    } catch (err) {
        logger.error('Could not add review', err)
        res.status(500).send({ err: 'failed to add review' })
    }
}

