// -------------------------------------------------------------------
// Imports and setup
// -------------------------------------------------------------------
const _ = require('lodash')

// Leave this filters line
const filters = {}

// Combine objects without mutating original
filters.mergeObjects = (...items) => {
  return Object.assign({}, ...items)
}

filters.isObject = item => {
  return _.isObject(item)
}

/*
  ====================================================================
  objectArrayToArray
  --------------------------------------------------------------------
  Flatten object array to nested array, keeping just the values
  ====================================================================

  Input:

  array = [
    {
      firstName: "Foo",
      lastName: "Bar"
    },{
      firstName: "Zip",
      lastName: "Buz"
    }
  ]

  Output:

  [
    ["Foo", "Bar"],
    ["Zip", "Buz"]
  ]

*/

filters.objectArrayToArray = array => {
  const newArray = []
  array.forEach(item => {
    const newItem = []
    Object.keys(item).forEach(part => {
      newItem.push(item[part])
    })
    newArray.push(newItem)
  })
  return newArray
}

filters.objectToArray = object => {
  if (!object) return []
  const newArray = []
  Object.keys(object).forEach(key => {
    newArray.push(object[key])
  })
  return newArray
}

// Keep only whitelisted keys from object or array of objects
filters.keepAttributes = (array, keysToKeep) => {
  const keepKeys = theObject => {
    const newObj = {}
    // Re-orders in order of keysToKeep and keeps only selected keys

    // Coerce string to array
    if (_.isString(keysToKeep)) keysToKeep = [keysToKeep]

    keysToKeep.forEach(key => {
      const objectKeys = Object.keys(theObject)
      if (objectKeys.includes(key)) {
        newObj[key] = theObject[key]
      }
    })
    return newObj
  }
  // Array of objects
  if (_.isArray(array)) {
    return array.map(keepKeys)
  }
  // Single object
  else return keepKeys(array)
}

// set attribute on object
filters.setAttribute = (dictionary, key, value) => {
  const newDictionary = Object.assign({}, dictionary)
  newDictionary[key] = value
  return newDictionary
}

// set attribute on object (or array of objects)
filters.addAttribute = (dictionary, key, value) => {
  if (Array.isArray(dictionary)) {
    newArr = []
    dictionary.forEach(item => {
      const newItem = Object.assign({}, item)
      newItem[key] = value
      newArr.push(newItem)
    })
    return newArr
  } else {
    const newDictionary = Object.assign({}, dictionary)
    newDictionary[key] = value
    return newDictionary
  }
}

// Clear a single attribute
filters.clearAttribute = (dictionary, key) => {
  const newDictionary = Object.assign({}, dictionary)
  newDictionary[key] = ''
  return newDictionary
}

// Rename a key on an object, preserving key order
filters.renameAttribute = (dictionary, oldKey, newKey) => {
  const keys = Object.keys(dictionary)
  const newObj = keys.reduce((acc, val) => {
    if (val === oldKey) {
      acc[newKey] = dictionary[oldKey]
    } else {
      acc[val] = dictionary[val]
    }
    return acc
  }, {})

  return newObj
}

// Delete a single attribute from an object or array of objects
filters.deleteAttribute = (input, attribute) => {
  const deleteAttributeFromObject = (object) => {
    // Don't modify the original
    const newDictionary = Object.assign({}, object)
    delete newDictionary[attribute]
    return newDictionary
  }

  // Array of objects
  if (_.isArray(input)) {
    return input.map(deleteAttributeFromObject)
  }
  // Single object
  else return deleteAttributeFromObject(input)
}

// Delete a keys with blank values
filters.deleteBlankAttributes = (dictionary) => {
  // Don't modify the original
  const newDictionary = Object.assign({}, dictionary)
  Object.keys(newDictionary).forEach(key => {
    if (newDictionary[key] == '' || newDictionary[key] == undefined) {
      delete newDictionary[key]
    }
  })
  return newDictionary
}

// Filter results for only those containing attribute and value
filters.where = (arr, key, compare) => {
  compare = [].concat(compare) // force to arr
  const filtered = arr.filter(item => {
    return compare.includes(_.get(item, key))
  })
  return filtered
}

// Remove items with a specified attribute and value
filters.removeWhere = (arr, key, compare) => {
  compare = [].concat(compare) // force to arr
  const filtered = arr.filter(item => {
    return !compare.includes(_.get(item, key))
  })
  return filtered
}

/*
  ---------------------------------------------------------
  whereIncludes
  ---------------------------------------------------------
  returns an array with all objects that don't match removed
  arr = [
    {"pet": "dog", name: "Catherine"},
    {"pet": "cat", name: "Vasili"}
    {"pet": "big cat", name: "Elizaveta"}
    ]
  arr = newArr | whereIncludes ("pet", "cat")
  newArr = [
    {"pet": "cat", name: "Vasili"}
    {"pet": "big cat", name: "Elizaveta"}
    ]
*/

filters.whereIncludes = (arr, key, compare) => {
  compare = [].concat(compare) // force to arr
  const filtered = arr.filter(item => {
    return compare.some(string => {
      return _.get(item, key) && _.get(item, key).includes(string)
    })
    return compare.includes(_.get(item, key))
  })
  return filtered
}

/*
  --------------------------------------------------------
  whereDoesNotInclude
  --------------------------------------------------------
  returns an array with objects that match removed
  arr = [
    {"pet": "dog", name: "Catherine"},
    {"pet": "cat", name: "Vasili"}
    {"pet": "big cat", name: "Elizaveta"}
    ]
  arr = newArr | whereDoesNotInclude("pet", "cat")
  newArr = [{"pet": "dog", name: "Catherine"}]
*/
filters.whereDoesNotInclude = (arr, key, compare) => {
  compare = [].concat(compare) // force to arr
  const filtered = arr.filter(item => {
    return !compare.some(string => {
      return _.get(item, key) && _.get(item, key).includes(string)
    })
    return compare.includes(_.get(item, key))
  })
  return filtered
}

// -------------------------------------------------------------------
// keep the following line to return your filters to the app
// -------------------------------------------------------------------
exports.filters = filters
