import { JSDOM } from "jsdom"
import { Readability } from "@mozilla/readability"
import DOMPurify from "isomorphic-dompurify"
import { minify } from "html-minifier-terser"
import path from "path"
import axios from "axios"
// import fs from "fs"

// TODO come back for this
// @ts-expect-error async-memoize-one
import memoizeOne from "async-memoize-one"

// import imageDownload from 'image-download';
// import axios from 'axios';

type article = null | {
  /** article title */
  title: string
  /** author metadata */
  byline: string
  /** content direction */
  dir: string
  /** HTML of processed article content */
  content: string
  /** text content of the article (all HTML removed) */
  textContent: string
  /** length of an article, in characters */
  length: number
  /** article description, or short excerpt from the content */
  excerpt: string
  siteName: string
}

export const getReadability = async ({
  html,
  url
}: {
  html: string
  url: string
}): Promise<{ article: article; doc: any }> => {
  const doc = new JSDOM(html, {
    url
  })

  const reader = new Readability(doc.window.document)
  const article = reader.parse()
  if (!article) {
    throw new Error("getReadability - could not parse article")
  }
  return { article, doc }
}

export const getSanitized = ({ html }: { html: string }) => {
  const window = new JSDOM("<!DOCTYPE html>").window
  // @ts-expect-error stackoverflow
  const domPurify = DOMPurify(window)
  const sanitized = domPurify.sanitize(html)
  return sanitized
}

export const getMinified = ({ html }: { html: string }) => {
  return minify(html, { collapseWhitespace: true, removeTagWhitespace: true })
}

export const replaceImages = async ({ html }: { html: string }) => {
  try {
    const dom = new JSDOM(html)

    const images = dom.window.document.querySelectorAll("img")
    const imagesToDownload = [...new Set(Array.from(images, ({ src }) => src))]

    // await Promise.all(
    //   imagesToDownload.map(async (img: any, i: number) => {
    //     // images[i] = await getBase64Image(img.src)
    //     const base64Src = await fetchImg(img)
    //     images[i].setAttribute("src", `data:image/${path.extname(images[i].src).substring(1)};base64,${base64Src}`)
    //   })
    // )

    const cache: { [key: string]: string | undefined } = {}
    for await (const img of imagesToDownload) {
      if (cache[img]) {
        continue
      }
      cache[img] = await getBase64Image(img)
      //break; // Closes iterator, triggers return
    }

    for (let i = 0; i < images.length; i++) {
      const src = images[i]?.src
      const base64Src = cache[src]
      if (base64Src) {
        images[i].setAttribute("src", `data:image/${path.extname(src).substring(1)};base64,${base64Src}`)
      }
    }

    console.log("images :>> ", images)

    // const promises = [];
    // for (var i = 0; i < images.length; i++) {
    //   // promises.push()
    //   promises.push(
    //     new Promise((resolve, reject) => {
    //       const { src } = images[i];
    //       if (!src || src.startsWith('data:')) {
    //         // Skip images with empty src or already base64-encoded
    //         return;
    //       }
    //       // const imgFilePath = src.startsWith('file://')
    //       //   ? src.replace(/^file:\/\//, '')
    //       //   : null;

    //       getBase64Image(src)
    //         .then((base64Src) => {
    //           if (!images[i]) {
    //             return;
    //           }
    //           images[i].setAttribute(
    //             'src',
    //             `data:image/${path
    //               .extname(src)
    //               .substring(1)};base64,${base64Src}`,
    //           );
    //           resolve();
    //         })
    //         .catch((err) => {
    //           console.log('err :>> ', err);
    //           reject();
    //         });
    //     }),
    //   );
    // }

    // for (let i = 0; i < images.length; i++) {
    //   const img = images[i];
    //   const src = img.src;

    //   if (!src || src.startsWith('data:')) {
    //     // Skip images with empty src or already base64-encoded
    //     continue;
    //   }

    //   const imgFilePath = src.startsWith('file://')
    //     ? src.replace(/^file:\/\//, '')
    //     : null;

    // }

    //   if (imgFilePath) {
    //     // Replace local file with base64 equivalent
    //     promises.push(
    //       fs.readFile(imgFilePath).then((imgBuffer) => {
    //         const base64Img = Buffer.from(imgBuffer).toString('base64');
    //         img.setAttribute(
    //           'src',
    //           `data:image/${path
    //             .extname(imgFilePath)
    //             .substring(1)};base64,${base64Img}`,
    //         );
    //       }),
    //     );
    //   } else {
    //     promises.push(
    //       new Promise((resolve, reject) => {
    //         getBase64Image(src)
    //           .then((base64Src) => {
    //             img.setAttribute(
    //               'src',
    //               `data:image/${path
    //                 .extname(src)
    //                 .substring(1)};base64,${base64Src}`,
    //             );
    //             resolve();
    //           })
    //           .catch((err) => {
    //             console.log('err :>> ', err);
    //             reject();
    //           });
    //       }),
    //     );

    //     promises.push(getBase64Image(img));
    //   }
    // }

    // promises.push();

    // await Promise.all(promises);

    // const outputFilePath = path.join(__dirname, "output.html")

    // await fs.promises.writeFile(outputFilePath, dom.serialize())

    console.log("Done")
    return dom.serialize()
  } catch (error) {
    console.error(error)
  }
}

const fetchImg = memoizeOne((src: string) => getBase64Image(src))

async function getBase64Image(src: string) {
  try {
    const response = await axios({
      responseType: "arraybuffer",
      method: "get",
      url: src, //'https://www.spamhaus.org/images/shad02.gif',
      headers: {
        authority: "www.spamhaus.org",
        accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "accept-language": "en-US,en;q=0.9",
        "cache-control": "no-cache",
        dnt: "1",
        pragma: "no-cache",
        "sec-ch-ua": '"Google Chrome";v="111", "Not(A:Brand";v="8", "Chromium";v="111"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"macOS"',
        "sec-fetch-dest": "document",
        "sec-fetch-mode": "navigate",
        "sec-fetch-site": "none",
        "sec-fetch-user": "?1",
        "upgrade-insecure-requests": "1",
        "user-agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36"
      }
    })
    return Buffer.from(response.data, "binary").toString("base64")
  } catch (err) {
    console.log("err :>> ", err)
    return
  }
}
