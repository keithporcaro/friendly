import Dict exposing (..)
-- MODEL


type Tree =
    Empty
    | Node

type Node = 
     Conditional Condition 
    | Rule Operator
    
type Condition
    = Any (Dict Int Node)
    | All (Dict Int Node)
    | None (Dict Int Node)

type Operator
    = Equal Float Float
    | NotEqual Float Float
    | GreaterThan Float Float
    | LessThan Float Float
    | GreaterThanEqual Float Float
    | LessThanEqual Float Float


processOperator : Operator -> Bool
processOperator operator = 
    case operator of
    Equal x y ->
        x == y
    NotEqual x y ->
        x /= y
    GreaterThan x y ->
        x > y
    LessThan x y ->
        x < y
    GreaterThanEqual x y ->
        x >= y
    LessThanEqual x y ->
        x <= y
 
processCondition : Condition -> Bool
processCondition condition =
    case condition of
    Any nodes ->
        List.any process (Dict.values nodes)
    All nodes ->
        List.all process (Dict.values nodes)
    None nodes ->
        not(List.any process (Dict.values nodes))
 
process : Node -> Bool
process node =
    case node of
        Conditional condition-> 
            processCondition condition
        Rule operator->
            processOperator operator
 



-- UPDATE

-- VIEW

-- SUBSCRIPTIONS

-- INIT