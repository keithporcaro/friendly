
        var viewModelMap = function(signature) {
          var map = {}
          return function(key) {
            if (!map[key]) {
                map[key] = {}
                for (var prop in signature) map[key][prop] = m.prop(signature[prop]())
            }
            return map[key]
          }
        }

        asker.dispose = function(conditions, rules){
          var disposition = false;
          if (conditions===true) {
            disposition = true;
          } //if showIf is set to true
          else {
            var engine = new RuleEngine({
              conditions: conditions,
              actions: []
            })
            disposition = engine.run(rules, [])
          }
          return disposition;
        }

        asker.buildAnswers = function(library, answers){
          var lib = {}
          Object.keys(library).map(function(id){
            lib[library[id].name] = asker.setOne(library[id], answers)
          });
          return lib
        }


        asker.setOne = function(entry, conditions){
          var answer = ""
          for(cv of entry.conditionalValues){
            if(cv.condition == "default" || asker.dispose(cv.setIf, conditions)){
    				if (cv.inputlink=="question"){
    					answer = conditions[cv.linkValue];
    				}else{
    					answer = cv.value;
    				}
              break;
            }
          }
          return answer;
        }

        asker.simpleFilter = function(object, conditions, target){
          object.map(function(item){
            if(asker.dispose(item.showIf, conditions)){
              target.push(item.content)
            }
          })
          return;
        }

        asker.assemble = function(library, answers){
        asker.vm.lib = asker.buildAnswers(library, answers)
  		  m.mount(document.body, packet);
  			asker.event = new CustomEvent('packet', {'detail': asker.vm.lib});
  			document.addEventListener('packet', function(e){packetHandler(e)}, false);
  		  document.dispatchEvent(asker.event);
        }


        asker.Interview =  viewModelMap({
          answered: m.prop(false),
          error: m.prop(""),
          choiceCount: m.prop(0)
        });

        //this helper could be improved
        asker.Answer = viewModelMap({
          chosen: m.prop(false),
          value: m.prop("")
        });
        //I'm not sure if this is optimal, since it rebuilds the condition set after each question.
        asker.builtConditions = function(questions){
          var conditionsBuilder = {};
          questions.map(function(question){
            conditionsBuilder[question.id.toString()+".answered"] = asker.Interview(question).answered().toString()
            conditionsBuilder = asker.addConditionsFrom[question.type](question, conditionsBuilder)
          });
          return conditionsBuilder;
        }

        asker.addConditionsFrom = {}
        asker.addConditionsFrom["choices"] = function(question, conditionsBuilder){
          question.choices.map(function(choice){
            conditionsBuilder[choice.id.toString()] = asker.Answer([question.id, choice.id]).chosen().toString()
          });
          return conditionsBuilder
        }
        asker.addConditionsFrom["fields"] = function(question, conditionsBuilder){
          question.fields.map(function(field){
            conditionsBuilder[field.id.toString()] = asker.Answer([question.id, field.id]).value().toString()
          });
          return conditionsBuilder
        }

        asker.vm = {
          init: function(){
            asker.vm.unansweredQuestions = asker.questions;
            asker.vm.questionHistory = [];
            asker.vm.answerObject = {};
            asker.vm.lib={};
            asker.vm.submitQuestion = function(question){
              asker.Interview(question).answered("true")
              asker.vm.questionHistory.push(question)
              asker.vm.unansweredQuestions.splice(asker.vm.unansweredQuestions.indexOf(question), 1);
              asker.vm.nextQuestion();
            }

            asker.vm.selected = function(question){
                    var selected = 0;
                    question.choices.map(function(choice){
                      if (asker.Answer([question.id, choice.id]).chosen()===true){selected++}
                    })
    				return selected
    			}
                asker.vm.isMax = function(question){
                  if (question.maxAnswers) {
                    return asker.vm.selected(question) >= question.maxAnswers ? true : false
                  } else {
                  return false
                  }
                }



            asker.vm.nextQuestion = function(){
              for (count=0; count <= asker.vm.unansweredQuestions.length; count++){
                question = asker.vm.unansweredQuestions[count];
                if (question){
                  if (asker.dispose(question.showIf, asker.builtConditions(asker.vm.questionHistory))===true){asker.vm.currentQuestion = question; break;}
                }
                else{
                  asker.vm.answerObject = asker.builtConditions(asker.vm.questionHistory);
                  asker.assemble(asker.library, asker.vm.answerObject) //route to answers template.
                }
              }
            }
            asker.vm.nextQuestion();
          }
        }

        asker.QuestionView = {
          controller: function(){
            asker.vm.init();
            return asker.vm.currentQuestion
          },
          view: function(ctrl, args){
              var ivm = asker.Interview(asker.vm.currentQuestion.id)
              return m("div",{class:"questions"}, [
                m("h2", asker.vm.currentQuestion.text),
                m.component(asker.AnswerRender[asker.vm.currentQuestion.type], args),
              m("button", {onclick:function(){asker.vm.submitQuestion(asker.vm.currentQuestion)}}, "Next Question")
            ])
            }
          }

          asker.AnswerRender = {}
          asker.AnswerRender["choices"] = {
            view: function(args){
            return  m("form",[
                asker.vm.currentQuestion.choices.map(function(choice){
                   var avm = asker.Answer([asker.vm.currentQuestion.id, choice.id])
                   return m("label", {class:"option"+ (avm.chosen() ? " selected" : "") + ((!avm.chosen() && asker.vm.isMax(asker.vm.currentQuestion)) ? " disabled" : "")}, [
                   m("input[type=checkbox]", {
                     onchange: m.withAttr("checked", avm.chosen),
                     checked: avm.chosen() || false,
                     disabled: !avm.chosen() && asker.vm.isMax(asker.vm.currentQuestion)
                     //todo: maxAnswers + disabled
                   }),
                   m("span", {class: "label-body"}, choice.text)
                   ])
                 })
                ])
            }
          }

          asker.AnswerRender["fields"] = {
            view: function(args){
              return m("form", [
                asker.vm.currentQuestion.fields.map(function(field){
                  var avm = asker.Answer([asker.vm.currentQuestion.id, field.id])
                  return m("label", [
                  m("input", {
                    onchange: m.withAttr("value", avm.value),
                    value: avm.value(),
                  }),
                  m("span", {class: "label-body"}, field.label)
                  ])
                })
              ])
            }
          }



          answerSummary = {
            controller: function(){
              return asker.vm.questionHistory
            },
            view: function(ctrl, args){
              return m(".container", {class:'answerhistory'}, [
                m("h3", "Your answers"),
                ctrl.map(function(question){
                return m("div", [
                  m("h4", question.text),
                  m("ul",[
                    question.choices.map(function(choice){
                      var avm = asker.Answer([question.id, choice.id])
                      return m("li", {class: avm.chosen() ? "chosen" : "not-chosen"}, choice.text)
                    })
                  ])
                ])
                })
              ])
            }
          };

          packet = {
            controller: function(args){
              return {lib:asker.vm.lib}
            },
            view: function(ctrl, args){
              return ///DOC TEMPLATE GETS INSERTED HERE
            }
          }
        m.mount(document.body, asker.QuestionView)
