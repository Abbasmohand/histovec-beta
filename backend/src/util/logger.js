import { createLogger, format, transports } from 'winston'
import config from '../config'
import { inspect } from 'util'

const { combine, timestamp, label, printf } = format

const isProd = config.isProd
const isTest = config.isTest

const TECH_LABEL = 'tech'
const APP_LABEL = 'app'

const level = isProd ? 'info' : isTest ? 'warn' : 'debug'

const options = {
  console: {
    level,
    json: false,
    colorize: !isProd,
  },
}

const logJsonFormat = printf(({ label, level, message, timestamp }) => {
  return inspect({
    content: typeof message === 'string' ? { default: message } : message,
    meta: {
      level,
      label,
      timestamp,
    },
  },
  {
    colors: config.isDevelopment,
    compact: !config.isDevelopment,
  })
})

const logFormat = printf(({ level, message }) => `${level} ${message}`)

const simplestFormat = printf(({ message }) => message)

export const simpleLogger = createLogger({
  format: logFormat,
  transports: [new transports.Console(options.console)],
  exitOnError: false,
})

export const simplestLogger = createLogger({
  format: simplestFormat,
  transports: [new transports.Console(options.console)],
  exitOnError: false,
})

export const techLogger = createLogger({
  format: combine(
    label({ label: TECH_LABEL }),
    timestamp(),
    isTest ? logFormat : logJsonFormat
  ),
  transports: [new transports.Console(options.console)],
  exitOnError: false,
})

export const appLogger = createLogger({
  format: combine(
    label({ label: APP_LABEL }),
    timestamp(),
    isTest ? logFormat : logJsonFormat
  ),
  transports: [new transports.Console(options.console)],
  exitOnError: false,
})

export const loggerStream = {
  write (message, encoding) {
    simplestLogger.info(message.trim())
  },
}
