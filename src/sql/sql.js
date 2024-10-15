import db from './database.js'
import { getAll, insertItem, removeItem, updateItem, getItem } from './dbUtils.js'

// 查询操作
export const loadRssWatchList = async () => {
  return getAll(db, 'rssWatchList', 'rss') // 直接返回数据库中的原始数据
}
export const loadAliasWhiteList = () => getAll(db, 'AliasWhiteList', 'alias')
export const loadRoomWhiteList = () => getAll(db, 'RoomWhiteList', 'roomName')

// 添加操作
export const addRssWatchList = (rss) => {
  return insertItem(db, 'rssWatchList', { rss }) // 直接存储传递过来的原始字符串
}
export const addAliasToWhiteList = (alias) => insertItem(db, 'AliasWhiteList', { alias })
export const addRoomToWhiteList = (roomName) => insertItem(db, 'RoomWhiteList', { roomName })

// 删除操作
export const removeRssWatchList = (rss) => {
  return removeItem(db, 'rssWatchList', { rss }) // 直接使用传递的字符串进行删除操作
}
export const removeAliasFromWhiteList = (alias) => removeItem(db, 'AliasWhiteList', { alias })
export const removeRoomFromWhiteList = (roomName) => removeItem(db, 'RoomWhiteList', { roomName })

// 更新操作
export const updateLastUpdate = (rssUrl, date) => updateItem(db, 'lastUpdate', { rssUrl }, { lastUpdate: date })
export const updateLatestContent = (rssUrl, content) => updateItem(db, 'latestContent', { rssUrl }, { content })

// 获取操作
export const getLastUpdate = (rssUrl) => getItem(db, 'lastUpdate', { rssUrl }, 'lastUpdate')
export const getLatestContent = (rssUrl) => getItem(db, 'latestContent', { rssUrl }, 'content')
