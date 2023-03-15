import { Handler, HandlerContext, HandlerEvent, HandlerResponse } from "@netlify/functions"
import { scrape } from "../src/metascraper"
import middleware from "src/middleware"
import { getHTML, jsonResponse } from "src/shared"
import { getMinified, getReadability, getSanitized, replaceImages } from "src/readable"

const handle: Handler = async (event: HandlerEvent, context: HandlerContext): Promise<HandlerResponse> => {
  const {
    url,
    html: inHtml,
    disableSanitize,
    disableMinify,
    disableImageReplace
  } = event.queryStringParameters as unknown as Body

  const html = inHtml || (await getHTML(url))
  const scraped = await scrape({ url, html })
  const { article, doc } = await getReadability({ url, html })
  if (!article?.content) {
    throw new Error("could not load content")
  }
  const htmlSanitized = disableSanitize ? doc.serialize() : await getSanitized({ html: article?.content })
  const htmlMinified = disableMinify ? htmlSanitized : await getMinified({ html: htmlSanitized })
  const htmlReplace = disableImageReplace ? htmlMinified : await replaceImages({ html: htmlMinified })

  if (event.headers["content-type"] !== "application/json") {
    return {
      statusCode: 200,
      body: htmlReplace,
      headers: {
        "content-type": "text/html; charset=UTF-8"
      }
    }
  }
  return jsonResponse({
    body: { disableSanitize, disableMinify, htmlSanitized: htmlSanitized, htmlMinified: htmlMinified, scraped, html }
  })
}

interface Body {
  html?: string
  url: string
  disableSanitize: boolean
  disableMinify: boolean
  disableImageReplace: boolean
}

const handler = middleware(handle)
export { handler }
