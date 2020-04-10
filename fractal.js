
const $ = _ => document.querySelector(_)

const $c = _ => document.createElement(_)

const URL = window.URL || window.webkitURL

let id = 0, previewID = 0, selected = {}

const population = Array(9)

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
	],
	[
		0.1400,0.0100,0.0000,0.5100,-0.0800,-1.3100,0.1,
		0.4300,0.5200,-0.4500,0.5000,1.4900,-0.7500,0.15,
		0.4500,-0.4900,0.4700,0.4700,-1.6200,-0.7400,0.15,
		0.4900,0.0000,0.0000,0.5100,0.0200,1.6200,0.6
	]
]

const createCanvasContext = (w,h,population = true) => {
	const canvas = $c("canvas")
	canvas.width = w
	canvas.height = h
	if(population){
		canvas.id = id++
		canvas.onclick = () => { 
			if( canvas.id in selected ){
				delete selected[canvas.id]
				canvas.style.border = "solid 1px black"
			}else{
				selected[canvas.id] = true
				canvas.style.border = "solid 2px red"
			}
		}
	}else{
		canvas.id = previewID++
		canvas.onclick = () => showPreview(canvas.id)
	}
	const c = canvas.getContext("2d")
	c.translate(w/2, h)
	return c
}

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
	iterate(10000,rules,c,60)
	return child
}

const iterate = (points, rules, c, zoom) => {
	let sum = 0
	for(let i = 0; i < rules.length; i++)
		sum += rules[i].w
	let x = Math.random()
	let y = Math.random()
	c.clearRect(-c.canvas.width/2,-c.canvas.height,c.canvas.width,c.canvas.height)
  for(let i = 0; i < points; i++){
    const rule = getRule(sum)
    x = x * rule.a + y * rule.b + rule.tx
    y = x * rule.c + y * rule.d + rule.ty
    c.fillRect(x * zoom, -y * zoom, 1, 1)
  }
}

const getRule = sum => {
  let rand = Math.random() * sum;
  for(let i = 0; i < rules.length; i++){
    const rule = rules[i]
    if(rand < rule.w)
      return rule
    rand -= rule.w
  }
}

const createPreview = arr => {
	const rules = arrayToRule( arr )
	const c = createCanvasContext((innerWidth*0.7)/3*0.5,(innerHeight*0.98)/3*0.5,false)
	iterate(500,rules,c,15)
	return c
}

const showPreview = id => {
	const canvas = $c('canvas')
	canvas.width = innerWidth * 0.8
	canvas.height = innerHeight * 0.8
	const ctx = canvas.getContext('2d')
	ctx.translate(canvas.width/2, canvas.height)
	const rules = arrayToRule(parents[id])
	
	const bg = $c('div')
	bg.id = "bg"
	const window = $c('div')
	window.id = "window"
	const toolbar = $c('div')
	toolbar.id = "toolbar"
	const close = $c('button')
	close.innerText = "close"
	close.onclick = () => bg.remove()
	const zoom = $c('input')
	zoom.type = "number"
	zoom.value = 100
	const zoomLabel = $c('label')
	zoomLabel.innerText = "zoom:"
	const points = $c('input')
	points.type = "number"
	points.value = "100000"
	const pointsLabel = $c('label')
	pointsLabel.innerText = "points:"
	const render = $c('button')
	render.innerText = "render"
	render.onclick = () => {
		ctx.clearRect( -canvas.width/2, -canvas.height, canvas.width, canvas.height )
		iterate( points.value, rules, ctx, zoom.value )
	}
	const png = $c('button')
	png.innerText = "PNG"
	png.onclick = () => {
		canvas.toBlob( blob => {
			const link = document.createElement('a')
			link.href = URL.createObjectURL(blob)
			link.download = 'fractal.png'
			link.click()
		})
	}
	const json = $c('button')
	json.innerText = "JSON"
	json.onclick = () => {
		let blob = new Blob([JSON.stringify(rules)], {type: 'text/json'})
		let link = $c('a')
		link.href = URL.createObjectURL(blob)
		link.download = 'fractal.json'
		link.click()
	}
	toolbar.appendChild( pointsLabel )
	toolbar.appendChild( points )
	toolbar.appendChild( zoomLabel )
	toolbar.appendChild( zoom )
	toolbar.appendChild( render )
	toolbar.appendChild( png )
	toolbar.appendChild( json )
	toolbar.appendChild( close )
	window.appendChild( toolbar )
	window.appendChild( canvas )
	iterate( 10000, rules, ctx, 100)
	bg.appendChild( window )
	document.body.appendChild( bg )
}

for(i = 0; i < parents.length; i++)
	$('#parents').appendChild(createPreview(parents[i]).canvas)

for(let i = 0; i < 9; i++)
	population[i] = refresh()

$('#evolve').onclick = e => {
	selected = Object.keys(selected)
	if(selected){
		for(s of selected){
			parents.push( population[s] )
			$('#parents').appendChild(createPreview(population[s]).canvas)
		}
	}
	$('#area').innerHTML = ""
	id = 0
	for(let i = 0; i < 9; i++)
		population[i] = refresh()
	selected = {}
}

$('#save').onclick = e => {
	let blob = new Blob([JSON.stringify(parents)], {type: 'text/json'})
	let link = document.createElement('a')
	link.href = URL.createObjectURL(blob)
	link.download = 'fractals.json'
	link.click()
}
