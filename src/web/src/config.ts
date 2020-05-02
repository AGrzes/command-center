import {config as getConfig} from '@agrzes/yellow-2020-common-config'
import { UIModel } from '@agrzes/yellow-2020-common-ui-model'
import { StateConfig } from '@agrzes/yellow-2020-web-vue-state'

export interface Config {
    state: StateConfig
    ui: UIModel
}

let theConfig: Config

export async function config(): Promise<Config> {
    if (!theConfig) {
        theConfig = await getConfig('http:/api/config/yellow2020')
    }
    return theConfig
}
