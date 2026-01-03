import { toyService } from './toy.service.js'
import { logger } from '../../services/logger.service.js'
import { socketService } from '../../services/socket.service.js'
import { asyncLocalStorage } from '../../services/als.service.js'

export async function getToys(req, res) {
    try {
        const filterBy = {
            txt: req.query.txt || '',
            inStock: JSON.parse(req.query.inStock || null),
            maxPrice: +req.query.maxPrice || 0,
            labels: req.query.labels || [],
            sort: req.query.sort || '',
            pageIdx: req.query.pageIdx || 0,

        }
        const toys = await toyService.query(filterBy)
        res.json(toys)
    } catch (err) {
        logger.error('Failed to get toys', err)
        res.status(500).send({ err: 'Failed to get toys' })
    }
}

export async function getToyById(req, res) {
    try {
        const toyId = req.params.id
        const toy = await toyService.getById(toyId)
        res.json(toy)
    } catch (err) {
        logger.error('Failed to get toy', err)
        res.status(500).send({ err: 'Failed to get toy' })
    }
}

export async function addToy(req, res) {
    const { loggedinUser } = asyncLocalStorage.getStore()

    try {
        const toy = req.body
        toy.owner = loggedinUser
        const addedToy = await toyService.add(toy)
        res.json(addedToy)
        if (loggedinUser.isAdmin) socketService.broadcast({ type: 'shop-update', data: { txt: 'added a toy', toyId: toy._id }, userId: loggedinUser._id })
    } catch (err) {
        logger.error('Failed to add toy', err)
        res.status(500).send({ err: 'Failed to add toy' })
    }
}

export async function updateChatTyping(req, res) {
    const { loggedinUser } = asyncLocalStorage.getStore()
    const toyId = req.params.id
    console.log(loggedinUser)
    try {
        socketService.broadcast({ type: 'chat-typing', data: null, room: toyId, userId: loggedinUser._id })
        res.sendStatus(200)
    } catch (err) {
        console.log('couldnot set typing mode')
        res.status(500).send('typing failed')

    }
}

export async function updateToy(req, res) {
    const { loggedinUser } = asyncLocalStorage.getStore()

    try {
        const toy = { ...req.body, _id: req.params.id }
        const updatedToy = await toyService.update(toy)
        res.json(updatedToy)
        if (loggedinUser.isAdmin) socketService.broadcast({ type: 'shop-update', data: { txt: 'updated a toy', toyId: toy._id }, userId: loggedinUser._id })
    } catch (err) {
        logger.error('Failed to update toy', err)
        res.status(500).send({ err: 'Failed to update toy' })
    }
}

export async function removeToy(req, res) {
    const { loggedinUser } = asyncLocalStorage.getStore()
    console.log(loggedinUser)

    try {
        const toyId = req.params.id
        const deletedCount = await toyService.remove(toyId)
        res.send(`${deletedCount} toys removed`)
        if (loggedinUser.isAdmin) socketService.broadcast({ type: 'shop-update', data: { txt: 'removed a toy', toyId }, userId: loggedinUser._id })
    } catch (err) {
        logger.error('Failed to remove toy', err)
        res.status(500).send({ err: 'Failed to remove toy' })
    }
}

export async function addToyMsg(req, res) {
    const { loggedinUser } = req
    try {
        const toyId = req.params.id
        const msg = {
            txt: req.body.txt,
            by: loggedinUser,
            createdAt: Date.now(),
        }
        const savedMsg = await toyService.addToyMsg(toyId, msg)
        res.json(savedMsg)
    } catch (err) {
        logger.error('Failed to update toy', err)
        res.status(500).send({ err: 'Failed to update toy' })
    }
}

export async function addToyChatMsg(req, res) {
    const { loggedinUser } = req
    console.log(req.body)
    console.log(req.params.id)
    try {
        const toyId = req.params.id
        const chatMsg = {
            txt: req.body.txt,
            from: req.body.from,
            createdAt: Date.now()
        }
        const savedChatMsg = await toyService.addToyChatMsg(toyId, chatMsg)
        res.json(savedChatMsg)
    } catch (err) {
        logger.error('Failed to update toy', err)
        res.status(500).send({ err: 'Failed to update toy' })
    }
}

export async function removeToyMsg(req, res) {
    console.log(req.params)
    try {
        const { toyId, msgId } = req.params

        await toyService.removeToyMsg(toyId, msgId)
        res.send(msgId)
    } catch (err) {
        logger.error('Failed to remove toy msg', err)
        res.status(500).send({ err: 'Failed to remove toy msg' })
    }
}



