const extract = (collection, key, value) => {
  const collection_length = collection.length
  for (let i = 0; i < collection_length; i++) {
    const item = collection[i]
    
    if (item[key] === value) {
      collection.splice(i, 1)
      return item
    }
  }
}

module.exports = extract
