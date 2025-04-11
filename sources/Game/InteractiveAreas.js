import * as THREE from 'three/webgpu'
import { Game } from './Game.js'
import { color, distance, float, Fn, max, min, mix, mul, normalWorld, positionWorld, step, texture, uniform, uv, vec2, vec3, vec4 } from 'three/tsl'
import gsap from 'gsap'

export class InteractiveAreas
{
    constructor()
    {
        this.game = Game.getInstance()

        if(this.game.debug.active)
        {
            this.debugPanel = this.game.debug.panel.addFolder({
                title: '🔳 Interactive Areas',
                expanded: true,
            })
        }

        this.items = []
        this.activeItem = null

        this.setGeometries()
        this.setMaterials()
        this.setCanvas()

        this.game.ticker.events.on('tick', () =>
        {
            this.update()
        })

        this.game.inputs.events.on('interact', (event) =>
        {
            if(event.down && this.activeItem)
            {
                this.activeItem.callback()

                // gsap.to(this.activeItem.scale, { z: 1, overwrite: true, duration: 2, delay: 0.2, ease: 'power1.inOut' })
                gsap.to(this.activeItem.outer.position, { y: 0.3, ease: 'power2.out', duration: 0.1, overwrite: true, onComplete: () =>
                {
                    gsap.to(this.activeItem.outer.position, { y: 0.75, ease: 'elastic.out(1.3,0.4)', duration: 1.5, overwrite: true })
                } })
            }
        })
    }

    setGeometries()
    {
        const size = 2.25
        this.geometries = {}

        // Bottom
        this.geometries.bottom = new THREE.RingGeometry(size - 0.12, size, 4, 1, Math.PI * 0.25)
        this.geometries.bottom.rotateX(- Math.PI * 0.5)

        // Outer
        this.geometries.outer = new THREE.CylinderGeometry(size, size, 0.6, 4, 1, true)
        this.geometries.outer.rotateY(- Math.PI * 0.25)
        this.geometries.outer = this.geometries.outer.toNonIndexed()
        this.geometries.outer.computeVertexNormals()

        // Label
        this.geometries.label = new THREE.PlaneGeometry(1, 1, 1, 1)
        this.geometries.label.rotateX(- Math.PI * 0.5)
    }

    setMaterials()
    {
        this.materials = {}

        // Uniforms
        this.baseColor = uniform(color('#ffffff'))
        this.mixColor = uniform(0.2)
        this.playerPosition = uniform(vec2())

        // Plain
        this.materials.plain = new THREE.MeshLambertNodeMaterial({ side: THREE.DoubleSide, transparent: true })

        this.materials.plain.outputNode = Fn(() =>
        {
            const lightOutput = this.game.lighting.lightOutputNodeBuilder(this.baseColor, vec3(0, 1, 0), float(1), true, false)
            return vec4(mix(lightOutput.rgb, this.baseColor.rgb, this.mixColor), 0.7)
        })()

        // Outer
        this.materials.outer = new THREE.MeshLambertNodeMaterial({ side: THREE.DoubleSide, transparent: true })

        this.materials.outer.outputNode = Fn(() =>
        {
            // Alpha
            const stripes = uv().x.sub(this.game.ticker.elapsedUniform.mul(0.02)).mul(20).sub(uv().y).fract().step(0.5).mul(0.5)
            const borders = step(0.4, uv().y.sub(0.5).abs())
            
            const playerDistance = this.playerPosition.distance(positionWorld.xz)
            const playerLow = step(1.6, playerDistance)
            const playerHigh = step(playerDistance, 1.7)
            const player = playerLow.mul(playerHigh)

            const alpha = max(stripes, borders, player).mul(playerLow)

            // Discard
            alpha.lessThan(0.1).discard()

            // Light
            const lightOutput = this.game.lighting.lightOutputNodeBuilder(this.baseColor, vec3(0, 1, 0), float(1), true, false)
            return vec4(mix(lightOutput.rgb, this.baseColor.rgb, this.mixColor), alpha.mul(0.7))
        })()

        // Debug
        if(this.game.debug.active)
        {
            this.game.debug.addThreeColorBinding(this.debugPanel, this.baseColor.value, 'this.baseColor')
            this.debugPanel.addBinding(this.mixColor, 'value', { label: 'this.mixColor', min: 0, max: 1, step: 0.001 })
        }
    }

