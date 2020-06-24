import arrayMethods from './array-methods'

export class Series {
  constructor (name, array, type) {
    this.name = name
    this.array = array
    this.type = type

    return new Proxy(this, {
      get: (obj, prop, receiver) => {
        if (prop in obj) {
          return Reflect.get(obj, prop, receiver)
        } else if (arrayMethods.has(prop)) {
          return (...args) => {
            const [value, type] = arrayMethods.get(prop)(obj, ...args)
            if (value instanceof Array) {
              return new Series('', value, type)
            } else {
              return value
            }
          }
        } else {
          return Reflect.get(obj.array, prop, receiver.array)
        }
      },
      set: (obj, prop, value, receiver) => {
        if (prop in obj) {
          return Reflect.set(obj, prop, value, receiver)
        } else {
          return Reflect.set(obj.array, prop, value, receiver.array)
        }
      },
      apply: (target, thisArgument, argumentList) => {
        return Reflect.apply(target, thisArgument, argumentList)
      },
      // construct: Reflect.construct,
      defineProperty: Reflect.defineProperty,
      getOwnPropertyDescriptor: Reflect.getOwnPropertyDescriptor,
      deleteProperty: Reflect.deleteProperty,
      getPrototypeOf: Reflect.getPrototypeOf,
      setPrototypeOf: Reflect.setPrototypeOf,
      isExtensible: Reflect.isExtensible,
      preventExtensions: Reflect.preventExtensions,
      has: Reflect.has,
      ownKeys: Reflect.ownKeys
    })
  }

  toString () {
    return `(${this.name};${this.type}): ${this.array.join(', ')}`
  }
}
