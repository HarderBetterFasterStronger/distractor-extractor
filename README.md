# distractor-extractor

A tool to strip the 💩 from a webpage

## Table of Contents

- [distractor-extractor](#distractor-extractor)
  - [Table of Contents](#table-of-contents)
  - [Installation](#installation)
  - [Usage](#usage)
    - [Example](#example)
  - [Support](#support)
  - [Contributing](#contributing)
  - [Work In Progress](#work-in-progress)

## Installation

Install dependencies:

```sh
npm install
npm install -g netlify-cli
```

Run the project:

npm run dev

## Usage

Pass a URL as the `url` query parameter to the `getreadable` netlify function to strip the page and return back html

### Example

[https://www.netlify.com/blog/intro-to-serverless-functions](https://www.netlify.com/blog/intro-to-serverless-functions)

```bash
curl "http://localhost:8888/.netlify/functions/getreadable?url=https://www.netlify.com/blog/intro-to-serverless-functions"
```

Output

```html
<html><head></head><body><div class="page" id="readability-page-1">
...
</div></body></html>
```

## Support

Please [open an issue](https://github.com/HarderBetterFasterStronger/distractor-extractor/issues/new) for support.

## Contributing

Please contribute using [Github Flow](https://guides.github.com/introduction/flow/). Create a branch, add commits, and [open a pull request](https://github.com/HarderBetterFasterStronger/distractor-extractor/compare/)

## Work In Progress

- more robust image conversion to base64 from HTML
- performance improvements as netlify requires < 10 seconds on free plan
