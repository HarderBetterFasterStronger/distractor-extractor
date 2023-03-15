import metascraper, { Metadata } from "metascraper"
import metascraperAuthor from "metascraper-author"
import metascraperDate from "metascraper-date"
import metascraperDescription from "metascraper-description"
import metascraperImage from "metascraper-image"
import metascraperLogo from "metascraper-logo"
import metascraperClearbit from "metascraper-clearbit"
import metascraperPublisher from "metascraper-publisher"
import metascraperTitle from "metascraper-title"
import metascraperUrl from "metascraper-url"

/**
 * `metascraper` is a collection of tiny packages,
 * so you can just use what you actually need.
 */
const metascrape = metascraper([
  metascraperAuthor(),
  metascraperDate(),
  metascraperDescription(),
  metascraperImage(),
  metascraperLogo(),
  metascraperClearbit(),
  metascraperPublisher(),
  metascraperTitle(),
  metascraperUrl()
])

interface EnhancedMetadata extends Metadata {
  logo?: string
}

/**
 * The main logic
 */
export async function scrape({ html, url }: { html: string; url: string }): Promise<EnhancedMetadata> {
  return await metascrape({ html, url })
}
