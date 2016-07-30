module Question exposing (Model, init, Msg, update, view, subscriptions) 

import Choice
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

type alias Model = 
    { text : String
    , choices : List Choice
    , uid: Int
    }

type alias Choice =  
   { id : Int
   , model : Choice.Model
   }


--UPDATE

type Msg
    = Change String
    | AddChoice
    | Remove Int
    | SubMsg Int Choice.Msg
update : Msg -> Model -> (Model, Cmd Msg)
update msg model = 
    case msg of
        Change newText->
           ({model | text = newText}, Cmd.none)
        AddChoice ->
             let
                id =
                model.uid

                (newChoice, cmds) =
                Choice.init

                newChoiceList =
                model.choices ++ [Choice id newChoice]
             in
                ( Model model.text newChoiceList (id + 1)
                , Cmd.map (SubMsg id) cmds
                )
        
        Remove id->
            ( ({model | choices = List.filter (removeHelp id) model.choices}), Cmd.none )
            
            
        SubMsg id subMsg ->
        let
            (newChoices, cmds) =
            List.unzip (List.map (updateHelp id subMsg) model.choices)
        in
            ( { model | choices = newChoices }
            , Cmd.batch cmds
            )

removeHelp : Int -> Choice -> Bool
removeHelp id choice =
    choice.id /= id

updateHelp : Int -> Choice.Msg -> Choice -> ( Choice, Cmd Msg )
updateHelp id msg choice =
  if choice.id /= id then
    ( choice, Cmd.none )

  else
    let
      ( newChoice, cmds ) =
        Choice.update msg choice.model
    in
      ( Choice id newChoice
      , Cmd.map (SubMsg id) cmds
      )



--VIEW

view : Model -> Html Msg
view model = 
    div [class "container"]
    [
     input [value model.text, placeholder "Question", onInput Change][]
     , button [ onClick AddChoice ] [ text "Add Choice" ]
     , div
        [ style [ ("display", "flex"), ("flex-wrap", "wrap") ]
        ]
        (List.map viewChoice model.choices)
    ]


viewChoice : Choice -> Html Msg
viewChoice {id, model} =
    let 
        remove =  
            button [ onClick (Remove id) ] [ text "Remove" ]
        choice = 
            Html.map (SubMsg id) (Choice.view model)
    in
        div [][choice, remove]
    
--SUBSCRIPTIONS
subscriptions : Model -> Sub Msg
subscriptions model =
  Sub.batch (List.map subHelp model.choices)


subHelp : Choice -> Sub Msg
subHelp {id, model} =
  Sub.map (SubMsg id) (Choice.subscriptions model)

--INIT
init : (Model, Cmd Msg)
init = 
    (Model "" [] 0, Cmd.none)