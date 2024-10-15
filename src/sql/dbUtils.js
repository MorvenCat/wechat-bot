export async function getAll(db, table, column) {
  const rows = await db.select(column).from(table)
  return rows.map((row) => row[column]) || []
}

export async function insertItem(db, table, data) {
  try {
    await db(table).insert(data)
    console.log(`${JSON.stringify(data)} added to ${table}.`)
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT') {
      throw new Error(`${JSON.stringify(data)} already exists in ${table}.`)
    }
    console.error(`Error adding item to ${table}:`, err)
    throw new Error(`Error adding item to ${table}: ${err.message}`)
  }
}

export async function removeItem(db, table, condition) {
  try {
    await db(table).where(condition).del()
    console.log(`Item removed from ${table} where ${JSON.stringify(condition)}.`)
  } catch (err) {
    console.error(`Error removing item from ${table}:`, err)
    throw new Error(`Error removing item from ${table}: ${err.message}`)
  }
}

export async function updateItem(db, table, condition, data) {
  try {
    await db(table)
      .insert({ ...condition, ...data })
      .onConflict(Object.keys(condition))
      .merge()
    console.log(`Item in ${table} updated with ${JSON.stringify(data)} where ${JSON.stringify(condition)}.`)
  } catch (err) {
    console.error(`Error updating item in ${table}:`, err)
    throw new Error(`Error updating item in ${table}: ${err.message}`)
  }
}

export async function getItem(db, table, condition, column) {
  const result = await db(table).where(condition).first()
  return result ? result[column] : null
}
