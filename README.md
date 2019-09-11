[![File Size](https://img.shields.io/github/size/32teeth/hud-gamepad/index.js?style=for-the-badge)]()
[![npm](https://img.shields.io/npm/dw/hud-gamepad?logo=npm&style=for-the-badge)]()
[![GitHub stars](https://img.shields.io/github/stars/32teeth/hud-gamepad?label=love&logo=github&style=for-the-badge)]()

# GamePad
> So you want to add a gamepad to a html5/canvas based app in [html5](http://html5.apache.org/)

```npm i html5-plugin-canvas-gamepad```

###GamePad setup and configurations
>In your html file add *GamePad.setup()*

```javascript
/*
** this is a basic joystick and 1 button setup with start and select buttons
*/
onDeviceReady: function() {
  GamePad.setup();
}
```

## Configuration options

*GamePad is fully customizable, from button names, colors, layout and more.*

| property | type    | value(s)                                                   | description                                                | example                                                      |
| -------: | :------ | :--------------------------------------------------------- | :--------------------------------------------------------- | :----------------------------------------------------------- |
|    debug | boolean | true\|false                                                | show or hide event debug info *default is false*           | ```debug:false```                                            |
|    trace | boolean | true\|false                                                | show or hide gamepad trace info *default is false*         | ```trace:false```                                            |
|   canvas | string  | id of target canvas                                        | *if left out, creates a new canvas object*                 | ```canvas:"game"```                                          |
|  buttons | array   | []                                                         | collection of button objects                               | ```[{name:"x",color:"rgba(255,255,0,0.5)"}]```               |
|   button | object  | {name:string,color:hex\|rgb\|rgba}                         | properties for custom buttons                              | ```[{name:"x",color:"rgba(255,255,0,0.5)"},{name:"y",color:"rgba(255,0,255,0.5)"}]``` |
|   layout | string  | TOP_LEFT<br />TOP_RIGHT<br />BOTTOM_LEFT<br />BOTTOM_RIGHT | cardinal position of buttons *default is **BOTTOM_RIGHT*** | ```layout:"BOTTOM_RIGHT"```                                  |
|    start | boolean | true\|false                                                | display start button *default is true*                     | ```start:false```                                            |
|   select | boolean | true\|false                                                | display select button *default is false*                   | ```select:false```                                           |
| joystick | boolean | true\|false                                                | display joystick/dpad *default is false*                   | ```debug:false```                                            |
|   hidden | boolean | true\|false                                                | show or hide the gamepad *default is false*                | this can be used to *hide* the gamepad if you are doing something else on screen |

***if you are using [multikey.js](http://multikey.32teeth.org/) to extend the GamePad for keyboard access***

| property | type    | value(s)                           | description                              | example                                  |
| -------: | :------ | :--------------------------------- | :--------------------------------------- | :--------------------------------------- |
|  buttons | array   | []                                 | collection of button objects             | ```[{name:"x",color:"rgba(255,255,0,0.5)", key:"[keyboard letter]"}]``` |
|   button | object  | {name:string,color:hex\|rgb\|rgba} | properties for custom buttons            | ```[{name:"x",color:"rgba(255,255,0,0.5)", key:"w"},{name:"y",color:"rgba(255,0,255,0.5)", key:"q"}]``` |
|     hint | boolean | true\|false                        | show or hidekeyboard hint *default is false* | ```hint:true```                          |

### Config examples
> *default options*

![default options](https://raw.githubusercontent.com/32teeth/html5-plugin-canvas-gamepad/master/images/CDVGamepad-1.png)

```javascript
GamePad.setup();
```

######*one button, custom name, no start button*

![default options](https://raw.githubusercontent.com/32teeth/html5-plugin-canvas-gamepad/master/images/CDVGamepad-2.png)

```javascript
GamePad.setup({
  start:false,
  buttons:[
    {name:"jump"}
  ]
});
```

###### *two buttons, custom names, custom colors, with select button*

![default options](https://raw.githubusercontent.com/32teeth/html5-plugin-canvas-gamepad/master/images/CDVGamepad-3.png)

```javascript
GamePad.setup({
  select:true,
  buttons:[
    {name:"x",color:"rgba(255,255,0,0.5)"},
    {name:"y",color:"rgba(0,255,255,0.75)"}
  ]
});
```

###### *target canvas*

![default options](https://raw.githubusercontent.com/32teeth/html5-plugin-canvas-gamepad/master/images/CDVGamepad-4.png)

```javascript
GamePad.setup({
  canvas:"game"
});
```

###### *change layout canvas*

![default options](https://raw.githubusercontent.com/32teeth/html5-plugin-canvas-gamepad/master/images/CDVGamepad-5.png)

```javascript
GamePad.setup({
  layout:"BOTTOM_LEFT"
});
```

###### *show trace & debug info*


![default options](https://raw.githubusercontent.com/32teeth/html5-plugin-canvas-gamepad/master/images/CDVGamepad-6.png)

```javascript
GamePad.setup({
  trace:true,
  debug:true
});
```

###### *all out everything*


![default options](https://raw.githubusercontent.com/32teeth/html5-plugin-canvas-gamepad/master/images/CDVGamepad-7.png)

```javascript
GamePad.setup({
  select:true,
  trace:true,
  debug:true,
  canvas:"game",
  buttons:[
    {name:"z", color:"#17861c"},
    {name:"y", color:"rgb(134, 83, 23)"},
    {name:"x", color:"rgba(204, 0, 51, 0.5)"},
  ]
});
```

###### *hidden gamepad*

![default options](https://raw.githubusercontent.com/32teeth/html5-plugin-canvas-gamepad/master/images/CDVGamepad-8.png)

```javascript
GamePad.setup({
  hidden:true
});
```

###### *real world example*

![default options](https://raw.githubusercontent.com/32teeth/html5-plugin-canvas-gamepad/master/images/CDVGamepad-9.png)

```javascript
/*
** @description start the game
*/
game.init();
/*
** @description setup gamepad, no stick, no start, one button
*/
GamePad.setup({
  canvas:"controller",
  joystick:false,
  start:false,
  buttons:[
    {name:"jump", color:"rgba(0,0,0,0.25)"}
  ]
});
```

###### *example using key binding with [multikey.js](http://multikey.32teeth.org/)*

![default options](https://raw.githubusercontent.com/32teeth/html5-plugin-canvas-gamepad/master/images/CDVGamepad-10.png)

```javascript
GamePad.setup(
  {
    canvas:"controller",
    start:{name:"start", key:"b"},
    select:{name:"select", key:"v"},
    trace:true,
    debug:true,
    hint:true,
    buttons:[
      {name:"a", "key":"s"},
      {name:"b", "key":"a"},
      {name:"x", "key":"w"},
      {name:"y", "key":"q"}
    ]
  }
);
multikey.setup(GamePad.events, "qwasbv", true);
```
the above code is running in [this example](http://32teeth.github.io/html5-plugin-canvas-gamepad/)

### GamePad observable method
---
GamePad has an observable method that returns the current state map of the gamepad

**observe();**

```javascript
GamePad.setup()
/*
** @description the below example simply logs out the observe method return
*/
setInterval(
  function()
  {
    var map = GamePad.observe();
    console.log(new Date() + ":" + JSON.stringify(map))
  }
  ,1000
);
```


```javascript
/*
** @description additionally, you can throw it into your main loop in canvas
*/
function draw()
{
  if(GamePad)
  {
    gamepad(GamePad.observe())
  }
}
```

