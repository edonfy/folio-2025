import * as THREE from 'three/webgpu'
import { luminance, cos, float, min, time, atan, uniform, pass, PI, PI2, color, positionLocal, oneMinus, sin, texture, Fn, uv, vec2, vec3, vec4, mix, step, max, smoothstep, remap } from 'three/tsl'
import { Game } from '../Game.js'

const skewedUv = Fn(([ uv, skew ]) =>
{
    return vec2(
        uv.x.add(uv.y.mul(skew.x)),
        uv.y.add(uv.x.mul(skew.y))
    )
})

const twistedCylinder = Fn(([ position, parabolStrength, parabolOffset, parabolAmplitude, time ]) =>
{
    const angle = atan(position.z, position.x).toVar()
    const elevation = position.y

    // Parabol
    const radius = parabolStrength.mul(position.y.sub(parabolOffset)).pow(2).add(parabolAmplitude).toVar()

    // Turbulences
    radius.addAssign(sin(elevation.sub(time).mul(20).add(angle.mul(2))).mul(0.05))

    const twistedPosition = vec3(
        cos(angle).mul(radius),
        elevation,
        sin(angle).mul(radius)
    )

    return twistedPosition
})

export class Tornado
{
    constructor()
    {
        this.game = Game.getInstance()

        this.resolution = 20
        this.position = new THREE.Vector3()

        // Debug
        if(this.game.debug.active)
        {
            this.debugPanel = this.game.debug.panel.addFolder({
                title: '🌪️ Tornado',
                expanded: true
            })
        }

        this.setMesh()
        this.setPath()

        // Update
        this.game.ticker.events.on('tick', () =>
        {
            this.update()
        })
    }

    setMesh()
    {
        // Uniforms
        const baseColor = uniform(color('#ff544d'))
        const emissive = uniform(8)
        const timeScale = uniform(0.08)
        const parabolStrength = uniform(1.7)
        const parabolOffset = uniform(0.4)
        const parabolAmplitude = uniform(0.27)

        // Geometry
        const geometry = new THREE.CylinderGeometry(1, 1, 1, 32, 16, true)
        geometry.translate(0, 0.5, 0)

        // Material
        const material = new THREE.MeshBasicNodeMaterial({ transparent: true, side: THREE.DoubleSide, wireframe: false, depthWrite: true, depthTest: true })

        material.positionNode = twistedCylinder(positionLocal, parabolStrength, parabolOffset, parabolAmplitude.sub(0.05), time.mul(timeScale).mul(2))

        material.outputNode = Fn(() =>
        {
            const scaledTime = this.game.ticker.elapsedScaledUniform.mul(timeScale)

            /**
             * Outer fade
             */
            const y = uv().y.sub(1).pow(2).oneMinus()
            const heightModifier = cos(y.mul(2).add(1).mul(PI))
            heightModifier.assign(remap(heightModifier, -1, 1, -1, 1))

            /**
             * Emissive
             */
            // Noise 1
            const emissiveNoise1Uv = uv().add(vec2(scaledTime, scaledTime.negate())).toVar()
            emissiveNoise1Uv.assign(skewedUv(emissiveNoise1Uv, vec2(- 1, 0)).mul(vec2(4, 0.5)))
            const emissiveNoise1 = texture(this.game.noises.others, emissiveNoise1Uv, 1).r.remap(0.45, 0.7)

            // Noise 2
            const emissiveNoise2Uv = uv().add(vec2(scaledTime.mul(0.5), scaledTime.negate())).toVar()
            emissiveNoise2Uv.assign(skewedUv(emissiveNoise2Uv, vec2(- 1, 0)).mul(vec2(10, 2)))
            const emissiveNoise2 = texture(this.game.noises.others, emissiveNoise2Uv, 1).r.remap(0.45, 0.7)

            // Final noise
            const emissiveNoise = emissiveNoise1.mul(emissiveNoise2).add(heightModifier)
            emissiveNoise.assign(smoothstep(0, 0.4, emissiveNoise))

            // Color
            const emissiveColor = baseColor.mul(emissive)

            /**
             * Goo
             */
            // Noise 1
            const gooNoise1Uv = uv().add(vec2(scaledTime.mul(0.88), scaledTime.mul(0.88).negate())).add(vec2(0.5)).toVar();
            gooNoise1Uv.assign(skewedUv(gooNoise1Uv, vec2(- 1, 0)).mul(vec2(3, 0.4)));
            const gooNoise1 = texture(this.game.noises.others, gooNoise1Uv, 1).r.remap(0.45, 0.7);

            // Noise 2
            const gooNoise2Uv = uv().add(vec2(scaledTime.mul(0.66), scaledTime.mul(0.66).negate())).add(vec2(0.5)).toVar();
            gooNoise2Uv.assign(skewedUv(gooNoise2Uv,vec2(- 1, 0)).mul(vec2(8, 2)));
            const gooNoise2 = texture(this.game.noises.others, gooNoise2Uv, 1).r.remap(0.45, 0.7);

            // Final noise
            const gooNoise = gooNoise1.mul(gooNoise2).add(heightModifier);
            const gooMix = step(0.2, gooNoise)

            // Color
            const gooColor = this.game.fog.strength.mix(vec3(0), this.game.fog.color) // Fog

            /**
             * Alpha
             */
            const alpha = max(emissiveNoise, gooMix)

            // Discard
            alpha.lessThan(0.001).discard()

            /**
             * Output
             */
            const finalColor = mix(emissiveColor, gooColor, gooMix)
            return vec4(vec3(finalColor), alpha)
        })()

        // Mesh
        this.mesh = new THREE.Mesh(geometry, material)
        this.mesh.position.x = 30
        this.mesh.position.y = 0.5
        this.mesh.position.z = -13
        this.mesh.scale.set(8, 8, 8)
        this.game.scene.add(this.mesh)

        // Debug
        if(this.game.debug.active)
        {
            this.debugPanel.addBinding(parabolStrength, 'value', { label: 'parabolStrength', min: 0, max: 4, step: 0.001 })
            this.debugPanel.addBinding(parabolOffset, 'value', { label: 'parabolOffset', min: 0, max: 4, step: 0.001 })
            this.debugPanel.addBinding(parabolAmplitude, 'value', { label: 'parabolAmplitude', min: 0, max: 4, step: 0.001 })
        }
    }

    setPath()
    {
        const points = []

        const referenceArray = this.game.resources.tornadoPathModel.scene.children[0].geometry.attributes.position.array
        const count = referenceArray.length / 3

        for(let i = 0; i < count; i++)
        {
            const i3 = i * 3
            const point = new THREE.Vector3(
                referenceArray[i3 + 0], 
                0, 
                referenceArray[i3 + 2]
            )

            points.push(point)
        }
        const curve = new THREE.CatmullRomCurve3(points, true)
        this.path = curve.getSpacedPoints(this.resolution)
    }

    getPosition(progress)
    {
        const loopProgress = progress % 1
        const prevIndex = Math.floor(loopProgress * this.resolution)
        const nextIndex = (prevIndex + 1) % this.resolution
        const mix = loopProgress * this.resolution - prevIndex
        const prevPosition = this.path[prevIndex]
        const nextPosition = this.path[nextIndex]
        const position = new THREE.Vector3().lerpVectors(prevPosition, nextPosition, mix)

        return position
    }

    update()
    {
        const progress = this.game.dayCycles.absoluteProgress * 2
        const newPosition = this.getPosition(progress)
        
        this.mesh.position.copy(newPosition)
    }
}
