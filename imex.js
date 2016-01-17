importexport={}

importexport.imExView = {

view(ctrl, args){
  return m(".container",[
    m("h1", "Friendly Builder"),
    m("a[href='/']", {config: m.route}, "Go to Questions"),
    m("br"),
    m("a[href='/library']", {config: m.route}, "Go to Library"),
    m("br"),
    m("a[href='/doc']", {config: m.route}, "Go to Doc"),
    m("br"),
    m("a.button", {download:"friendlypacket.js", href: makeTextFile(JSON.stringify(assembleFile()))}, "Export"),

  ])
  }
}
