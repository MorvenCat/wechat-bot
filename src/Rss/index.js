import Parser from 'rss-parser'
import dotenv from 'dotenv'
import { htmlToText } from 'html-to-text'
import { broadcastMessage } from '../wechaty/sendMessage.js'
import { getLastUpdate, getLatestContent, loadRssWatchList, updateLastUpdate, updateLatestContent } from '../sql/sql.js'

dotenv.config()

const env = dotenv.config().parsed // 环境参数
async function getRssWatchList() {
  const rssList = await loadRssWatchList()
  return rssList
}
/**
 * sleep
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * 监听rss更新
 */
export async function checkRssUpdates(bot) {
  const parser = new Parser() // 初始化 RSS 解析器
  const rssList = await getRssWatchList()

  for (const rss of rssList) {
    console.log(rss)
    let [rssurl, source, tag] = rss.split('|') // 获取 rssurl, 标签，来源
    // 将 &amp; 替换为 &
    rssurl = convertSpecialCharacter(rssurl)
    console.log(rssurl, source, tag)

    try {
      const feed = await parser.parseURL(rssurl) // 解析 RSS 源
      const latestItem = feed.items[0] // 获取最新的文章
      const pubDate = new Date(latestItem.pubDate) // 获取文章的发布时间

      // 获取数据库中存储的最后更新时间
      const lastUpdateDateRaw = await getLastUpdate(rssurl)
      const lastUpdateDate = lastUpdateDateRaw ? new Date(lastUpdateDateRaw) : null
      console.log('A' + lastUpdateDate + 'B' + pubDate)

      // 如果是第一次检查，或者发现有更新
      if (!lastUpdateDate || pubDate > lastUpdateDate) {
        // 更新数据库中的 lastUpdate
        await updateLastUpdate(rssurl, pubDate)

        // 获取最新的内容，并更新数据库中的 latestContent
        const latestContentInDb = await getLatestContent(rssurl)
        const textContent = htmlToText(latestItem.content)
        console.log(textContent)
        if (textContent !== latestContentInDb) {
          // 更新数据库中保存的最新内容
          await updateLatestContent(rssurl, latestItem.content)

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
      }
    } catch (error) {
      console.error(`Failed to fetch RSS feed from ${rssurl}:`, error)
    }

    await sleep(10000) // 每个 RSS 源之间等待 30 秒
  }
}

/**
 * 启动RSS监听
 */
export async function startRssWatch(bot) {
  // 使用 setTimeout 递归调用 checkRssUpdates
  async function scheduleNextCheck() {
    await checkRssUpdates(bot)
    setTimeout(scheduleNextCheck, 10000) // 每次检查完成后等待 30 秒再次执行
  }

  scheduleNextCheck() // 开始第一次调用
}

function convertSpecialCharacter(str) {
  const arrEntities = { lt: '<', gt: '>', nbsp: ' ', amp: '&', quot: '"' }
  return str.replace(/&(lt|gt|nbsp|amp|quot);/gi, function (all, t) {
    return arrEntities[t]
  })
}
