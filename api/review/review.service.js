import { ObjectId } from 'mongodb'
import { dbService } from '../../services/db.service.js'
import { logger } from '../../services/logger.service.js'

export const reviewService = {
    addReview,
    query
}

async function query(filterBy = {}) {
    try {
        const criteria = _buildCriteria(filterBy)
        const collection = await dbService.getCollection('review')
        // var reviews = await collection.find().toArray()
        var reviews = await collection.aggregate([

            {
                $lookup: {
                    localField: 'byUserId',
                    from: 'user',
                    foreignField: '_id',
                    as: 'byUser',
                },
            },
            {
                $unwind: '$byUser',
            },
            {
                $lookup: {
                    localField: 'toyId',
                    from: 'toy',
                    foreignField: '_id',
                    as: 'aboutToy',
                },
            },
            {
                $unwind: '$aboutToy',
            },
            {
                $project: { // TODO: ?
                    'txt': true,
                    'byUser._id': true, 'byUser.fullname': true,
                    'aboutToy._id': true, 'aboutToy.name': true,
                }
            },
            {
                $match: criteria,
            },
        ]).toArray()

        return reviews
    } catch (err) {
        logger.error('cannot get reviews', err)
        throw err
    }
}

async function addReview(review) {
    try {
        const reviewToAdd = {
            byUserId: ObjectId.createFromHexString(review.byUserId),
            toyId: ObjectId.createFromHexString(review.toyId),
            txt: review.txt
        }
        const collection = await dbService.getCollection('review')
        await collection.insertOne(reviewToAdd)
        return reviewToAdd
    } catch (err) {
        logger.error('Could not add review')
        throw err
    }
}

function _buildCriteria(filterBy) {
    const criteria = {}
    if (filterBy.toyId) {
        criteria.toyId = ObjectId.createFromHexString(filterBy.toyId)
    }

    if (filterBy.txt) {
        const txtCriteria = { $regex: filterBy.txt, $options: 'i' }
        criteria.$or = [
            {
                txt: txtCriteria
            },
            {
                'aboutToy.name': txtCriteria
            }
        ]
    }
    console.log(criteria)
    return criteria
}
