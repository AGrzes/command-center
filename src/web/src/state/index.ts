import {bookModel} from '@agrzes/yellow-2020-common-books'
import {modelState} from '@agrzes/yellow-2020-web-vue-books'
import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex)

async function store() {
  await bookModel.load()
  return new Vuex.Store({
    modules: {
      model: await modelState(bookModel)
    }
  })
}

export default store
