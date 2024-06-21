import { execSync } from 'node:child_process'
import { describe, it, beforeAll, afterAll, beforeEach, expect } from 'vitest'
import request from 'supertest'
import { app } from '../../src/app'

describe('Auth Controller', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(async () => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
  })

  it('should be able register a user successfully', async () => {
    const response = await request(app.server).post('/register').send({
      name: 'Ola Hawkins',
      email: 'jezibzev@bumaz.cy',
      password: '408929',
    })

    expect(response.status).toBe(201)
  })

  it('should be able login a user successfully', async () => {
    await request(app.server).post('/register').send({
      name: 'Evan Norman',
      email: 'mubgo@duhol.ml',
      password: '923606',
    })

    const response = await request(app.server).post('/login').send({
      email: 'mubgo@duhol.ml',
      password: '923606',
    })

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('accessToken')
    expect(response.body).toHaveProperty('refreshToken')
  })

  it('should be able refresh a token successfully', async () => {
    await request(app.server).post('/register').send({
      name: 'Luke Little',
      email: 'wauc@utkut.sl',
      password: '699277',
    })

    const {
      body: { refreshToken },
    } = await request(app.server).post('/login').send({
      email: 'wauc@utkut.sl',
      password: '699277',
    })

    const response = await request(app.server).post('/token').send({
      refreshToken,
    })

    expect(response.status).toBe(201)
    expect(response.body).toHaveProperty('accessToken')
    expect(response.body).toHaveProperty('refreshToken')
  })
})
