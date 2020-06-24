import { Series } from './Series'

export class DataFrame {
  constructor (series) {
    this.series = {}
    for (const item of series) {
      this.series[item.name] = item
    }

    return new Proxy(this, {
      get: (obj, prop, receiver) => {
        return prop in obj ? Reflect.get(obj, prop, receiver) : Reflect.get(obj.series, prop, receiver.series)
      },
      set: (obj, prop, value, receiver) => {
        if (prop in obj) {
          Reflect.set(obj, prop, value, receiver)
        } else {
          value.name = prop
          return Reflect.set(obj.series, prop, value, receiver.series)
        }
      },
      apply: (target, thisArgument, argumentList) => {
        return target in thisArgument ? Reflect.apply(target, thisArgument, argumentList) : Reflect.apply(target, thisArgument.array, argumentList)
      },
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

  static fromObject (data, types) {
    const series = {}
    for (let i = 0; i < data.length; i++) {
      for (const column in data[i]) {
        if (!(column in series)) {
          series[column] = new Series(column, new Array(data.length), types[column])
        }
        series[column][i] = data[i][column]
      }
    }
    const seriesList = Object.values(series)
    return new DataFrame(seriesList)
  }

  toString () {
    const columns = Object.getOwnPropertyNames(this.series)
    let s = columns.join(', ') + '\n'
    const maxLength = Object.values(this.series)
      .map(x => x.length)
      .reduce((accumulator, currentValue) => Math.max(accumulator, currentValue), 0)
    for (let i = 0; i < maxLength; i++) {
      const row = []
      for (const column of columns) {
        if (i < this.series[column].length) {
          row.push(this.series[column][i])
        } else {
          row.push(null)
        }
      }
      s += row.join(', ') + '\n'
    }
    s += columns.map(column => this.series[column].type).join(', ') + '\n'
    return s
  }
}
