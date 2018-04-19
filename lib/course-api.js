/*
  Example usage
  var resolver = new ApiJsonResolver();
  resolver.resolve(apiJson);
  // Now apiJson has no $refs and $ids anymore
*/

function ApiJsonResolver() {
  function extractIds(obj, idToObject) {
    if (!idToObject) idToObject = {};
    if (!obj) return idToObject;
    if(obj["$id"] !== undefined) {
      idToObject[obj["$id"]] = obj;
      delete obj["$id"];
    }
    for (var key in obj) {
      if (obj.hasOwnProperty(key) && typeof obj[key] === "object") {
        extractIds(obj[key], idToObject);
      }
    }
    return idToObject;
  }

  function findRefs(obj, idToObject, allRefs) {
    if (!allRefs) allRefs = [];
    if (!obj) return allRefs;
    for (var key in obj) {
      if (obj.hasOwnProperty(key) && typeof obj[key] === "object" && !! obj[key]) {
        if (obj[key]["$ref"] !== undefined) {
          allRefs.push({obj: obj, key: key, val: idToObject[obj[key]["$ref"]]});
        } else {
          findRefs(obj[key], idToObject, allRefs);
        }
      }
    }
    return allRefs;
  }

  function hydrateRefs(allRefs) {
    if (!allRefs) return;
    for (var i in allRefs) {
      var r = allRefs[i];
      r.obj[r.key] = r.val;
    }
  }

  this.resolve = function(obj) {
    let idToObject = extractIds(obj);
    let allRefs = findRefs(obj, idToObject);
    hydrateRefs(allRefs);
    return obj;
  }
}

exports.parseIds = function (json) {
  var resolver = new ApiJsonResolver();
  return resolver.resolve(json);
}
