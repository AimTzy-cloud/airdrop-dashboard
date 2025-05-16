/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Serializes MongoDB documents to plain JavaScript objects
 * Removes all non-serializable properties and methods
 */
export function serializeMongoDoc<T>(doc: any): T {
  if (!doc) return null as unknown as T

  // Handle arrays of documents
  if (Array.isArray(doc)) {
    return doc.map(serializeMongoDoc) as unknown as T
  }

  // If it's not an object or already a plain object, return as is
  if (typeof doc !== "object" || doc === null) {
    return doc as T
  }

  // Handle Date objects
  if (doc instanceof Date) {
    return doc.toISOString() as unknown as T
  }

  // Convert to plain object
  const plainObject: Record<string, any> = {}

  // Get all enumerable properties
  Object.keys(doc).forEach((key) => {
    // Skip functions and internal MongoDB properties that start with underscore
    // except for _id which we want to keep
    if (typeof doc[key] === "function" || (key.startsWith("_") && key !== "_id")) {
      return
    }

    const value = doc[key]

    // Handle ObjectId (convert to string)
    if (key === "_id" && value && typeof value.toString === "function") {
      plainObject._id = value.toString()
    }
    // Handle nested objects (recursively)
    else if (value && typeof value === "object") {
      plainObject[key] = serializeMongoDoc(value)
    }
    // Regular values
    else {
      plainObject[key] = value
    }
  })

  return plainObject as T
}
