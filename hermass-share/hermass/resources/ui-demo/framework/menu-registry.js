(function (global) {
  var modules = new Map();

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function register(id, definition) {
    if (!id || typeof id !== 'string') throw new Error('菜单模块必须提供唯一 id');
    if (!definition || !Array.isArray(definition.items)) throw new Error('菜单模块必须提供 items');
    modules.set(id, Object.assign({ routes: {} }, clone(definition)));
    return api;
  }

  function get(id) {
    var definition = modules.get(id);
    if (!definition) throw new Error('未注册菜单模块：' + id);
    return clone(definition);
  }

  function route(reference) {
    var parts = String(reference || '').split(':');
    var feature = parts.pop();
    var moduleId = parts.join(':');
    var definition = modules.get(moduleId);
    return definition && definition.routes ? definition.routes[feature] || '' : '';
  }

  function link(moduleId, feature, overrides) {
    var definition = get(moduleId);
    var target = findItem(definition.items, feature);
    return Object.assign({}, target || { key: feature, label: feature }, overrides || {}, {
      href: route(moduleId + ':' + feature)
    });
  }

  function findItem(items, key) {
    for (var i = 0; i < items.length; i += 1) {
      if (items[i].key === key) return items[i];
      var child = findItem(items[i].children || [], key);
      if (child) return child;
    }
    return null;
  }

  var api = { register: register, get: get, route: route, link: link };
  global.WiseMenuRegistry = api;
}(window));
