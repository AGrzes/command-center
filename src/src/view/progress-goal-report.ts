// tslint:disable:only-arrow-functions
const view = {
  _id: '_design/views',
  language: 'javascript',
  version: '1.0.0',
  views: {
    byActivity: {
      map: (function(doc) {
        if (doc.activity) {
          emit(doc.activity)
        }
      }).toString()
    }
  }
}
export default view
