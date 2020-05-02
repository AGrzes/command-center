import { UIModel } from '@agrzes/yellow-2020-common-ui-model'
import { config } from './config'

export async function uiModel(): Promise<UIModel> {
  const {ui} = await config()
  return ui
}
