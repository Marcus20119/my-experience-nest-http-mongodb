export const uniq = <T>(array: T[]): T[] => [...new Set(array)]

export const toArray = <T>(item: T | T[]): T[] => (Array.isArray(item) ? item : [item])

type ExtractNestedArrayType<T> = T extends ReadonlyArray<infer U> ? ExtractNestedArrayType<U> : T

export const flattenDeep = <T>(array: T[]): Array<ExtractNestedArrayType<T>> => {
  let result: ExtractNestedArrayType<T>[] = []

  for (const item of array) {
    if (Array.isArray(item)) {
      result = [...result, ...flattenDeep(item)]
    } else {
      result.push(item as ExtractNestedArrayType<T>)
    }
  }

  return result
}

export const difference = <T>(source: T[], target: T[]): T[] => {
  return source.filter((item) => !target.includes(item))
}

export const isEqual = <T extends number | string>(arr1: T[], arr2: T[]): boolean => {
  if (!arr1 || !arr2) {
    return arr1 === arr2
  }

  if (arr1.length !== arr2.length) {
    return false
  }

  const sorted1 = [...arr1].sort()
  const sorted2 = [...arr2].sort()

  return sorted1.every((val, index) => val === sorted2[index])
}

export const isTheSameArray = <T>(source: T[], target: T[]): boolean => {
  return source.length === target.length && new Set([...source, ...target]).size === source.length
}
