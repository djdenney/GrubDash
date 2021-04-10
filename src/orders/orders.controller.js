const path = require("path");
const dishesController = require("../dishes/dishes.controller");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass
const orderDoesExist = (req, res, next) => {
    const { orderId } = req.params
    const foundOrder = orders.find((order) => order.id === orderId)
    if (foundOrder) {
        res.locals.order = foundOrder
        return next()
    }
    next({
        status: 404,
        message: `Order does not exist: ${orderId}`
    })
}

const bodyHasDeliverToProperty = (req, res, next) => {
    const { data: { deliverTo } = {} } = req.body
    deliverTo ? next() : next({ status: 400, message: 'Order must include a deliverTo'})
}

const bodyHasMobileNumberProperty = (req, res, next) => {
    const { data: { mobileNumber } = {} } = req.body
    mobileNumber ? next() : next({ status: 400, message: 'Order must include a mobileNumber'})
}

const bodyHasDishesProperty = (req, res, next) => {
    const { data: { dishes } = {} } = req.body
    dishes ? next() : next({ status: 400, message: 'Order must include a dish'})
}

const dishesPropertyIsAnArray = (req, res, next) => {
    const { data: { dishes } = {} } = req.body
    Array.isArray(dishes) ? next() : next({ status: 400, message: 'Order must include at least one dish'})
}

const dishesArrayIsNotEmpty = (req, res, next) => {
    const { data: { dishes } = {} } = req.body
    dishes.length > 0 ? next() : next({ status: 400, message: 'Order must include at least one dish'})
}

const dishesArrayHasDishQuantity = (req, res, next) => {
    const { data: { dishes } = {} } = req.body
    const index = dishes.findIndex((dish) => !dish.quantity)
    index != -1 ? next({ status: 400, message: `Dish ${index} must have a quantity that is an integer greater than 0`}) : next() 
}

const dishQuantityIsGreaterThanZero = (req, res, next) => {
    const { data: { dishes } = {} } = req.body
    const index = dishes.findIndex((dish) => dish.quantity <= 0)
    index != -1 ? next({ status: 400, message: `Dish ${index} must have a quantity that is an integer greater than 0`}) : next() 
}

const dishQuantityIsAnInteger = (req, res, next) => {
    const { data: { dishes } = {} } = req.body
    const index = dishes.findIndex((dish) => !Number.isInteger(dish.quantity))
    index != -1 ? next({ status: 400, message: `Dish ${index} must have a quantity that is an integer greater than 0`}) : next() 
}

const statusIsMissing = (req, res, next) => {
    const { data: { status } = {} } = req.body
    status ? next() : next({ status: 400, message: `Order must have a status of pending, preparing, out-for-delivery, delivered` })
}

const statusIsEmpty = (req, res, next) => {
    const { data: { status } = {} } = req.body
    status != '' ? next() : next({ status: 400, message: `Order must have a status of pending, preparing, out-for-delivery, delivered` })
}

const statusIsInvalid = (req, res, next) => {
    const { data: { status } = {} } = req.body
    status === 'pending' || 
    status === 'preparing' || 
    status === 'out-for-delivery' ? 
    next() : 
    next({ status: 400, message: `Order must have a status of pending, preparing, out-for-delivery, delivered` })
}

const dataIdDoesNotMatchOrderId = (req, res, next) => {
    const { data: { id } = {} } = req.body
    const order = res.locals.order
    if (!id || id === '' || id === null || id === undefined) {
        return next()
    }
    id === order.id ? next() : next({ status: 400, message: `Order id does not match route id. Order: ${id}, Route: ${order.id}` })
}

const create = (req, res, next) => {
    const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body
    const newOrderId = nextId()
    const newOrder = {
        id: newOrderId,
        deliverTo,
        mobileNumber,
        status,
        dishes
    }
    orders.push(newOrder)
    res.status(201).json({ data: newOrder })
}

const read = (req, res, next) => {
    const order = res.locals.order
    res.json({ data: order })

}

const update = (req, res, next) => {
    const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body
    const order = res.locals.order
    const updatedOrder = {
        id: order.id,
        deliverTo,
        mobileNumber,
        status,
        dishes
    }
    res.json({ data: updatedOrder })
}

const remove = (req, res, next) => {
    const order = res.locals.order
    const { orderId } = req.params
    const index = orders.findIndex((order) => order.id === orderId)
    if (index > -1 && order.status === 'pending') {
        orders.splice(index, 1)
    } else {
        return next({
            status: 400,
            message: 'An order cannot be deleted unless it is pending'
        })
    }
    res.sendStatus(204)
}

const list = (req, res, next) => {
    res.json({ data: orders })
}

module.exports = {
    create: [
        bodyHasDeliverToProperty, 
        bodyHasMobileNumberProperty,
        bodyHasDishesProperty,
        dishesPropertyIsAnArray,
        dishesArrayIsNotEmpty,
        dishesArrayHasDishQuantity,
        dishQuantityIsGreaterThanZero,
        dishQuantityIsAnInteger,
        create],
    read: [orderDoesExist, read],
    update: [
        orderDoesExist, 
        bodyHasDeliverToProperty, 
        bodyHasMobileNumberProperty,
        bodyHasDishesProperty,
        dishesPropertyIsAnArray,
        dishesArrayIsNotEmpty,
        dishesArrayHasDishQuantity,
        dishQuantityIsGreaterThanZero,
        dishQuantityIsAnInteger,
        statusIsMissing,
        statusIsEmpty,
        statusIsInvalid,
        dataIdDoesNotMatchOrderId,
        update],
    delete: [orderDoesExist, remove],
    list
}