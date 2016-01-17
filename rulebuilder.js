rules ={}
//r memory is DOM Triggered
//viewmodel for actual node properties
//viewmodel for children of Node

//viewmodel = Array


//models & view models
rules.Node = function(data){
  this.id = m.prop(data.id)
  this.type = m.prop(data.type)
}

rules.operators = ["present", "blank", "equalTo", "notEqualTo", "greaterThan", "greaterThanEqual", "lessThan", "lessThanEqual", "includes", "matchesRegex"]

rules.conditionalNode = viewModelMap({
  condition: m.prop("any")
})

rules.ruleNode = viewModelMap({
  name: m.prop(""),
  operator: m.prop("equalTo"),
  value: m.prop(""),
  question: m.prop(""),
  choice: m.prop(""),
})

rules.qMeta = viewModelMap({
  type: m.prop("choices")
})

rules.ChildNodeList = Array
rules.ChildrenNodes = Object

rules.vm = (function(){
  vm = {}
  vm.init = function(){
    vm.childList = new rules.ChildrenNodes;
    vm.addChild = function(args){
      //console.log(args.parent)
      var uid = uuid(0,0)
      vm.childList[uid]=new rules.ChildNodeList
      vm.childList[args.parent].push(new rules.Node({id: uid, type: args.type}))
    }

    vm.addCore = function(args){
      var uid = uuid(0,0)
      vm.childList[uid] = new rules.ChildNodeList
      return new rules.Node({id:uid, type: "conditional"})
    }
  }

  return vm
}())

rules.ruleView = {
  view: function(ctrl, args){
    var rvm = rules.ruleNode(args.node.id())
    return m("div", {key: args.node.id()},
    [
      m("select", {key: args.node.id(), onchange: m.withAttr("value", rvm.question), value: rvm.question()}, [
        m("option", {value: ""}, ""), //quirk to trigger selection instead of auto-assign of default value.
        composer.vm.list.map(function(question){
          return args.owner != question ? m("option", {key: question, value:question}, composer.vm.questionAttributes[question].text()) : ''
        })
      ]),
    //ideally this would be more modular, but mithril's component feature has problems rendering element lists in a ternary statement like this.
    //better to use an object map in the future, like with composer.subView
      rvm.question()!="" ? (
        (composer.vm.questionAttributes[rvm.question()].type() == "choices") ?
        [
          " is ",
          m("select", {onchange: m.withAttr("value", rvm.choice), value: rvm.choice()}, [
            m("option", {value:""}, ""), //kludge to force the user to select an item (and therefore set a value)
            composer.vm.choicesLookup[rvm.question()].map(function(choice){
              return m("option", {value:choice.id()}, choice.text())
            })
          ])
        ] :
        [
          m("select", {onchange: m.withAttr("value", rvm.choice), value: rvm.choice()}, [
            m("option", {value:""}, ""), //kludge to force the user to select an item (and therefore set a value)
            composer.vm.fieldsLookup[rvm.question()].map(function(field){
              return m("option", {value:field.id()}, field.label())
            })
          ]), m("span","is"),
          m("select", {onchange: m.withAttr("value", rvm.operator), value: rvm.operator()},[
            m("option", {value:""}, ""),
            rules.operators.map(function(operator){
              return m("option", {value: operator}, operator)
            })
          ]),
          (rvm.operator() != "present" && rvm.operator() != "blank") ? m("input", {onchange: m.withAttr("value", rvm.value), value:rvm.value()}) : ''
        ]
      ) : '',
      m("a", {class: "remove", onclick: composer.vm.remove.bind(this, rules.vm.childList[args.parentNode], args.node)}, "x")
    ])
  }
}


rules.nodeView = {
  controller: function(args){

  },
  view: function(ctrl, args){
    return m("div", [
      //args.node.id(),
      [args.node.type() == "conditional" ? m.component(rules.conditionalView, args) : m.component(rules.ruleView, args)]
      /*[args.node.type() == "conditional" ? m("button", {onclick: rules.vm.addChild.bind(vm, {type:"rule", parent: args.node.id()})}, "Add Rule") : ''],
      [args.node.type() == "conditional" ? m("button", {onclick: rules.vm.addChild.bind(vm, {type:"conditional", parent: args.node.id()})}, "Add Sub-Condition") : ''],
      rules.vm.childList[args.node.id()].map(function(child){
        return m.component(rules.nodeView, {node:child})
      }),*/

    ])
  }
}

rules.conditionalView = {
  view: function(ctrl, args){
    var cvm = rules.conditionalNode(args.node.id())

    return m(".container",
    m("select", {key: args.node.id(), onchange: m.withAttr("value", cvm.condition), value: cvm.condition()}, [
      m("option", {value:"any"}, "Any of the following are true"),
      m("option", {value:"all"}, "All of the following are true"),
      m("option", {value:"none"}, "None of the following are true"),
    ]),
    m("button", {onclick: rules.vm.addChild.bind(vm, {type:"rule", parent: args.node.id()})}, "Add Rule"),
    m("button", {onclick: rules.vm.addChild.bind(vm, {type:"conditional", parent: args.node.id()})}, "Add Sub-Condition"),
    args.parentNode ? m("a", {class: "remove", onclick: composer.vm.remove.bind(this, rules.vm.childList[args.parentNode], args.node)}, "x") : '',
    rules.vm.childList[args.node.id()].map(function(child){
      return m.component(rules.nodeView, {node:child, owner:args.owner, parentNode: args.node.id()})
    }))
  }
}

/*rules.startView = {
  controller: function(args){
    rules.vm.init();
  },
  view: function(args){
    return m.component(rules.nodeView, {node: rules.vm.initial})
  }
}



//renderChildren

//nodeHandler


m.mount(document.body, rules.startView)*/
