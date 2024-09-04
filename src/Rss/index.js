import Parser from 'rss-parser'
import dotenv from 'dotenv'
import { broadcastMessage } from '../wechaty/sendMessage.js'

export function getRssMsg() {}

const env = dotenv.config().parsed // 环境参数
const rssList = env.RSS_URLS ? env.RSS_URLS.split(',') : [] //
const lastUpdate = new Map() //
const latestcontent = new Map()
/**
 * 监听rss更新
 */
export async function startRssWatch(bot) {
  const parser = new Parser() // 初始化 RSS 解析器

  // 每60秒检查一次更新
  setInterval(async () => {
    for (const url of rssList) {
      try {
        const feed = await parser.parseURL(url) // 解析RSS源
        const latestItem = feed.items[0] // 获取最新的文章

        if (!lastUpdate.has(url) || new Date(latestItem.pubDate) > lastUpdate.get(url)) {
          // 如果是第一次检查，或者发现有更新
          lastUpdate.set(url, new Date(latestItem.pubDate)) // 更新lastUpdate
          latestcontent.set(url, latestItem.content) // 保存最新的文章标题
          console.log(`New update found in ${url}: ${latestItem.content}`)
          await broadcastMessage(bot, 'Rss', `${latestItem.content}`)
        }
      } catch (error) {
        console.error(`Failed to fetch RSS feed from ${url}:`, error)
      }
    }
  }, 60000) // 60000ms = 60秒
}
