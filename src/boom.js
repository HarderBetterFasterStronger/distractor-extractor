import { normalizeHttpResponse, jsonSafeParse } from "@middy/util"
const defaults = {
  logger: console.error,
  fallbackMessage: "fallback",
}

const boomMiddleware = (opts = {}) => {
  const options = { ...defaults, ...opts }
  return {
    onError: async (request) => {
      if (typeof options.logger === "function") {
        options.logger(request.error)
      }

      console.log("fdsaf", JSON.stringify(request?.error))
      const boomMessage = request?.error?.output?.payload?.message
      const boomStatus = request?.error?.output?.statusCode
      const statusCode = boomStatus || request?.error?.statusCode || 500
      const message = boomMessage || request?.error?.message || options.fallbackMessage
      const details = request?.error?.details
      const expose = statusCode < 500 || true
      request.error = {
        statusCode,
        message,
        expose,
        details,
      }

      // TODO come back and refactor...this was from middy httpErrorHandler
      if (options.fallbackMessage && (!statusCode || !expose)) {
        request.error = {
          statusCode: 500,
          message: options.fallbackMessage,
          expose: true,
          details,
        }
      }

      // TODO the use of jsonSafeParse is a bit strage to me (also from middy httpErrorHandler )
      if (request.error.expose) {
        normalizeHttpResponse(request)
        const { statusCode, message, headers, details } = request.error
        const body = JSON.stringify({ error: message, details })
        request.response = {
          ...request.response,
          statusCode,
          body,
          headers: {
            ...headers,
            ...request.response.headers,
            // TODO and add if header is content-type == apprlication/json?
            "Content-Type": typeof jsonSafeParse(body) === "string" ? "text/plain" : "application/json",
          },
        }
      }
    },
  }
}
export default boomMiddleware
