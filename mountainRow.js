class MountainRow {
    constructor(minM = .4, maxM = .6, spd=1) {
        this.minGround = 1-minM
        this.maxGround = 1-maxM

        this.resolution = 30
        this.step = Math.trunc(Math.random()*1000)
        this.generalSpeed = .7
        this.stepSpeed = spd
        this.points = []

        this.pointCount = width / this.resolution

        this.noiseScale = baseNoiseScale * aspectRatio
        this.noises = [
            x=>noise(x),
            // (x)=>((Math.sin(x)+1)/2),
        ]
        this.generatePoints()
    }

    groundLevelFor(x) {
        // return this.heightAt(x *this.stepSpeed)
        let closestPoint = Math.trunc((x/width)*this.pointCount)
        return this.points[closestPoint]/height
    }

    heightAt(x) {
        let finalVal = ((this.step-x)/this.pointCount)
        this.noises.forEach(fn=>{
            finalVal = fn(finalVal * this.noiseScale)
        })
        return map(finalVal, 0, 1, this.minGround, this.maxGround)
    }

    generatePoints() {
        this.pointCount = width / this.resolution
        const newPoints = []
        for (let i = this.pointCount; i >= -1; i--) {
            newPoints.push(this.heightAt(i) * height)
        }

        this.points = newPoints
    }

    update() {
        this.generatePoints()
        this.step += this.stepSpeed * this.generalSpeed
    }

    render() {
        push()
        noStroke()
        beginShape()
        // vertex(10, height)
        vertex(0, height)
        for (let i = 0; i < this.points.length; i++) {
            const x = i * this.resolution
            const y = this.points[i]

            vertex(x, y)
        }
        vertex(width, height)
        // curveVertex(width-10, height)
        endShape(CLOSE)

        // line(0, this.minGround*height, width/2, this.middleGround*height)
        // line(width/2, this.middleGround*height, width, this.maxGround*height)
        pop()
    }
}
