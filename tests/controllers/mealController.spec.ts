import { execSync } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { describe, it, beforeAll, afterAll, beforeEach, expect } from 'vitest'
import request from 'supertest'
import jwt from 'jsonwebtoken'
import { knex } from '../../src/database'
import { app } from '../../src/app'
import { env } from '../../src/env'

describe('Meal Controller', () => {
  let token: string
  let userId: string

  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(async () => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')

    const user = {
      id: randomUUID(),
      name: 'Jason Reeves',
      email: 'bap@cepe.gi',
      password: '951046',
    }

    await knex('users').insert(user)

    userId = user.id

    token = jwt.sign({ userId: user.id }, env.JWT_SECRET, {
      expiresIn: '1h',
    })
  })

  it('should be able to create a meal', async () => {
    const response = await request(app.server)
      .post('/api/meals')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Breakfast',
        description: 'Healthy breakfast',
        dateTime: new Date().toISOString(),
        isWithinDiet: true,
      })

    expect(response.status).toBe(201)
    expect(response.body.message).toBe('Meal created successfully!')
  })

  it('should be able to edit a meal', async () => {
    const meal = {
      id: randomUUID(),
      user_id: userId,
      name: 'Breakfast',
      description: 'Healthy breakfast',
      date_time: '2024-06-23T07:30:00.000Z',
      is_within_diet: true,
    }

    await knex('meals').insert(meal)

    const response = await request(app.server)
      .put(`/api/meals/${meal.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Updated Breakfast',
        description: 'Updated healthy breakfast',
        date_time: '2024-06-23T08:30:00.000Z',
        isWithinDiet: false,
      })

    expect(response.status).toBe(200)
    expect(response.body.message).toBe('Meal updated successfully!')
  })

  it('should be able to delete a meal', async () => {
    const meal = {
      id: randomUUID(),
      user_id: userId,
      name: 'Breakfast',
      description: 'Healthy breakfast',
      date_time: '2024-06-23T07:30:00.000Z',
      is_within_diet: true,
    }

    await knex('meals').insert(meal)

    const response = await request(app.server)
      .delete(`/api/meals/${meal.id}`)
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(200)
    expect(response.body.message).toBe('Meal deleted successfully!')
  })

  it('should be able to list all meals', async () => {
    const meal = {
      id: randomUUID(),
      user_id: userId,
      name: 'Breakfast',
      description: 'Healthy breakfast',
      date_time: '2024-06-23T07:30:00.000Z',
      is_within_diet: true,
    }

    await knex('meals').insert(meal)

    const response = await request(app.server)
      .get('/api/meals')
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(200)
    expect(response.body.meals).toEqual([
      expect.objectContaining({
        name: 'Breakfast',
        description: 'Healthy breakfast',
        date_time: '2024-06-23T07:30:00.000Z',
        is_within_diet: 1,
      }),
    ])
  })

  it('should be able to get a specific meal', async () => {
    const meal = {
      id: randomUUID(),
      user_id: userId,
      name: 'Breakfast',
      description: 'Healthy breakfast',
      date_time: '2024-06-23T07:30:00.000Z',
      is_within_diet: true,
    }

    await knex('meals').insert(meal)

    const response = await request(app.server)
      .get(`/api/meals/${meal.id}`)
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(200)
    expect(response.body.meal).toEqual(
      expect.objectContaining({
        name: 'Breakfast',
        description: 'Healthy breakfast',
        date_time: '2024-06-23T07:30:00.000Z',
        is_within_diet: 1,
      }),
    )
  })

  it('should be able to obtain meal metrics', async () => {
    const meal1 = {
      id: randomUUID(),
      user_id: userId,
      name: 'Breakfast',
      description: 'Healthy breakfast',
      date_time: '2024-06-23T07:30:00.000Z',
      is_within_diet: true,
    }

    const meal2 = {
      id: randomUUID(),
      user_id: userId,
      name: 'Lunch',
      description: 'Healthy lunch',
      date_time: '2024-06-23T12:30:00.000Z',
      is_within_diet: true,
    }

    const meal3 = {
      id: randomUUID(),
      user_id: userId,
      name: 'Dinner',
      description: 'dinner',
      date_time: '2024-06-23T20:30:00.000Z',
      is_within_diet: false,
    }

    await knex('meals').insert([meal1, meal2, meal3])

    const response = await request(app.server)
      .get('/api/meals')
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(200)
    expect(response.body.metrics).toEqual(
      expect.objectContaining({
        total_meals: 3,
        meals_within_diet: 2,
        meals_out_diet: 1,
        best_meal_sequence_within_diet: 2,
      }),
    )
  })
})
