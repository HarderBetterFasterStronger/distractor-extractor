import { Handler, HandlerContext, HandlerEvent, HandlerResponse } from "@netlify/functions"
import { scrape } from "../src/metascraper"
import middleware from "src/middleware"
import { JSONSchemaType } from "ajv"
import { getHTML, jsonResponse } from "src/shared"

const handle: Handler = async (event: HandlerEvent, context: HandlerContext): Promise<HandlerResponse> => {
  const {
    body: { url, html: inHtml }
  } = event as unknown as Payload

  const html = inHtml || await getHTML(url)
  const scraped = await scrape({ url, html })

  return jsonResponse({body: {scraped, html}})
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