    setCanvas()
    {
        const text = 'Accept\nCookie'
        const textParts = text.split('\n')
        
        const width = 64 * 16
        const lineHeight = 64
        const height = lineHeight * textParts.length
        this.textOffsetVertical = 2

        this.font = `700 ${lineHeight}px "Amatic SC"`

        this.canvas = {}
        this.canvas.element = document.createElement('canvas')

        this.context = this.canvas.element.getContext('2d')
        this.context.font = this.font
        this.context.letterSpacing = '10px'

        // Canvas debug
        this.canvas.element.style.position = 'fixed'
        this.canvas.element.style.zIndex = 999
        this.canvas.element.style.top = 0
        this.canvas.element.style.left = 0
        this.canvas.element.style.letterSpacing = '-3px'
        // document.body.append(this.canvas.element)

        // Text
        let textWidth = 0

        for(const textPart of textParts)
        {
            const textPartSize = this.context.measureText(textPart)

            if(textPartSize.width > textWidth)
            {
                textWidth = textPartSize.width
            }
        }
        textWidth = Math.ceil(textWidth) + 2

        this.textWidth = textWidth
        this.canvas.element.width = textWidth
        this.canvas.element.height = height

        this.context.fillStyle = '#000000'
        this.context.fillRect(0, 0, width, height)

        this.context.font = this.font
        this.context.fillStyle = '#ffffff'
        this.context.textAlign = 'center'
        this.context.textBaseline = 'middle'

        let i = 0
        for(const textPart of textParts)
        {
            this.context.fillText(textPart, textWidth * 0.5, (i + 0.5) * lineHeight + this.textOffsetVertical)
            i++
        }

        this.canvas.texture = new THREE.Texture(this.canvas.element)
        this.canvas.texture.colorSpace = THREE.SRGBColorSpace
        this.canvas.texture.minFilter = THREE.NearestFilter
        this.canvas.texture.magFilter = THREE.NearestFilter
        this.canvas.texture.generateMipmaps = false
        this.canvas.texture.needsUpdate = true
    }

    create(position, callback)
    {
        const newPosition = position.clone()
        newPosition.y = 0.01

        // Bottom
        const bottom = new THREE.Mesh(
            this.geometries.bottom,
            this.materials.plain
        )
        bottom.position.copy(newPosition)
        this.game.scene.add(bottom)

        // Outer
        const outer = new THREE.Mesh(
            this.geometries.outer,
            this.materials.outer
        )
        outer.position.copy(newPosition)
        outer.position.y -= 0.3
        this.game.scene.add(outer)

        // Label
        const labelMaterial = new THREE.MeshLambertNodeMaterial({ transparent: true })
        labelMaterial.outputNode = Fn(() =>
        {
            const alpha = texture(this.canvas.texture, uv()).r
            const lightOutput = this.game.lighting.lightOutputNodeBuilder(color('#ffffff'), vec3(0, 1, 0), float(1), true, false)
            return vec4(mix(lightOutput.rgb, this.baseColor.rgb, this.mixColor), alpha)
        })()

        const label = new THREE.Mesh(this.geometries.label, labelMaterial)
        label.scale.x = 1.1 * this.textWidth / 60
        label.scale.z = 1.1
        label.position.copy(newPosition)
        this.game.scene.add(label)

        // Save
        const item = {}
        item.outer = outer
        item.position = new THREE.Vector2(position.x, position.z)
        item.callback = callback
        item.isIn = false

        this.items.push(item)
    }

    update()
    {
        const playerPosition2 = new THREE.Vector2(this.game.player.position.x, this.game.player.position.z)
        this.playerPosition.value.copy(playerPosition2)

        for(const item of this.items)
        {
            const isIn = Math.abs(item.position.x - playerPosition2.x) < 2 && Math.abs(item.position.y - playerPosition2.y) < 2

            if(isIn !== item.isIn)
            {
                item.isIn = isIn

                if(isIn)
                {
                    this.activeItem = item

                    gsap.to(item.outer.position, { y: 0.75, ease: 'elastic.out(1.3,0.4)', duration: 1.5, overwrite: true })
                }
                else
                {
                    this.activeItem = null

                    gsap.to(item.outer.position, { y: -0.3, ease: 'back.in(4.5)', duration: 0.6, overwrite: true })
                }
            }
        }
    }
}