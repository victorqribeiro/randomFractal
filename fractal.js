
const $ = _ => document.querySelector(_)

let id = 0, selected = {}

const createCanvasContext = (w,h,event = true) => {
	const canvas = document.createElement("canvas")
	canvas.id = id++
	canvas.width = w
	canvas.height = h
	if(event){
		canvas.onclick = () => { 
			if( canvas.id in selected ){
				delete selected[canvas.id]
				canvas.style.border = "solid 1px black"
			}else{
				selected[canvas.id] = true
				canvas.style.border = "solid 2px red"
			}
		}
	}
	const c = canvas.getContext("2d")
	c.translate(w/2, h)
	return c
}

const keys = ['a', 'b', 'c', 'd', 'tx', 'ty', 'w']

const parents = [
	[
	0.85,0.04,-0.04,0.85,0,1.6,0.85,
	-0.15,0.28,0.26,0.24,0,0.44,0.07,
	0.2,-0.26,0.23,0.22,0,1.6,0.07,
	0,0,0,0.16,0,0,0.01
	],
	[
	0.05,0,0,0.6,0,0,0.17,
	0.05,0,0,-0.5,0,1,0.17,
	0.46,-0.321,0.386,0.383,0,0.6,0.17,
	0.47,-0.154,0.171,0.423,0,1.1,0.17,
	0.433,0.275,-0.25,0.476,0,1,0.16,            	
	0.421,0.257,-0.353,0.306,0,0.7,0.16
	]
]

const crossover = (a,b) => {
	const child = Array( Math.random() > 0.5 ? a.length : b.length ).fill(0)
	for(let i = 0; i < child.length; i++)
		child[i] = Math.random() > 0.5 ? a[i%a.length] : b[i%b.length]
	return child
}

const arrayToRule = arr => {
	rules = Array( arr.length/keys.length ).fill().map( _ => { return {} } )
	for(let i = 0; i < arr.length; i++)
		rules[Math.floor( i / keys.length )][keys[i % keys.length]] = arr[i]
	return rules
}

const refresh = () => {
	const c = createCanvasContext((innerWidth*0.7)/3,(innerHeight*0.98)/3)
	$('#area').appendChild( c.canvas )
	const parentA = Math.floor(Math.random() * parents.length)
	let parentB = Math.floor(Math.random() * parents.length)
	while( parentB == parentA )
		parentB = Math.floor(Math.random() * parents.length)
	const child = crossover( parents[parentA], parents[parentB] )
	rules = arrayToRule( child )
	iterate(10000,rules,c,100)
	return child
}

const iterate = (points, rules,c,zoom) => {
	let sum = 0
	for(let i = 0; i < rules.length; i++)
		sum += rules[i].w
	let x = Math.random()
	let y = Math.random()
	c.clearRect(-c.canvas.width/2,-c.canvas.height,c.canvas.width,c.canvas.height)
  for(let i = 0; i < points; i++){
    let rule = getRule(sum)
    x = x * rule.a + y * rule.b + rule.tx
    y = x * rule.c + y * rule.d + rule.ty
    c.fillRect(x * zoom, -y * zoom, 1, 1)
  }
}

const getRule = sum => {
  let rand = Math.random() * sum;
  for(let i = 0; i < rules.length; i++){
    let rule = rules[i]
    if(rand < rule.w){
      return rule
    }
    rand -= rule.w
  }
}

const previewParents = () => {
	for(i = 0; i < parents.length; i++){
		const rules = arrayToRule( parents[i] )
		const c = createCanvasContext((innerWidth*0.7)/3*0.5,(innerHeight*0.98)/3*0.5,false)
		iterate(500,rules,c,10)
		$('#parents').appendChild(c.canvas)
	}
}

const population = Array(9)
for(let i = 0; i < 9; i++)
	population[i] = refresh()

previewParents()

$('#evolve').onclick = e => {
	for(s of Object.keys(selected))
		parents.push( population[s] )
	$('#area').innerHTML = ""
	id = 0
	for(let i = 0; i < 9; i++)
		population[i] = refresh()
	$('#parents').innerHTML = ""
	previewParents()
	selected = {}
}

$('#save').onclick = e => {
	const URL = window.URL || window.webkitURL
	let blob = new Blob([JSON.stringify(parents)], {type: 'text/json'})
	let link = document.createElement('a')
	link.href = URL.createObjectURL(blob)
	link.download = 'fractals.json'
	link.click()
}
