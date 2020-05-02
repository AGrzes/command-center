import { modelRoutes } from '@agrzes/yellow-2020-web-vue-router'
import { uiModel } from '../uiModel'

export default async function references() {
    const model = await uiModel()
    return {
        name: 'references',
        path: 'references',
        component: {
          template: `
            <div class="row mt-4">
              <div class="col-2">
                <ul class="nav flex-column">
                    <router-link tag="li" class="nav-item" :to="{name:view.pathName+'-list'}" v-for="view in views">
                        <a class="nav-link">{{view.pathName}}</a>
                    </router-link>
                </ul>
              </div>
              <div class="col-10">
                <router-view></router-view>
              </div>
           </div>`,
           data() {
               return {
                views: model.views
               }
           }
        },
        children: modelRoutes(model)
      }
}
