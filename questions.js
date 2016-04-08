composer = {}

composer.questions = []

composer.Question = function(data){
  this.text = m.prop(data.text);
  this.type = m.prop("choices");
  this.maxAnswers = m.prop(false);
  this.choices = m.prop(data.choices);
  this.showIf = m.prop("true");
  this.id = m.prop(data.id)
  this.rules = m.prop(data.rules)
}

composer.Choice = function(data){
  this.text = m.prop(data.text);
  this.id = m.prop(data.id);
  this.showIf = m.prop("true");
}

composer.Field = function(data){
  this.type = m.prop(data.type);
  this.label = m.prop(data.label);
  this.id = m.prop(data.id);
  this.showIf = m.prop("true")
}

composer.ruleNode = function(data){
  this.name = m.prop(data.name);
  this.operator = m.prop(data.operator);
  this.value = m.prop(value);
}

composer.conditionalNode = function(data){
  this.key = m.prop(data.key)
  this.contains = m.prop(data.contains)
  this.id=m.prop(data.id)
}



composer.QuestionList = Array;
composer.QuestionAttribute = Object

composer.ChoiceList = Array;
composer.ChoicesLookup = Object;

composer.FieldList = Array;
composer.FieldLookup = Object;
//This could be merged into Choices, but I think separation of concerns makes more sense.

composer.RulesTreeList = Object;

//view helper to cut a ternary statement in the choice/field lookup
composer.subView = Object;

composer.vm = (function() {
    var vm = {}
    vm.init = function() {
        //a running list of questions
        vm.list = new composer.QuestionList();
        vm.choicesLookup = new composer.ChoicesLookup();
        vm.ruleTree = new composer.RulesTreeList();
        vm.fieldsLookup = new composer.FieldLookup()
        vm.questionAttributes = new composer.QuestionAttribute();

        vm.remove = function(list, item){
          list.splice(list.indexOf(item),1);
          //remove questionAttributes
        }

        vm.addChoice = function(args){
          id = uuid(0,0);
          vm.choicesLookup[args.parent].push(new composer.Choice({text:"", id:id}));
        }

        vm.addField = function(args){
          id = uuid(0,0)
          vm.fieldsLookup[args.parent].push(new composer.Field({label: "", type: "shortText", id: id}))
        }

        vm.add = function(){
          var uid = uuid(0,0)
          vm.choicesLookup[uid] = new composer.ChoiceList()
          vm.fieldsLookup[uid] = new composer.FieldList()
          vm.ruleTree[uid] = rules.vm.addCore(uid)

          vm.list.push(uid)
          vm.questionAttributes[uid] = new composer.Question({text: "", id: uid})
          //vm.addChoice({parent: uid});
        }

        vm.add();

    }
    return vm
}())


composer.composerView = {
  controller: function(){

  },
  view: function(ctrl, args){
    return m(".container",[
      m("h1", "Friendly Builder"),
      m("a[href='/library']", {config: m.route}, "Go to Library"),
      m("br"),
      m("a[href='/doc']", {config: m.route}, "Go to Doc"),
      m("br"),
      m("a[href='/imex']", {config: m.route}, "Export"),
      m("br"),
      m("button", {onclick: composer.vm.add}, "Add Question"),
      //m("button", {onclick: packager({questionList: composer.vm.list, choiceList: composer.vm.choicesLookup, ruleTree: composer.vm.ruleTree})}, "Export"),
      composer.vm.list.map(function(question){
        return m.component(composer.questionConstructor, {question: composer.vm.questionAttributes[question]})
      })
  ])
  }
}

composer.questionConstructor = {
  controller: function(args){

  },
  view: function(ctrl, args){
    return m(".question", {key: args.question.id()}, [
      m("label", "Question Text:"),
      m("input", {onchange: m.withAttr("value", args.question.text), value: args.question.text(), class:"question"}),
      m("label", "Question Type:"),
      m("select", {onchange: m.withAttr("value", args.question.type), value:args.question.type()}, [
        m("option", {value:"choices"}, "Multiple Choice"),
        m("option", {value:"fields"}, "Text Fields")
      ]),
      m.component(composer.subView[args.question.type()], {parent: args.question.id()}),

      m.component(RuleConstructor, {question: args.question}),
      m("button", {onclick: composer.vm.remove.bind(this, composer.vm.list, args.question.id())}, "Remove")
    ])
  }
}




composer.subView["choices"] = {
  controller: function(args){

  },
  view: function(ctrl, args){
    return m("div",[
      m("label", "Choices:"),
      composer.vm.choicesLookup[args.parent].map(function(choice){
        return [m("input", {onchange:m.withAttr("value", choice.text), value: choice.text(), key: choice.id()}),
      //  m.component(dummyRuleConstructor),
        m("a", {class: "remove", onclick: composer.vm.remove.bind(this, composer.vm.choicesLookup[args.parent], choice)}, "x"),
        m("br")
        ]
      }),
      m("button", {onclick: composer.vm.addChoice.bind(vm, {parent: args.parent})}, "Add Choice"),
    ])
  }
}

composer.subView["fields"] = {
  controller: function(args){

  },
  view: function(ctrl, args){
    return m("div",[
      m("label", "Fields:"),
      composer.vm.fieldsLookup[args.parent].map(function(field){
        return [m("input", {onchange:m.withAttr("value", field.label), value: field.label(), placeholder: "Label",key: field.id()}),
        m("select", {onchange: m.withAttr("value", field.type), value:field.type()}, [
          m("option", {value:"shortText"}, "Short Answer"),
          m("option", {value:"longText"}, "Long Answer"),
          m("option", {value:"number"}, "Number"),
        //  m("option", {value:"date"}, "Date"),
        //  m("option", {value:"time"}, "Time"),
        ]),
        m("a", {class: "remove", onclick: composer.vm.remove.bind(this, composer.vm.fieldsLookup[args.parent], field)}, "x"),
        m("br")
        ]
      }),
      m("button", {onclick: composer.vm.addField.bind(vm, {parent: args.parent})}, "Add Field"),
    ])
  }
};

var RuleConstructor = {
  view: function(ctrl, args){
    return m("div", {key: args.question.id()}, [
      m("select", {onchange: m.withAttr("value", args.question.showIf), disabled: (composer.vm.list.length == 1), value:args.question.showIf()}, [
        m("option", {value:"true"}, "Always Show"),
        m("option", {value:"false"}, "Show If...")
      ]),
       args.question.showIf() == "false" ? m.component(rules.nodeView, {node: composer.vm.ruleTree[args.question.id()], owner: args.question.id()}) : ''
    ])
  }
}

var dummyRuleConstructor = {
  view: function(ctrl, args){
    return m("span", "hi")
  }
}
