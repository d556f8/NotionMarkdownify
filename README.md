![NotionMarkdownify](https://user-images.githubusercontent.com/64972038/217763800-7758c37d-a8f2-4279-b6a3-c17e41efc3ab.svg)

# NotionMarkdownify

NotionMarkdownify is a program that converts notion pages stored in the Notion database into markdown files.
## Getting Started

  Run `npm install` or `yarn` in the terminal to install the required packages.

  Set up a Notion API token by adding it to your .env file. More information on how to get an API token can be found in the Notion API documentation.


## Usage
~~~TypeScript
import { Client } from '@notionhq/client';
import { NotionDownify } from './index';
import * as dotenv from 'dotenv';
dotenv.config();

const {
  NOTION_API_KEY = '',
  DATABASE_ID = '',
  CONTENT_LOCATION = ''
} = process.env;

// A NOTION_API_KEY is required to create a Client object.
const notion = new Client({ auth: NOTION_API_KEY });

const downify = new NotionDownify({ notionClient: notion });

downify.dbDownify(DATABASE_ID, CONTENT_LOCATION);
~~~
![image](https://user-images.githubusercontent.com/64972038/221720439-2a913cf9-dced-42d8-8fa0-6b3dcf5a6742.png)
