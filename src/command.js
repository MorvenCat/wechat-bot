import {
  addAliasToWhiteList,
  addRoomToWhiteList,
  loadAliasWhiteList,
  loadRoomWhiteList,
  loadRssWatchList,
  removeAliasFromWhiteList,
  removeRoomFromWhiteList,
  addRssWatchList,
  removeRssWatchList,
} from './sql/sql.js'

async function executeCommand(commandFunction, args) {
  try {
    return await commandFunction(args)
  } catch (error) {
    return `Error executing command: ${error.message}`
  }
}

function parseCommand(cmd) {
  const [entity, action, ...args] = cmd.split(' ')

  // 处理 rss 添加或删除时，避免错误的参数切分
  if (entity === '/rss' && (action === 'add' || action === 'del')) {
    const rssArgs = cmd.slice(entity.length + action.length + 2) // 获取完整的 RSS 链接及其余参数
    return { entity: entity.slice(1), action, args: [rssArgs] }
  }

  const cleanEntity = entity.startsWith('/') ? entity.slice(1) : entity
  return { entity: cleanEntity, action, args }
}

async function checkAndAddItem(loadFunction, addFunction, item, itemName) {
  const items = (await loadFunction()) || []
  if (items.includes(item)) {
    return `${itemName} "${item}" already exists.`
  }
  try {
    await addFunction(item)
    return `${itemName} "${item}" has been added.`
  } catch (error) {
    return `Error adding ${itemName} "${item}": ${error.message}`
  }
}

async function checkAndRemoveItem(loadFunction, removeFunction, item, itemName) {
  const items = (await loadFunction()) || []
  if (!items.includes(item)) {
    return `${itemName} "${item}" does not exist.`
  }
  await removeFunction([item])
  return `${itemName} "${item}" has been deleted.`
}

const commandStrategies = {
  group: {
    add: async (args) => {
      const roomName = args[0]
      try {
        await addRoomToWhiteList(roomName)
        return `Group "${roomName}" has been added.`
      } catch (error) {
        return error.message
      }
    },
    del: async (args) => {
      const roomName = args[0]
      try {
        await removeRoomFromWhiteList(roomName)
        return `Group "${roomName}" has been deleted.`
      } catch (error) {
        return `Error deleting group "${roomName}": ${error.message}`
      }
    },
    list: async () => {
      try {
        const groups = await loadRoomWhiteList()
        if (groups.length === 0) {
          return 'Group list is empty.'
        }
        return `Group list: ${groups.join(', ')}`
      } catch (error) {
        return `Error loading group list: ${error.message}`
      }
    },
  },
  alias: {
    add: (args) => checkAndAddItem(loadAliasWhiteList, addAliasToWhiteList, args[0], 'Alias'),
    del: (args) => checkAndRemoveItem(loadAliasWhiteList, removeAliasFromWhiteList, args[0], 'Alias'),
    list: async () => {
      try {
        const aliases = await loadAliasWhiteList()
        if (aliases.length === 0) {
          return 'Alias list is empty.'
        }
        return `Alias list: ${aliases.join(', ')}`
      } catch (error) {
        return `Error loading alias list: ${error.message}`
      }
    },
  },
  rss: {
    add: async (args) => {
      const rssLink = args[0]
      try {
        await addRssWatchList(rssLink)
        return `RSS feed "${rssLink}" has been added.`
      } catch (error) {
        return `Error adding RSS feed: ${error.message}`
      }
    },
    del: async (args) => {
      const rssLink = args[0]
      try {
        await removeRssWatchList(rssLink)
        return `RSS feed "${rssLink}" has been deleted.`
      } catch (error) {
        return `Error deleting RSS feed "${rssLink}": ${error.message}`
      }
    },
    list: async () => {
      try {
        const rssFeeds = await loadRssWatchList()
        if (rssFeeds.length === 0) {
          return 'RSS list is empty.'
        }
        return `RSS list: ${rssFeeds.join(', ')}`
      } catch (error) {
        return `Error loading RSS list: ${error.message}`
      }
    },
  },
}

export async function command(cmd) {
  const { entity, action, args } = parseCommand(cmd)
  console.log('Command:', cmd)
  console.log('Parsed:', { entity, action, args })

  if (commandStrategies[entity] && commandStrategies[entity][action]) {
    return await executeCommand(commandStrategies[entity][action], args)
  } else {
    return `Unknown command: ${cmd}`
  }
}
