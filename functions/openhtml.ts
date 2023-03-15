import { Handler, HandlerContext, HandlerEvent, HandlerResponse } from "@netlify/functions"
import middleware from "src/middleware"
import {JSONSchemaType} from 'ajv'
import { getHTML, jsonResponse } from "src/shared"

const handle: Handler = async (event: HandlerEvent, context: HandlerContext): Promise<HandlerResponse> => {
  const {
    body: { url }
  } = event as unknown as Payload

  const html = await getHTML(url)
  if (event.headers["content-type"] == "text/html") {
    return {
      statusCode: 200,
      body: html
    }
  }

 return jsonResponse({body: {html}})
}

interface Payload {
  body: {
    html?: string
    url: string
  }
}

const inputSchema: JSONSchemaType<Payload> = {
  type: "object",
  properties: {
    body: {
      type: "object",
      properties: {
        html: { type: "string", nullable: true },
        url: { type: "string" }
      },
      required: ["url"],
      additionalProperties: false
    }
  },
  required: ["body"],
}

const handler = middleware(handle, { inputSchema })
export { handler }
