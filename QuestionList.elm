import Question
import Html exposing (..)
import Html.App as Html
import Html.Attributes exposing (..)
import Html.Events exposing (..)


main =
  Html.program
    { init = init
    , view = view
    , update = update
    , subscriptions = subscriptions
    }

--MODEL

type alias QuestionList = 
    { questions : List Question
    , uid: Int
    }

type alias Question =  
   { id : Int
   , model : Question.Model
   }


--UPDATE

type Msg
    =  AddQuestion
    | Remove Int
    | SubMsg Int Question.Msg
update : Msg -> QuestionList -> (QuestionList, Cmd Msg)
update msg model = 
    case msg of
        AddQuestion ->
             let
                id =
                model.uid

                (newQuestion, cmds) =
                Question.init

                newQuestionList =
                model.questions ++ [Question id newQuestion]
             in
                ( {model | questions = newQuestionList, uid= id + 1}
                , Cmd.map (SubMsg id) cmds
                )
        
        Remove id->
            ( ({model | questions = List.filter (removeHelp id) model.questions}), Cmd.none )
            
            
        SubMsg id subMsg ->
        let
            (newQuestions, cmds) =
            List.unzip (List.map (updateHelp id subMsg) model.questions)
        in
            ( { model | questions = newQuestions }
            , Cmd.batch cmds
            )

removeHelp : Int -> Question -> Bool
removeHelp id question =
    question.id /= id

updateHelp : Int -> Question.Msg -> Question -> ( Question, Cmd Msg )
updateHelp id msg question =
  if question.id /= id then
    ( question, Cmd.none )

  else
    let
      ( newQuestion, cmds ) =
        Question.update msg question.model
    in
      ( Question id newQuestion
      , Cmd.map (SubMsg id) cmds
      )



--VIEW

view : QuestionList -> Html Msg
view model = 
    div [class "container"]
    [
     button [ onClick AddQuestion ] [ text "Add Question" ]
     , div
        [ style [ ("display", "flex"), ("flex-wrap", "wrap") ]
        ]
        (List.map viewQuestion model.questions),
        select[] (List.map dropQuestions model.questions)
    ]


viewQuestion : Question -> Html Msg
viewQuestion {id, model} =
    let 
        remove =  
            button [ onClick (Remove id) ] [ text "Remove" ]
        question = 
            Html.map (SubMsg id) (Question.view model)
    in
        div [][question, remove]

dropQuestions : Question -> Html Msg
dropQuestions {id, model} =
    option [][text model.text] 
    
--SUBSCRIPTIONS
subscriptions : QuestionList -> Sub Msg
subscriptions model =
  Sub.batch (List.map subHelp model.questions)


subHelp : Question -> Sub Msg
subHelp {id, model} =
  Sub.map (SubMsg id) (Question.subscriptions model)

--INIT
init : (QuestionList, Cmd Msg)
init = 
    (QuestionList [] 0, Cmd.none)