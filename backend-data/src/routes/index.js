import express from 'express'
import config from '../config'
import { getReport } from './report'

const getRouter = () => {
  const router = express.Router()
  const getReport = generateGetReport(utacClient)

  router.get('/version', (req, res) => res.send({ version: config.version }))
  router.get('/health', (req, res) => res.send({ status: 'ok' }))
  router.post('/report', getReport)

  return router
}

export default getRouter
