import { Handler, HandlerContext, HandlerEvent, HandlerResponse } from "@netlify/functions"
import { scrape } from "../src/metascraper"
import middleware from "src/middleware"
import { JSONSchemaType } from "ajv"
import { getHTML, jsonResponse } from "src/shared"
import { getMinified, getReadability, getSanitized, replaceImages } from "src/readable"

const handle: Handler = async (event: HandlerEvent, context: HandlerContext): Promise<HandlerResponse> => {
  const {
    body: { url, html: inHtml, disableSanitize, disableMinify, disableImageReplace }
  } = event as unknown as Payload

  const html = inHtml || (await getHTML(url))
  const scraped = await scrape({ url, html })
  const { article, doc } = await getReadability({ url, html })
  if (!article?.content) {
    throw new Error("could not load content")
  }

  const htmlSanitized = disableSanitize ? doc.serialize() : await getSanitized({ html: article?.content })
  const htmlMinified = disableMinify ? htmlSanitized : await getMinified({ html: htmlSanitized })
  const htmlReplace = disableImageReplace ? htmlMinified : await replaceImages({ html: htmlMinified })

  return jsonResponse({
    // body: { disableSanitize, disableMinify, htmlSanitized: htmlSanitized, htmlMinified, scraped, html }
    body: { htmlReplace }
  })
}

interface Payload {
  body: {
    html?: string
    url: string
    disableSanitize: boolean
    disableMinify: boolean
    disableImageReplace: boolean
  }
}
const inputSchema: JSONSchemaType<Payload> = {
  type: "object",
  properties: {
    body: {
      type: "object",
      properties: {
        html: { type: "string", nullable: true },
        url: { type: "string" },
        disableSanitize: { type: "boolean", default: false },
        disableMinify: { type: "boolean", default: false },
        disableImageReplace: { type: "boolean", default: false }
      },
      required: ["url"],
      additionalProperties: false
    }
  },
  required: ["body"]
}

const handler = middleware(handle, { inputSchema })
export { handler }
