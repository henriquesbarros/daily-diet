import { randomUUID } from 'node:crypto'
import { FastifyRequest, FastifyReply } from 'fastify'
import { knex } from '../database'
import {
  addMealBodySchema,
  checkUserIdSchema,
  editMealBodySchema,
  mealIdParamsSchema,
} from '../utils/schemas'
import { longestWithinDietSequence } from '../utils/longestWithinDietSequence'
import { Meal } from '../@types/meal'

export async function addMeal(request: FastifyRequest, reply: FastifyReply) {
  const { name, description, dateTime, isWithinDiet } = addMealBodySchema.parse(
    request.body,
  )

  const { userId } = checkUserIdSchema.parse(request.user)

  try {
    await knex('meals').insert({
      id: randomUUID(),
      user_id: userId,
      name,
      description,
      date_time: dateTime,
      is_within_diet: isWithinDiet,
    })

    reply.status(201).send({ message: 'Meal created successfully!' })
  } catch (error) {
    reply.status(500).send({ error: 'Error adding meal!' })
  }
}

export async function editMeal(request: FastifyRequest, reply: FastifyReply) {
  const { mealId } = mealIdParamsSchema.parse(request.params)

  const { name, description, dateTime, isWithinDiet } =
    editMealBodySchema.parse(request.body)

  const { userId } = checkUserIdSchema.parse(request.user)

  try {
    const meal = await knex('meals')
      .where({ id: mealId, user_id: userId })
      .first()

    if (!meal) {
      return reply.status(404).send({
        error: 'Meal not found or you do not have permission to edit it.',
      })
    }

    await knex('meals').where({ id: mealId }).update({
      name,
      description,
      date_time: dateTime,
      is_within_diet: isWithinDiet,
    })

    reply.send({ message: 'Meal updated successfully!' })
  } catch (error) {
    reply.status(500).send({ error: 'Error editing meal' })
  }
}

export async function deleteMeal(request: FastifyRequest, reply: FastifyReply) {
  const { mealId } = mealIdParamsSchema.parse(request.params)

  const { userId } = checkUserIdSchema.parse(request.user)

  try {
    const meal = await knex('meals').where({ id: mealId, user_id: userId })

    if (!meal) {
      return reply.status(404).send({
        error: 'Meal not found or you do not have permission to delete it.',
      })
    }

    await knex('meals').where({ id: mealId }).delete()

    reply.send({ message: 'Meal deleted successfully!' })
  } catch (error) {
    reply.status(500).send({ error: 'Error deleting meal!' })
  }
}

export async function getMeals(request: FastifyRequest, reply: FastifyReply) {
  const { userId } = checkUserIdSchema.parse(request.user)

  try {
    const meals: Meal[] = await knex('meals').where({ user_id: userId })

    const mealsWithinDiet = meals.filter((meal) => meal.is_within_diet).length

    const mealsOutDiet = meals.filter((meal) => !meal.is_within_diet).length

    const bestMealSequenceWithinTheDiet = longestWithinDietSequence(meals)

    reply.status(200).send({
      meals,
      metrics: {
        total_meals: meals.length,
        meals_within_diet: mealsWithinDiet,
        meals_out_diet: mealsOutDiet,
        best_meal_sequence_within_diet: bestMealSequenceWithinTheDiet,
      },
    })
  } catch (error) {
    reply.status(500).send({ error: 'Error getting meals!' })
  }
}

export async function getMeal(request: FastifyRequest, reply: FastifyReply) {
  const { userId } = checkUserIdSchema.parse(request.user)
  const { mealId } = mealIdParamsSchema.parse(request.params)

  try {
    const meal = await knex('meals')
      .where({ id: mealId, user_id: userId })
      .first()

    if (!meal) {
      return reply.status(404).send({
        error: 'Meal not found or you do not have permission to delete it.',
      })
    }

    reply.status(200).send({ meal })
  } catch (error) {
    reply.status(500).send({ error: 'Error getting meal!' })
  }
}
