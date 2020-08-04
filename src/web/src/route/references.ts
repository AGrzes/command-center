import { bookRoutes} from '@agrzes/yellow-2020-web-vue-books'
import { navigationMenu } from '@agrzes/yellow-2020-web-vue-components'
import { uiModel } from '../uiModel'

export default async function references() {
    const model = await uiModel()
    return {
      name: 'references',
      path: 'references',
      component: {
        template: `
      <div class="container-fluid">
          <div class="row mt-4">
            <div class="col-2">
              <navigation-menu :navigation="navigation"></navigation-menu>
            </div>
            <div class="col-10">
              <router-view></router-view>
            </div>
         </div>
      </div>
         `,
         data() {
             return {
                 navigation: model.navigation
             }
         },
         components: {
             navigationMenu
         }
      },
      children: [...bookRoutes]
    }
}
