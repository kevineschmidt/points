
const BLUE = 0
const RED = 1
const GREEN = 2
const YELLOW = 3
const LAST_COLOR = 4

const colors = []
colors[BLUE] = 'blue'
colors[RED] = 'red'
colors[GREEN] = 'green'
colors[YELLOW] = 'yellow'

const BORDER_FORCE_FRACTION = .05

const NUM_POINTS = 1000
const WIDTH= 750
const HEIGHT= WIDTH
const FORCE_RANGE = 20
const MIN_FORCE_RANGE = 5
const points = []
const forceMatrix = []

function createPoints() {
    for (let i = 0; i < NUM_POINTS; i++) {
        points[i] = {
            color: Math.floor(Math.random() * LAST_COLOR),
            pos: [Math.floor(Math.random()*WIDTH),
                Math.floor(Math.random()*HEIGHT),
            ],
            v: [0, 0],
        }
    }
}

function draw(context) {
    context.fillStyle = 'black'
    context.fillRect(0, 0, WIDTH, HEIGHT);
    points.forEach((pt) => {
        context.fillStyle = colors[pt.color];
        context.fillRect(pt.pos[0], pt.pos[1], 4, 4);
    })
}


function generateForceMatrix() {
    for (let i = 0; i < LAST_COLOR; i++) {
        forceMatrix[i] = []
        for (let j = 0; j < LAST_COLOR; j++) {
            forceMatrix[i][j] = Math.random() * 2 - 1;
        }
    }
    const table = document.createElement('table')

    document.body.appendChild(table);
    table.style.cssText = 'position: absolute; top: 0; right: 0; z-index: 1; background: white;';
    const header = document.createElement('tr')
    header.appendChild(document.createElement('th'))
    colors.forEach((color) => {
        const h = document.createElement('th')
        h.innerHTML = color
        header.appendChild(h)
    })
    table.appendChild(header);
    colors.forEach((color, idx1) => {
        tr = document.createElement('tr')
        let td = document.createElement('td')
        td.innerHTML = color
        tr.appendChild(td)
        table.appendChild(tr)
        colors.forEach((color2, idx2) => {
            td = document.createElement('td')
            td.innerHTML = forceMatrix[idx1][idx2].toFixed(3)
            tr.appendChild(td)
        })
    })
    /*
    forceMatrix[BLUE][BLUE] = 2
     forceMatrix[BLUE][RED] = 1
    forceMatrix[RED][BLUE] = -1
    forceMatrix[RED][RED] = 2
     */
}

function applyEdgeForces(deltaT) {
    const MIN_X = BORDER_FORCE_FRACTION * WIDTH
    const MIN_Y = BORDER_FORCE_FRACTION * HEIGHT

    points.forEach((pt) => {
        let xForce = 0
        let yForce = 0
        if (pt.pos[0] < MIN_X) {
            xForce = Math.sqrt((MIN_X - pt.pos[0]) * deltaT)
        } else if (pt.pos[0] > WIDTH - MIN_X) {
            xForce = -Math.sqrt((pt.pos[0] - (WIDTH - MIN_X)) * deltaT)
        }

        if (pt.pos[1] < MIN_Y) {
            yForce = Math.sqrt((MIN_Y - pt.pos[1]) * deltaT)
        } else if (pt.pos[1] > HEIGHT - MIN_Y) {
            yForce = -Math.sqrt((pt.pos[1] - (HEIGHT - MIN_Y)) * deltaT)
        }

        pt.v[0] += xForce
        pt.v[1] += yForce
    })
}

function applyPointPointForces(deltaT) {
    for (let i = 0; i < points.length; i++) {
        for (let j = i+1; j < points.length; j++) {
            const p1 = points[i]
            const p2 = points[j]
            let force1 = forceMatrix[p1.color][p2.color];
            let force2 = forceMatrix[p2.color][p1.color];

            const deltaX = p2.pos[0] - p1.pos[0]
            const deltaY = p2.pos[1] - p1.pos[1]
            if (Math.abs(deltaX) > FORCE_RANGE || Math.abs(deltaY) > FORCE_RANGE) continue
            const dist = Math.sqrt(deltaX * deltaX  + deltaY * deltaY)
            if (dist > FORCE_RANGE) continue
            if (dist === 0) continue
            if (dist < MIN_FORCE_RANGE) {
                force1 = dist - MIN_FORCE_RANGE
                force2 = dist - MIN_FORCE_RANGE
            }

            if (force1 === 0 && force2 === 0) continue


            let appliedForce = force1 * dist / FORCE_RANGE
            let vector = [appliedForce * deltaX/dist, appliedForce* deltaY/dist]
            p1.v[0] += vector[0] * deltaT
            p1.v[1] += vector[1] * deltaT

            appliedForce = force2 * dist / FORCE_RANGE
            vector = [-1 * appliedForce * deltaX/dist, -1 * appliedForce* deltaY/dist]
            p2.v[0] += vector[0] * deltaT
            p2.v[1] += vector[1] * deltaT
        }
    }

}

function applyResistanceForces(deltaT) {
    const resistance = 1 -  deltaT
    points.forEach((pt) => {
        pt.v[0] *= resistance
        pt.v[1] *= resistance
    })
}

function movePoints(deltaT) {
    points.forEach((pt) => {
        pt.pos[0] += pt.v[0] * deltaT
        pt.pos[1] += pt.v[1] * deltaT
    })
}

window.onload = () => {
    const canvas = document.querySelector('#dacanvas');
    const fps = document.querySelector('#fps')
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    createPoints()
    generateForceMatrix()
    const context = canvas.getContext('2d');
    let lastTime = performance.now();
    const render = () =>{
        const now = performance.now();
        const actualDelta = now - lastTime
        fps.innerText = (1 / (.001 * actualDelta)).toFixed( 1);
        const delta = Math.min(actualDelta, 1/30)
        lastTime = now;
        draw(context);
        applyPointPointForces(delta);
        applyPointPointForces(delta);
        applyPointPointForces(delta);
        applyPointPointForces(delta);
        applyEdgeForces(delta)
        movePoints(delta);
        applyResistanceForces(delta)
        requestAnimationFrame(render);
    }

    render()
    console.log(canvas)
}
