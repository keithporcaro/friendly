library = {}

library.Entry = function(data){
  this.id = m.prop(data.id)
}

library.EntryAttributes = function(data){
  this.type = m.prop(data.type)
  this.name = m.prop(data.name)
  this.id = m.prop(data.id)
}

library.ConditionalValue = function(data){
  this.value = m.prop(data.value)
  this.inputlink = m.prop(data.inputlink)
  this.condition = m.prop(data.condition)
  this.id = m.prop(data.id)
  this.linkValue = m.prop(data.linkValue)
}


//scope-wide objects
library.EntryList = Array;
library.EntryLookup = Object;
library.ValueDictionary = Object;
library.ValueLookup = Object;
library.ConditionalValueLookup = Object;

//scope: one list per individual entry
library.ValueList = Array;

library.RulesTreeList = Object;

//potential object types
library.types = ['text', 'list', 'math', 'object', 'api']

library.vm = (function() {
    var vm = {}
    vm.init = function() {
        //a running list of questions
        vm.list = new library.EntryList();
        vm.entryLookup = new library.EntryLookup();
        vm.valueDictionary = new library.ValueDictionary();
        vm.conditionalValueLookup = new library.ConditionalValueLookup();
        vm.ruleTree = new library.RulesTreeList();

        vm.remove = function(list, item){
          list.splice(list.indexOf(item),1);
        }

        vm.addCV = function(args){
          var uid = uuid(0,0)
          vm.valueDictionary[args.parent].push(uid)
          vm.conditionalValueLookup[uid] = new library.ConditionalValue({value:"", id: uid, condition:"not", inputlink:"free"})
          vm.ruleTree[uid] = rules.vm.addCore(uid)
        }

        vm.add = function(args){
          var uid = uuid(0,0)
          vm.entryLookup[uid] = new library.EntryAttributes({type:args.type, name:"", id:uid})
          vm.valueDictionary[uid] = new library.ValueList();
          vm.list.push(uid)
        }


    }
    return vm
}())


library.libraryView = {
  controller: function(){
  },
  view: function(ctrl, args){
    return m(".container",[
      m("h1", "Friendly Builder"),
      m("a[href='/']", {config: m.route}, "Go to Questions"),
      m("br"),
      m("a[href='/doc']", {config: m.route}, "Go to Doc"),
      m("br"),
      m("a[href='/imex']", {config: m.route}, "Export"),
      m("br"),
      m("button", {onclick: library.vm.add.bind(vm, {type:"text"})}, "Add Text"),
    //  m("button", {onclick: library.vm.add}, "Add Object"),
    //  m("button", {onclick: library.vm.add}, "Add Number"),
    //  m("button", {onclick: library.vm.add}, "Add List"),
    //  m("button", {onclick: packager({questionList: library.vm.list, choiceList: library.vm.choicesLookup, ruleTree: library.vm.ruleTree})}, "Export"),
      library.vm.list.map(function(question){
        return m.component(entryConstructor, {entry: library.vm.entryLookup[question]})
      })
  ])
  }
}

var entryConstructor = {
  controller: function(args){

  },
  view: function(ctrl, args){
    return m(".question", {key: args.entry.id()}, [
      m("label", "Entry Name (no spaces):"),
      m("input", {onchange: m.withAttr("value", args.entry.name), value: args.entry.name(), class:"question"}),
      m("button", {onclick: library.vm.addCV.bind(vm, {parent: args.entry.id()})}, "Add Conditional Value"),
      m("label", "Values:"),
      library.vm.valueDictionary[args.entry.id()].map(function(conditionalValue){

        //return m.component(CVConstructor, {conditionalValue: library.vm.conditionalValueLookup[conditionalValue], parent: args.entry.id()})
        //return m.component(LinkValueConstructor, {conditionalValue: library.vm.conditionalValueLookup[conditionalValue], parent: args.entry.id(), id: conditionalValue})
        return m.component(valueDirector, {conditionalValue: library.vm.conditionalValueLookup[conditionalValue], parent: args.entry.id(), id: conditionalValue})
      }),


    //Rule component
    //  m.component(RuleConstructor, {question: args.question}),
      m("button", {onclick: library.vm.remove.bind(this, library.vm.list, args.question)}, "Remove")
    ])
  }
}

var valueDirector = {
  view: function(ctrl, args){
    return m("div.value", [m("select", {onchange: m.withAttr("value", args.conditionalValue.inputlink), value:args.conditionalValue.inputlink()}, [
      m("option", {value: "free"}, "Custom"),
      m("option", {value: "question"}, "User Answer"),
    ]), m("a", {class: "remove", onclick: library.vm.remove.bind(this, library.vm.valueDictionary[args.parent], args.conditionalValue)}, "x"),

    args.conditionalValue.inputlink() == "free" ? m.component(CVConstructor, args) : m.component(LinkValueConstructor, args),
    m.component(LibRuleConstructor, {question: args.conditionalValue})
  ])
  }
}

var CVConstructor = {
  view: function(ctrl, args){
    return m("div",[
        m("input", {onchange:m.withAttr("value", args.conditionalValue.value), value: args.conditionalValue.value(), key: args.conditionalValue.id()}),
    ])
  }
}
library.linkValue = viewModelMap({
  question: m.prop(""),
  field: m.prop("")
})
var LinkValueConstructor = {
  view:function(ctrl, args){
    var vvm = library.linkValue(args.conditionalValue)
    return m("div",[
      m("select", {onchange: m.withAttr("value", vvm.question), value: vvm.question()}, [
        m("option", {value: ""}, ""), //quirk to trigger selection instead of auto-assign of default value.
        composer.vm.list.map(function(question){
          return composer.vm.questionAttributes[question].type()=="fields" ? m("option", {key: question, value:question}, composer.vm.questionAttributes[question].text()) : ''
        })
      ]),
      vvm.question() !="" ? m("select", {onchange: m.withAttr("value", args.conditionalValue.linkValue), value: args.conditionalValue.linkValue()}, [
        m("option", {value: ""}, ""),
        composer.vm.fieldsLookup[vvm.question()].map(function(field){
          return m("option", {value:field.id()}, field.label())
        })
      ]) : ''
    ])
  }
}


var LibRuleConstructor = {
  view: function(ctrl, args){
    return m("div", {key: args.question.id()}, [
     m("select", {onchange: m.withAttr("value", args.question.condition), value:args.question.condition()}, [
        m("option", {value:"default"}, "Default Value"),
        m("option", {value:"not"}, "Set If...")
      ]),
      args.question.condition() == "not" ? m.component(rules.nodeView, {node: library.vm.ruleTree[args.question.id()], owner: args.question.id()}) : ''
    ])
  }
}


//m.mount(document.body, library.libraryView)
