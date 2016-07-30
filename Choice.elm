module Choice exposing (Model, init, Msg, update, view, subscriptions)

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
    }


--UPDATE

type Msg
    = Change String

update : Msg -> Model -> (Model, Cmd Msg)
update msg model = 
    case msg of
        Change newText->
           ({model | text = newText}, Cmd.none)
            


--VIEW

view : Model -> Html Msg
view model = 
    div [class "container"]
    [
     input [value model.text, onInput Change][]    
    ]
    
--SUBSCRIPTIONS
subscriptions : Model -> Sub Msg
subscriptions model =
  Sub.none

--INIT
init : (Model, Cmd Msg)
init = 
    (Model "", Cmd.none)