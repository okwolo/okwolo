# Syntax

### text element

````javascript
let elem = textContent;
  // textContent: content of the textNode
````

````javascript
let elem = 'Hello World!';
  // Hello World!
````

### tag element

````javascript
let elem = [tagName, attributes, children];
  // tagName: string representing the dom tag's name
  // attributes: object containing all attributes of the element
  // children: array of child elements
````

````javascript
let elem = ['div'];
  // <div></div>

let elem = ['div', {id: 'banner'}];
  // <div id="banner"></div>

let elem = ['div', {}, ['Hello World!']];
  // <div>Hello World!</div>

let elem = ['div#banner'];
  // <div id="banner"></div>

let elem = ['div.nav'];
  // <div class="nav"></div>

let elem = ['div | height: 10px;'];
  // <div style="height: 10px;"></div>

let elem = ['div#banner.nav.hidden | font-size: 20px;'];
  // <div id="banner" class="nav hidden" style="font-size: 20px;"></div>"
````

### component element

````javascript
let elem = [component, props, children];
  // component: function which returns an element [(props) => element]
  // props: object containing all props for the component
  // children: array of child elements
````

````javascript
let component = ({children, color}) => (
    ['div', {style: `color: ${color}`}, children]
);

let elem = [component, {color: 'red'}, ['content']]
  // <div style="color: red;">content</div>
````
