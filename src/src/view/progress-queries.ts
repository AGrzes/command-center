// tslint:disable:only-arrow-functions
const view = {
  _id: '_design/queries',
  language: 'javascript',
  version: '1.0.0',
  views: {
    'resolved': {
      map: (function(doc) {
        if (doc.resolved) {
          emit([doc.resolved.substring(0, 4),
            doc.resolved.substring(5, 7),
            doc.resolved.substring(8, 10),
            doc.resolved.substring(11)])
        }
      }).toString(),
      reduce: '_count'
    },
    'defined': {
      map: (function(doc) {
        if (doc.defined) {
          emit([doc.defined.substring(0, 4),
            doc.defined.substring(5, 7),
            doc.defined.substring(8, 10),
            doc.defined.substring(11)])
        }
      }).toString(),
      reduce: '_count'
    },
    'actionable:resolved': {
      map: (function(doc) {
        if (doc.resolved && (doc.labels.indexOf('Action') !== -1 || doc.labels.indexOf('github') !== -1)) {
          emit([doc.resolved.substring(0, 4),
            doc.resolved.substring(5, 7),
            doc.resolved.substring(8, 10),
            doc.resolved.substring(11)])
        }
      }).toString(),
      reduce: '_count'
    },
    'actionable:defined': {
      map: (function(doc) {
        if (doc.defined && (doc.labels.indexOf('Action') !== -1 || doc.labels.indexOf('github') !== -1)) {
          emit([doc.defined.substring(0, 4),
            doc.defined.substring(5, 7),
            doc.defined.substring(8, 10),
            doc.defined.substring(11)])
        }
      }).toString(),
      reduce: '_count'
    },
    'projects:defined': {
      map: (function(doc) {
        if (doc.defined && doc.labels.indexOf('Project') !== -1) {
          emit([doc.defined.substring(0, 4),
            doc.defined.substring(5, 7),
            doc.defined.substring(8, 10),
            doc.defined.substring(11)])
        }
      }).toString(),
      reduce: '_count'
    },
    'projects:resolved': {
      map: (function(doc) {
        if (doc.resolved && doc.labels.indexOf('Project') !== -1) {
          emit([doc.resolved.substring(0, 4),
            doc.resolved.substring(5, 7),
            doc.resolved.substring(8, 10),
            doc.resolved.substring(11)])
        }
      }).toString(),
      reduce: '_count'
    }
  }
}
export default view
