class Star {
    constructor(pos) {
        this.pos = pos
        this.sz = Math.trunc(Math.random()*5)
    }
}

let baseNoiseScale = 3

window.aspectRatio = 1

let imgSuffix = 0

let recording = false

let mountainColor

let moonImage

let foreground

function preload() {
    moonImage = loadImage('moon.png')
}

let mainCanvas

let mountains = []

function addMountain(m) {
    mountains.push(m)
    m.resolution /= 3

    for (let i = 0; i < mountains.length; i++) {
        mountains[i].stepSpeed = map(i, 0, mountains.length, .1, 1)
    }
}

function setup() {
    mainCanvas = createCanvas(innerWidth, innerHeight)
    aspectRatio = innerWidth/innerHeight

    addMountain(new MountainRow(.5, .9))
    addMountain(new MountainRow(.3, .6))

    addMountain(new MountainRow(.4, .8))
    addMountain(new MountainRow(.2, .7))

    addMountain(new MountainRow(.4, .8))
    addMountain(new MountainRow(.2, .7))

    const tallerPeaks = new MountainRow(.3, .6)
    tallerPeaks.noises = [
        x=>(Math.sin(x) + noise(x)*.5) - (.5*.5)
    ]
    addMountain(tallerPeaks)

    addMountain(new MountainRow(.3, .7))

    foreground = new MountainRow(.2, .4)
    addMountain(foreground)

    mountainColor = color(40, 70, 150)

    addMountain(new MountainRow(.1, .3))
    addMountain(new MountainRow(.01, .2))

    let moonCanvas = createGraphics(width/4, width/4)
    generateMoon(moonCanvas)
    moonImage = moonCanvas

    generateStars()

    // noLoop()
}

const skySpeed = .2

const baseMoonHeight = 250

let currentMoonX = 200
let moonHeight = baseMoonHeight + ((Math.random()*80)-40)

function generateMoon(c) {
    const glowColor = color('#d9d4eb')
    glowColor.setAlpha(1) //color(250, 230, 245, 0)
    c.noStroke()

    const center = createVector(c.width/2, c.height/2)
    c.fill(0, 80)
    drawRadial(c, center, 100, c.width, 10)
    
    c.imageMode(CENTER)
    c.image(moonImage, center.x, center.y, 100, 100)
    c.filter(BLUR, 4)

    c.fill(glowColor, 1)
    drawRadial(c, center, 100, c.width, 3)
}

const starCount = 400

let stars = []

function generateStars() {
    for (let i = 0; i < starCount; i++) {
        stars.push(new Star(
            createVector(
                Math.trunc(Math.random()*width),
                Math.trunc(Math.random()*3*height/4)
            )
        ))
    }
}

function drawSky() {
    push()
    stroke(255, 200)
    for(let s of stars) {
        strokeWeight(s.sz)
        point(s.pos.x, s.pos.y)
        s.pos.x -= skySpeed*.8
    }

    stars = stars.filter(x=>x.pos.x > 0)

    for (let i = 0; i < starCount-stars.length; i++) {
        stars.push(new Star(
            createVector(
                width,
                Math.trunc(Math.random()*3*height/4)
            )
        ))
    }

    drawMoon()
    pop()
}

function drawMoon() {
    push()
    const moonPos = createVector(width-currentMoonX, moonHeight)

    imageMode(CENTER)
    image(moonImage, moonPos.x, moonPos.y, moonImage.width, moonImage.height)
    currentMoonX+=skySpeed
    if (currentMoonX > width+100) {
        moonHeight = baseMoonHeight + ((Math.random()*80)-40)
        currentMoonX = -200
    }

    pop()
}

function drawCar(pos) {
    push()
    const carColor = color(75, 43, 83)
    const lightsColor = color(228, 191, 135)
    const wheelSize = 40
    const carLength = 120
    
    pos = constrain(pos, 0, width-carLength)
    
    let ball = createVector(pos, foreground.groundLevelFor(pos)*height - wheelSize/2)
    let ball2 = createVector(pos+carLength, foreground.groundLevelFor(pos+carLength)*height - wheelSize/2)

    stroke(0)
    
    noStroke()
    fill(lerpColor(carColor, color(0), .1))
    circle(ball.x, ball.y, wheelSize)
    circle(ball2.x, ball2.y, wheelSize)

    difference = p5.Vector.sub(ball2, ball)
    // direction = difference.copy().normalize()
    translate(ball.x, ball.y)
    rotate(difference.heading())

    const padding = .2

    const carHeight = 100

    fill(carColor)
    rect(-carLength*padding, 0, carLength * (1+padding), -carHeight, 30)
    rect(carLength*(1-padding-.5), 0, carLength*padding*5, -carHeight*.5, 30)

    fill(lerpColor(carColor, color(220), .2))
    rect(carLength*.55, -carHeight*.85, carLength*.3, carHeight*.3, carLength*.1)

    const lightsOrigin = createVector(carLength*(1+padding), -carHeight*.25)
    fill(lightsColor)
    ellipse(lightsOrigin.x, lightsOrigin.y, carLength*.1, carHeight*.3)

    const lightsLength = 400
    lightsColor.setAlpha(80)
    fill(lightsColor)
    const lightsArc = createVector(
        lightsOrigin.x+lightsLength, lightsOrigin.y
    )
    quad(
        lightsOrigin.x, lightsOrigin.y*(1+padding*3), lightsOrigin.x, lightsOrigin.y*(1-padding*3),
        lightsOrigin.x+lightsLength, lightsOrigin.y*(1-padding*20), lightsOrigin.x + lightsLength, lightsOrigin.y*(1+padding*20)
    )

    arc(lightsArc.x, lightsArc.y, lightsOrigin.y*(1+padding*35), lightsOrigin.y*(1+padding*35), -HALF_PI, HALF_PI)
    pop()
}

function draw() {
    background(0)

    drawSky()

    mountains.forEach((m, i) =>{
        const normalI = (i+1)/mountains.length
        m.update(normalI+.1)
    })
    let fadedMountain = color(21, 31, 59)

    mountains.forEach((m, i) => {
        const normalI = (i+1)/mountains.length
        fill(lerpColor(fadedMountain, mountainColor, normalI))
        if (m === foreground)
            drawCar(2*width/5 + sin(frameCount/200)*width/4)
        m.render(true)
        m.render()
    })

    // drawDebugLines()
}

function drawRadial(c, pos, minRad, maxRad, qual = 1) {
    c.push()
    const diff = maxRad - minRad
    for(let i = maxRad; i >= minRad; i-=qual) {
        c.ellipse(pos.x, pos.y, i, i)
    }
    c.pop()
}

function drawDebugLines() {
    push()
    fill(0)
    const lineCount = 9
    const lineStep = height/(lineCount+1)
    for(let i = 0; i < (lineCount+1); i++) {
        noStroke()
        text(Math.round(10-(lineStep*i/height)*10)/10, 0, lineStep*i)
        stroke(0)
        line(0, lineStep*i, width, lineStep*i)
    }
    pop()
}


function windowResized() {
    resizeCanvas(innerWidth, innerHeight)
    aspectRatio = innerWidth/innerHeight

    for (let m of mountains) {
        m.noiseScale = 4 * aspectRatio
    }

    stars = []
    generateStars()
}