import Html exposing (..)
import Html.App as Html
import Html.Attributes exposing (..)
import Html.Events exposing (..)
import Keyboard exposing (..)
import Char exposing (..)
import String exposing (..)

main =
  Html.program
    { init = init
    , view = view
    , update = update
    , subscriptions = subscriptions
    }

--MODEL

type alias Model = 
    { content : String }



--UPDATE

type Msg
    = Change Int

update : Msg -> Model -> (Model, Cmd Msg)
update msg model = 
    case msg of
        Change code->
           if code == 8
        


--VIEW

view : Model -> Html Msg
view model = 
    div [class "container"]
    [
        text model.content
    ]



    
--SUBSCRIPTIONS
subscriptions : Model -> Sub Msg
subscriptions model =
    Keyboard.presses Change



--INIT
init : (Model, Cmd Msg)
init = 
    (Model "", Cmd.none)