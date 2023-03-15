import middy from "middy"
import boom from "boom"
import {
  jsonBodyParser,
  validator,
  httpErrorHandler,
  httpHeaderNormalizer,
  cors,
  httpEventNormalizer,
  urlEncodeBodyParser,
} from "middy/middlewares"
import boomMiddleware from "./boom"

export const middleware = (
  handler,
  {
    inputSchema = {},
    json = true,
    normalizeHeaders = true,
    normalizeEvent = true,
    corsOptions = {},
    errorHandler = true,
  } = {}
) => {
  const m = middy(handler)

  m.use(urlEncodeBodyParser())

  m.use(boomMiddleware())
  if (normalizeHeaders) {
    // Normalizes HTTP header names to their canonical format.
    m.use(httpHeaderNormalizer())
  }

  if (normalizeEvent) {
    // Normalizes HTTP events by adding an empty object for queryStringParameters and pathParameters if they are missing.
    m.use(httpEventNormalizer())
  }

  // Sets CORS headers on response
  m.use(cors(corsOptions))

  if (json) {
    // automatically parses HTTP requests with JSON body and converts the body into an object. Also handles gracefully broken JSON if used in combination of httpErrorHandler.
    m.use(jsonBodyParser())
  }
  if (inputSchema && Object.keys(inputSchema).length) {
    if (!json) {
      throw new Error("can not validate if not JSON")
    }
    m.use(validator({ inputSchema }))
  }

  // if (errorHandler) {
  //   m.use(httpErrorHandler())
  // }

  return m
}

export default middleware
