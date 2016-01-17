#Friendly (development branch)

current version: 0.1

demo builder at http://keithporcaro.github.io/friendly

##About
Friendly is a light serverless form builder with a rules engine and document builder. It generates a javascript file that can be pasted, standalone, on any HTML page (whether or not it uses the internet). 

At the moment, it is in a **very** early build state.

##Using Friendly
###Questions
Questions can be either freeform or multiple choice. At the moment, freeform questions only offer short answer fields, although most number comparisons should work.

Rules for showing (i.e. asking) questions can be nested, and based off the answers to previous questions. At least one question needs to be set to "Always Show" (it doesn't matter which). When the packet is deployed, friendlypacket.js will keep looping through the unasked questions until it cannot (according to the rules engine logic) ask any more.

###Library
The library is made up of entries, each with a list of conditional values.

Conditional Values can be either custom-written, or pulled from a user's answer to a short answer question.

Order of conditional values DOES matter (and at the moment, cannot yet be reordered). Friendlypacket.js will go through conditional values in order UNTIL a "Set If" rule set resolves to true (or it hits the Default Value).

Entry names (which cannot have spaces) are entered into the Doc template below.

###Doc
The document is straight markdown, with library entries entered as ~entryName~. Conversion is done with marked.js and mithril template converter.

###Export
Export will accumulate everything into a javascript file, which can then be used as a standalone app on any website. 

##Using friendlypacket.js
Just paste it in the body of an empty HTML file. At the moment, the survey will target document.body.

###CSS
####Questions
Questions live in a div with class "questions". Question titles are H2s.

Fields look like this:
```
<form>
<label>
  <input><span class="label-body">{label}</span>
</label>
...
</form>
```

Choices look like this:
```
<form>
<label class="option">
<input type="checkbox">
<span class="label-body">{label}</span>
</label>
...
</form>
```

####Packet
The completed document lives in a div with class "packet". Variables sit in spans, with a class of their variable name and a prefix of "var-" (e.g. "var-name"). Everything else is converted normally from markdown.


###packetHandler()
Once an end-user has finished answering questions, a packetHandler event will fire. It can be captured with the below function, in a script tag before packet.js. e.detail is an object with the final values of the library variables, keyed to the variable names (e.g. e.detail.foo).

```
<script>
function packetHandler(e) {
    console.log(e.detail);
}
</script>
```

##What doesn't work (spoiler: lots of things)
* At the moment, it doesn't make a difference whether you select short answer, long answer, or number. User will get an <input> field either way. Eventually this will trigger <input> <textarea> and <input type=number> respectively.
* There's no validation on the form-builder side. So, if there are rules that never resolve, or variables that are improperly matched in the document, errors will result.
* Currently, this uses base64 encoded strings to build some of the unchanging components of the final packet. This is suboptimal.
* Back button doesn't work, and all data is lost on a page refresh.
* Regex is untested, and may not work.
* Yeah, needs a test suite.
* No errors fire.

##Roadmap
0.1 - Asker

To-Do:
Validation
History
LocalStorage
Import
Expose Variables
API Calls
Lists
Math
Custom element targeting
Default CSS
Replace document builder kludge (perhaps with ProseMirror?)
Visualize question flows
Single Page option
Back button
