import got from 'got'
export const jsonResponse = (
  body: object,
  statusCode = 200,
  headers = {
    "content-type": "application/json",
  }
) => ({
  statusCode: 200,
  body: JSON.stringify(body),
  headers: {
    "content-type": "application/json",
  },
})

export async function getHTML(url: string): Promise<string> {
  try {
    const { body } = await got(url)
    return body
  } catch (err: unknown) {
    throw new Error(`🛑 could not open URL for html - ` + err)
  }
}