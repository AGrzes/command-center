import { uiModel } from '../uiModel'
import { modelRoutes } from '@agrzes/yellow-2020-web-vue-router'
import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'
Vue.use(VueRouter)

async function router() {
    const routes: RouteConfig[] = [...modelRoutes(await uiModel())]
    return new VueRouter({
        mode: 'history',
        routes,
        linkActiveClass: 'active'
    })
}

export default router
