import { NotionToMarkdown } from 'notion-to-md';
import { Client } from '@notionhq/client';
import fs from 'fs';
import mkdir from './utils/mkdir';
import { DatabaseObjectResponse, PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';

interface NotionToMarkdownOptions {
  notionClient: Client
}

interface UserInfo {
  title: string;
  date: string;
  author: string;
  tags: string[];
  category: string;
}

export class NotionDownify {
  private notionClient;

  constructor(options: NotionToMarkdownOptions) {
    this.notionClient = options.notionClient;
  }
  /**
   * ISO Date to 'yyyy-mm-dd HH:ii:ss'
   * @param date 
   * @returns 
   */
  private isoToFormatted(date: string) {
    const beforeDate = new Date(date);
    const formattedDate = beforeDate.toISOString().replace('T', ' ').slice(0, 19);
    return formattedDate;
  }

  private toStringUserInfo(userInfo: UserInfo) {
    const { title, date, author, tags, category } = userInfo;
    const tagsStr = tags.join(' ');
    return (
      `---\n` +
      `title: '${title}'\n` +
      `date: '${date}'\n` +
      `author: '${author}'\n` +
      `tags: ${tagsStr}\n` +
      `categories: '${category}'\n` +
      `---\n`
    );
  }

  /**
   * Take a page from your database and mark it up.
   * @param databaseID 
   * The databaseID is needed to retrieve the information in the database and the information on each page.
   */
  public async dbDownify(databaseID: string): Promise<void> {
    const res = await this.notionClient.databases.retrieve({ database_id: databaseID }) as DatabaseObjectResponse;
    const category = res.title[0].plain_text;

    const pageIDs = await this.getPageIDs(databaseID);
    for (const pageID of pageIDs) {
      const res = await this.notionClient.pages.retrieve({ page_id: pageID }) as PageObjectResponse;
      const properties = res.properties;

      const title = properties['Title'].type === 'title' ? properties['Title'].title[0].plain_text : '';
      const date = this.isoToFormatted(res.last_edited_time);
      const authorID = res.created_by.id;
      const author = (await this.notionClient.users.retrieve({ user_id: authorID })).name ?? '';
      const tags = properties['tags'].type === 'multi_select' ? properties['tags'].multi_select.map(tag => tag.name) : [];

      const pageInfo: PageInfo = {
        title,
        date,
        author,
        tags,
        category,
      }

    this.getPageIDs(databaseID).then((pageIDs) => {
      pageIDs.map((pageID) => {
        // make directory
      mkdir(pageID);
      this.savePageToMd(pageID, pageInfo);
    }
  }

  /**
   * Get pageIDs from database
   * @param databaseID 
   * @returns pageIDs
   */
  async getPageIDs(databaseID: string): Promise<string[]> {
    const queryData = await this.notionClient.databases.query({
      database_id: databaseID,
    });
    const pageIDs = queryData.results.map((page) => page.id);

    return pageIDs;
  }

  /**
   * Markdown a page
   * @param pageId 
   * @param buildLocation 
   */
  async savePageToMd(pageId: string) {
    const n2m = new NotionToMarkdown({ notionClient: this.notionClient });

    // Get markdown blocks from page
    const mdBlocks = await n2m.pageToMarkdown(pageId);

    // Convert markdown blocks to markdown string
    const mdString = n2m.toMarkdownString(mdBlocks);

    // Write markdown string to file
    fs.writeFile(
      `${pageId}/index.md`,
      mdString,
      (err) => {
        if (err) {
          throw new Error(`An error occurred: ${err}. Please report it to the developer.`);
        }
      },
    );

    // notify Success
    console.log(`Successful save as '${pageId}'`)
  }
}
