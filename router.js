bigfriendly = {}




rules.vm.init()
library.vm.init()
doc.vm.init()
composer.vm.init()

m.route.mode="hash";
m.route(document.body, "/", {
  "/": composer.composerView,
  "/library": library.libraryView,
  "/doc": doc.docView,
  "/imex": importexport.imExView
});
