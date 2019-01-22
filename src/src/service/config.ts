import {config as configDb} from '../db'

export function config(id: string): Promise<any> {
  return configDb.get(id)
}
