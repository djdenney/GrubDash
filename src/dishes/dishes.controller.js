const path = require("path")

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"))

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId")

// TODO: Implement the /dishes handlers needed to make the tests pass
const doesDishExist = (req, res, next) => {
    const { dishId } = req.params
    const foundDish = dishes.find((dish) => {
        return dish.id === dishId
        }
    )
    if (foundDish) {
        res.locals.dish = foundDish
        return next()
    }
    next({ status: 404, message: `Dish does not exist: ${dishId}` })
}

const validate = (req, res, next) => {
    const { data: { name, description, price, image_url } = {} } = req.body
    if (name && description && price && price > 0 && typeof price === 'number' && image_url) {
        return next()
    } else {
        const messageType = 
            !name ? 'name' : 
                !description ? 'description' : 
                    !price || price <= 0 || typeof price !== 'number' ? 'price' : 
                        'image_url'
        next({ status: 400, message: `Dish must include ${messageType}` })
    }
}

const create = (req, res, next) => {
    const { data: { name, description, price, image_url } = {} } = req.body
    const newId = nextId()
    const newDish = {
        id: newId,
        name,
        description,
        price,
        image_url
    }
    dishes.push(newDish)
    res.status(201).json({ data: newDish })
}

const read = (req, res, next) => {
    const dish = res.locals.dish
    res.json({ data: dish })
}

const update = (req, res, next) => {
    let dish = res.locals.dish
    const originalDishId = dish.id
    const { data: { id, name, description, price, image_url } = {} } = req.body
    if (originalDishId === id || !id) {
        const updatedDish = {
            id: dish.id,
            name,
            description,
            price,
            image_url
        }
        dish = updatedDish
        res.json({ data: dish })
    }
    next({ status: 400, message: `Dish id does not match route id. Dish: ${id}, Route: ${originalDishId}` })
}

const list = (req, res, next) => {
    res.json({ data: dishes})
}

module.exports = {
    create: [validate, create],
    read: [doesDishExist, read],
    update: [doesDishExist, validate, update],
    list
}