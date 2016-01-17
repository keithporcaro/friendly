doc = {}

doc.Doc = function(data){
  this.id = m.prop(data.id)
  this.content = m.prop(data.content)
}

doc.Styles = function(data){
  this.id = m.prop(data.id)
  this.content = m.prop(data.content)
}

doc.vm = (function(){
  var vm = {}
  vm.init = function(){
    uid = uuid(0,0)
    vm.doc = new doc.Doc({id: uid, content:""})
  }

  return vm;

}());

doc.docView = {
view: function(ctrl, args){
  return m(".container",[
    m("h1", "Friendly Builder"),
    m("a[href='/']", {config: m.route}, "Go to Questions"),
    m("br"),
    m("a[href='/library']", {config: m.route}, "Go to Library"),
    m("br"),
    m("a[href='/imex']", {config: m.route}, "Export"),
    m("br"),

    m("textarea", {onchange: m.withAttr("value", doc.vm.doc.content), value: doc.vm.doc.content(), style:"width:100%;height:80%"})
  ]);
}

}
