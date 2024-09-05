import Parser from 'rss-parser'
import dotenv from 'dotenv'
import { htmlToText } from 'html-to-text'
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
    for (const rss of rssList) {
      let [rssurl, source, tag] = rss.split('|') // 获取rssurl，标签，来源
      try {
        const feed = await parser.parseURL(rssurl) // 解析RSS源
        const latestItem = feed.items[0] // 获取最新的文章

        if (!lastUpdate.has(rssurl) || new Date(latestItem.pubDate) > lastUpdate.get(rssurl)) {
          // 如果是第一次检查，或者发现有更新
          lastUpdate.set(rssurl, new Date(latestItem.pubDate)) // 更新lastUpdate
          latestcontent.set(rssurl, latestItem.content) // 保存最新的文章标题
          const textContent = htmlToText(latestItem.content)
          console.log(`New update found in ${rssurl}: ${textContent}`)

          // 消息模板
          const msg = `
          📢 ${textContent}
          
📝 > ${source}
🏷️ > ${tag}
🔗 > ${latestItem.link}
          `

          await broadcastMessage(bot, 'Rss', msg.trim())
        }
      } catch (error) {
        console.error(`Failed to fetch RSS feed from ${rss}:`, error)
      }
    }
  }, 60000) // 60000ms = 60秒
}
