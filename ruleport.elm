import Dict exposing (..)

--Model 

type alias NodeList = (Dict Int Flavor)
type alias Node =
    { id : Int
    , flavor : Flavor
    }

type Flavor
    = Rule RuleNode
    | Conditional ConditionalNode

type Operator
    = Present
    | Blank
    | EqualTo
    | NotEqualTo
    | GreaterThan
    | GreaterThanEqual
    | LessThan
    | LessThanEqual

type Condition
    = Any
    | All
    | None
 
type alias ConditionalNode = 
    { condition : Condition
    , children : List Int
    }

type alias RuleNode =
    { lefthand : String
    , operator : Operator
    , righthand : String
    }


process : Dict -> Int -> Bool
process node =
    case node.flavor of
        Conditional conditionalNode-> 
            processCondition conditionalNode
        Rule ruleNode->
            processRuleNode ruleNode
            
 
processRuleNode : RuleNode -> Bool
processRuleNode node = 
    case node.operator of
    Present ->
        node.lefthand /= ""
    Blank ->
        node.lefthand == ""
    EqualTo ->
        node.lefthand == node.righthand
    NotEqualTo ->
        node.lefthand /= node.righthand
    GreaterThan ->
        node.lefthand > node.righthand
    LessThan ->
        node.lefthand < node.righthand
    GreaterThanEqual ->
        node.lefthand >= node.righthand
    LessThanEqual ->
        node.lefthand <= node.righthand
 
processCondition : ConditionalNode -> Bool
processCondition condition =
    case condition.condition of
    Any ->
        List.any process condition.children
    All ->
        List.all process condition.children
    None ->
        not(List.any process condition.children)
        

-- update
type Msg
    = Update Flavor
update : Msg -> Node -> (Node, Cmd Msg)
update msg node = 
    case msg of
    Update ->
        (node, Cmd.none)