const canvas = document.getElementById("canvas")
canvas.width = w = innerWidth
canvas.height = h = innerHeight
const c = canvas.getContext("2d")
c.translate(w/2, h);

const keys = ['a', 'b', 'c', 'd', 'tx', 'ty', 'w']

let parentA = [
	0.85,0.04,-0.04,0.85,0,1.6,0.85,
	-0.15,0.28,0.26,0.24,0,0.44,0.07,
	0.2,-0.26,0.23,0.22,0,1.6,0.07,
	0,0,0,0.16,0,0,0.01
]

let parentB = [
	0.05,0,0,0.6,0,0,0.17,
	0.05,0,0,-0.5,0,1,0.17,
	0.46,-0.321,0.386,0.383,0,0.6,0.17,
	0.47,-0.154,0.171,0.423,0,1.1,0.17,
	0.433,0.275,-0.25,0.476,0,1,0.16,            	
	0.421,0.257,-0.353,0.306,0,0.7,0.16
]

const zoom = 100

let rules, sum, x, y

const crossover = (a,b) => {
	const child = Array( Math.random() > 0.5 ? a.length : b.length ).fill(0)
	for(let i = 0; i < child.length; i++)
		child[i] = Math.random() > 0.5 ? a[i%a.length] : b[i%b.length]
	return child
}

const refresh = () => {
	const child = crossover( parentA, parentB )
	rules = Array( child.length/keys.length ).fill().map( _ => { return {} } )
	for(let i = 0; i < child.length; i++)
		rules[Math.floor( i / keys.length )][keys[i % keys.length]] = child[i]
	sum = 0
	for(let i = 0; i < rules.length; i++)
		sum += rules[i].w
	x = Math.random()
	y = Math.random()
	iterate()
}

const iterate = () => {
	c.clearRect(-w/2,-h,w,h)
  for(let i = 0; i < 10000; i++){
    let rule = getRule()
    x = x * rule.a + y * rule.b + rule.tx
    y = x * rule.c + y * rule.d + rule.ty
    plot(x,y,zoom)
  }
}

const getRule = () => {
  let rand = Math.random() * sum;
  for(let i = 0; i < rules.length; i++){
    let rule = rules[i]
    if(rand < rule.w){
      return rule
    }
    rand -= rule.w
  }
}

const plot = (x,y,z) => c.fillRect(x * z, -y * z, 1, 1)

document.addEventListener('click', e => refresh() )

refresh()
