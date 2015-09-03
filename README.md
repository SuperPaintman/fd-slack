# Node.js class for [slack.com](https://slack.com/)

## Installation
```sh
npm install fd-slack --save
```

## Usage Example
```js
var Slack = require('fd-slack');

var slack = new Slack('aaaa-000000000000-aaaaaaaaaaaaaaaaaaaaaaaaaa'); //Your skack bot token

slack.query('chat.postMessage', {
    channel: "#general",
    text: "Hello from *Russia*",
    parse: "full"
}, function(err, data) {
    console.log("Errors: %s", err.toString() );
    console.log("Response: %s", data.toString() );
});
```

## Methods
### query(method, args, callback)
* `string` method - slack.com api method. Full methods list: [api.slack.com/methods](https://api.slack.com/methods).
* `object` args - POST data
* `callback` callback - **function(err, res)** callback агтсешщт after a request to the api

